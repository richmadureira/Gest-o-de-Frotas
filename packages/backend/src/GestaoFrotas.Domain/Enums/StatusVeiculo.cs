namespace GestaoFrotas.Domain.Enums;

/// <summary>
/// Status do veículo na frota
/// </summary>
public enum StatusVeiculo
{
    /// <summary>
    /// Disponível para uso
    /// </summary>
    Disponivel = 1,

    /// <summary>
    /// Em uso/operação
    /// </summary>
    EmUso = 2,

    /// <summary>
    /// Em manutenção
    /// </summary>
    EmManutencao = 3,

    /// <summary>
    /// Inativo/Fora de operação
    /// </summary>
    Inativo = 4
}

