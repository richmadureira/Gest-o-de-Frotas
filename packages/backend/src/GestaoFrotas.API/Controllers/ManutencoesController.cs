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
        [FromQuery] StatusManutencao? status,
        [FromQuery] TipoManutencao? tipo,
        [FromQuery] Guid? veiculoId,
        [FromQuery] DateTime? dataInicio,
        [FromQuery] DateTime? dataFim)
    {
        var query = _context.Manutencoes
            .Include(m => m.Veiculo)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(m => m.Status == status.Value);
        }

        if (tipo.HasValue)
        {
            query = query.Where(m => m.Tipo == tipo.Value);
        }

        if (veiculoId.HasValue)
        {
            query = query.Where(m => m.VeiculoId == veiculoId.Value);
        }

        if (dataInicio.HasValue)
        {
            query = query.Where(m => m.AgendadoPara >= dataInicio.Value);
        }

        if (dataFim.HasValue)
        {
            query = query.Where(m => m.AgendadoPara <= dataFim.Value);
        }

        var manutencoes = await query
            .OrderBy(m => m.AgendadoPara)
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

        var manutencao = new Manutencao
        {
            VeiculoId = request.VeiculoId,
            Tipo = request.Tipo,
            Descricao = request.Descricao,
            Custo = request.Custo,
            AgendadoPara = request.AgendadoPara,
            Status = StatusManutencao.Agendada
        };

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
        manutencao.AgendadoPara = request.AgendadoPara;

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

        manutencao.Status = request.Status;

        if (request.Status == StatusManutencao.Concluida)
        {
            manutencao.ConcluidoEm = DateTime.UtcNow;
            
            // Atualizar a data de última manutenção do veículo
            manutencao.Veiculo.UltimaManutencao = DateTime.UtcNow;
        }

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
}

public record ManutencaoRequest(
    Guid VeiculoId,
    TipoManutencao Tipo,
    string Descricao,
    decimal? Custo,
    DateTime AgendadoPara
);

public record UpdateManutencaoStatusRequest(
    StatusManutencao Status,
    decimal? Custo
);
