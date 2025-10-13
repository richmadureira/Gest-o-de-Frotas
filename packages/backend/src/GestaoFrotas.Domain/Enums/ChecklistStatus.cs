namespace GestaoFrotas.Domain.Enums;

/// <summary>
/// Status de aprovação do checklist
/// </summary>
public enum ChecklistStatus
{
    /// <summary>
    /// Aguardando aprovação
    /// </summary>
    Pending = 1,

    /// <summary>
    /// Aprovado pelo gestor
    /// </summary>
    Approved = 2,

    /// <summary>
    /// Rejeitado pelo gestor
    /// </summary>
    Rejected = 3
}

