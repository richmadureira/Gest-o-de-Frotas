using GestaoFrotas.Domain.Entities;
using GestaoFrotas.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace GestaoFrotas.Infrastructure.Data;

/// <summary>
/// DataSeeder refatorado com exemplos estratégicos que demonstram todas as funcionalidades do sistema
/// Total: 8 usuários, 6 veículos, 12 checklists, 8 manutenções
/// </summary>
public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Seed na ordem correta de dependências
        await SeedUsuarios(context);
        await SeedVeiculos(context);
        await SeedChecklists(context);
        await SeedManutencoes(context);
    }

    private static async Task SeedUsuarios(AppDbContext context)
    {
        if (await context.Usuarios.AnyAsync()) return;

        var hoje = DateTime.UtcNow;

        // ============================================
        // USUÁRIOS (8 totais)
        // ============================================
        
        var usuarios = new List<Usuario>
        {
            // ----------------------------------------
            // 1. ADMINISTRADOR (1)
            // ----------------------------------------
            new Usuario
            {
                Email = "admin@translog.com",
                SenhaHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Nome = "Administrador Sistema",
                Papel = PapelUsuario.Administrador,
                Cpf = "12345678901",
                Telefone = "(11) 98765-4321",
                Ativo = true
            },

            // ----------------------------------------
            // 2. GESTORES (2)
            // ----------------------------------------
            new Usuario
            {
                Email = "gestor@translog.com",
                SenhaHash = BCrypt.Net.BCrypt.HashPassword("gestor123"),
                Nome = "Maria Silva Santos",
                Papel = PapelUsuario.Gestor,
                Cpf = "98765432109",
                Telefone = "(11) 97654-3210",
                Ativo = true
            },
            new Usuario
            {
                Email = "gestor2@translog.com",
                SenhaHash = BCrypt.Net.BCrypt.HashPassword("gestor123"),
                Nome = "João Carlos Oliveira",
                Papel = PapelUsuario.Gestor,
                Cpf = "45678912345",
                Telefone = "(11) 96543-2109",
                Ativo = true
            },

            // ----------------------------------------
            // 3. CONDUTORES (5) - Demonstrar Alertas CNH
            // ----------------------------------------
            
            // CNH VENCIDA - Alerta Crítico Vermelho
            new Usuario
            {
                Email = "carlos.silva@translog.com",
                SenhaHash = BCrypt.Net.BCrypt.HashPassword("condutor123"),
                Nome = "Carlos Silva",
                Papel = PapelUsuario.Condutor,
                Cpf = "11122233344",
                Telefone = "(11) 91111-1111",
                CnhNumero = "11122233344",
                CnhCategoria = CategoriaCNH.D,
                CnhValidade = hoje.AddDays(-10), // Vencida há 10 dias
                Matricula = "COND001",
                TurnoTrabalho = Turno.Manha,
                Ativo = true
            },

            // CNH VENCENDO EM 5 DIAS - Alerta Laranja Urgente
            new Usuario
            {
                Email = "ana.costa@translog.com",
                SenhaHash = BCrypt.Net.BCrypt.HashPassword("condutor123"),
                Nome = "Ana Costa",
                Papel = PapelUsuario.Condutor,
                Cpf = "22233344455",
                Telefone = "(11) 92222-2222",
                CnhNumero = "22233344455",
                CnhCategoria = CategoriaCNH.C,
                CnhValidade = hoje.AddDays(5), // Vence em 5 dias
                Matricula = "COND002",
                TurnoTrabalho = Turno.Tarde,
                Ativo = true
            },

            // CNH VENCENDO EM 12 DIAS - Alerta Amarelo
            new Usuario
            {
                Email = "pedro.almeida@translog.com",
                SenhaHash = BCrypt.Net.BCrypt.HashPassword("condutor123"),
                Nome = "Pedro Almeida",
                Papel = PapelUsuario.Condutor,
                Cpf = "33344455566",
                Telefone = "(11) 93333-3333",
                CnhNumero = "33344455566",
                CnhCategoria = CategoriaCNH.D,
                CnhValidade = hoje.AddDays(12), // Vence em 12 dias
                Matricula = "COND003",
                TurnoTrabalho = Turno.Noite,
                Ativo = true
            },

            // CNH VENCENDO EM 25 DIAS - Alerta Azul
            new Usuario
            {
                Email = "julia.santos@translog.com",
                SenhaHash = BCrypt.Net.BCrypt.HashPassword("condutor123"),
                Nome = "Júlia Santos",
                Papel = PapelUsuario.Condutor,
                Cpf = "44455566677",
                Telefone = "(11) 94444-4444",
                CnhNumero = "44455566677",
                CnhCategoria = CategoriaCNH.E,
                CnhValidade = hoje.AddDays(25), // Vence em 25 dias
                Matricula = "COND004",
                TurnoTrabalho = Turno.Manha,
                Ativo = true
            },

            // CNH VÁLIDA POR 6 MESES - Sem Alerta
            new Usuario
            {
                Email = "ricardo.lima@translog.com",
                SenhaHash = BCrypt.Net.BCrypt.HashPassword("condutor123"),
                Nome = "Ricardo Lima",
                Papel = PapelUsuario.Condutor,
                Cpf = "55566677788",
                Telefone = "(11) 95555-5555",
                CnhNumero = "55566677788",
                CnhCategoria = CategoriaCNH.C,
                CnhValidade = hoje.AddDays(180), // Válida por 6 meses
                Matricula = "COND005",
                TurnoTrabalho = Turno.Tarde,
                Ativo = true
            }
        };

        context.Usuarios.AddRange(usuarios);
        await context.SaveChangesAsync();
    }

    private static async Task SeedVeiculos(AppDbContext context)
    {
        if (await context.Veiculos.AnyAsync()) return;

        var hoje = DateTime.UtcNow;

        // ============================================
        // VEÍCULOS (6 totais - Apenas Carros e Motocicletas)
        // ============================================

        var veiculos = new List<Veiculo>
        {
            // ----------------------------------------
            // CARROS (4) - Todos modelo HB20 - Demonstrar todos os status
            // ----------------------------------------
            
            // Carro Disponível - Quilometragem média, próxima manutenção futura
            new Veiculo
            {
                Placa = "ABC-1234",
                Modelo = "HB20",
                Marca = "Hyundai",
                Ano = 2023,
                Tipo = TipoVeiculo.Carro,
                Status = StatusVeiculo.Disponivel,
                Quilometragem = 42000,
                UltimaManutencao = hoje.AddDays(-45),
                ProximaManutencao = hoje.AddDays(30) // Manutenção daqui 30 dias
            },

            // Carro Em Manutenção - Quilometragem alta, manutenção em andamento
            new Veiculo
            {
                Placa = "DEF-5678",
                Modelo = "HB20",
                Marca = "Hyundai",
                Ano = 2019,
                Tipo = TipoVeiculo.Carro,
                Status = StatusVeiculo.EmManutencao,
                Quilometragem = 145000,
                UltimaManutencao = hoje.AddDays(-90),
                ProximaManutencao = hoje.AddDays(-15) // Manutenção atrasada
            },

            // Carro Disponível - Quilometragem baixa, recém mantido
            new Veiculo
            {
                Placa = "GHI-9012",
                Modelo = "HB20",
                Marca = "Hyundai",
                Ano = 2022,
                Tipo = TipoVeiculo.Carro,
                Status = StatusVeiculo.Disponivel,
                Quilometragem = 28000,
                UltimaManutencao = hoje.AddDays(-15),
                ProximaManutencao = hoje.AddDays(75) // Bem mantido
            },

            // Carro Inativo - Quilometragem muito alta, aguardando decisão
            new Veiculo
            {
                Placa = "JKL-3456",
                Modelo = "HB20",
                Marca = "Hyundai",
                Ano = 2015,
                Tipo = TipoVeiculo.Carro,
                Status = StatusVeiculo.Inativo,
                Quilometragem = 320000,
                UltimaManutencao = hoje.AddDays(-180),
                ProximaManutencao = null // Sem manutenção programada (inativo)
            },

            // ----------------------------------------
            // MOTOCICLETAS (2) - Todas Honda CG - Demonstrar diferentes cenários
            // ----------------------------------------
            
            // Motocicleta Disponível - Quilometragem média, próxima manutenção em 1 mês
            new Veiculo
            {
                Placa = "MNO-7890",
                Modelo = "Honda CG",
                Marca = "Honda",
                Ano = 2023,
                Tipo = TipoVeiculo.Motocicleta,
                Status = StatusVeiculo.Disponivel,
                Quilometragem = 22000,
                UltimaManutencao = hoje.AddDays(-60),
                ProximaManutencao = hoje.AddDays(30)
            },

            // Motocicleta Disponível - Quilometragem baixa, manutenção ATRASADA (para alerta)
            new Veiculo
            {
                Placa = "PQR-2468",
                Modelo = "Honda CG",
                Marca = "Honda",
                Ano = 2022,
                Tipo = TipoVeiculo.Motocicleta,
                Status = StatusVeiculo.Disponivel,
                Quilometragem = 15000,
                UltimaManutencao = hoje.AddDays(-120),
                ProximaManutencao = hoje.AddDays(-20) // Atrasada há 20 dias - ALERTA!
            }
        };

        context.Veiculos.AddRange(veiculos);
        await context.SaveChangesAsync();
    }

    private static async Task SeedChecklists(AppDbContext context)
    {
        if (await context.Checklists.AnyAsync()) return;

        var usuarios = await context.Usuarios.Where(u => u.Papel == PapelUsuario.Condutor).ToListAsync();
        var veiculos = await context.Veiculos.ToListAsync();
        var hoje = DateTime.UtcNow.Date;

        // ============================================
        // CHECKLISTS (10 totais - 2 de hoje + 8 histórico)
        // Demonstra: 3 condutores sem checklist hoje (Carlos, Ana, Pedro)
        // ============================================

        var checklists = new List<Checklist>();

        // ----------------------------------------
        // CHECKLISTS DE HOJE (2 de 5 condutores - demonstra 3 pendentes)
        // ----------------------------------------
        // Apenas Ricardo e Júlia enviaram checklist hoje
        // Carlos, Ana e Pedro NÃO enviaram (aparecem em "Ações Pendentes")

        // 1. Checklist SEM AVARIAS - Tudo OK
        checklists.Add(new Checklist
        {
            VeiculoId = veiculos[0].Id, // ABC-1234
            MotoristaId = usuarios[4].Id, // Ricardo (CNH válida)
            Data = hoje.AddHours(7),
            PlacaVeiculo = veiculos[0].Placa,
            KmVeiculo = 75120,
            Pneus = true,
            Luzes = true,
            Freios = true,
            Limpeza = true,
            Observacoes = "Veículo em perfeito estado. Tudo verificado e aprovado.",
            Enviado = true
        });

        // 2. Checklist COM MÚLTIPLAS AVARIAS - Pneus + Luzes + Freios
        checklists.Add(new Checklist
        {
            VeiculoId = veiculos[2].Id, // GHI-9012
            MotoristaId = usuarios[3].Id, // Júlia (CNH vence em 25 dias)
            Data = hoje.AddHours(6),
            PlacaVeiculo = veiculos[2].Placa,
            KmVeiculo = 28230,
            Pneus = false, // PROBLEMA!
            Luzes = false, // PROBLEMA!
            Freios = false, // PROBLEMA!
            Limpeza = true,
            ImagemPneus = "/uploads/checklist-pneus-002.jpg",
            ImagemLuzes = "/uploads/checklist-luzes-001.jpg",
            ImagemFreios = "/uploads/checklist-freios-001.jpg",
            Observacoes = "ATENÇÃO: Múltiplos problemas detectados. Pneus carecas, faróis queimados e pastilhas de freio gastas. Veículo necessita manutenção imediata!",
            Enviado = true
        });

        // ----------------------------------------
        // CHECKLISTS DOS ÚLTIMOS 7 DIAS (8)
        // ----------------------------------------

        // Dia -1
        checklists.Add(new Checklist
        {
            VeiculoId = veiculos[0].Id,
            MotoristaId = usuarios[4].Id,
            Data = hoje.AddDays(-1).AddHours(7),
            PlacaVeiculo = veiculos[0].Placa,
            KmVeiculo = 75050,
            Pneus = true,
            Luzes = true,
            Freios = true,
            Limpeza = false, // Problema de limpeza
            Observacoes = "Veículo necessita lavagem interna e externa.",
            Enviado = true
        });

        checklists.Add(new Checklist
        {
            VeiculoId = veiculos[5].Id, // Carro PQR-2468
            MotoristaId = usuarios[0].Id, // Carlos (CNH vencida)
            Data = hoje.AddDays(-1).AddHours(14),
            PlacaVeiculo = veiculos[5].Placa,
            KmVeiculo = 35120,
            Pneus = true,
            Luzes = true,
            Freios = true,
            Limpeza = true,
            Enviado = true
        });

        // Dia -2
        checklists.Add(new Checklist
        {
            VeiculoId = veiculos[2].Id,
            MotoristaId = usuarios[3].Id,
            Data = hoje.AddDays(-2).AddHours(8),
            PlacaVeiculo = veiculos[2].Placa,
            KmVeiculo = 28080,
            Pneus = true,
            Luzes = true,
            Freios = true,
            Limpeza = true,
            Enviado = true
        });

        // Dia -3
        checklists.Add(new Checklist
        {
            VeiculoId = veiculos[4].Id,
            MotoristaId = usuarios[1].Id,
            Data = hoje.AddDays(-3).AddHours(7),
            PlacaVeiculo = veiculos[4].Placa,
            KmVeiculo = 42020,
            Pneus = true,
            Luzes = false, // Problema com luzes
            Freios = true,
            Limpeza = true,
            ImagemLuzes = "/uploads/checklist-luzes-002.jpg",
            Observacoes = "Lanterna traseira direita queimada.",
            Enviado = true
        });

        // Dia -4
        checklists.Add(new Checklist
        {
            VeiculoId = veiculos[0].Id,
            MotoristaId = usuarios[2].Id,
            Data = hoje.AddDays(-4).AddHours(9),
            PlacaVeiculo = veiculos[0].Placa,
            KmVeiculo = 74980,
            Pneus = true,
            Luzes = true,
            Freios = true,
            Limpeza = true,
            Enviado = true
        });

        // Dia -5
        checklists.Add(new Checklist
        {
            VeiculoId = veiculos[5].Id,
            MotoristaId = usuarios[4].Id,
            Data = hoje.AddDays(-5).AddHours(13),
            PlacaVeiculo = veiculos[5].Placa,
            KmVeiculo = 35050,
            Pneus = true,
            Luzes = true,
            Freios = true,
            Limpeza = true,
            Enviado = true
        });

        // Dia -6
        checklists.Add(new Checklist
        {
            VeiculoId = veiculos[2].Id,
            MotoristaId = usuarios[1].Id,
            Data = hoje.AddDays(-6).AddHours(7),
            PlacaVeiculo = veiculos[2].Placa,
            KmVeiculo = 28015,
            Pneus = true,
            Luzes = true,
            Freios = true,
            Limpeza = true,
            Enviado = true
        });

        // Dia -7
        checklists.Add(new Checklist
        {
            VeiculoId = veiculos[4].Id,
            MotoristaId = usuarios[3].Id,
            Data = hoje.AddDays(-7).AddHours(8),
            PlacaVeiculo = veiculos[4].Placa,
            KmVeiculo = 41955,
            Pneus = true,
            Luzes = true,
            Freios = true,
            Limpeza = true,
            Enviado = true
        });

        context.Checklists.AddRange(checklists);
        await context.SaveChangesAsync();
    }

    private static async Task SeedManutencoes(AppDbContext context)
    {
        if (await context.Manutencoes.AnyAsync()) return;

        var veiculos = await context.Veiculos.ToListAsync();
        var usuarios = await context.Usuarios.ToListAsync();
        var gestor = usuarios.First(u => u.Papel == PapelUsuario.Gestor);
        var condutor = usuarios.First(u => u.Papel == PapelUsuario.Condutor);
        var hoje = DateTime.UtcNow;

        // ============================================
        // MANUTENÇÕES (8 totais)
        // Demonstrando TODOS os Status SAP e tipos
        // ============================================

        var manutencoes = new List<Manutencao>
        {
            // ----------------------------------------
            // 1. SOLICITADA - Início do fluxo
            // ----------------------------------------
            new Manutencao
            {
                VeiculoId = veiculos[5].Id, // Carro PQR-2468 (manutenção atrasada)
                Tipo = TipoManutencao.Preventiva,
                Descricao = "Revisão preventiva de 30.000 km: troca de óleo, filtros, velas e verificação geral.",
                Prioridade = PrioridadeManutencao.Baixa,
                QuilometragemNoAto = 35000,
                SolicitanteId = condutor.Id,
                StatusSAP = StatusManutencaoSAP.Solicitada,
                Custo = null,
                ConcluidoEm = null,
                NumeroOrdemSAP = null,
                FornecedorSAP = null
            },

            // ----------------------------------------
            // 2. APROVADA - Aguardando envio ao SAP
            // ----------------------------------------
            new Manutencao
            {
                VeiculoId = veiculos[4].Id, // Carro MNO-7890
                Tipo = TipoManutencao.Corretiva,
                Descricao = "Correção de pneu com desgaste irregular identificado no checklist. Substituição do pneu dianteiro esquerdo.",
                Prioridade = PrioridadeManutencao.Media,
                QuilometragemNoAto = 42085,
                SolicitanteId = gestor.Id,
                StatusSAP = StatusManutencaoSAP.Aprovada,
                Custo = null,
                ConcluidoEm = null,
                NumeroOrdemSAP = null,
                FornecedorSAP = null
            },

            // ----------------------------------------
            // 3. ENVIADA SAP - Aguardando processamento
            // ----------------------------------------
            new Manutencao
            {
                VeiculoId = veiculos[0].Id, // Van ABC-1234
                Tipo = TipoManutencao.Preventiva,
                Descricao = "Manutenção preventiva programada: balanceamento, alinhamento e rodízio de pneus.",
                Prioridade = PrioridadeManutencao.Alta,
                QuilometragemNoAto = 75000,
                SolicitanteId = gestor.Id,
                StatusSAP = StatusManutencaoSAP.EnviadaSAP,
                Custo = null,
                ConcluidoEm = null,
                NumeroOrdemSAP = "SAP-2024-0001",
                FornecedorSAP = null
            },

            // ----------------------------------------
            // 4. PROCESSANDO SAP - Em análise
            // ----------------------------------------
            new Manutencao
            {
                VeiculoId = veiculos[1].Id, // Van DEF-5678 (em manutenção)
                Tipo = TipoManutencao.Corretiva,
                Descricao = "URGENTE: Múltiplos problemas críticos. Substituição de pneus, troca de lâmpadas dos faróis e substituição de pastilhas de freio.",
                Prioridade = PrioridadeManutencao.Urgente,
                QuilometragemNoAto = 145230,
                SolicitanteId = gestor.Id,
                StatusSAP = StatusManutencaoSAP.ProcessandoSAP,
                Custo = null,
                ConcluidoEm = null,
                NumeroOrdemSAP = "SAP-2024-0002",
                FornecedorSAP = null
            },

            // ----------------------------------------
            // 5. ORDEM CRIADA - Ordem de serviço gerada
            // ----------------------------------------
            new Manutencao
            {
                VeiculoId = veiculos[2].Id, // Caminhão GHI-9012
                Tipo = TipoManutencao.Preventiva,
                Descricao = "Revisão preventiva de 10.000 km: troca de óleo do motor e filtros.",
                Prioridade = PrioridadeManutencao.Media,
                QuilometragemNoAto = 28000,
                SolicitanteId = gestor.Id,
                StatusSAP = StatusManutencaoSAP.OrdemCriada,
                Custo = null,
                ConcluidoEm = null,
                NumeroOrdemSAP = "SAP-2024-0003",
                FornecedorSAP = "Auto Peças Central Ltda"
            },

            // ----------------------------------------
            // 6. EM EXECUÇÃO - Manutenção sendo realizada
            // ----------------------------------------
            new Manutencao
            {
                VeiculoId = veiculos[1].Id, // Van DEF-5678
                Tipo = TipoManutencao.Corretiva,
                Descricao = "Reparo no sistema de freios: substituição de disco e pastilhas.",
                Prioridade = PrioridadeManutencao.Alta,
                QuilometragemNoAto = 145150,
                SolicitanteId = gestor.Id,
                StatusSAP = StatusManutencaoSAP.EmExecucao,
                Custo = null,
                ConcluidoEm = null,
                NumeroOrdemSAP = "SAP-2024-0004",
                FornecedorSAP = "Oficina Mecânica São Paulo"
            },

            // ----------------------------------------
            // 7. FINALIZADA - Manutenção preventiva concluída
            // ----------------------------------------
            new Manutencao
            {
                VeiculoId = veiculos[2].Id, // Caminhão GHI-9012
                Tipo = TipoManutencao.Preventiva,
                Descricao = "Revisão preventiva completa de 25.000 km realizada com sucesso.",
                Prioridade = PrioridadeManutencao.Baixa,
                QuilometragemNoAto = 27850,
                SolicitanteId = gestor.Id,
                StatusSAP = StatusManutencaoSAP.Finalizada,
                Custo = 850.00m,
                ConcluidoEm = hoje.AddDays(-15),
                NumeroOrdemSAP = "SAP-2024-0005",
                FornecedorSAP = "Auto Peças Central Ltda"
            },

            // ----------------------------------------
            // 8. FINALIZADA - Manutenção de emergência (custo alto)
            // ----------------------------------------
            new Manutencao
            {
                VeiculoId = veiculos[0].Id, // Van ABC-1234
                Tipo = TipoManutencao.Emergencia,
                Descricao = "Manutenção emergencial: substituição da bomba de combustível que apresentou falha inesperada durante operação.",
                Prioridade = PrioridadeManutencao.Urgente,
                QuilometragemNoAto = 74500,
                SolicitanteId = gestor.Id,
                StatusSAP = StatusManutencaoSAP.Finalizada,
                Custo = 2450.00m,
                ConcluidoEm = hoje.AddDays(-45),
                NumeroOrdemSAP = "SAP-2024-0006",
                FornecedorSAP = "Concessionária Mercedes-Benz"
            }
        };

        context.Manutencoes.AddRange(manutencoes);
        await context.SaveChangesAsync();
    }

    /// <summary>
    /// Método auxiliar para gerar observações com base nos problemas detectados
    /// </summary>
    private static string GerarObservacoesProblemas(bool pneus, bool luzes, bool freios, bool limpeza)
    {
        var problemas = new List<string>();
        if (!pneus) problemas.Add("Pneus");
        if (!luzes) problemas.Add("Luzes");
        if (!freios) problemas.Add("Freios");
        if (!limpeza) problemas.Add("Limpeza");

        return problemas.Count > 0
            ? $"Problemas identificados: {string.Join(", ", problemas)}. Necessário verificação."
            : "Veículo em perfeito estado";
    }
}
