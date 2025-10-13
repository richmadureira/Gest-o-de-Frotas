using GestaoFrotas.Domain.Enums;

namespace GestaoFrotas.Domain.Entities;

/// <summary>
/// Entidade que representa um veículo da frota
/// </summary>
public class Vehicle : BaseEntity
{
    /// <summary>
    /// Placa do veículo (único)
    /// </summary>
    public string Plate { get; set; } = string.Empty;

    /// <summary>
    /// Modelo do veículo
    /// </summary>
    public string Model { get; set; } = string.Empty;

    /// <summary>
    /// Marca/Fabricante do veículo
    /// </summary>
    public string Brand { get; set; } = string.Empty;

    /// <summary>
    /// Ano de fabricação
    /// </summary>
    public int Year { get; set; }

    /// <summary>
    /// Tipo de veículo
    /// </summary>
    public VehicleType Type { get; set; }

    /// <summary>
    /// Status atual do veículo
    /// </summary>
    public VehicleStatus Status { get; set; } = VehicleStatus.Available;

    /// <summary>
    /// Quilometragem atual do veículo
    /// </summary>
    public int? Mileage { get; set; }

    /// <summary>
    /// Data da última manutenção realizada
    /// </summary>
    public DateTime? LastMaintenance { get; set; }

    /// <summary>
    /// Data prevista para próxima manutenção
    /// </summary>
    public DateTime? NextMaintenance { get; set; }

    // Navigation Properties

    /// <summary>
    /// Checklists realizados neste veículo
    /// </summary>
    public virtual ICollection<Checklist> Checklists { get; set; } = new List<Checklist>();

    /// <summary>
    /// Manutenções agendadas/realizadas neste veículo
    /// </summary>
    public virtual ICollection<Maintenance> Maintenances { get; set; } = new List<Maintenance>();
}

