namespace GestaoFrotas.Domain.Enums;

/// <summary>
/// Nível de combustível no veículo
/// </summary>
public enum FuelLevel
{
    /// <summary>
    /// Tanque vazio
    /// </summary>
    Empty = 0,

    /// <summary>
    /// Um quarto do tanque
    /// </summary>
    Quarter = 25,

    /// <summary>
    /// Meio tanque
    /// </summary>
    Half = 50,

    /// <summary>
    /// Três quartos do tanque
    /// </summary>
    ThreeQuarters = 75,

    /// <summary>
    /// Tanque cheio
    /// </summary>
    Full = 100
}

