using GestaoFrotas.Domain.Entities;
using GestaoFrotas.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace GestaoFrotas.Infrastructure.Data;

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

        var usuarios = new List<Usuario>
        {
            // Admin
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

            // Gestores
            new Usuario
        {
                Email = "gestor1@translog.com",
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

            // Condutores com CNH válida
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
                CnhValidade = DateTime.UtcNow.AddDays(180),
                Matricula = "COND001",
                TurnoTrabalho = Turno.Manha,
                Ativo = true
            },
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
                CnhValidade = DateTime.UtcNow.AddDays(120),
                Matricula = "COND002",
                TurnoTrabalho = Turno.Tarde,
                Ativo = true
            },
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
                CnhValidade = DateTime.UtcNow.AddDays(90),
                Matricula = "COND003",
                TurnoTrabalho = Turno.Noite,
                Ativo = true
            },
            new Usuario
            {
                Email = "maria.santos@translog.com",
                SenhaHash = BCrypt.Net.BCrypt.HashPassword("condutor123"),
                Nome = "Maria Santos",
                Papel = PapelUsuario.Condutor,
                Cpf = "44455566677",
                Telefone = "(11) 94444-4444",
                CnhNumero = "44455566677",
                CnhCategoria = CategoriaCNH.E,
                CnhValidade = DateTime.UtcNow.AddDays(200),
                Matricula = "COND004",
                TurnoTrabalho = Turno.Manha,
                Ativo = true
            },

            // Condutores com CNH vencida
            new Usuario
            {
                Email = "joao.oliveira@translog.com",
                SenhaHash = BCrypt.Net.BCrypt.HashPassword("condutor123"),
                Nome = "João Oliveira",
                Papel = PapelUsuario.Condutor,
                Cpf = "55566677788",
                Telefone = "(11) 95555-5555",
                CnhNumero = "55566677788",
                CnhCategoria = CategoriaCNH.D,
                CnhValidade = DateTime.UtcNow.AddDays(-30), // Vencida há 30 dias
                Matricula = "COND005",
                TurnoTrabalho = Turno.Tarde,
                Ativo = true
            },
            new Usuario
            {
                Email = "fernanda.lima@translog.com",
                SenhaHash = BCrypt.Net.BCrypt.HashPassword("condutor123"),
                Nome = "Fernanda Lima",
                Papel = PapelUsuario.Condutor,
                Cpf = "66677788899",
                Telefone = "(11) 96666-6666",
                CnhNumero = "66677788899",
                CnhCategoria = CategoriaCNH.C,
                CnhValidade = DateTime.UtcNow.AddDays(-15), // Vencida há 15 dias
                Matricula = "COND006",
                TurnoTrabalho = Turno.Noite,
                Ativo = true
            }
        };

        context.Usuarios.AddRange(usuarios);
        await context.SaveChangesAsync();
    }

    private static async Task SeedVeiculos(AppDbContext context)
    {
        if (await context.Veiculos.AnyAsync()) return;

        var veiculos = new List<Veiculo>
        {
            // Vans - Disponíveis (modelos comerciais comuns)
            new Veiculo
            {
                Placa = "ABC-1234",
                Modelo = "Ducato Cargo",
                Marca = "Fiat",
                Ano = 2022,
                Tipo = TipoVeiculo.Van,
                Status = StatusVeiculo.Disponivel,
                Quilometragem = 45000,
                UltimaManutencao = DateTime.UtcNow.AddDays(-15),
                ProximaManutencao = DateTime.UtcNow.AddDays(45)
            },
            new Veiculo
            {
                Placa = "XYZ-5678",
                Modelo = "Master Furgão",
                Marca = "Renault",
                Ano = 2021,
                Tipo = TipoVeiculo.Van,
                Status = StatusVeiculo.Disponivel,
                Quilometragem = 68000,
                UltimaManutencao = DateTime.UtcNow.AddDays(-30),
                ProximaManutencao = DateTime.UtcNow.AddDays(30)
            },
            new Veiculo
            {
                Placa = "DEF-9012",
                Modelo = "Daily Furgão",
                Marca = "Iveco",
                Ano = 2023,
                Tipo = TipoVeiculo.Van,
                Status = StatusVeiculo.Disponivel,
                Quilometragem = 12000,
                UltimaManutencao = DateTime.UtcNow.AddDays(-5),
                ProximaManutencao = DateTime.UtcNow.AddDays(55)
            },
            new Veiculo
            {
                Placa = "GHI-3456",
                Modelo = "Sprinter Furgão",
                Marca = "Mercedes-Benz",
                Ano = 2020,
                Tipo = TipoVeiculo.Van,
                Status = StatusVeiculo.Disponivel,
                Quilometragem = 95000,
                UltimaManutencao = DateTime.UtcNow.AddDays(-20),
                ProximaManutencao = DateTime.UtcNow.AddDays(40)
            },
            new Veiculo
            {
                Placa = "JKL-7890",
                Modelo = "Ducato Maxi Cargo",
                Marca = "Fiat",
                Ano = 2021,
                Tipo = TipoVeiculo.Van,
                Status = StatusVeiculo.Disponivel,
                Quilometragem = 52000,
                UltimaManutencao = DateTime.UtcNow.AddDays(-10),
                ProximaManutencao = DateTime.UtcNow.AddDays(50)
            },

            // Caminhões leves - Disponíveis (modelos comerciais comuns)
            new Veiculo
            {
                Placa = "MNO-1111",
                Modelo = "Accelo 1016",
                Marca = "Mercedes-Benz",
                Ano = 2020,
                Tipo = TipoVeiculo.Caminhao,
                Status = StatusVeiculo.Disponivel,
                Quilometragem = 85000,
                UltimaManutencao = DateTime.UtcNow.AddDays(-25),
                ProximaManutencao = DateTime.UtcNow.AddDays(35)
            },
            new Veiculo
            {
                Placa = "PQR-2222",
                Modelo = "Delivery 6.160",
                Marca = "Volkswagen",
                Ano = 2022,
                Tipo = TipoVeiculo.Caminhao,
                Status = StatusVeiculo.Disponivel,
                Quilometragem = 35000,
                UltimaManutencao = DateTime.UtcNow.AddDays(-8),
                ProximaManutencao = DateTime.UtcNow.AddDays(52)
            },
            new Veiculo
            {
                Placa = "STU-3333",
                Modelo = "Daily Chassi 55C17",
                Marca = "Iveco",
                Ano = 2021,
                Tipo = TipoVeiculo.Caminhao,
                Status = StatusVeiculo.Disponivel,
                Quilometragem = 72000,
                UltimaManutencao = DateTime.UtcNow.AddDays(-12),
                ProximaManutencao = DateTime.UtcNow.AddDays(48)
            },
            new Veiculo
            {
                Placa = "VWX-4444",
                Modelo = "Accelo 815",
                Marca = "Mercedes-Benz",
                Ano = 2023,
                Tipo = TipoVeiculo.Caminhao,
                Status = StatusVeiculo.Disponivel,
                Quilometragem = 15000,
                UltimaManutencao = DateTime.UtcNow.AddDays(-3),
                ProximaManutencao = DateTime.UtcNow.AddDays(57)
            },
            new Veiculo
            {
                Placa = "YZA-5555",
                Modelo = "Delivery 9.170",
                Marca = "Volkswagen",
                Ano = 2020,
                Tipo = TipoVeiculo.Caminhao,
                Status = StatusVeiculo.Disponivel,
                Quilometragem = 110000,
                UltimaManutencao = DateTime.UtcNow.AddDays(-18),
                ProximaManutencao = DateTime.UtcNow.AddDays(42)
            },

            // Utilitários - Disponíveis (modelos comerciais comuns)
            new Veiculo
            {
                Placa = "BCD-6666",
                Modelo = "Saveiro Robust CS",
                Marca = "Volkswagen",
                Ano = 2022,
                Tipo = TipoVeiculo.Carro,
                Status = StatusVeiculo.Disponivel,
                Quilometragem = 28000,
                UltimaManutencao = DateTime.UtcNow.AddDays(-7),
                ProximaManutencao = DateTime.UtcNow.AddDays(53)
            },
            new Veiculo
            {
                Placa = "EFG-7777",
                Modelo = "Strada Endurance",
                Marca = "Fiat",
                Ano = 2021,
                Tipo = TipoVeiculo.Carro,
                Status = StatusVeiculo.Disponivel,
                Quilometragem = 42000,
                UltimaManutencao = DateTime.UtcNow.AddDays(-14),
                ProximaManutencao = DateTime.UtcNow.AddDays(46)
            },
            new Veiculo
            {
                Placa = "HIJ-8888",
                Modelo = "Montana LS",
                Marca = "Chevrolet",
                Ano = 2023,
                Tipo = TipoVeiculo.Carro,
                Status = StatusVeiculo.Disponivel,
                Quilometragem = 8000,
                UltimaManutencao = DateTime.UtcNow.AddDays(-2),
                ProximaManutencao = DateTime.UtcNow.AddDays(58)
            },

            // Veículos em manutenção
            new Veiculo
            {
                Placa = "KLM-9999",
                Modelo = "Master Furgão L2H2",
                Marca = "Renault",
                Ano = 2021,
                Tipo = TipoVeiculo.Van,
                Status = StatusVeiculo.EmManutencao,
                Quilometragem = 75000,
                UltimaManutencao = DateTime.UtcNow.AddDays(-1),
                ProximaManutencao = DateTime.UtcNow.AddDays(59)
            },
            new Veiculo
            {
                Placa = "NOP-0000",
                Modelo = "Ducato Combinato",
                Marca = "Fiat",
                Ano = 2020,
                Tipo = TipoVeiculo.Van,
                Status = StatusVeiculo.EmManutencao,
                Quilometragem = 130000,
                UltimaManutencao = DateTime.UtcNow.AddDays(-2),
                ProximaManutencao = DateTime.UtcNow.AddDays(58)
            },

            // Veículos inativos
            new Veiculo
            {
                Placa = "QRS-1111",
                Modelo = "Accelo 715C",
                Marca = "Mercedes-Benz",
                Ano = 2018,
                Tipo = TipoVeiculo.Caminhao,
                Status = StatusVeiculo.Inativo,
                Quilometragem = 180000,
                UltimaManutencao = DateTime.UtcNow.AddDays(-60),
                ProximaManutencao = null
            }
        };

        context.Veiculos.AddRange(veiculos);
        await context.SaveChangesAsync();
    }

    private static async Task SeedChecklists(AppDbContext context)
    {
        if (await context.Checklists.AnyAsync()) return;

        var usuarios = await context.Usuarios.Where(u => u.Papel == PapelUsuario.Condutor).ToListAsync();
        var veiculos = await context.Veiculos.Where(v => v.Status == StatusVeiculo.Disponivel).ToListAsync();

        if (usuarios.Count == 0 || veiculos.Count == 0) return;

        var checklists = new List<Checklist>();
        var random = new Random();

        // Gerar checklists dos últimos 30 dias
        for (int i = 0; i < 25; i++)
        {
            var usuario = usuarios[random.Next(usuarios.Count)];
            var veiculo = veiculos[random.Next(veiculos.Count)];
            var diasAtras = random.Next(0, 30);
            var dataChecklist = DateTime.UtcNow.AddDays(-diasAtras);

            // Simular quilometragem crescente
            var kmBase = veiculo.Quilometragem ?? 0;
            var kmChecklist = kmBase + random.Next(0, 1000);

            // Determinar status baseado em probabilidade
            StatusChecklist status;
            var statusRandom = random.Next(100);
            if (statusRandom < 70) status = StatusChecklist.Aprovado;
            else if (statusRandom < 90) status = StatusChecklist.Pendente;
            else status = StatusChecklist.Rejeitado;

            // Gerar verificações baseadas no status
            bool pneus = status == StatusChecklist.Aprovado || (status == StatusChecklist.Pendente && random.Next(2) == 0);
            bool luzes = status == StatusChecklist.Aprovado || (status == StatusChecklist.Pendente && random.Next(2) == 0);
            bool freios = status == StatusChecklist.Aprovado || (status == StatusChecklist.Pendente && random.Next(2) == 0);
            bool limpeza = status == StatusChecklist.Aprovado || (status == StatusChecklist.Pendente && random.Next(2) == 0);

            // Se rejeitado, garantir pelo menos um problema
            if (status == StatusChecklist.Rejeitado)
            {
                var problemas = new[] { "pneus", "luzes", "freios", "limpeza" };
                var problema = problemas[random.Next(problemas.Length)];
                switch (problema)
                {
                    case "pneus": pneus = false; break;
                    case "luzes": luzes = false; break;
                    case "freios": freios = false; break;
                    case "limpeza": limpeza = false; break;
                }
            }

            var checklist = new Checklist
            {
                VeiculoId = veiculo.Id,
                MotoristaId = usuario.Id,
                Data = dataChecklist,
                Status = status,
                PlacaVeiculo = veiculo.Placa,
                KmVeiculo = kmChecklist,
                Pneus = pneus,
                Luzes = luzes,
                Freios = freios,
                Limpeza = limpeza,
                Observacoes = status == StatusChecklist.Rejeitado ? 
                    GerarObservacoesProblemas(pneus, luzes, freios, limpeza) : 
                    (random.Next(3) == 0 ? "Veículo em perfeito estado" : null),
                Enviado = status == StatusChecklist.Aprovado || random.Next(2) == 0
            };

            checklists.Add(checklist);
        }

        context.Checklists.AddRange(checklists);
        await context.SaveChangesAsync();
    }

    private static async Task SeedManutencoes(AppDbContext context)
    {
        if (await context.Manutencoes.AnyAsync()) return;

        var veiculos = await context.Veiculos.ToListAsync();
        if (veiculos.Count == 0) return;

        var manutencoes = new List<Manutencao>();
        var random = new Random();

        // Manutenções normais (sem StatusSAP) - 12 manutenções
        var manutencoesNormais = new[]
        {
            new Manutencao
            {
                VeiculoId = veiculos[0].Id,
            Tipo = TipoManutencao.Preventiva,
                Descricao = "Revisão dos 50.000 km - Troca de óleo e filtros",
            Custo = 850.00m,
                Status = StatusManutencao.Concluida,
                AgendadoPara = DateTime.UtcNow.AddDays(-10),
                ConcluidoEm = DateTime.UtcNow.AddDays(-8)
            },
            new Manutencao
            {
                VeiculoId = veiculos[1].Id,
                Tipo = TipoManutencao.Corretiva,
                Descricao = "Reparo no sistema de freios - Pastilhas e discos",
                Custo = 1200.00m,
                Status = StatusManutencao.Concluida,
                AgendadoPara = DateTime.UtcNow.AddDays(-15),
                ConcluidoEm = DateTime.UtcNow.AddDays(-12)
            },
            new Manutencao
            {
                VeiculoId = veiculos[2].Id,
                Tipo = TipoManutencao.Preventiva,
                Descricao = "Revisão dos 20.000 km",
                Custo = 650.00m,
                Status = StatusManutencao.Concluida,
                AgendadoPara = DateTime.UtcNow.AddDays(-5),
                ConcluidoEm = DateTime.UtcNow.AddDays(-3)
            },
            new Manutencao
            {
                VeiculoId = veiculos[3].Id,
                Tipo = TipoManutencao.Corretiva,
                Descricao = "Troca de pneus - 4 unidades",
                Custo = 1800.00m,
                Status = StatusManutencao.Concluida,
                AgendadoPara = DateTime.UtcNow.AddDays(-20),
                ConcluidoEm = DateTime.UtcNow.AddDays(-18)
            },
            new Manutencao
            {
                VeiculoId = veiculos[4].Id,
                Tipo = TipoManutencao.Preventiva,
                Descricao = "Manutenção do ar condicionado",
                Custo = 400.00m,
                Status = StatusManutencao.Concluida,
                AgendadoPara = DateTime.UtcNow.AddDays(-7),
                ConcluidoEm = DateTime.UtcNow.AddDays(-5)
            },
            new Manutencao
            {
                VeiculoId = veiculos[5].Id,
                Tipo = TipoManutencao.Corretiva,
                Descricao = "Reparo na suspensão dianteira",
                Custo = 950.00m,
                Status = StatusManutencao.Concluida,
                AgendadoPara = DateTime.UtcNow.AddDays(-12),
                ConcluidoEm = DateTime.UtcNow.AddDays(-10)
            },
            new Manutencao
            {
                VeiculoId = veiculos[6].Id,
                Tipo = TipoManutencao.Preventiva,
                Descricao = "Revisão dos 30.000 km completa",
                Custo = 1100.00m,
                Status = StatusManutencao.Concluida,
                AgendadoPara = DateTime.UtcNow.AddDays(-8),
                ConcluidoEm = DateTime.UtcNow.AddDays(-6)
            },
            new Manutencao
            {
                VeiculoId = veiculos[7].Id,
                Tipo = TipoManutencao.Corretiva,
                Descricao = "Reparo no sistema elétrico",
                Custo = 750.00m,
                Status = StatusManutencao.Concluida,
                AgendadoPara = DateTime.UtcNow.AddDays(-25),
                ConcluidoEm = DateTime.UtcNow.AddDays(-22)
            },
            new Manutencao
            {
                VeiculoId = veiculos[8].Id,
                Tipo = TipoManutencao.Preventiva,
                Descricao = "Troca de correia dentada e bomba d'água",
                Custo = 600.00m,
                Status = StatusManutencao.Concluida,
                AgendadoPara = DateTime.UtcNow.AddDays(-18),
                ConcluidoEm = DateTime.UtcNow.AddDays(-16)
            },
            new Manutencao
            {
                VeiculoId = veiculos[9].Id,
                Tipo = TipoManutencao.Corretiva,
                Descricao = "Reparo na transmissão",
                Custo = 2500.00m,
                Status = StatusManutencao.Concluida,
                AgendadoPara = DateTime.UtcNow.AddDays(-30),
                ConcluidoEm = DateTime.UtcNow.AddDays(-25)
            },
            new Manutencao
            {
                VeiculoId = veiculos[10].Id,
                Tipo = TipoManutencao.Preventiva,
                Descricao = "Revisão dos 25.000 km",
                Custo = 500.00m,
                Status = StatusManutencao.EmAndamento,
                AgendadoPara = DateTime.UtcNow.AddDays(-2)
            },
            new Manutencao
            {
                VeiculoId = veiculos[11].Id,
                Tipo = TipoManutencao.Corretiva,
                Descricao = "Troca de embreagem",
                Custo = 1800.00m,
                Status = StatusManutencao.Agendada,
                AgendadoPara = DateTime.UtcNow.AddDays(3)
            }
        };

        manutencoes.AddRange(manutencoesNormais);

        // Manutenções SAP (7 exemplos existentes + 6 adicionais)
        var manutencoesSAP = new[]
        {
            new Manutencao
            {
                VeiculoId = veiculos[0].Id,
                Tipo = TipoManutencao.Preventiva,
                Descricao = "Troca de óleo e filtros",
                Custo = 150.00m,
                Status = StatusManutencao.Agendada,
                StatusSAP = StatusManutencaoSAP.Solicitada,
                Progresso = 10,
                AgendadoPara = DateTime.UtcNow.AddDays(2)
            },
            new Manutencao
            {
                VeiculoId = veiculos[1].Id,
                Tipo = TipoManutencao.Corretiva,
                Descricao = "Reparo no sistema de freios",
                Custo = 450.00m,
                Status = StatusManutencao.Agendada,
                StatusSAP = StatusManutencaoSAP.Aprovada,
                Progresso = 25,
                AgendadoPara = DateTime.UtcNow.AddDays(1)
            },
            new Manutencao
            {
                VeiculoId = veiculos[2].Id,
                Tipo = TipoManutencao.Preventiva,
                Descricao = "Revisão geral 20.000km",
                Custo = 800.00m,
                Status = StatusManutencao.Agendada,
                StatusSAP = StatusManutencaoSAP.EnviadaSAP,
                Progresso = 40,
                AgendadoPara = DateTime.UtcNow.AddDays(3)
            },
            new Manutencao
            {
                VeiculoId = veiculos[3].Id,
                Tipo = TipoManutencao.Corretiva,
                Descricao = "Troca de pneus",
                Custo = 600.00m,
                Status = StatusManutencao.Agendada,
                StatusSAP = StatusManutencaoSAP.ProcessandoSAP,
                Progresso = 55,
                AgendadoPara = DateTime.UtcNow.AddDays(4)
            },
            new Manutencao
            {
                VeiculoId = veiculos[4].Id,
            Tipo = TipoManutencao.Preventiva,
                Descricao = "Manutenção do ar condicionado",
                Custo = 300.00m,
                Status = StatusManutencao.Agendada,
                StatusSAP = StatusManutencaoSAP.OrdemCriada,
                NumeroOrdemSAP = $"OS-{DateTime.UtcNow.Year}-001",
                FornecedorSAP = "Oficina Central",
                Progresso = 70,
                AgendadoPara = DateTime.UtcNow.AddDays(5)
            },
            new Manutencao
            {
                VeiculoId = veiculos[5].Id,
                Tipo = TipoManutencao.Corretiva,
                Descricao = "Reparo na transmissão",
            Custo = 1200.00m,
                Status = StatusManutencao.Agendada,
                StatusSAP = StatusManutencaoSAP.EmExecucao,
                NumeroOrdemSAP = $"OS-{DateTime.UtcNow.Year}-002",
                FornecedorSAP = "Auto Center SP",
                Progresso = 85,
                AgendadoPara = DateTime.UtcNow.AddDays(6)
            },
            new Manutencao
            {
                VeiculoId = veiculos[6].Id,
                Tipo = TipoManutencao.Preventiva,
                Descricao = "Troca de correia dentada",
                Custo = 350.00m,
                Status = StatusManutencao.Agendada,
                StatusSAP = StatusManutencaoSAP.Finalizada,
                NumeroOrdemSAP = $"OS-{DateTime.UtcNow.Year}-003",
                FornecedorSAP = "Oficina Central",
                Progresso = 100,
                AgendadoPara = DateTime.UtcNow.AddDays(-1)
            },
            // Manutenções SAP adicionais
            new Manutencao
            {
                VeiculoId = veiculos[7].Id,
                Tipo = TipoManutencao.Preventiva,
                Descricao = "Revisão dos 40.000 km",
                Custo = 900.00m,
                Status = StatusManutencao.Agendada,
                StatusSAP = StatusManutencaoSAP.Solicitada,
                Progresso = 10,
                AgendadoPara = DateTime.UtcNow.AddDays(7)
            },
            new Manutencao
            {
                VeiculoId = veiculos[8].Id,
                Tipo = TipoManutencao.Corretiva,
                Descricao = "Reparo no sistema de suspensão",
                Custo = 750.00m,
                Status = StatusManutencao.Agendada,
                StatusSAP = StatusManutencaoSAP.Aprovada,
                Progresso = 25,
                AgendadoPara = DateTime.UtcNow.AddDays(8)
            },
            new Manutencao
            {
                VeiculoId = veiculos[9].Id,
                Tipo = TipoManutencao.Preventiva,
                Descricao = "Manutenção do sistema de freios",
                Custo = 550.00m,
                Status = StatusManutencao.Agendada,
                StatusSAP = StatusManutencaoSAP.EnviadaSAP,
                Progresso = 40,
                AgendadoPara = DateTime.UtcNow.AddDays(9)
            },
            new Manutencao
            {
                VeiculoId = veiculos[10].Id,
                Tipo = TipoManutencao.Corretiva,
                Descricao = "Reparo no motor",
                Custo = 2200.00m,
                Status = StatusManutencao.Agendada,
                StatusSAP = StatusManutencaoSAP.ProcessandoSAP,
                Progresso = 55,
                AgendadoPara = DateTime.UtcNow.AddDays(10)
            },
            new Manutencao
            {
                VeiculoId = veiculos[11].Id,
                Tipo = TipoManutencao.Preventiva,
                Descricao = "Troca de filtros e fluidos",
                Custo = 280.00m,
                Status = StatusManutencao.Agendada,
                StatusSAP = StatusManutencaoSAP.OrdemCriada,
                NumeroOrdemSAP = $"OS-{DateTime.UtcNow.Year}-004",
                FornecedorSAP = "Oficina Norte",
                Progresso = 70,
                AgendadoPara = DateTime.UtcNow.AddDays(11)
            },
            new Manutencao
            {
                VeiculoId = veiculos[12].Id,
                Tipo = TipoManutencao.Corretiva,
                Descricao = "Reparo no sistema elétrico",
                Custo = 650.00m,
                Status = StatusManutencao.Agendada,
                StatusSAP = StatusManutencaoSAP.EmExecucao,
                NumeroOrdemSAP = $"OS-{DateTime.UtcNow.Year}-005",
                FornecedorSAP = "Auto Elétrica SP",
                Progresso = 85,
                AgendadoPara = DateTime.UtcNow.AddDays(12)
            }
        };

        manutencoes.AddRange(manutencoesSAP);

        context.Manutencoes.AddRange(manutencoes);
        await context.SaveChangesAsync();
    }

    private static string? GerarObservacoesProblemas(bool pneus, bool luzes, bool freios, bool limpeza)
    {
        var problemas = new List<string>();
        
        if (!pneus) problemas.Add("Pneu traseiro careca");
        if (!luzes) problemas.Add("Farol alto não funciona");
        if (!freios) problemas.Add("Freios com barulho");
        if (!limpeza) problemas.Add("Veículo sujo");

        return problemas.Count > 0 ? string.Join(", ", problemas) : null;
    }
}
