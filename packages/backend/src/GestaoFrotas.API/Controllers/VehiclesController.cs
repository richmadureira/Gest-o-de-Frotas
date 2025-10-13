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
public class VehiclesController : ControllerBase
{
    private readonly AppDbContext _context;

    public VehiclesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Vehicle>>> GetVehicles(
        [FromQuery] string? search,
        [FromQuery] VehicleStatus? status)
    {
        var query = _context.Vehicles.AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(v => 
                v.Plate.Contains(search) || 
                v.Model.Contains(search) || 
                v.Brand.Contains(search));
        }

        if (status.HasValue)
        {
            query = query.Where(v => v.Status == status.Value);
        }

        var vehicles = await query
            .OrderBy(v => v.Plate)
            .ToListAsync();

        return Ok(vehicles);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Vehicle>> GetVehicle(Guid id)
    {
        var vehicle = await _context.Vehicles
            .Include(v => v.Checklists)
            .Include(v => v.Maintenances)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (vehicle == null)
        {
            return NotFound(new { message = "Veículo não encontrado" });
        }

        return Ok(vehicle);
    }

    [Authorize(Roles = "Admin,Gestor")]
    [HttpPost]
    public async Task<ActionResult<Vehicle>> CreateVehicle([FromBody] VehicleRequest request)
    {
        // Verificar se a placa já existe
        if (await _context.Vehicles.AnyAsync(v => v.Plate == request.Plate))
        {
            return BadRequest(new { message = "Placa já cadastrada" });
        }

        var vehicle = new Vehicle
        {
            Plate = request.Plate,
            Model = request.Model,
            Brand = request.Brand,
            Year = request.Year,
            Type = request.Type,
            Status = request.Status ?? VehicleStatus.Available,
            Mileage = request.Mileage,
            LastMaintenance = request.LastMaintenance,
            NextMaintenance = request.NextMaintenance
        };

        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVehicle), new { id = vehicle.Id }, vehicle);
    }

    [Authorize(Roles = "Admin,Gestor")]
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateVehicle(Guid id, [FromBody] VehicleRequest request)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);

        if (vehicle == null)
        {
            return NotFound(new { message = "Veículo não encontrado" });
        }

        // Verificar se a placa já existe em outro veículo
        if (await _context.Vehicles.AnyAsync(v => v.Plate == request.Plate && v.Id != id))
        {
            return BadRequest(new { message = "Placa já cadastrada em outro veículo" });
        }

        vehicle.Plate = request.Plate;
        vehicle.Model = request.Model;
        vehicle.Brand = request.Brand;
        vehicle.Year = request.Year;
        vehicle.Type = request.Type;
        vehicle.Status = request.Status ?? vehicle.Status;
        vehicle.Mileage = request.Mileage;
        vehicle.LastMaintenance = request.LastMaintenance;
        vehicle.NextMaintenance = request.NextMaintenance;

        await _context.SaveChangesAsync();

        return Ok(vehicle);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteVehicle(Guid id)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);

        if (vehicle == null)
        {
            return NotFound(new { message = "Veículo não encontrado" });
        }

        // Verificar se há checklists ou manutenções associadas
        var hasRelations = await _context.Checklists.AnyAsync(c => c.VehicleId == id) ||
                          await _context.Maintenances.AnyAsync(m => m.VehicleId == id);

        if (hasRelations)
        {
            return BadRequest(new { message = "Não é possível excluir um veículo com checklists ou manutenções associadas" });
        }

        _context.Vehicles.Remove(vehicle);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public record VehicleRequest(
    string Plate,
    string Model,
    string Brand,
    int Year,
    VehicleType Type,
    VehicleStatus? Status,
    int? Mileage,
    DateTime? LastMaintenance,
    DateTime? NextMaintenance
);
