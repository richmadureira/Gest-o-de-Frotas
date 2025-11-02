using GestaoFrotas.Application.DTOs;

namespace GestaoFrotas.Application.Interfaces
{
    public interface IAuditService
    {
        Task LogAuditAsync(
            string userId,
            string userName,
            string action,
            string entityName,
            string entityId,
            string changes,
            string ipAddress,
            string userAgent);

        Task<IEnumerable<AuditLogDto>> GetAuditLogsAsync();
    }
}

