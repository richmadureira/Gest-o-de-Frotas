using GestaoFrotas.Domain.Enums;

namespace GestaoFrotas.Domain.Entities;

/// <summary>
/// Entidade que representa um veículo da frota
/// </summary>
public class Veiculo : EntidadeBase
{
    /// <summary>
    /// Placa do veículo (único)
    /// </summary>
    public string Placa { get; set; } = string.Empty;

    /// <summary>
    /// Modelo do veículo
    /// </summary>
    public string Modelo { get; set; } = string.Empty;

    /// <summary>
    /// Marca/Fabricante do veículo
    /// </summary>
    public string Marca { get; set; } = string.Empty;

    /// <summary>
    /// Ano de fabricação
    /// </summary>
    public int Ano { get; set; }

    /// <summary>
    /// Tipo de veículo
    /// </summary>
    public TipoVeiculo Tipo { get; set; }

    /// <summary>
    /// Status atual do veículo
    /// </summary>
    public StatusVeiculo Status { get; set; } = StatusVeiculo.Disponivel;

    /// <summary>
    /// Quilometragem atual do veículo
    /// </summary>
    public int? Quilometragem { get; set; }

    /// <summary>
    /// Data da última manutenção realizada
    /// </summary>
    public DateTime? UltimaManutencao { get; set; }

    // Navigation Properties

    /// <summary>
    /// Checklists realizados neste veículo
    /// </summary>
    public virtual ICollection<Checklist> Checklists { get; set; } = new List<Checklist>();

    /// <summary>
    /// Manutenções agendadas/realizadas neste veículo
    /// </summary>
    public virtual ICollection<Manutencao> Manutencoes { get; set; } = new List<Manutencao>();
}

