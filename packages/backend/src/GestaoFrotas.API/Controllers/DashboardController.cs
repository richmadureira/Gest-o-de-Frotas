using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestaoFrotas.Infrastructure.Data;
using GestaoFrotas.Domain.Enums;

namespace GestaoFrotas.API.Controllers;

[Authorize(Roles = "Administrador,Gestor")]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetDashboardData()
    {
        try
        {
            var hoje = DateTime.UtcNow.Date;
            var inicioSemana = hoje.AddDays(-7);
            var inicioMes = new DateTime(hoje.Year, hoje.Month, 1);

            // KPI 1: Frota
            var totalVeiculos = await _context.Veiculos.CountAsync();
            var veiculosDisponiveis = await _context.Veiculos.CountAsync(v => v.Status == StatusVeiculo.Disponivel);
            var veiculosEmManutencao = await _context.Veiculos.CountAsync(v => v.Status == StatusVeiculo.EmManutencao);
            var veiculosInativos = await _context.Veiculos.CountAsync(v => v.Status == StatusVeiculo.Inativo);

            // KPI 2: Checklists Hoje
            var checklistsHoje = await _context.Checklists
                .Where(c => c.Data >= hoje && c.Data < hoje.AddDays(1))
                .ToListAsync();
            
            var checklistsPendentes = checklistsHoje.Count(c => c.Status == StatusChecklist.Pendente);
            var checklistsConcluidos = checklistsHoje.Count(c => c.Status == StatusChecklist.Aprovado);
            var totalChecklistsHoje = checklistsHoje.Count;
            var taxaConclusao = totalChecklistsHoje > 0 ? (checklistsConcluidos * 100) / totalChecklistsHoje : 0;

            // KPI 3: Manutenções (baseado em StatusSAP)
            var manutencoesAtivas = await _context.Manutencoes
                .Where(m => m.StatusSAP != null && m.StatusSAP != StatusManutencaoSAP.Finalizada)
                .CountAsync();
            
            var manutencoesAtrasadas = await _context.Veiculos
                .Where(v => v.ProximaManutencao.HasValue && v.ProximaManutencao.Value < hoje)
                .CountAsync();

            // KPI 4: Custos do Mês (baseado em data de criação)
            var manutencoesComCusto = await _context.Manutencoes
                .Where(m => m.CriadoEm >= inicioMes && m.Custo.HasValue)
                .ToListAsync();
            var custosMes = manutencoesComCusto.Sum(m => m.Custo ?? 0);

            // Alertas: CNH Vencida
            var condutoresCnhVencida = await _context.Usuarios
                .Where(u => u.Papel == PapelUsuario.Condutor && 
                           u.CnhValidade.HasValue && 
                           u.CnhValidade.Value.Date < hoje)
                .Select(u => new
                {
                    id = u.Id,
                    nome = u.Nome,
                    cnhValidade = u.CnhValidade,
                    diasVencida = EF.Functions.DateDiffDay(u.CnhValidade!.Value, hoje)
                })
                .OrderBy(u => u.cnhValidade)
                .Take(5)
                .ToListAsync();

            // Alertas: Manutenções Atrasadas
            var veiculosManutencaoAtrasada = await _context.Veiculos
                .Where(v => v.ProximaManutencao.HasValue && 
                           v.ProximaManutencao.Value < hoje)
                .Select(v => new
                {
                    id = v.Id,
                    placa = v.Placa,
                    modelo = v.Modelo,
                    proximaManutencao = v.ProximaManutencao,
                    diasAtraso = EF.Functions.DateDiffDay(v.ProximaManutencao!.Value, hoje)
                })
                .OrderByDescending(v => v.diasAtraso)
                .Take(5)
                .ToListAsync();

            // Alertas: Checklists Pendentes (atrasados > 2h)
            var duasHorasAtras = DateTime.UtcNow.AddHours(-2);
            var checklistsPendentesLista = await _context.Checklists
                .Include(c => c.Veiculo)
                .Include(c => c.Motorista)
                .Where(c => c.Status == StatusChecklist.Pendente && 
                           c.Data < duasHorasAtras)
                .ToListAsync();
            
            var checklistsPendentesAtrasados = checklistsPendentesLista
                .Select(c => new
                {
                    id = c.Id,
                    motorista = c.Motorista.Nome,
                    veiculo = c.Veiculo.Placa + " - " + c.Veiculo.Modelo,
                    data = c.Data,
                    horasAtraso = Math.Round((DateTime.UtcNow - c.Data).TotalHours, 1)
                })
                .OrderByDescending(c => c.horasAtraso)
                .Take(5)
                .ToList();

            // Tendências: Checklists últimos 7 dias
            var checklistsSemana = await _context.Checklists
                .Where(c => c.Data >= inicioSemana)
                .GroupBy(c => c.Data.Date)
                .Select(g => new
                {
                    data = g.Key,
                    aprovados = g.Count(c => c.Status == StatusChecklist.Aprovado),
                    rejeitados = g.Count(c => c.Status == StatusChecklist.Rejeitado),
                    pendentes = g.Count(c => c.Status == StatusChecklist.Pendente)
                })
                .OrderBy(g => g.data)
                .ToListAsync();

            // Preencher dias faltantes com zeros
            var tendenciaCompleta = new List<object>();
            for (int i = 6; i >= 0; i--)
            {
                var dia = hoje.AddDays(-i);
                var dados = checklistsSemana.FirstOrDefault(c => c.data == dia);
                
                tendenciaCompleta.Add(new
                {
                    dia = dia.ToString("dd/MM"),
                    diaSemana = dia.ToString("ddd"),
                    aprovados = dados?.aprovados ?? 0,
                    rejeitados = dados?.rejeitados ?? 0,
                    pendentes = dados?.pendentes ?? 0,
                    total = (dados?.aprovados ?? 0) + (dados?.rejeitados ?? 0) + (dados?.pendentes ?? 0)
                });
            }

            return Ok(new
            {
                kpis = new
                {
                    frota = new
                    {
                        total = totalVeiculos,
                        disponiveis = veiculosDisponiveis,
                        emManutencao = veiculosEmManutencao,
                        inativos = veiculosInativos,
                        taxaDisponibilidade = totalVeiculos > 0 ? (veiculosDisponiveis * 100) / totalVeiculos : 0
                    },
                    checklists = new
                    {
                        pendentes = checklistsPendentes,
                        concluidos = checklistsConcluidos,
                        total = totalChecklistsHoje,
                        taxaConclusao
                    },
                    manutencoes = new
                    {
                        ativas = manutencoesAtivas,
                        atrasadas = manutencoesAtrasadas
                    },
                    custos = new
                    {
                        mesAtual = custosMes
                    }
                },
                alertas = new
                {
                    cnhVencidas = condutoresCnhVencida,
                    manutencoesAtrasadas = veiculosManutencaoAtrasada,
                    checklistsPendentes = checklistsPendentesAtrasados
                },
                tendencias = new
                {
                    checklistsSemana = tendenciaCompleta
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao buscar dados do dashboard: {ex.Message}" });
        }
    }
}

