using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using GestaoFrotas.Domain.Entities;

namespace GestaoFrotas.Infrastructure.Configurations;

/// <summary>
/// Configuração da entidade Veiculo usando Fluent API
/// </summary>
public class VeiculoConfiguration : IEntityTypeConfiguration<Veiculo>
{
    public void Configure(EntityTypeBuilder<Veiculo> builder)
    {
        builder.ToTable("Veiculos");

        // Chave primária
        builder.HasKey(v => v.Id);

        // Propriedades obrigatórias
        builder.Property(v => v.Placa)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(v => v.Modelo)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(v => v.Marca)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(v => v.Ano)
            .IsRequired();

        // Propriedades opcionais
        builder.Property(v => v.Quilometragem)
            .IsRequired(false);

        builder.Property(v => v.UltimaManutencao)
            .IsRequired(false);

        // Índices únicos
        builder.HasIndex(v => v.Placa)
            .IsUnique();

        // Conversões de enum para string
        builder.Property(v => v.Tipo)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(v => v.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Relacionamentos
        builder.HasMany(v => v.Checklists)
            .WithOne(c => c.Veiculo)
            .HasForeignKey(c => c.VeiculoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(v => v.Manutencoes)
            .WithOne(m => m.Veiculo)
            .HasForeignKey(m => m.VeiculoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
