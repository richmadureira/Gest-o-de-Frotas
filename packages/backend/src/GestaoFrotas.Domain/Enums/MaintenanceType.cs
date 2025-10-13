namespace GestaoFrotas.Domain.Enums;

/// <summary>
/// Tipo de manutenção do veículo
/// </summary>
public enum MaintenanceType
{
    /// <summary>
    /// Manutenção preventiva (programada)
    /// </summary>
    Preventive = 1,

    /// <summary>
    /// Manutenção corretiva (reparo)
    /// </summary>
    Corrective = 2,

    /// <summary>
    /// Manutenção de emergência
    /// </summary>
    Emergency = 3
}

