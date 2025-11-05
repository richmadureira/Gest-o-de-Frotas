using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using GestaoFrotas.Infrastructure.Data;
using GestaoFrotas.Domain.Entities;
using GestaoFrotas.Domain.Enums;

namespace GestaoFrotas.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChecklistsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ChecklistsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetChecklists(
        [FromQuery] DateTime? dataInicio,
        [FromQuery] DateTime? dataFim,
        [FromQuery] string? status,
        [FromQuery] Guid? veiculoId,
        [FromQuery] Guid? motoristaId)
    {
        try
        {
            var query = _context.Checklists
                .Include(c => c.Veiculo)
                .Include(c => c.Motorista)
                .AsQueryable();

            // Aplicar filtros
            if (dataInicio.HasValue)
                query = query.Where(c => c.Data >= dataInicio.Value);
                
            if (dataFim.HasValue)
            {
                // Adicionar 1 dia para incluir todo o dia selecionado
                var dataFimAjustada = dataFim.Value.Date.AddDays(1);
                query = query.Where(c => c.Data < dataFimAjustada);
            }
                
            if (veiculoId.HasValue)
                query = query.Where(c => c.VeiculoId == veiculoId.Value);
                
            if (motoristaId.HasValue)
                query = query.Where(c => c.MotoristaId == motoristaId.Value);

            var checklists = await query
                .OrderByDescending(c => c.Data)
                .Select(c => new
                {
                    c.Id,
                    c.Data,
                    c.VeiculoId,
                    c.MotoristaId,
                    c.PlacaVeiculo,
                    c.KmVeiculo,
                    c.Pneus,
                    c.Luzes,
                    c.Freios,
                    c.Limpeza,
                    c.ImagemPneus,
                    c.ImagemLuzes,
                    c.ImagemFreios,
                    c.ImagemOutrasAvarias,
                    c.Observacoes,
                    c.Enviado,
                    Veiculo = new
                    {
                        c.Veiculo.Id,
                        c.Veiculo.Placa,
                        c.Veiculo.Modelo,
                        c.Veiculo.Marca
                    },
                    Motorista = new
                    {
                        c.Motorista.Id,
                        c.Motorista.Nome,
                        c.Motorista.Email,
                        CnhVencida = c.Motorista.CnhValidade.HasValue && 
                                    c.Motorista.CnhValidade.Value.Date < DateTime.UtcNow.Date
                    }
                })
                .ToListAsync();

            return Ok(checklists);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao buscar checklists: {ex.Message}" });
        }
    }

    [HttpGet("estatisticas")]
    public async Task<ActionResult<object>> GetEstatisticas()
    {
        try
        {
            var hoje = DateTime.UtcNow.Date;
            var amanha = hoje.AddDays(1);
            
            // Checklists de hoje
            var checklistsHoje = await _context.Checklists
                .Where(c => c.Data >= hoje && c.Data < amanha)
                .ToListAsync();
                
            var totalHoje = checklistsHoje.Count;
            var enviados = checklistsHoje.Count(c => c.Enviado);
            
            // Avarias não resolvidas (checklists com avarias detectadas nos últimos 7 dias)
            var avariasNaoResolvidas = await _context.Checklists
                .Include(c => c.Veiculo)
                .Where(c => (!c.Pneus || !c.Luzes || !c.Freios || !c.Limpeza) && 
                           c.Data >= DateTime.UtcNow.AddDays(-7))
                .Select(c => new
                {
                    c.Id,
                    Veiculo = c.Veiculo.Placa + " - " + c.Veiculo.Modelo,
                    Desc = c.Observacoes ?? "Avaria detectada",
                    Status = "Pendente"
                })
                .Take(5)
                .ToListAsync();
            
            return Ok(new
            {
                checklistsHoje = new { total = totalHoje, enviados },
                avariasNaoResolvidas
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao buscar estatísticas: {ex.Message}" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Checklist>> GetChecklist(Guid id)
    {
        var checklist = await _context.Checklists
            .Include(c => c.Veiculo)
            .Include(c => c.Motorista)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (checklist == null)
        {
            return NotFound(new { message = "Checklist não encontrado" });
        }

        return Ok(checklist);
    }

    [HttpPost]
    public async Task<ActionResult<Checklist>> CreateChecklist([FromBody] ChecklistRequest request)
    {
        // Verificar se o veículo existe
        var veiculo = await _context.Veiculos.FindAsync(request.VeiculoId);
        if (veiculo == null)
        {
            return BadRequest(new { message = "Veículo não encontrado" });
        }

        // Obter o ID do usuário logado
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var motoristaId))
        {
            return Unauthorized();
        }

        // Verificar se já existe checklist enviado hoje
        var hoje = DateTime.UtcNow.Date;
        var amanha = hoje.AddDays(1);

        var checklistHoje = await _context.Checklists
            .AnyAsync(c => c.MotoristaId == motoristaId 
                        && c.Data >= hoje 
                        && c.Data < amanha
                        && c.Enviado);

        if (checklistHoje)
        {
            return BadRequest(new { message = "Você já enviou um checklist hoje. Apenas um checklist por dia é permitido." });
        }

        var checklist = new Checklist
        {
            VeiculoId = request.VeiculoId,
            MotoristaId = motoristaId,
            PlacaVeiculo = veiculo.Placa,
            KmVeiculo = request.KmVeiculo,
            Pneus = request.Pneus,
            Luzes = request.Luzes,
            Freios = request.Freios,
            Limpeza = request.Limpeza,
            ImagemPneus = request.ImagemPneus,
            ImagemLuzes = request.ImagemLuzes,
            ImagemFreios = request.ImagemFreios,
            ImagemOutrasAvarias = request.ImagemOutrasAvarias,
            Observacoes = request.Observacoes,
            Enviado = true // Marca como enviado ao criar
        };

        _context.Checklists.Add(checklist);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetChecklist), new { id = checklist.Id }, checklist);
    
    }

    [Authorize(Roles = "Condutor")]
    [HttpGet("meu-checklist-hoje")]
    public async Task<ActionResult<object>> GetMeuChecklistHoje()
    {
        var motoristaId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var hoje = DateTime.UtcNow.Date;
        var amanha = hoje.AddDays(1);
        
        var checklist = await _context.Checklists
            .Include(c => c.Veiculo)
            .Where(c => c.MotoristaId == motoristaId 
                     && c.Data >= hoje 
                     && c.Data < amanha
                     && c.Enviado)
            .OrderByDescending(c => c.Data)
            .FirstOrDefaultAsync();
        
        if (checklist == null)
        {
            return Ok(new { enviado = false, checklist = (object?)null });
        }
        
        return Ok(new { enviado = true, checklist });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateChecklist(Guid id, [FromBody] ChecklistRequest request)
    {
        var checklist = await _context.Checklists.FindAsync(id);

        if (checklist == null)
        {
            return NotFound(new { message = "Checklist não encontrado" });
        }

        // Verificar se o usuário é o dono do checklist ou é admin/gestor
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        
        if (!Guid.TryParse(userIdClaim, out var userId) || 
            (checklist.MotoristaId != userId && userRole != "Administrador" && userRole != "Gestor"))
        {
            return Forbid();
        }

        checklist.KmVeiculo = request.KmVeiculo;
        checklist.Pneus = request.Pneus;
        checklist.Luzes = request.Luzes;
        checklist.Freios = request.Freios;
        checklist.Limpeza = request.Limpeza;
        checklist.ImagemPneus = request.ImagemPneus;
        checklist.ImagemLuzes = request.ImagemLuzes;
        checklist.ImagemFreios = request.ImagemFreios;
        checklist.ImagemOutrasAvarias = request.ImagemOutrasAvarias;
        checklist.Observacoes = request.Observacoes;

        await _context.SaveChangesAsync();

        return Ok(checklist);
    }

    [Authorize(Roles = "Administrador")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteChecklist(Guid id)
    {
        var checklist = await _context.Checklists.FindAsync(id);

        if (checklist == null)
        {
            return NotFound(new { message = "Checklist não encontrado" });
        }

        _context.Checklists.Remove(checklist);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("validar-placa/{veiculoId}")]
    public async Task<ActionResult<object>> ValidarPlacaHoje(Guid veiculoId)
    {
        try
        {
            var hoje = DateTime.UtcNow.Date;
            var amanha = hoje.AddDays(1);
            
            // Buscar checklist para este veículo hoje
            var checklistExistente = await _context.Checklists
                .Include(c => c.Motorista)
                .Where(c => c.VeiculoId == veiculoId 
                         && c.Data >= hoje 
                         && c.Data < amanha
                         && c.Enviado)
                .FirstOrDefaultAsync();
            
            if (checklistExistente != null)
            {
                return Ok(new 
                { 
                    existe = true, 
                    motivo = $"Já existe um checklist para este veículo hoje, preenchido por {checklistExistente.Motorista?.Nome ?? "outro usuário"} às {checklistExistente.Data.ToLocalTime():HH:mm}.",
                    checklist = checklistExistente
                });
            }
            
            return Ok(new { existe = false });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao validar placa: {ex.Message}" });
        }
    }

    [HttpPost("upload-image")]
    public async Task<ActionResult<object>> UploadImage(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Arquivo inválido" });

            // Validar tipo de arquivo
            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
                return BadRequest(new { message = "Apenas imagens JPG e PNG são permitidas" });

            // Validar tamanho (máximo 5MB)
            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { message = "Imagem muito grande. Máximo 5MB" });

            // Gerar nome único com timestamp para evitar conflitos
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var fileName = $"{timestamp}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var uploadsFolder = Path.Combine("wwwroot", "uploads", "checklists");
            
            // Criar pasta se não existir
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var filePath = Path.Combine(uploadsFolder, fileName);

            // Salvar arquivo com FileShare.ReadWrite para permitir acesso simultâneo
            using (var stream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.ReadWrite))
            {
                await file.CopyToAsync(stream);
                await stream.FlushAsync(); // Garantir que os dados foram escritos
            }

            // Aguardar um pouco para garantir que o arquivo foi completamente escrito
            await Task.Delay(100);

            // Retornar URL relativa
            return Ok(new { url = $"/uploads/checklists/{fileName}" });
        }
        catch (IOException ioEx)
        {
            // Erro específico de acesso ao arquivo
            return StatusCode(500, new { message = $"Erro de acesso ao arquivo: {ioEx.Message}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao fazer upload: {ex.Message}" });
        }
    }
}

public record ChecklistRequest(
    Guid VeiculoId,
    int KmVeiculo,
    bool Pneus,
    bool Luzes,
    bool Freios,
    bool Limpeza,
    string? ImagemPneus,
    string? ImagemLuzes,
    string? ImagemFreios,
    string? ImagemOutrasAvarias,
    string? Observacoes
);
