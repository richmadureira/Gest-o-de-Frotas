using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using GestaoFrotas.Domain.Entities;

namespace GestaoFrotas.Infrastructure.Configurations;

/// <summary>
/// Configuração da entidade Checklist usando Fluent API
/// </summary>
public class ChecklistConfiguration : IEntityTypeConfiguration<Checklist>
{
    public void Configure(EntityTypeBuilder<Checklist> builder)
    {
        builder.ToTable("Checklists");

        // Chave primária
        builder.HasKey(c => c.Id);

        // Propriedades obrigatórias
        builder.Property(c => c.VehicleId)
            .IsRequired();

        builder.Property(c => c.DriverId)
            .IsRequired();

        builder.Property(c => c.VehiclePlate)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(c => c.VehicleKm)
            .IsRequired();

        // Propriedades opcionais
        builder.Property(c => c.TiresImage)
            .HasMaxLength(500);

        builder.Property(c => c.LightsImage)
            .HasMaxLength(500);

        builder.Property(c => c.WindshieldImage)
            .HasMaxLength(500);

        builder.Property(c => c.BrakesImage)
            .HasMaxLength(500);

        builder.Property(c => c.Observations)
            .HasMaxLength(1000);

        // Conversões de enum para string
        builder.Property(c => c.Shift)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(c => c.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(c => c.Fuel)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Valores padrão
        builder.Property(c => c.Date)
            .HasDefaultValueSql("GETUTCDATE()");

        // Relacionamentos
        builder.HasOne(c => c.Vehicle)
            .WithMany(v => v.Checklists)
            .HasForeignKey(c => c.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Driver)
            .WithMany(u => u.Checklists)
            .HasForeignKey(c => c.DriverId)
            .OnDelete(DeleteBehavior.Restrict);

        // Índices para performance
        builder.HasIndex(c => c.VehicleId);
        builder.HasIndex(c => c.DriverId);
        builder.HasIndex(c => c.Date);
        builder.HasIndex(c => c.Status);
    }
}
