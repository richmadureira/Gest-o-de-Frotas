using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using GestaoFrotas.Application.DTOs;
using GestaoFrotas.Application.Interfaces;
using GestaoFrotas.Domain.Entities;
using GestaoFrotas.Infrastructure.Data;

namespace GestaoFrotas.Infrastructure.Services
{
    public class AuditService : IAuditService
    {
        private readonly AppDbContext _context;

        public AuditService(AppDbContext context)
        {
            _context = context;
        }

        public async Task LogAuditAsync(
            string userId,
            string userName,
            string action,
            string entityName,
            string changes,
            string ipAddress,
            string userAgent)
        {
            var auditLog = new AuditLog
            {
                // Id is auto-generated in EntidadeBase
                UsuarioId = userId,
                UsuarioNome = userName,
                Acao = action,
                Entidade = entityName,
                ValoresNovos = changes, // Using ValoresNovos for the changes
                DataHora = DateTime.UtcNow,
                IpAddress = ipAddress,
                UserAgent = userAgent
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<AuditLogDto>> GetAuditLogsAsync()
        {
            return await _context.AuditLogs
                .OrderByDescending(a => a.DataHora)
                .Select(a => new AuditLogDto
                {
                    Id = a.Id.ToString(),
                    UsuarioId = a.UsuarioId,
                    UsuarioNome = a.UsuarioNome,
                    Acao = a.Acao,
                    Entidade = a.Entidade,
                    ValoresAntigos = a.ValoresAntigos,
                    ValoresNovos = a.ValoresNovos,
                    DataHora = a.DataHora,
                    IpAddress = a.IpAddress,
                    UserAgent = a.UserAgent
                })
                .ToListAsync();
        }
    }
}

