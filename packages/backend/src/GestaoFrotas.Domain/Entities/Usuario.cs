using GestaoFrotas.Domain.Enums;

namespace GestaoFrotas.Domain.Entities;

/// <summary>
/// Entidade que representa um usuário/motorista do sistema
/// </summary>
public class Usuario : EntidadeBase
{
    /// <summary>
    /// Email do usuário (usado para login)
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Hash da senha do usuário
    /// </summary>
    public string SenhaHash { get; set; } = string.Empty;

    /// <summary>
    /// Nome completo do usuário
    /// </summary>
    public string Nome { get; set; } = string.Empty;

    /// <summary>
    /// Perfil/Role do usuário no sistema
    /// </summary>
    public PapelUsuario Papel { get; set; }

    /// <summary>
    /// CPF do usuário (opcional, apenas para motoristas)
    /// </summary>
    public string? Cpf { get; set; }

    /// <summary>
    /// Telefone de contato
    /// </summary>
    public string? Telefone { get; set; }

    /// <summary>
    /// Indica se o usuário está ativo no sistema
    /// </summary>
    public bool Ativo { get; set; } = true;

    /// <summary>
    /// Indica se é o primeiro login do usuário (precisa trocar senha)
    /// </summary>
    public bool PrimeiroLogin { get; set; } = true;

    // Campos específicos para condutores
    /// <summary>
    /// Número da CNH do condutor
    /// </summary>
    public string? CnhNumero { get; set; }

    /// <summary>
    /// Categoria da CNH do condutor
    /// </summary>
    public CategoriaCNH? CnhCategoria { get; set; }

    /// <summary>
    /// Data de validade da CNH
    /// </summary>
    public DateTime? CnhValidade { get; set; }

    /// <summary>
    /// Matrícula interna do condutor
    /// </summary>
    public string? Matricula { get; set; }

    /// <summary>
    /// Turno de trabalho do condutor
    /// </summary>
    public Turno? TurnoTrabalho { get; set; }

    /// <summary>
    /// Propriedade computada para verificar se a CNH está vencida
    /// </summary>
    public bool CnhVencida => CnhValidade.HasValue && CnhValidade.Value.Date < DateTime.UtcNow.Date;

    // Navigation Properties
    
    /// <summary>
    /// Checklists realizados por este usuário/motorista
    /// </summary>
    public virtual ICollection<Checklist> Checklists { get; set; } = new List<Checklist>();
}

