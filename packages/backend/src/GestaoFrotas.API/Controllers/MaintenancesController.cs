using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestaoFrotas.Infrastructure.Data;
using GestaoFrotas.Domain.Entities;
using GestaoFrotas.Domain.Enums;

namespace GestaoFrotas.API.Controllers;

[Authorize(Roles = "Admin,Gestor")]
[ApiController]
[Route("api/[controller]")]
public class MaintenancesController : ControllerBase
{
    private readonly AppDbContext _context;

    public MaintenancesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Maintenance>>> GetMaintenances(
        [FromQuery] MaintenanceStatus? status,
        [FromQuery] MaintenanceType? type,
        [FromQuery] Guid? vehicleId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var query = _context.Maintenances
            .Include(m => m.Vehicle)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(m => m.Status == status.Value);
        }

        if (type.HasValue)
        {
            query = query.Where(m => m.Type == type.Value);
        }

        if (vehicleId.HasValue)
        {
            query = query.Where(m => m.VehicleId == vehicleId.Value);
        }

        if (startDate.HasValue)
        {
            query = query.Where(m => m.ScheduledAt >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(m => m.ScheduledAt <= endDate.Value);
        }

        var maintenances = await query
            .OrderBy(m => m.ScheduledAt)
            .ToListAsync();

        return Ok(maintenances);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Maintenance>> GetMaintenance(Guid id)
    {
        var maintenance = await _context.Maintenances
            .Include(m => m.Vehicle)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (maintenance == null)
        {
            return NotFound(new { message = "Manutenção não encontrada" });
        }

        return Ok(maintenance);
    }

    [HttpPost]
    public async Task<ActionResult<Maintenance>> CreateMaintenance([FromBody] MaintenanceRequest request)
    {
        // Verificar se o veículo existe
        var vehicle = await _context.Vehicles.FindAsync(request.VehicleId);
        if (vehicle == null)
        {
            return BadRequest(new { message = "Veículo não encontrado" });
        }

        var maintenance = new Maintenance
        {
            VehicleId = request.VehicleId,
            Type = request.Type,
            Description = request.Description,
            Cost = request.Cost,
            ScheduledAt = request.ScheduledAt,
            Status = MaintenanceStatus.Scheduled
        };

        _context.Maintenances.Add(maintenance);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMaintenance), new { id = maintenance.Id }, maintenance);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateMaintenance(Guid id, [FromBody] MaintenanceRequest request)
    {
        var maintenance = await _context.Maintenances.FindAsync(id);

        if (maintenance == null)
        {
            return NotFound(new { message = "Manutenção não encontrada" });
        }

        maintenance.Type = request.Type;
        maintenance.Description = request.Description;
        maintenance.Cost = request.Cost;
        maintenance.ScheduledAt = request.ScheduledAt;

        await _context.SaveChangesAsync();

        return Ok(maintenance);
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult> UpdateMaintenanceStatus(Guid id, [FromBody] UpdateMaintenanceStatusRequest request)
    {
        var maintenance = await _context.Maintenances
            .Include(m => m.Vehicle)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (maintenance == null)
        {
            return NotFound(new { message = "Manutenção não encontrada" });
        }

        maintenance.Status = request.Status;

        if (request.Status == MaintenanceStatus.Completed)
        {
            maintenance.CompletedAt = DateTime.UtcNow;
            
            // Atualizar a data de última manutenção do veículo
            maintenance.Vehicle.LastMaintenance = DateTime.UtcNow;
        }

        if (request.Cost.HasValue)
        {
            maintenance.Cost = request.Cost.Value;
        }

        await _context.SaveChangesAsync();

        return Ok(maintenance);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMaintenance(Guid id)
    {
        var maintenance = await _context.Maintenances.FindAsync(id);

        if (maintenance == null)
        {
            return NotFound(new { message = "Manutenção não encontrada" });
        }

        _context.Maintenances.Remove(maintenance);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public record MaintenanceRequest(
    Guid VehicleId,
    MaintenanceType Type,
    string Description,
    decimal? Cost,
    DateTime ScheduledAt
);

public record UpdateMaintenanceStatusRequest(
    MaintenanceStatus Status,
    decimal? Cost
);
