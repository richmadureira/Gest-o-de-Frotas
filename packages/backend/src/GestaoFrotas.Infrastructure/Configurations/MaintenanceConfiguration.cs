using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using GestaoFrotas.Domain.Entities;

namespace GestaoFrotas.Infrastructure.Configurations;

/// <summary>
/// Configuração da entidade Maintenance usando Fluent API
/// </summary>
public class MaintenanceConfiguration : IEntityTypeConfiguration<Maintenance>
{
    public void Configure(EntityTypeBuilder<Maintenance> builder)
    {
        builder.ToTable("Maintenances");

        // Chave primária
        builder.HasKey(m => m.Id);

        // Propriedades obrigatórias
        builder.Property(m => m.VehicleId)
            .IsRequired();

        builder.Property(m => m.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(m => m.ScheduledAt)
            .IsRequired();

        // Propriedades opcionais
        builder.Property(m => m.Cost)
            .HasColumnType("decimal(18,2)")
            .IsRequired(false);

        builder.Property(m => m.CompletedAt)
            .IsRequired(false);

        // Conversões de enum para string
        builder.Property(m => m.Type)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(m => m.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Relacionamentos
        builder.HasOne(m => m.Vehicle)
            .WithMany(v => v.Maintenances)
            .HasForeignKey(m => m.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        // Índices para performance
        builder.HasIndex(m => m.VehicleId);
        builder.HasIndex(m => m.ScheduledAt);
        builder.HasIndex(m => m.Status);
        builder.HasIndex(m => m.Type);
    }
}
