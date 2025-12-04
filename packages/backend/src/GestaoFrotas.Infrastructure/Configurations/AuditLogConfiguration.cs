using GestaoFrotas.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GestaoFrotas.Infrastructure.Configurations
{
    public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
    {
        public void Configure(EntityTypeBuilder<AuditLog> builder)
        {
            builder.ToTable("AuditLogs");

            builder.HasKey(a => a.Id);

            builder.Property(a => a.UsuarioId)
                .IsRequired()
                .HasMaxLength(450);

            builder.Property(a => a.UsuarioNome)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(a => a.Acao)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(a => a.Entidade)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(a => a.DataHora)
                .IsRequired();

            builder.Property(a => a.IpAddress)
                .HasMaxLength(45); // IPv6

            builder.Property(a => a.UserAgent)
                .HasMaxLength(500);

            // Índices para melhorar performance de consultas
            builder.HasIndex(a => a.UsuarioId);
            builder.HasIndex(a => a.Entidade);
            builder.HasIndex(a => a.DataHora);
        }
    }
}

