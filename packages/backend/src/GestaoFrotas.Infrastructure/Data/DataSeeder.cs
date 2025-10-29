using GestaoFrotas.Domain.Entities;
using GestaoFrotas.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace GestaoFrotas.Infrastructure.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Verificar se já existem dados básicos
        if (!await context.Usuarios.AnyAsync())
        {
            // Criar usuários de exemplo
            var admin = new Usuario
            {
                Email = "admin@gestaodefrotas.com",
                SenhaHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Nome = "Administrador",
                Papel = PapelUsuario.Administrador,
                Cpf = "12345678901",
                Telefone = "(11) 98765-4321",
                Ativo = true
            };

            var gestor = new Usuario
            {
                Email = "gestor@gestaodefrotas.com",
                SenhaHash = BCrypt.Net.BCrypt.HashPassword("gestor123"),
                Nome = "Gestor Silva",
                Papel = PapelUsuario.Gestor,
                Cpf = "98765432109",
                Telefone = "(11) 97654-3210",
                Ativo = true
            };

            var condutor = new Usuario
            {
                Email = "condutor@gestaodefrotas.com",
                SenhaHash = BCrypt.Net.BCrypt.HashPassword("condutor123"),
                Nome = "João Condutor",
                Papel = PapelUsuario.Condutor,
                Cpf = "45678912345",
                Telefone = "(11) 96543-2109",
                Ativo = true
            };

            context.Usuarios.AddRange(admin, gestor, condutor);
        }

        // Verificar se já existem veículos
        if (!await context.Veiculos.AnyAsync())
        {
            // Criar veículos de exemplo
            var veiculo1 = new Veiculo
            {
                Placa = "ABC-1234",
                Modelo = "Sprinter",
                Marca = "Mercedes-Benz",
                Ano = 2022,
                Tipo = TipoVeiculo.Van,
                Status = StatusVeiculo.Disponivel,
                Quilometragem = 15000
            };

            var veiculo2 = new Veiculo
            {
                Placa = "XYZ-9876",
                Modelo = "Master",
                Marca = "Renault",
                Ano = 2021,
                Tipo = TipoVeiculo.Van,
                Status = StatusVeiculo.Disponivel,
                Quilometragem = 32000
            };

            var veiculo3 = new Veiculo
            {
                Placa = "DEF-5678",
                Modelo = "Accelo",
                Marca = "Mercedes-Benz",
                Ano = 2020,
                Tipo = TipoVeiculo.Caminhao,
                Status = StatusVeiculo.Disponivel,
                Quilometragem = 48000
            };

            context.Veiculos.AddRange(veiculo1, veiculo2, veiculo3);
        }

        await context.SaveChangesAsync();

        // Criar algumas manutenções básicas se não existirem
        if (!await context.Manutencoes.AnyAsync())
        {
            var veiculos = await context.Veiculos.ToListAsync();
            if (veiculos.Count >= 2)
            {
                var manutencao1 = new Manutencao
                {
                    VeiculoId = veiculos[1].Id,
                    Tipo = TipoManutencao.Preventiva,
                    Descricao = "Revisão dos 30.000 km - Troca de óleo e filtros",
                    Custo = 850.00m,
                    AgendadoPara = DateTime.UtcNow.AddDays(7),
                    Status = StatusManutencao.Agendada
                };

                var manutencao2 = new Manutencao
                {
                    VeiculoId = veiculos[2].Id,
                    Tipo = TipoManutencao.Preventiva,
                    Descricao = "Revisão dos 50.000 km",
                    Custo = 1200.00m,
                    AgendadoPara = DateTime.UtcNow.AddDays(3),
                    Status = StatusManutencao.Agendada
                };

                context.Manutencoes.AddRange(manutencao1, manutencao2);
                await context.SaveChangesAsync();
            }
        }

        // Sempre tentar criar dados mockados de manutenções SAP
        await SeedManutencoesSAP(context);
    }

    private static async Task SeedManutencoesSAP(AppDbContext context)
    {
        // Adicionar apenas se não existirem manutenções SAP suficientes
        var manutencoesComSAP = context.Manutencoes.Count(m => m.StatusSAP.HasValue);
        if (manutencoesComSAP >= 7) return;

        var veiculos = context.Veiculos.ToList();
        if (veiculos.Count < 3) return;

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
                VeiculoId = veiculos[0].Id,
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
                VeiculoId = veiculos[1].Id,
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
                VeiculoId = veiculos[2].Id,
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
                VeiculoId = veiculos[0].Id,
                Tipo = TipoManutencao.Preventiva,
                Descricao = "Troca de correia dentada",
                Custo = 350.00m,
                Status = StatusManutencao.Agendada,
                StatusSAP = StatusManutencaoSAP.Finalizada,
                NumeroOrdemSAP = $"OS-{DateTime.UtcNow.Year}-003",
                FornecedorSAP = "Oficina Central",
                Progresso = 100,
                AgendadoPara = DateTime.UtcNow.AddDays(-1)
            }
        };

        context.Manutencoes.AddRange(manutencoesSAP);
        await context.SaveChangesAsync();
    }
}
