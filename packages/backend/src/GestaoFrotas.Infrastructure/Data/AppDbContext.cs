using Microsoft.EntityFrameworkCore;
using GestaoFrotas.Domain.Entities;

namespace GestaoFrotas.Infrastructure.Data;

/// <summary>
/// Contexto do Entity Framework para o banco de dados
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // DbSets - Tabelas do banco de dados
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Veiculo> Veiculos { get; set; }
    public DbSet<Checklist> Checklists { get; set; }
    public DbSet<Manutencao> Manutencoes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Aplicar todas as configurações do assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Atualizar AtualizadoEm automaticamente para todas as entidades modificadas
        var entries = ChangeTracker.Entries<EntidadeBase>()
            .Where(e => e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            entry.Entity.AtualizadoEm = DateTime.UtcNow;
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
