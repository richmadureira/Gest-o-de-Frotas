using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using GestaoFrotas.Domain.Entities;

namespace GestaoFrotas.Infrastructure.Configurations;

/// <summary>
/// Configuração da entidade Vehicle usando Fluent API
/// </summary>
public class VehicleConfiguration : IEntityTypeConfiguration<Vehicle>
{
    public void Configure(EntityTypeBuilder<Vehicle> builder)
    {
        builder.ToTable("Vehicles");

        // Chave primária
        builder.HasKey(v => v.Id);

        // Propriedades obrigatórias
        builder.Property(v => v.Plate)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(v => v.Model)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(v => v.Brand)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(v => v.Year)
            .IsRequired();

        // Propriedades opcionais
        builder.Property(v => v.Mileage)
            .IsRequired(false);

        builder.Property(v => v.LastMaintenance)
            .IsRequired(false);

        builder.Property(v => v.NextMaintenance)
            .IsRequired(false);

        // Índices únicos
        builder.HasIndex(v => v.Plate)
            .IsUnique();

        // Conversões de enum para string
        builder.Property(v => v.Type)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(v => v.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Relacionamentos
        builder.HasMany(v => v.Checklists)
            .WithOne(c => c.Vehicle)
            .HasForeignKey(c => c.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(v => v.Maintenances)
            .WithOne(m => m.Vehicle)
            .HasForeignKey(m => m.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
