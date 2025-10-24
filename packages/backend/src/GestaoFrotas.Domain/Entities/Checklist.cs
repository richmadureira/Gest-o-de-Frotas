using GestaoFrotas.Domain.Enums;

namespace GestaoFrotas.Domain.Entities;

/// <summary>
/// Entidade que representa um checklist veicular
/// </summary>
public class Checklist : EntidadeBase
{
    /// <summary>
    /// ID do veículo verificado
    /// </summary>
    public Guid VeiculoId { get; set; }

    /// <summary>
    /// ID do motorista/condutor que realizou o checklist
    /// </summary>
    public Guid MotoristaId { get; set; }

    /// <summary>
    /// Data e hora da realização do checklist
    /// </summary>
    public DateTime Data { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Turno em que o checklist foi realizado
    /// </summary>
    public Turno Turno { get; set; }

    /// <summary>
    /// Status de aprovação do checklist
    /// </summary>
    public StatusChecklist Status { get; set; } = StatusChecklist.Pendente;

    // Dados do veículo no momento do checklist
    
    /// <summary>
    /// Placa do veículo (snapshot)
    /// </summary>
    public string PlacaVeiculo { get; set; } = string.Empty;

    /// <summary>
    /// Quilometragem registrada no momento do checklist
    /// </summary>
    public int KmVeiculo { get; set; }

    // Itens de verificação do checklist (true = OK, false = NOK)

    /// <summary>
    /// Estado dos pneus
    /// </summary>
    public bool Pneus { get; set; }

    /// <summary>
    /// Funcionamento das luzes/faróis
    /// </summary>
    public bool Luzes { get; set; }

    /// <summary>
    /// Estado dos retrovisores
    /// </summary>
    public bool Retrovisores { get; set; }

    /// <summary>
    /// Estado do para-brisa
    /// </summary>
    public bool ParaBrisa { get; set; }

    /// <summary>
    /// Funcionamento da buzina
    /// </summary>
    public bool Buzina { get; set; }

    /// <summary>
    /// Funcionamento dos freios
    /// </summary>
    public bool Freios { get; set; }

    /// <summary>
    /// Nível de combustível
    /// </summary>
    public NivelCombustivel Combustivel { get; set; }

    /// <summary>
    /// Documentos do veículo em ordem
    /// </summary>
    public bool Documentos { get; set; }

    /// <summary>
    /// Limpeza geral do veículo
    /// </summary>
    public bool Limpeza { get; set; }

    // URLs das imagens (armazenadas no servidor)

    /// <summary>
    /// Caminho da imagem dos pneus
    /// </summary>
    public string? ImagemPneus { get; set; }

    /// <summary>
    /// Caminho da imagem das luzes
    /// </summary>
    public string? ImagemLuzes { get; set; }

    /// <summary>
    /// Caminho da imagem do para-brisa
    /// </summary>
    public string? ImagemParaBrisa { get; set; }

    /// <summary>
    /// Caminho da imagem dos freios
    /// </summary>
    public string? ImagemFreios { get; set; }

    /// <summary>
    /// Observações adicionais do motorista
    /// </summary>
    public string? Observacoes { get; set; }

    // Navigation Properties

    /// <summary>
    /// Veículo relacionado a este checklist
    /// </summary>
    public virtual Veiculo Veiculo { get; set; } = null!;

    /// <summary>
    /// Motorista que realizou o checklist
    /// </summary>
    public virtual Usuario Motorista { get; set; } = null!;
}

