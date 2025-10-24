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
        [FromQuery] StatusVeiculo? status)
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
