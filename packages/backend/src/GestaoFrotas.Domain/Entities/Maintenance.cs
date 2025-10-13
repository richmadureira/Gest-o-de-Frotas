using GestaoFrotas.Domain.Enums;

namespace GestaoFrotas.Domain.Entities;

/// <summary>
/// Entidade que representa uma manutenção de veículo
/// </summary>
public class Maintenance : BaseEntity
{
    /// <summary>
    /// ID do veículo que receberá/recebeu a manutenção
    /// </summary>
    public Guid VehicleId { get; set; }

    /// <summary>
    /// Tipo de manutenção
    /// </summary>
    public MaintenanceType Type { get; set; }

    /// <summary>
    /// Descrição detalhada da manutenção
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Custo da manutenção (opcional)
    /// </summary>
    public decimal? Cost { get; set; }

    /// <summary>
    /// Status atual da manutenção
    /// </summary>
    public MaintenanceStatus Status { get; set; } = MaintenanceStatus.Scheduled;

    /// <summary>
    /// Data e hora agendada para a manutenção
    /// </summary>
    public DateTime ScheduledAt { get; set; }

    /// <summary>
    /// Data e hora em que a manutenção foi concluída
    /// </summary>
    public DateTime? CompletedAt { get; set; }

    // Navigation Properties

    /// <summary>
    /// Veículo relacionado a esta manutenção
    /// </summary>
    public virtual Vehicle Vehicle { get; set; } = null!;
}

