namespace GestaoFrotas.Domain.Enums;

/// <summary>
/// Status do veículo na frota
/// </summary>
public enum VehicleStatus
{
    /// <summary>
    /// Disponível para uso
    /// </summary>
    Available = 1,

    /// <summary>
    /// Em uso/operação
    /// </summary>
    InUse = 2,

    /// <summary>
    /// Em manutenção
    /// </summary>
    Maintenance = 3,

    /// <summary>
    /// Inativo/Fora de operação
    /// </summary>
    Inactive = 4
}

