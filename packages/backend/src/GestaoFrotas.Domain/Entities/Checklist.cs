using GestaoFrotas.Domain.Enums;

namespace GestaoFrotas.Domain.Entities;

/// <summary>
/// Entidade que representa um checklist veicular
/// </summary>
public class Checklist : BaseEntity
{
    /// <summary>
    /// ID do veículo verificado
    /// </summary>
    public Guid VehicleId { get; set; }

    /// <summary>
    /// ID do motorista/condutor que realizou o checklist
    /// </summary>
    public Guid DriverId { get; set; }

    /// <summary>
    /// Data e hora da realização do checklist
    /// </summary>
    public DateTime Date { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Turno em que o checklist foi realizado
    /// </summary>
    public Shift Shift { get; set; }

    /// <summary>
    /// Status de aprovação do checklist
    /// </summary>
    public ChecklistStatus Status { get; set; } = ChecklistStatus.Pending;

    // Dados do veículo no momento do checklist
    
    /// <summary>
    /// Placa do veículo (snapshot)
    /// </summary>
    public string VehiclePlate { get; set; } = string.Empty;

    /// <summary>
    /// Quilometragem registrada no momento do checklist
    /// </summary>
    public int VehicleKm { get; set; }

    // Itens de verificação do checklist (true = OK, false = NOK)

    /// <summary>
    /// Estado dos pneus
    /// </summary>
    public bool Tires { get; set; }

    /// <summary>
    /// Funcionamento das luzes/faróis
    /// </summary>
    public bool Lights { get; set; }

    /// <summary>
    /// Estado dos retrovisores
    /// </summary>
    public bool Mirrors { get; set; }

    /// <summary>
    /// Estado do para-brisa
    /// </summary>
    public bool Windshield { get; set; }

    /// <summary>
    /// Funcionamento da buzina
    /// </summary>
    public bool Horn { get; set; }

    /// <summary>
    /// Funcionamento dos freios
    /// </summary>
    public bool Brakes { get; set; }

    /// <summary>
    /// Nível de combustível
    /// </summary>
    public FuelLevel Fuel { get; set; }

    /// <summary>
    /// Documentos do veículo em ordem
    /// </summary>
    public bool Documents { get; set; }

    /// <summary>
    /// Limpeza geral do veículo
    /// </summary>
    public bool Cleaning { get; set; }

    // URLs das imagens (armazenadas no servidor)

    /// <summary>
    /// Caminho da imagem dos pneus
    /// </summary>
    public string? TiresImage { get; set; }

    /// <summary>
    /// Caminho da imagem das luzes
    /// </summary>
    public string? LightsImage { get; set; }

    /// <summary>
    /// Caminho da imagem do para-brisa
    /// </summary>
    public string? WindshieldImage { get; set; }

    /// <summary>
    /// Caminho da imagem dos freios
    /// </summary>
    public string? BrakesImage { get; set; }

    /// <summary>
    /// Observações adicionais do motorista
    /// </summary>
    public string? Observations { get; set; }

    // Navigation Properties

    /// <summary>
    /// Veículo relacionado a este checklist
    /// </summary>
    public virtual Vehicle Vehicle { get; set; } = null!;

    /// <summary>
    /// Motorista que realizou o checklist
    /// </summary>
    public virtual User Driver { get; set; } = null!;
}

