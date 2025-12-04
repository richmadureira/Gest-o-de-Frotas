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
        builder.Property(c => c.VeiculoId)
            .IsRequired();

        builder.Property(c => c.MotoristaId)
            .IsRequired();

        builder.Property(c => c.PlacaVeiculo)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(c => c.KmVeiculo)
            .IsRequired();

        // Propriedades opcionais
        builder.Property(c => c.ImagemPneus)
            .HasMaxLength(500);

        builder.Property(c => c.ImagemLuzes)
            .HasMaxLength(500);

        builder.Property(c => c.ImagemOutrasAvarias)
            .HasMaxLength(500);

        builder.Property(c => c.ImagemFreios)
            .HasMaxLength(500);

        builder.Property(c => c.Observacoes)
            .HasMaxLength(1000);

        // Valores padrão
        builder.Property(c => c.Data)
            .HasDefaultValueSql("GETUTCDATE()");

        // Relacionamentos
        builder.HasOne(c => c.Veiculo)
            .WithMany(v => v.Checklists)
            .HasForeignKey(c => c.VeiculoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Motorista)
            .WithMany(u => u.Checklists)
            .HasForeignKey(c => c.MotoristaId)
            .OnDelete(DeleteBehavior.Restrict);

        // Índices para performance
        builder.HasIndex(c => c.VeiculoId);
        builder.HasIndex(c => c.MotoristaId);
        builder.HasIndex(c => c.Data);
    }
}
