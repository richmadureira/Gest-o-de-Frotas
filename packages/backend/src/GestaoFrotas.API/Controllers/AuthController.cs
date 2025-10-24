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

        var token = GenerateJwtToken(usuario);

        return Ok(new
        {
            token,
            user = new
            {
                id = usuario.Id,
                email = usuario.Email,
                name = usuario.Nome,
                role = usuario.Papel.ToString()
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

        var usuario = new Usuario
        {
            Email = request.Email,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Nome = request.Nome,
            Papel = request.Papel ?? PapelUsuario.Condutor,
            Cpf = request.Cpf,
            Telefone = request.Telefone,
            Ativo = true
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(usuario);

        return Ok(new
        {
            token,
            user = new
            {
                id = usuario.Id,
                email = usuario.Email,
                name = usuario.Nome,
                role = usuario.Papel.ToString()
            }
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
    string? Telefone
);
