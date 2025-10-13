namespace GestaoFrotas.Domain.Enums;

/// <summary>
/// Perfis de usuário do sistema
/// </summary>
public enum UserRole
{
    /// <summary>
    /// Administrador do sistema - Acesso total
    /// </summary>
    Admin = 1,

    /// <summary>
    /// Gestor de frota - Gerencia veículos, motoristas e relatórios
    /// </summary>
    Gestor = 2,

    /// <summary>
    /// Condutor - Realiza checklists veiculares
    /// </summary>
    Condutor = 3
}

