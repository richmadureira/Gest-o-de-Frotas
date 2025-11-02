using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestaoFrotas.Infrastructure.Data;
using GestaoFrotas.Application.DTOs;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace GestaoFrotas.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Administrador")]
    public class AuditLogsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuditLogsController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obter logs de auditoria com filtros e paginação
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<object>> GetAuditLogs(
            [FromQuery] string? usuarioId = null,
            [FromQuery] string? acao = null,
            [FromQuery] string? entidade = null,
            [FromQuery] DateTime? dataInicio = null,
            [FromQuery] DateTime? dataFim = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.AuditLogs.AsQueryable();

            // Aplicar filtros
            if (!string.IsNullOrEmpty(usuarioId))
                query = query.Where(a => a.UsuarioId == usuarioId);

            if (!string.IsNullOrEmpty(acao))
                query = query.Where(a => a.Acao == acao);

            if (!string.IsNullOrEmpty(entidade))
                query = query.Where(a => a.Entidade == entidade);

            if (dataInicio.HasValue)
                query = query.Where(a => a.DataHora >= dataInicio.Value);

            if (dataFim.HasValue)
                query = query.Where(a => a.DataHora <= dataFim.Value);

            // Contar total
            var total = await query.CountAsync();

            // Paginar
            var logs = await query
                .OrderByDescending(a => a.DataHora)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new AuditLogDto
                {
                    Id = a.Id.ToString(),
                    UsuarioId = a.UsuarioId,
                    UsuarioNome = a.UsuarioNome,
                    Acao = a.Acao,
                    Entidade = a.Entidade,
                    EntidadeId = a.EntidadeId,
                    ValoresAntigos = a.ValoresAntigos,
                    ValoresNovos = a.ValoresNovos,
                    DataHora = a.DataHora,
                    IpAddress = a.IpAddress,
                    UserAgent = a.UserAgent
                })
                .ToListAsync();

            return Ok(new
            {
                data = logs,
                total,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)total / pageSize)
            });
        }

        /// <summary>
        /// Obter estatísticas de auditoria
        /// </summary>
        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetStats()
        {
            var totalLogs = await _context.AuditLogs.CountAsync();
            var logsHoje = await _context.AuditLogs.CountAsync(a => a.DataHora.Date == DateTime.UtcNow.Date);
            var ultimoLogin = await _context.AuditLogs
                .Where(a => a.Acao == "LOGIN")
                .OrderByDescending(a => a.DataHora)
                .FirstOrDefaultAsync();

            var acoesCount = await _context.AuditLogs
                .GroupBy(a => a.Acao)
                .Select(g => new { Acao = g.Key, Count = g.Count() })
                .ToListAsync();

            return Ok(new
            {
                totalLogs,
                logsHoje,
                ultimoLogin = ultimoLogin != null ? new
                {
                    Usuario = ultimoLogin.UsuarioNome,
                    DataHora = ultimoLogin.DataHora
                } : null,
                acoesCount
            });
        }
    }
}

