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
public class UsuariosController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsuariosController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize(Roles = "Administrador,Gestor")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetUsuarios(
        [FromQuery] string? search,
        [FromQuery] PapelUsuario? papel,
        [FromQuery] bool? ativo)
    {
        var query = _context.Usuarios.AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(u => 
                u.Nome.Contains(search) || 
                u.Email.Contains(search) ||
                (u.Cpf != null && u.Cpf.Contains(search)));
        }

        if (papel.HasValue)
        {
            query = query.Where(u => u.Papel == papel.Value);
        }

        if (ativo.HasValue)
        {
            query = query.Where(u => u.Ativo == ativo.Value);
        }

        var usuarios = await query
            .OrderBy(u => u.Nome)
            .Select(u => new
            {
                u.Id,
                u.Email,
                Nome = u.Nome,
                Papel = u.Papel.ToString(),
                u.Cpf,
                Telefone = u.Telefone,
                Ativo = u.Ativo,
                CriadoEm = u.CriadoEm,
                CnhNumero = u.CnhNumero,
                CnhCategoria = u.CnhCategoria.HasValue ? u.CnhCategoria.ToString() : null,
                CnhValidade = u.CnhValidade,
                CnhVencida = u.CnhValidade.HasValue && u.CnhValidade.Value.Date < DateTime.UtcNow.Date,
                Matricula = u.Matricula,
                TurnoTrabalho = u.TurnoTrabalho.HasValue ? u.TurnoTrabalho.ToString() : null
            })
            .ToListAsync();

        return Ok(usuarios);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetUsuario(Guid id)
    {
        var usuario = await _context.Usuarios
            .Where(u => u.Id == id)
            .Select(u => new
            {
                u.Id,
                u.Email,
                Nome = u.Nome,
                Papel = u.Papel.ToString(),
                u.Cpf,
                Telefone = u.Telefone,
                Ativo = u.Ativo,
                CriadoEm = u.CriadoEm,
                ChecklistsCount = u.Checklists.Count,
                CnhNumero = u.CnhNumero,
                CnhCategoria = u.CnhCategoria.HasValue ? u.CnhCategoria.ToString() : null,
                CnhValidade = u.CnhValidade,
                CnhVencida = u.CnhValidade.HasValue && u.CnhValidade.Value.Date < DateTime.UtcNow.Date,
                Matricula = u.Matricula,
                TurnoTrabalho = u.TurnoTrabalho.HasValue ? u.TurnoTrabalho.ToString() : null
            })
            .FirstOrDefaultAsync();

        if (usuario == null)
        {
            return NotFound(new { message = "Usuário não encontrado" });
        }

        return Ok(usuario);
    }

    [Authorize(Roles = "Administrador,Gestor")]
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateUsuario(Guid id, [FromBody] UpdateUsuarioRequest request)
    {
        var usuario = await _context.Usuarios.FindAsync(id);

        if (usuario == null)
        {
            return NotFound(new { message = "Usuário não encontrado" });
        }

        // Verificar se o email já existe em outro usuário
        if (await _context.Usuarios.AnyAsync(u => u.Email == request.Email && u.Id != id))
        {
            return BadRequest(new { message = "Email já cadastrado em outro usuário" });
        }

        // Verificar se o CPF já existe em outro usuário (se fornecido)
        if (!string.IsNullOrEmpty(request.Cpf) && 
            await _context.Usuarios.AnyAsync(u => u.Cpf == request.Cpf && u.Id != id))
        {
            return BadRequest(new { message = "CPF já cadastrado em outro usuário" });
        }

        // Verificar se a matrícula já existe em outro usuário
        if (!string.IsNullOrEmpty(request.Matricula) && 
            await _context.Usuarios.AnyAsync(u => u.Matricula == request.Matricula && u.Id != id))
        {
            return BadRequest(new { message = "Matrícula já cadastrada em outro usuário" });
        }

        usuario.Email = request.Email;
        usuario.Nome = request.Nome;
        usuario.Papel = request.Papel;
        usuario.Cpf = request.Cpf;
        usuario.Telefone = request.Telefone;
        usuario.Ativo = request.Ativo;
        usuario.CnhNumero = request.CnhNumero;
        usuario.CnhCategoria = request.CnhCategoria;
        usuario.CnhValidade = request.CnhValidade;
        usuario.Matricula = request.Matricula;
        usuario.TurnoTrabalho = request.TurnoTrabalho;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            usuario.Id,
            usuario.Email,
            Nome = usuario.Nome,
            Papel = usuario.Papel.ToString(),
            usuario.Cpf,
            Telefone = usuario.Telefone,
            Ativo = usuario.Ativo,
            CnhNumero = usuario.CnhNumero,
            CnhCategoria = usuario.CnhCategoria.HasValue ? usuario.CnhCategoria.ToString() : null,
            CnhValidade = usuario.CnhValidade,
            Matricula = usuario.Matricula,
            TurnoTrabalho = usuario.TurnoTrabalho.HasValue ? usuario.TurnoTrabalho.ToString() : null
        });
    }

    [Authorize(Roles = "Administrador")]
    [HttpPut("{id}/toggle-active")]
    public async Task<ActionResult> ToggleUsuarioAtivo(Guid id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);

        if (usuario == null)
        {
            return NotFound(new { message = "Usuário não encontrado" });
        }

        usuario.Ativo = !usuario.Ativo;
        await _context.SaveChangesAsync();

        return Ok(new { ativo = usuario.Ativo });
    }

    [Authorize(Roles = "Administrador")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteUsuario(Guid id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);

        if (usuario == null)
        {
            return NotFound(new { message = "Usuário não encontrado" });
        }

        // Verificar se há checklists associados
        if (await _context.Checklists.AnyAsync(c => c.MotoristaId == id))
        {
            return BadRequest(new { message = "Não é possível excluir um usuário com checklists associados" });
        }

        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public record UpdateUsuarioRequest(
    string Email,
    string Nome,
    PapelUsuario Papel,
    string? Cpf,
    string? Telefone,
    bool Ativo,
    string? CnhNumero,
    CategoriaCNH? CnhCategoria,
    DateTime? CnhValidade,
    string? Matricula,
    Turno? TurnoTrabalho
);
