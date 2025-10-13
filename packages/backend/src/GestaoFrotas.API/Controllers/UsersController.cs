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
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetUsers(
        [FromQuery] string? search,
        [FromQuery] UserRole? role,
        [FromQuery] bool? active)
    {
        var query = _context.Users.AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(u => 
                u.Name.Contains(search) || 
                u.Email.Contains(search) ||
                (u.Cpf != null && u.Cpf.Contains(search)));
        }

        if (role.HasValue)
        {
            query = query.Where(u => u.Role == role.Value);
        }

        if (active.HasValue)
        {
            query = query.Where(u => u.Active == active.Value);
        }

        var users = await query
            .OrderBy(u => u.Name)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.Name,
                Role = u.Role.ToString(),
                u.Cpf,
                u.Phone,
                u.Active,
                u.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetUser(Guid id)
    {
        var user = await _context.Users
            .Where(u => u.Id == id)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.Name,
                Role = u.Role.ToString(),
                u.Cpf,
                u.Phone,
                u.Active,
                u.CreatedAt,
                ChecklistsCount = u.Checklists.Count
            })
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound(new { message = "Usuário não encontrado" });
        }

        return Ok(user);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound(new { message = "Usuário não encontrado" });
        }

        // Verificar se o email já existe em outro usuário
        if (await _context.Users.AnyAsync(u => u.Email == request.Email && u.Id != id))
        {
            return BadRequest(new { message = "Email já cadastrado em outro usuário" });
        }

        // Verificar se o CPF já existe em outro usuário (se fornecido)
        if (!string.IsNullOrEmpty(request.Cpf) && 
            await _context.Users.AnyAsync(u => u.Cpf == request.Cpf && u.Id != id))
        {
            return BadRequest(new { message = "CPF já cadastrado em outro usuário" });
        }

        user.Email = request.Email;
        user.Name = request.Name;
        user.Role = request.Role;
        user.Cpf = request.Cpf;
        user.Phone = request.Phone;
        user.Active = request.Active;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            user.Id,
            user.Email,
            user.Name,
            Role = user.Role.ToString(),
            user.Cpf,
            user.Phone,
            user.Active
        });
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/toggle-active")]
    public async Task<ActionResult> ToggleUserActive(Guid id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound(new { message = "Usuário não encontrado" });
        }

        user.Active = !user.Active;
        await _context.SaveChangesAsync();

        return Ok(new { active = user.Active });
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteUser(Guid id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound(new { message = "Usuário não encontrado" });
        }

        // Verificar se há checklists associados
        if (await _context.Checklists.AnyAsync(c => c.DriverId == id))
        {
            return BadRequest(new { message = "Não é possível excluir um usuário com checklists associados" });
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public record UpdateUserRequest(
    string Email,
    string Name,
    UserRole Role,
    string? Cpf,
    string? Phone,
    bool Active
);
