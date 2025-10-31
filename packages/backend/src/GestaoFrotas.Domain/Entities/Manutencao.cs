using GestaoFrotas.Domain.Enums;

namespace GestaoFrotas.Domain.Entities;

/// <summary>
/// Entidade que representa uma manutenção de veículo
/// </summary>
public class Manutencao : EntidadeBase
{
    /// <summary>
    /// ID do veículo que receberá/recebeu a manutenção
    /// </summary>
    public Guid VeiculoId { get; set; }

    /// <summary>
    /// Tipo de manutenção
    /// </summary>
    public TipoManutencao Tipo { get; set; }

    /// <summary>
    /// Descrição detalhada da manutenção
    /// </summary>
    public string Descricao { get; set; } = string.Empty;

    /// <summary>
    /// Custo da manutenção (opcional)
    /// </summary>
    public decimal? Custo { get; set; }

    /// <summary>
    /// Status atual da manutenção
    /// </summary>
    public StatusManutencao Status { get; set; } = StatusManutencao.Agendada;

    /// <summary>
    /// Data e hora agendada para a manutenção
    /// </summary>
    public DateTime AgendadoPara { get; set; }

    /// <summary>
    /// Data e hora em que a manutenção foi concluída
    /// </summary>
    public DateTime? ConcluidoEm { get; set; }

    /// <summary>
    /// Número da ordem de serviço no SAP
    /// </summary>
    public string? NumeroOrdemSAP { get; set; }

    /// <summary>
    /// Fornecedor responsável pela manutenção no SAP
    /// </summary>
    public string? FornecedorSAP { get; set; }

    /// <summary>
    /// Status atual da manutenção no SAP
    /// </summary>
    public StatusManutencaoSAP? StatusSAP { get; set; }

    /// <summary>
    /// Progresso da manutenção (0-100)
    /// </summary>
    public int Progresso { get; set; } = 0;

    /// <summary>
    /// Prioridade atribuída à manutenção (Baixa, Média, Alta, Urgente)
    /// </summary>
    public PrioridadeManutencao Prioridade { get; set; } = PrioridadeManutencao.Media;

    /// <summary>
    /// Quilometragem registrada no momento da abertura da manutenção
    /// </summary>
    public int? QuilometragemNoAto { get; set; }

    /// <summary>
    /// Centro de custo associado (quando aplicável)
    /// </summary>
    public string? CentroCusto { get; set; }

    /// <summary>
    /// Observações adicionais para contexto da solicitação
    /// </summary>
    public string? Observacoes { get; set; }

    /// <summary>
    /// Usuário que abriu a solicitação (solicitante)
    /// </summary>
    public Guid? SolicitanteId { get; set; }

    // Navigation Properties

    /// <summary>
    /// Veículo relacionado a esta manutenção
    /// </summary>
    public virtual Veiculo Veiculo { get; set; } = null!;
}

