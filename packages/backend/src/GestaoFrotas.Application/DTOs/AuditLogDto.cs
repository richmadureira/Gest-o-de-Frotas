using System;

namespace GestaoFrotas.Application.DTOs
{
    public class AuditLogDto
    {
        public string Id { get; set; } = string.Empty;
        public string UsuarioId { get; set; } = string.Empty;
        public string UsuarioNome { get; set; } = string.Empty;
        public string Acao { get; set; } = string.Empty;
        public string Entidade { get; set; } = string.Empty;
        public string? ValoresAntigos { get; set; }
        public string? ValoresNovos { get; set; }
        public DateTime DataHora { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
    }
}

