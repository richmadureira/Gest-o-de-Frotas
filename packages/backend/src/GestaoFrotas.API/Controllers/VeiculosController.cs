using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestaoFrotas.Infrastructure.Data;
using GestaoFrotas.Domain.Entities;
using GestaoFrotas.Domain.Enums;

namespace GestaoFrotas.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class VeiculosController : ControllerBase
{
    private readonly AppDbContext _context;

    public VeiculosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Veiculo>>> GetVeiculos(
        [FromQuery] string? search,
        [FromQuery] StatusVeiculo? status,
        [FromQuery] TipoVeiculo? tipo,
        [FromQuery] int? anoMin,
        [FromQuery] int? anoMax)
    {
        var query = _context.Veiculos.AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(v => 
                v.Placa.Contains(search) || 
                v.Modelo.Contains(search) || 
                v.Marca.Contains(search));
        }

        if (status.HasValue)
        {
            query = query.Where(v => v.Status == status.Value);
        }

        if (tipo.HasValue)
        {
            query = query.Where(v => v.Tipo == tipo.Value);
        }

        if (anoMin.HasValue)
        {
            query = query.Where(v => v.Ano >= anoMin.Value);
        }

        if (anoMax.HasValue)
        {
            query = query.Where(v => v.Ano <= anoMax.Value);
        }

        var veiculos = await query
            .OrderBy(v => v.Placa)
            .ToListAsync();

        return Ok(veiculos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Veiculo>> GetVeiculo(Guid id)
    {
        var veiculo = await _context.Veiculos
            .Include(v => v.Checklists)
            .Include(v => v.Manutencoes)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (veiculo == null)
        {
            return NotFound(new { message = "Veículo não encontrado" });
        }

        return Ok(veiculo);
    }

    [Authorize(Roles = "Administrador,Gestor")]
    [HttpPost]
    public async Task<ActionResult<Veiculo>> CreateVeiculo([FromBody] VeiculoRequest request)
    {
        // Verificar se a placa já existe
        if (await _context.Veiculos.AnyAsync(v => v.Placa == request.Placa))
        {
            return BadRequest(new { message = "Placa já cadastrada" });
        }

        var veiculo = new Veiculo
        {
            Placa = request.Placa,
            Modelo = request.Modelo,
            Marca = request.Marca,
            Ano = request.Ano,
            Tipo = request.Tipo,
            Status = request.Status ?? StatusVeiculo.Disponivel,
            Quilometragem = request.Quilometragem,
            UltimaManutencao = request.UltimaManutencao,
            ProximaManutencao = request.ProximaManutencao
        };

        _context.Veiculos.Add(veiculo);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVeiculo), new { id = veiculo.Id }, veiculo);
    }

    [Authorize(Roles = "Administrador,Gestor")]
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateVeiculo(Guid id, [FromBody] VeiculoRequest request)
    {
        var veiculo = await _context.Veiculos.FindAsync(id);

        if (veiculo == null)
        {
            return NotFound(new { message = "Veículo não encontrado" });
        }

        // Verificar se a placa já existe em outro veículo
        if (await _context.Veiculos.AnyAsync(v => v.Placa == request.Placa && v.Id != id))
        {
            return BadRequest(new { message = "Placa já cadastrada em outro veículo" });
        }

        veiculo.Placa = request.Placa;
        veiculo.Modelo = request.Modelo;
        veiculo.Marca = request.Marca;
        veiculo.Ano = request.Ano;
        veiculo.Tipo = request.Tipo;
        veiculo.Status = request.Status ?? veiculo.Status;
        veiculo.Quilometragem = request.Quilometragem;
        veiculo.UltimaManutencao = request.UltimaManutencao;
        veiculo.ProximaManutencao = request.ProximaManutencao;

        await _context.SaveChangesAsync();

        return Ok(veiculo);
    }

    [Authorize(Roles = "Administrador")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteVeiculo(Guid id)
    {
        var veiculo = await _context.Veiculos.FindAsync(id);

        if (veiculo == null)
        {
            return NotFound(new { message = "Veículo não encontrado" });
        }

        // Verificar se há checklists ou manutenções associadas
        var hasRelations = await _context.Checklists.AnyAsync(c => c.VeiculoId == id) ||
                          await _context.Manutencoes.AnyAsync(m => m.VeiculoId == id);

        if (hasRelations)
        {
            return BadRequest(new { message = "Não é possível excluir um veículo com checklists ou manutenções associadas" });
        }

        _context.Veiculos.Remove(veiculo);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Obter histórico completo do veículo (incluindo checklists e manutenções)
    /// </summary>
    [HttpGet("{id}/historico")]
    public async Task<ActionResult<object>> GetHistoricoVeiculo(string id)
    {
        if (!Guid.TryParse(id, out var veiculoId))
        {
            return BadRequest(new { message = "ID inválido" });
        }

        var veiculo = await _context.Veiculos.FindAsync(veiculoId);
        if (veiculo == null)
        {
            return NotFound(new { message = "Veículo não encontrado" });
        }

        // Buscar checklists do veículo
        var checklists = await _context.Checklists
            .Include(c => c.Motorista)
            .Where(c => c.VeiculoId == veiculoId)
            .OrderByDescending(c => c.Data)
            .Select(c => new
            {
                c.Id,
                c.Data,
                c.KmVeiculo,
                MotoristaId = c.MotoristaId,
                MotoristaNome = c.Motorista != null ? c.Motorista.Nome : "N/A",
                c.Pneus,
                c.Luzes,
                c.Freios,
                c.Limpeza,
                c.Observacoes,
                c.Enviado,
                TemAvarias = !c.Pneus || !c.Luzes || !c.Freios || !c.Limpeza
            })
            .ToListAsync();

        // Buscar manutenções do veículo
        var manutencoes = await _context.Manutencoes
            .Where(m => m.VeiculoId == veiculoId)
            .OrderByDescending(m => m.CriadoEm)
            .Select(m => new
            {
                m.Id,
                m.Tipo,
                m.Prioridade,
                StatusSAP = m.StatusSAP,
                m.Descricao,
                m.QuilometragemNoAto,
                m.Custo,
                m.CriadoEm,
                m.AtualizadoEm,
                m.NumeroOrdemSAP,
                m.FornecedorSAP
            })
            .ToListAsync();

        // Calcular estatísticas
        var totalChecklists = checklists.Count;
        var totalManutencoes = manutencoes.Count;
        var custoTotalManutencoes = manutencoes.Sum(m => m.Custo ?? 0);
        var ultimoChecklist = checklists.FirstOrDefault();
        var ultimaManutencao = manutencoes.FirstOrDefault();
        
        // Estatísticas de checklists
        var checklistsEnviados = checklists.Count(c => c.Enviado);
        
        // Estatísticas de manutenções (usando StatusSAP)
        var manutencoesSolicitadas = manutencoes.Count(m => m.StatusSAP == StatusManutencaoSAP.Solicitada);
        var manutencoesAprovadas = manutencoes.Count(m => m.StatusSAP == StatusManutencaoSAP.Aprovada);
        var manutencoesEnviadasSAP = manutencoes.Count(m => m.StatusSAP == StatusManutencaoSAP.EnviadaSAP);
        var manutencoesEmExecucao = manutencoes.Count(m => m.StatusSAP == StatusManutencaoSAP.EmExecucao);
        var manutencoesFinalizadas = manutencoes.Count(m => m.StatusSAP == StatusManutencaoSAP.Finalizada);

        // Evolução de quilometragem (últimos 10 checklists)
        var evolucaoKm = checklists
            .Take(10)
            .OrderBy(c => c.Data)
            .Select(c => new
            {
                Data = c.Data.ToString("dd/MM"),
                Km = c.KmVeiculo
            })
            .ToList();

        // Custos por tipo de manutenção
        var custosPorTipo = manutencoes
            .Where(m => m.Custo.HasValue && m.Custo > 0)
            .GroupBy(m => m.Tipo)
            .Select(g => new
            {
                Tipo = g.Key.ToString(),
                Total = g.Sum(m => m.Custo ?? 0),
                Quantidade = g.Count()
            })
            .OrderByDescending(x => x.Total)
            .ToList();

        // Custos mensais (últimos 6 meses)
        var seiseMesesAtras = DateTime.UtcNow.AddMonths(-6);
        var custosMensais = manutencoes
            .Where(m => m.CriadoEm >= seiseMesesAtras && m.Custo.HasValue && m.Custo > 0)
            .GroupBy(m => new { m.CriadoEm.Year, m.CriadoEm.Month })
            .Select(g => new
            {
                Mes = $"{g.Key.Month:00}/{g.Key.Year}",
                Total = g.Sum(m => m.Custo ?? 0),
                Quantidade = g.Count()
            })
            .OrderBy(x => x.Mes)
            .ToList();

        var result = new
        {
            Veiculo = new
            {
                veiculo.Id,
                veiculo.Placa,
                veiculo.Modelo,
                veiculo.Marca,
                veiculo.Ano,
                veiculo.Tipo,
                veiculo.Status,
                veiculo.Quilometragem,
                veiculo.UltimaManutencao,
                veiculo.ProximaManutencao
            },
            Checklists = checklists,
            Manutencoes = manutencoes,
            Estatisticas = new
            {
                TotalChecklists = totalChecklists,
                ChecklistsEnviados = checklistsEnviados,
                TotalManutencoes = totalManutencoes,
                ManutencoesSolicitadas = manutencoesSolicitadas,
                ManutencoesAprovadas = manutencoesAprovadas,
                ManutencoesEnviadasSAP = manutencoesEnviadasSAP,
                ManutencoesEmExecucao = manutencoesEmExecucao,
                ManutencoesFinalizadas = manutencoesFinalizadas,
                CustoTotalManutencoes = custoTotalManutencoes,
                UltimoChecklist = ultimoChecklist,
                UltimaManutencao = ultimaManutencao
            },
            Graficos = new
            {
                EvolucaoKm = evolucaoKm,
                CustosPorTipo = custosPorTipo,
                CustosMensais = custosMensais
            }
        };

        return Ok(result);
    }
}

public record VeiculoRequest(
    string Placa,
    string Modelo,
    string Marca,
    int Ano,
    TipoVeiculo Tipo,
    StatusVeiculo? Status,
    int? Quilometragem,
    DateTime? UltimaManutencao,
    DateTime? ProximaManutencao
);
