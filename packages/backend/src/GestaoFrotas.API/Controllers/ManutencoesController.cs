using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestaoFrotas.Infrastructure.Data;
using GestaoFrotas.Domain.Entities;
using GestaoFrotas.Domain.Enums;

namespace GestaoFrotas.API.Controllers;

[Authorize(Roles = "Administrador,Gestor")]
[ApiController]
[Route("api/[controller]")]
public class ManutencoesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ManutencoesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Manutencao>>> GetManutencoes(
        [FromQuery] TipoManutencao? tipo,
        [FromQuery] Guid? veiculoId,
        [FromQuery] PrioridadeManutencao? prioridade,
        [FromQuery] StatusManutencaoSAP? statusSAP,
        [FromQuery] DateTime? dataInicio,
        [FromQuery] DateTime? dataFim)
    {
        var query = _context.Manutencoes
            .Include(m => m.Veiculo)
            .AsQueryable();

        if (tipo.HasValue)
        {
            query = query.Where(m => m.Tipo == tipo.Value);
        }

        if (veiculoId.HasValue)
        {
            query = query.Where(m => m.VeiculoId == veiculoId.Value);
        }

        if (prioridade.HasValue)
        {
            query = query.Where(m => m.Prioridade == prioridade.Value);
        }

        if (statusSAP.HasValue)
        {
            query = query.Where(m => m.StatusSAP == statusSAP.Value);
        }

        if (dataInicio.HasValue)
        {
            query = query.Where(m => m.CriadoEm >= dataInicio.Value);
        }

        if (dataFim.HasValue)
        {
            // Adicionar 1 dia para incluir todo o dia selecionado
            var dataFimAjustada = dataFim.Value.Date.AddDays(1);
            query = query.Where(m => m.CriadoEm < dataFimAjustada);
        }

        var manutencoes = await query
            .OrderByDescending(m => m.CriadoEm)
            .ToListAsync();

        return Ok(manutencoes);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Manutencao>> GetManutencao(Guid id)
    {
        var manutencao = await _context.Manutencoes
            .Include(m => m.Veiculo)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (manutencao == null)
        {
            return NotFound(new { message = "Manutenção não encontrada" });
        }

        return Ok(manutencao);
    }

    [HttpPost]
    public async Task<ActionResult<Manutencao>> CreateManutencao([FromBody] ManutencaoRequest request)
    {
        // Verificar se o veículo existe
        var veiculo = await _context.Veiculos.FindAsync(request.VeiculoId);
        if (veiculo == null)
        {
            return BadRequest(new { message = "Veículo não encontrado" });
        }

        // Obter solicitante
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        Guid? solicitanteId = null;
        if (Guid.TryParse(userIdClaim, out var sid))
        {
            solicitanteId = sid;
        }

        // Validações
        if (request.QuilometragemNoAto.HasValue && request.QuilometragemNoAto.Value < 0)
        {
            return BadRequest(new { message = "Quilometragem não pode ser negativa." });
        }

        var manutencao = new Manutencao
        {
            VeiculoId = request.VeiculoId,
            Tipo = request.Tipo,
            Descricao = request.Descricao,
            Custo = request.Custo,
            Prioridade = request.Prioridade,
            QuilometragemNoAto = request.QuilometragemNoAto,
            SolicitanteId = solicitanteId,
            StatusSAP = StatusManutencaoSAP.Solicitada
        };
        // Observações e centro de custo removidos do modelo; enriquecimento omitido

        _context.Manutencoes.Add(manutencao);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetManutencao), new { id = manutencao.Id }, manutencao);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateManutencao(Guid id, [FromBody] ManutencaoRequest request)
    {
        var manutencao = await _context.Manutencoes.FindAsync(id);

        if (manutencao == null)
        {
            return NotFound(new { message = "Manutenção não encontrada" });
        }

        manutencao.Tipo = request.Tipo;
        manutencao.Descricao = request.Descricao;
        manutencao.Custo = request.Custo;

        await _context.SaveChangesAsync();

        return Ok(manutencao);
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult> UpdateManutencaoStatus(Guid id, [FromBody] UpdateManutencaoStatusRequest request)
    {
        var manutencao = await _context.Manutencoes
            .Include(m => m.Veiculo)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (manutencao == null)
        {
            return NotFound(new { message = "Manutenção não encontrada" });
        }

        // Status removido; endpoint mantém atualização de custo apenas

        if (request.Custo.HasValue)
        {
            manutencao.Custo = request.Custo.Value;
        }

        await _context.SaveChangesAsync();

        return Ok(manutencao);
    }

    [Authorize(Roles = "Administrador")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteManutencao(Guid id)
    {
        var manutencao = await _context.Manutencoes.FindAsync(id);

        if (manutencao == null)
        {
            return NotFound(new { message = "Manutenção não encontrada" });
        }

        _context.Manutencoes.Remove(manutencao);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/simular-proximo-status")]
    public async Task<ActionResult<Manutencao>> SimularProximoStatus(Guid id)
    {
        var manutencao = await _context.Manutencoes
            .Include(m => m.Veiculo)
            .FirstOrDefaultAsync(m => m.Id == id);
            
        if (manutencao == null) return NotFound();
        
        // Não permitir avançar se já está finalizada
        if (manutencao.StatusSAP == StatusManutencaoSAP.Finalizada)
            return BadRequest(new { message = "Manutenção já está finalizada" });

        var proximoStatus = ObterProximoStatus(manutencao.StatusSAP);
        manutencao.StatusSAP = proximoStatus;
        // Progresso removido; progresso calculado no frontend
        
        if (proximoStatus == StatusManutencaoSAP.OrdemCriada && string.IsNullOrEmpty(manutencao.NumeroOrdemSAP))
        {
            manutencao.NumeroOrdemSAP = $"OS-{DateTime.UtcNow.Year}-{Random.Shared.Next(100, 999)}";
            manutencao.FornecedorSAP = "Oficina Central";
        }

        await _context.SaveChangesAsync();
        
        // Retornar dados atualizados
        return Ok(manutencao);
    }

    private StatusManutencaoSAP? ObterProximoStatus(StatusManutencaoSAP? atual)
    {
        // Sequência: Solicitada -> Aprovada -> EnviadaSAP -> ProcessandoSAP -> OrdemCriada -> EmExecucao -> Finalizada
        return atual switch
        {
            StatusManutencaoSAP.Solicitada => StatusManutencaoSAP.Aprovada,
            StatusManutencaoSAP.Aprovada => StatusManutencaoSAP.EnviadaSAP,
            StatusManutencaoSAP.EnviadaSAP => StatusManutencaoSAP.ProcessandoSAP,
            StatusManutencaoSAP.ProcessandoSAP => StatusManutencaoSAP.OrdemCriada,
            StatusManutencaoSAP.OrdemCriada => StatusManutencaoSAP.EmExecucao,
            StatusManutencaoSAP.EmExecucao => StatusManutencaoSAP.Finalizada,
            _ => atual
        };
    }

    private int CalcularProgresso(StatusManutencaoSAP? status)
    {
        return status switch
        {
            StatusManutencaoSAP.Solicitada => 10,
            StatusManutencaoSAP.Aprovada => 25,
            StatusManutencaoSAP.EnviadaSAP => 40,
            StatusManutencaoSAP.ProcessandoSAP => 55,
            StatusManutencaoSAP.OrdemCriada => 70,
            StatusManutencaoSAP.EmExecucao => 85,
            StatusManutencaoSAP.Finalizada => 100,
            _ => 0
        };
    }
}

public record ManutencaoRequest(
    Guid VeiculoId,
    TipoManutencao Tipo,
    string Descricao,
    decimal? Custo,
    PrioridadeManutencao Prioridade,
    int? QuilometragemNoAto
);

public record UpdateManutencaoStatusRequest(
    StatusManutencao Status,
    decimal? Custo
);