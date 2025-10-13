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
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] ChecklistStatus? status,
        [FromQuery] Guid? vehicleId,
        [FromQuery] Guid? driverId)
    {
        var query = _context.Checklists
            .Include(c => c.Vehicle)
            .Include(c => c.Driver)
            .AsQueryable();

        if (startDate.HasValue)
        {
            query = query.Where(c => c.Date >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(c => c.Date <= endDate.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(c => c.Status == status.Value);
        }

        if (vehicleId.HasValue)
        {
            query = query.Where(c => c.VehicleId == vehicleId.Value);
        }

        if (driverId.HasValue)
        {
            query = query.Where(c => c.DriverId == driverId.Value);
        }

        var checklists = await query
            .OrderByDescending(c => c.Date)
            .ToListAsync();

        return Ok(checklists);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Checklist>> GetChecklist(Guid id)
    {
        var checklist = await _context.Checklists
            .Include(c => c.Vehicle)
            .Include(c => c.Driver)
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
        var vehicle = await _context.Vehicles.FindAsync(request.VehicleId);
        if (vehicle == null)
        {
            return BadRequest(new { message = "Veículo não encontrado" });
        }

        // Obter o ID do usuário logado
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var driverId))
        {
            return Unauthorized();
        }

        var checklist = new Checklist
        {
            VehicleId = request.VehicleId,
            DriverId = driverId,
            Date = DateTime.UtcNow,
            Shift = request.Shift,
            VehiclePlate = vehicle.Plate,
            VehicleKm = request.VehicleKm,
            Tires = request.Tires,
            Lights = request.Lights,
            Mirrors = request.Mirrors,
            Windshield = request.Windshield,
            Horn = request.Horn,
            Brakes = request.Brakes,
            Fuel = request.Fuel,
            Documents = request.Documents,
            Cleaning = request.Cleaning,
            TiresImage = request.TiresImage,
            LightsImage = request.LightsImage,
            WindshieldImage = request.WindshieldImage,
            BrakesImage = request.BrakesImage,
            Observations = request.Observations,
            Status = ChecklistStatus.Pending
        };

        _context.Checklists.Add(checklist);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetChecklist), new { id = checklist.Id }, checklist);
    }

    [Authorize(Roles = "Admin,Gestor")]
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
            (checklist.DriverId != userId && userRole != "Admin" && userRole != "Gestor"))
        {
            return Forbid();
        }

        checklist.Shift = request.Shift;
        checklist.VehicleKm = request.VehicleKm;
        checklist.Tires = request.Tires;
        checklist.Lights = request.Lights;
        checklist.Mirrors = request.Mirrors;
        checklist.Windshield = request.Windshield;
        checklist.Horn = request.Horn;
        checklist.Brakes = request.Brakes;
        checklist.Fuel = request.Fuel;
        checklist.Documents = request.Documents;
        checklist.Cleaning = request.Cleaning;
        checklist.TiresImage = request.TiresImage;
        checklist.LightsImage = request.LightsImage;
        checklist.WindshieldImage = request.WindshieldImage;
        checklist.BrakesImage = request.BrakesImage;
        checklist.Observations = request.Observations;

        await _context.SaveChangesAsync();

        return Ok(checklist);
    }

    [Authorize(Roles = "Admin")]
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
    Guid VehicleId,
    Shift Shift,
    int VehicleKm,
    bool Tires,
    bool Lights,
    bool Mirrors,
    bool Windshield,
    bool Horn,
    bool Brakes,
    FuelLevel Fuel,
    bool Documents,
    bool Cleaning,
    string? TiresImage,
    string? LightsImage,
    string? WindshieldImage,
    string? BrakesImage,
    string? Observations
);

public record UpdateStatusRequest(ChecklistStatus Status);
