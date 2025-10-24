using GestaoFrotas.Domain.Entities;
using GestaoFrotas.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace GestaoFrotas.Infrastructure.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Verificar se já existem dados
        if (await context.Usuarios.AnyAsync())
        {
            return; // Banco já populado
        }

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

        await context.SaveChangesAsync();

        // Criar algumas manutenções de exemplo
        var manutencao1 = new Manutencao
        {
            VeiculoId = veiculo2.Id,
            Tipo = TipoManutencao.Preventiva,
            Descricao = "Revisão dos 30.000 km - Troca de óleo e filtros",
            Custo = 850.00m,
            AgendadoPara = DateTime.UtcNow.AddDays(7),
            Status = StatusManutencao.Agendada
        };

        var manutencao2 = new Manutencao
        {
            VeiculoId = veiculo3.Id,
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
