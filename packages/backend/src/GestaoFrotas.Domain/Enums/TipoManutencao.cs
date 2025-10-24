namespace GestaoFrotas.Domain.Enums;

/// <summary>
/// Tipo de manutenção do veículo
/// </summary>
public enum TipoManutencao
{
    /// <summary>
    /// Manutenção preventiva (programada)
    /// </summary>
    Preventiva = 1,

    /// <summary>
    /// Manutenção corretiva (reparo)
    /// </summary>
    Corretiva = 2,

    /// <summary>
    /// Manutenção de emergência
    /// </summary>
    Emergencia = 3
}

