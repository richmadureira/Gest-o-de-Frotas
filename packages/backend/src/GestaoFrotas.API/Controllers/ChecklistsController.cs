using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using GestaoFrotas.Infrastructure.Data;
using GestaoFrotas.Domain.Entities;
using GestaoFrotas.Domain.Enums;

namespace GestaoFrotas.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChecklistsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ChecklistsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Checklist>>> GetChecklists(
        [FromQuery] DateTime? dataInicio,
        [FromQuery] DateTime? dataFim,
        [FromQuery] StatusChecklist? status,
        [FromQuery] Guid? veiculoId,
        [FromQuery] Guid? motoristaId)
    {
        var query = _context.Checklists
            .Include(c => c.Veiculo)
            .Include(c => c.Motorista)
            .AsQueryable();

        if (dataInicio.HasValue)
        {
            query = query.Where(c => c.Data >= dataInicio.Value);
        }

        if (dataFim.HasValue)
        {
            query = query.Where(c => c.Data <= dataFim.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(c => c.Status == status.Value);
        }

        if (veiculoId.HasValue)
        {
            query = query.Where(c => c.VeiculoId == veiculoId.Value);
        }

        if (motoristaId.HasValue)
        {
            query = query.Where(c => c.MotoristaId == motoristaId.Value);
        }

        var checklists = await query
            .OrderByDescending(c => c.Data)
            .ToListAsync();

        return Ok(checklists);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Checklist>> GetChecklist(Guid id)
    {
        var checklist = await _context.Checklists
            .Include(c => c.Veiculo)
            .Include(c => c.Motorista)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (checklist == null)
        {
            return NotFound(new { message = "Checklist não encontrado" });
        }

        return Ok(checklist);
    }

    [HttpPost]
    public async Task<ActionResult<Checklist>> CreateChecklist([FromBody] ChecklistRequest request)
    {
        // Verificar se o veículo existe
        var veiculo = await _context.Veiculos.FindAsync(request.VeiculoId);
        if (veiculo == null)
        {
            return BadRequest(new { message = "Veículo não encontrado" });
        }

        // Obter o ID do usuário logado
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var motoristaId))
        {
            return Unauthorized();
        }

        var checklist = new Checklist
        {
            VeiculoId = request.VeiculoId,
            MotoristaId = motoristaId,
            Data = DateTime.UtcNow,
            Turno = request.Turno,
            PlacaVeiculo = veiculo.Placa,
            KmVeiculo = request.KmVeiculo,
            Pneus = request.Pneus,
            Luzes = request.Luzes,
            Retrovisores = request.Retrovisores,
            ParaBrisa = request.ParaBrisa,
            Buzina = request.Buzina,
            Freios = request.Freios,
            Combustivel = request.Combustivel,
            Documentos = request.Documentos,
            Limpeza = request.Limpeza,
            ImagemPneus = request.ImagemPneus,
            ImagemLuzes = request.ImagemLuzes,
            ImagemParaBrisa = request.ImagemParaBrisa,
            ImagemFreios = request.ImagemFreios,
            Observacoes = request.Observacoes,
            Status = StatusChecklist.Pendente
        };

        _context.Checklists.Add(checklist);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetChecklist), new { id = checklist.Id }, checklist);
    }

    [Authorize(Roles = "Administrador,Gestor")]
    [HttpPut("{id}/status")]
    public async Task<ActionResult> UpdateChecklistStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        var checklist = await _context.Checklists.FindAsync(id);

        if (checklist == null)
        {
            return NotFound(new { message = "Checklist não encontrado" });
        }

        checklist.Status = request.Status;
        await _context.SaveChangesAsync();

        return Ok(checklist);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateChecklist(Guid id, [FromBody] ChecklistRequest request)
    {
        var checklist = await _context.Checklists.FindAsync(id);

        if (checklist == null)
        {
            return NotFound(new { message = "Checklist não encontrado" });
        }

        // Verificar se o usuário é o dono do checklist ou é admin/gestor
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        
        if (!Guid.TryParse(userIdClaim, out var userId) || 
            (checklist.MotoristaId != userId && userRole != "Administrador" && userRole != "Gestor"))
        {
            return Forbid();
        }

        checklist.Turno = request.Turno;
        checklist.KmVeiculo = request.KmVeiculo;
        checklist.Pneus = request.Pneus;
        checklist.Luzes = request.Luzes;
        checklist.Retrovisores = request.Retrovisores;
        checklist.ParaBrisa = request.ParaBrisa;
        checklist.Buzina = request.Buzina;
        checklist.Freios = request.Freios;
        checklist.Combustivel = request.Combustivel;
        checklist.Documentos = request.Documentos;
        checklist.Limpeza = request.Limpeza;
        checklist.ImagemPneus = request.ImagemPneus;
        checklist.ImagemLuzes = request.ImagemLuzes;
        checklist.ImagemParaBrisa = request.ImagemParaBrisa;
        checklist.ImagemFreios = request.ImagemFreios;
        checklist.Observacoes = request.Observacoes;

        await _context.SaveChangesAsync();

        return Ok(checklist);
    }

    [Authorize(Roles = "Administrador")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteChecklist(Guid id)
    {
        var checklist = await _context.Checklists.FindAsync(id);

        if (checklist == null)
        {
            return NotFound(new { message = "Checklist não encontrado" });
        }

        _context.Checklists.Remove(checklist);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public record ChecklistRequest(
    Guid VeiculoId,
    Turno Turno,
    int KmVeiculo,
    bool Pneus,
    bool Luzes,
    bool Retrovisores,
    bool ParaBrisa,
    bool Buzina,
    bool Freios,
    NivelCombustivel Combustivel,
    bool Documentos,
    bool Limpeza,
    string? ImagemPneus,
    string? ImagemLuzes,
    string? ImagemParaBrisa,
    string? ImagemFreios,
    string? Observacoes
);

public record UpdateStatusRequest(StatusChecklist Status);
