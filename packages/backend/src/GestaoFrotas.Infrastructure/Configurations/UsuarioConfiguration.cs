using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using GestaoFrotas.Domain.Entities;

namespace GestaoFrotas.Infrastructure.Configurations;

/// <summary>
/// Configuração da entidade Usuario usando Fluent API
/// </summary>
public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.ToTable("Usuarios");

        // Chave primária
        builder.HasKey(u => u.Id);

        // Propriedades obrigatórias
        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(u => u.SenhaHash)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(u => u.Nome)
            .IsRequired()
            .HasMaxLength(255);

        // Propriedades opcionais
        builder.Property(u => u.Cpf)
            .HasMaxLength(11);

        builder.Property(u => u.Telefone)
            .HasMaxLength(20);

        // Índices únicos
        builder.HasIndex(u => u.Email)
            .IsUnique();

        builder.HasIndex(u => u.Cpf)
            .IsUnique()
            .HasFilter("[Cpf] IS NOT NULL");

        // Conversão de enum para string
        builder.Property(u => u.Papel)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Valor padrão
        builder.Property(u => u.Ativo)
            .HasDefaultValue(true);

        // Campos específicos de condutor
        builder.Property(u => u.CnhNumero)
            .HasMaxLength(11);

        builder.Property(u => u.CnhCategoria)
            .HasConversion<string>()
            .HasMaxLength(5);

        builder.Property(u => u.Matricula)
            .HasMaxLength(20);

        builder.Property(u => u.TurnoTrabalho)
            .HasConversion<string>()
            .HasMaxLength(10);

        // Índice único para matrícula
        builder.HasIndex(u => u.Matricula)
            .IsUnique()
            .HasFilter("[Matricula] IS NOT NULL");

        // Relacionamentos
        builder.HasMany(u => u.Checklists)
            .WithOne(c => c.Motorista)
            .HasForeignKey(c => c.MotoristaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
