using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using GestaoFrotas.Domain.Entities;

namespace GestaoFrotas.Infrastructure.Configurations;

/// <summary>
/// Configuração da entidade Manutencao usando Fluent API
/// </summary>
public class ManutencaoConfiguration : IEntityTypeConfiguration<Manutencao>
{
    public void Configure(EntityTypeBuilder<Manutencao> builder)
    {
        builder.ToTable("Manutencoes");

        // Chave primária
        builder.HasKey(m => m.Id);

        // Propriedades obrigatórias
        builder.Property(m => m.VeiculoId)
            .IsRequired();

        builder.Property(m => m.Descricao)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(m => m.AgendadoPara)
            .IsRequired();

        // Propriedades opcionais
        builder.Property(m => m.Custo)
            .HasColumnType("decimal(18,2)")
            .IsRequired(false);

        builder.Property(m => m.ConcluidoEm)
            .IsRequired(false);

        // Conversões de enum para string
        builder.Property(m => m.Tipo)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(m => m.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(m => m.Prioridade)
            .HasConversion<string>()
            .HasMaxLength(10);

        builder.Property(m => m.CentroCusto)
            .HasMaxLength(50)
            .IsRequired(false);

        builder.Property(m => m.Observacoes)
            .HasMaxLength(1000)
            .IsRequired(false);

        builder.Property(m => m.QuilometragemNoAto)
            .IsRequired(false);

        builder.Property(m => m.SolicitanteId)
            .IsRequired(false);

        // Relacionamentos
        builder.HasOne(m => m.Veiculo)
            .WithMany(v => v.Manutencoes)
            .HasForeignKey(m => m.VeiculoId)
            .OnDelete(DeleteBehavior.Restrict);

        // Índices para performance
        builder.HasIndex(m => m.VeiculoId);
        builder.HasIndex(m => m.AgendadoPara);
        builder.HasIndex(m => m.Status);
        builder.HasIndex(m => m.Tipo);
        builder.HasIndex(m => m.Prioridade);
    }
}
