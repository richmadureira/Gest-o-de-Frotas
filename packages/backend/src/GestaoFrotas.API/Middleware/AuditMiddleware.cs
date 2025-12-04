using System;
using System.Security.Claims;
using System.Threading.Tasks;
using GestaoFrotas.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace GestaoFrotas.API.Middleware
{
    public class AuditMiddleware
    {
        private readonly RequestDelegate _next;

        public AuditMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IAuditService auditService)
        {
            // Capturar informações da requisição
            var method = context.Request.Method;
            var path = context.Request.Path.Value ?? string.Empty;
            var ipAddress = context.Connection.RemoteIpAddress?.ToString();
            var userAgent = context.Request.Headers["User-Agent"].ToString();

            // Executar a requisição
            await _next(context);

            // Auditar apenas operações específicas
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var usuarioId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "Sistema";
                var usuarioNome = context.User.FindFirst(ClaimTypes.Name)?.Value ?? "Sistema";

                // Auditar login
                if (path.Contains("/api/auth/login", StringComparison.OrdinalIgnoreCase) && 
                    method == "POST" && 
                    context.Response.StatusCode == 200)
                {
                    await auditService.LogAuditAsync(
                        usuarioId,
                        usuarioNome,
                        "LOGIN",
                        "Usuario",
                        string.Empty,
                        ipAddress ?? string.Empty,
                        userAgent ?? string.Empty
                    );
                }

                // Auditar criação, atualização e exclusão de entidades críticas
                if ((method == "POST" || method == "PUT" || method == "DELETE") &&
                    context.Response.StatusCode >= 200 && context.Response.StatusCode < 300)
                {
                    string entidade = string.Empty;
                    string acao = method switch
                    {
                        "POST" => "CREATE",
                        "PUT" => "UPDATE",
                        "DELETE" => "DELETE",
                        _ => "UNKNOWN"
                    };

                    // Identificar entidade pelo path
                    if (path.Contains("/api/usuarios", StringComparison.OrdinalIgnoreCase))
                        entidade = "Usuario";
                    else if (path.Contains("/api/veiculos", StringComparison.OrdinalIgnoreCase))
                        entidade = "Veiculo";
                    else if (path.Contains("/api/checklists", StringComparison.OrdinalIgnoreCase))
                        entidade = "Checklist";
                    else if (path.Contains("/api/manutencoes", StringComparison.OrdinalIgnoreCase))
                        entidade = "Manutencao";

                    if (!string.IsNullOrEmpty(entidade))
                    {
                        await auditService.LogAuditAsync(
                            usuarioId,
                            usuarioNome,
                            acao,
                            entidade,
                            string.Empty, // Changes - requer implementação mais complexa
                            ipAddress ?? string.Empty,
                            userAgent ?? string.Empty
                        );
                    }
                }
            }
        }
    }
}

