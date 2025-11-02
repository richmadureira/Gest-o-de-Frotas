using System;

namespace GestaoFrotas.Domain.Entities
{
    public class AuditLog : EntidadeBase
    {
        public string UsuarioId { get; set; } = string.Empty;
        public string UsuarioNome { get; set; } = string.Empty;
        public string Acao { get; set; } = string.Empty; // CREATE, UPDATE, DELETE, LOGIN, LOGOUT
        public string Entidade { get; set; } = string.Empty; // Veiculo, Usuario, Checklist, Manutencao
        public string? EntidadeId { get; set; }
        public string? ValoresAntigos { get; set; } // JSON
        public string? ValoresNovos { get; set; } // JSON
        public DateTime DataHora { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
    }
}

