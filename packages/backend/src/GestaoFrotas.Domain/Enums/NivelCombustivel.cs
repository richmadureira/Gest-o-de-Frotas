namespace GestaoFrotas.Domain.Enums;

/// <summary>
/// Nível de combustível no veículo
/// </summary>
public enum NivelCombustivel
{
    /// <summary>
    /// Tanque vazio
    /// </summary>
    Vazio = 0,

    /// <summary>
    /// Um quarto do tanque
    /// </summary>
    UmQuarto = 25,

    /// <summary>
    /// Meio tanque
    /// </summary>
    Metade = 50,

    /// <summary>
    /// Três quartos do tanque
    /// </summary>
    TresQuartos = 75,

    /// <summary>
    /// Tanque cheio
    /// </summary>
    Cheio = 100
}

