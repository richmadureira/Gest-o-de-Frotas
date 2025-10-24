namespace GestaoFrotas.Domain.Enums;

/// <summary>
/// Status de aprovação do checklist
/// </summary>
public enum StatusChecklist
{
    /// <summary>
    /// Aguardando aprovação
    /// </summary>
    Pendente = 1,

    /// <summary>
    /// Aprovado pelo gestor
    /// </summary>
    Aprovado = 2,

    /// <summary>
    /// Rejeitado pelo gestor
    /// </summary>
    Rejeitado = 3
}

