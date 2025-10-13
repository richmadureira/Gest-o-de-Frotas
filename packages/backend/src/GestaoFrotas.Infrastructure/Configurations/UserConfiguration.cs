using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using GestaoFrotas.Domain.Entities;

namespace GestaoFrotas.Infrastructure.Configurations;

/// <summary>
/// Configuração da entidade User usando Fluent API
/// </summary>
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        // Chave primária
        builder.HasKey(u => u.Id);

        // Propriedades obrigatórias
        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(u => u.PasswordHash)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(u => u.Name)
            .IsRequired()
            .HasMaxLength(255);

        // Propriedades opcionais
        builder.Property(u => u.Cpf)
            .HasMaxLength(11);

        builder.Property(u => u.Phone)
            .HasMaxLength(20);

        // Índices únicos
        builder.HasIndex(u => u.Email)
            .IsUnique();

        builder.HasIndex(u => u.Cpf)
            .IsUnique()
            .HasFilter("[Cpf] IS NOT NULL");

        // Conversão de enum para string
        builder.Property(u => u.Role)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Valor padrão
        builder.Property(u => u.Active)
            .HasDefaultValue(true);

        // Relacionamentos
        builder.HasMany(u => u.Checklists)
            .WithOne(c => c.Driver)
            .HasForeignKey(c => c.DriverId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
