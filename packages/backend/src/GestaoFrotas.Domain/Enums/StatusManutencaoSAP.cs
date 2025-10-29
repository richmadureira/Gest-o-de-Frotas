namespace GestaoFrotas.Domain.Enums;

/// <summary>
/// Status da manutenção no sistema SAP
/// </summary>
public enum StatusManutencaoSAP
{
    /// <summary>
    /// Manutenção solicitada
    /// </summary>
    Solicitada = 1,

    /// <summary>
    /// Manutenção aprovada
    /// </summary>
    Aprovada = 2,

    /// <summary>
    /// Enviada para o SAP
    /// </summary>
    EnviadaSAP = 3,

    /// <summary>
    /// Processando no SAP
    /// </summary>
    ProcessandoSAP = 4,

    /// <summary>
    /// Ordem de serviço criada no SAP
    /// </summary>
    OrdemCriada = 5,

    /// <summary>
    /// Em execução
    /// </summary>
    EmExecucao = 6,

    /// <summary>
    /// Finalizada
    /// </summary>
    Finalizada = 7
}
