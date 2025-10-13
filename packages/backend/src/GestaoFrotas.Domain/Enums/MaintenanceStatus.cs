namespace GestaoFrotas.Domain.Enums;

/// <summary>
/// Status da manutenção
/// </summary>
public enum MaintenanceStatus
{
    /// <summary>
    /// Agendada
    /// </summary>
    Scheduled = 1,

    /// <summary>
    /// Em andamento
    /// </summary>
    InProgress = 2,

    /// <summary>
    /// Concluída
    /// </summary>
    Completed = 3,

    /// <summary>
    /// Cancelada
    /// </summary>
    Cancelled = 4
}

