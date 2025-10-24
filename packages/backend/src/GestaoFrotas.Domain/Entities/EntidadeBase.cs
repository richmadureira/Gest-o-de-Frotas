namespace GestaoFrotas.Domain.Entities;

/// <summary>
/// Classe base para todas as entidades do domínio
/// </summary>
public abstract class EntidadeBase
{
    /// <summary>
    /// Identificador único da entidade
    /// </summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Data e hora de criação do registro
    /// </summary>
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Data e hora da última atualização do registro
    /// </summary>
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;
}

