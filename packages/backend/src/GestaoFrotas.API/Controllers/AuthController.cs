using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GestaoFrotas.Infrastructure.Data;
using GestaoFrotas.Domain.Entities;
using GestaoFrotas.Domain.Enums;
using BCrypt.Net;

namespace GestaoFrotas.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(new { message = "Email e senha são obrigatórios" });
        }

        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.Ativo);

        if (usuario == null || !BCrypt.Net.BCrypt.Verify(request.Password, usuario.SenhaHash))
        {
            return Unauthorized(new { message = "Email ou senha inválidos" });
        }

        // Verificar CNH vencida para condutores (não bloqueia login, apenas avisa)
        var cnhVencida = false;
        var cnhVenceEm = (int?)null;
        
        if (usuario.Papel == PapelUsuario.Condutor && usuario.CnhValidade.HasValue)
        {
            var diasParaVencimento = (usuario.CnhValidade.Value.Date - DateTime.UtcNow.Date).Days;
            cnhVencida = diasParaVencimento < 0;
            cnhVenceEm = diasParaVencimento;
        }

        Console.WriteLine($"[AuthController] Login: {usuario.Email}, PrimeiroLogin: {usuario.PrimeiroLogin}, CNH Vencida: {cnhVencida}");

        var token = GenerateJwtToken(usuario);

        return Ok(new
        {
            token,
            user = new
            {
                id = usuario.Id,
                email = usuario.Email,
                name = usuario.Nome,
                role = usuario.Papel.ToString(),
                primeiroLogin = usuario.PrimeiroLogin,
                cnhVencida = cnhVencida,
                cnhVenceEm = cnhVenceEm
            }
        });
    }

    [HttpPost("register")]
    public async Task<ActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(new { message = "Email e senha são obrigatórios" });
        }

        // Verificar se o email já existe
        if (await _context.Usuarios.AnyAsync(u => u.Email == request.Email))
        {
            return BadRequest(new { message = "Email já cadastrado" });
        }

        // Verificar se o CPF já existe (se fornecido)
        if (!string.IsNullOrEmpty(request.Cpf) && await _context.Usuarios.AnyAsync(u => u.Cpf == request.Cpf))
        {
            return BadRequest(new { message = "CPF já cadastrado" });
        }

        // Validar matrícula única
        if (!string.IsNullOrEmpty(request.Matricula) && 
            await _context.Usuarios.AnyAsync(u => u.Matricula == request.Matricula))
        {
            return BadRequest(new { message = "Matrícula já cadastrada" });
        }

        // Validar CNH para condutores
        if (request.Papel == PapelUsuario.Condutor)
        {
            if (string.IsNullOrEmpty(request.CnhNumero))
            {
                return BadRequest(new { message = "Número da CNH é obrigatório para condutores" });
            }
            if (!request.CnhCategoria.HasValue)
            {
                return BadRequest(new { message = "Categoria da CNH é obrigatória para condutores" });
            }
            if (!request.CnhValidade.HasValue)
            {
                return BadRequest(new { message = "Validade da CNH é obrigatória para condutores" });
            }
        }

        var usuario = new Usuario
        {
            Email = request.Email,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Nome = request.Nome,
            Papel = request.Papel ?? PapelUsuario.Condutor,
            Cpf = request.Cpf,
            Telefone = request.Telefone,
            CnhNumero = request.CnhNumero,
            CnhCategoria = request.CnhCategoria,
            CnhValidade = request.CnhValidade,
            Matricula = request.Matricula,
            TurnoTrabalho = request.TurnoTrabalho,
            Ativo = true,
            PrimeiroLogin = true // Novo usuário precisa trocar senha no primeiro login
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        Console.WriteLine($"[AuthController] Usuário criado: {usuario.Email}, PrimeiroLogin: {usuario.PrimeiroLogin}");

        // Verificar CNH para o retorno
        var cnhVencida = false;
        var cnhVenceEm = (int?)null;
        
        if (usuario.Papel == PapelUsuario.Condutor && usuario.CnhValidade.HasValue)
        {
            var diasParaVencimento = (usuario.CnhValidade.Value.Date - DateTime.UtcNow.Date).Days;
            cnhVencida = diasParaVencimento < 0;
            cnhVenceEm = diasParaVencimento;
        }

        var token = GenerateJwtToken(usuario);

        return Ok(new
        {
            token,
            user = new
            {
                id = usuario.Id,
                email = usuario.Email,
                name = usuario.Nome,
                role = usuario.Papel.ToString(),
                primeiroLogin = usuario.PrimeiroLogin,
                cnhVencida = cnhVencida,
                cnhVenceEm = cnhVenceEm
            }
        });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        // Obter o ID do usuário autenticado do token
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { message = "Usuário não autenticado" });
        }

        var usuario = await _context.Usuarios.FindAsync(userId);
        if (usuario == null)
        {
            return NotFound(new { message = "Usuário não encontrado" });
        }

        // Verificar senha atual
        if (!BCrypt.Net.BCrypt.Verify(request.SenhaAtual, usuario.SenhaHash))
        {
            return BadRequest(new { message = "Senha atual incorreta" });
        }

        // Validar que a nova senha é diferente da atual
        if (BCrypt.Net.BCrypt.Verify(request.NovaSenha, usuario.SenhaHash))
        {
            return BadRequest(new { message = "A nova senha deve ser diferente da senha atual" });
        }

        // Atualizar senha e marcar que não é mais o primeiro login
        usuario.SenhaHash = BCrypt.Net.BCrypt.HashPassword(request.NovaSenha);
        usuario.PrimeiroLogin = false;
        await _context.SaveChangesAsync();

        // Verificar CNH para o retorno
        var cnhVencida = false;
        var cnhVenceEm = (int?)null;
        
        if (usuario.Papel == PapelUsuario.Condutor && usuario.CnhValidade.HasValue)
        {
            var diasParaVencimento = (usuario.CnhValidade.Value.Date - DateTime.UtcNow.Date).Days;
            cnhVencida = diasParaVencimento < 0;
            cnhVenceEm = diasParaVencimento;
        }

        // Gerar novo token
        var token = GenerateJwtToken(usuario);

        return Ok(new
        {
            token,
            user = new
            {
                id = usuario.Id,
                email = usuario.Email,
                name = usuario.Nome,
                role = usuario.Papel.ToString(),
                primeiroLogin = usuario.PrimeiroLogin,
                cnhVencida = cnhVencida,
                cnhVenceEm = cnhVenceEm
            },
            message = "Senha alterada com sucesso"
        });
    }

    private string GenerateJwtToken(Usuario usuario)
    {
        var jwtKey = _configuration["Jwt:Key"];
        var jwtIssuer = _configuration["Jwt:Issuer"];
        var jwtAudience = _configuration["Jwt:Audience"];
        var jwtExpiresInDays = int.Parse(_configuration["Jwt:ExpiresInDays"] ?? "7");

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(jwtKey!);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                new Claim(ClaimTypes.Email, usuario.Email),
                new Claim(ClaimTypes.Name, usuario.Nome),
                new Claim(ClaimTypes.Role, usuario.Papel.ToString())
            }),
            Expires = DateTime.UtcNow.AddDays(jwtExpiresInDays),
            Issuer = jwtIssuer,
            Audience = jwtAudience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}

public record LoginRequest(string Email, string Password);

public record RegisterRequest(
    string Email,
    string Password,
    string Nome,
    PapelUsuario? Papel,
    string? Cpf,
    string? Telefone,
    string? CnhNumero,
    CategoriaCNH? CnhCategoria,
    DateTime? CnhValidade,
    string? Matricula,
    Turno? TurnoTrabalho
);

public record ChangePasswordRequest(string SenhaAtual, string NovaSenha);
