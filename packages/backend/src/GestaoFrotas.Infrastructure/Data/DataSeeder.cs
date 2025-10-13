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
        if (await context.Users.AnyAsync())
        {
            return; // Banco já populado
        }

        // Criar usuários de exemplo
        var admin = new User
        {
            Email = "admin@gestaodefrotas.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Name = "Administrador",
            Role = UserRole.Admin,
            Cpf = "12345678901",
            Phone = "(11) 98765-4321",
            Active = true
        };

        var gestor = new User
        {
            Email = "gestor@gestaodefrotas.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("gestor123"),
            Name = "Gestor Silva",
            Role = UserRole.Gestor,
            Cpf = "98765432109",
            Phone = "(11) 97654-3210",
            Active = true
        };

        var condutor = new User
        {
            Email = "condutor@gestaodefrotas.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("condutor123"),
            Name = "João Condutor",
            Role = UserRole.Condutor,
            Cpf = "45678912345",
            Phone = "(11) 96543-2109",
            Active = true
        };

        context.Users.AddRange(admin, gestor, condutor);

        // Criar veículos de exemplo
        var vehicle1 = new Vehicle
        {
            Plate = "ABC-1234",
            Model = "Sprinter",
            Brand = "Mercedes-Benz",
            Year = 2022,
            Type = VehicleType.Van,
            Status = VehicleStatus.Available,
            Mileage = 15000
        };

        var vehicle2 = new Vehicle
        {
            Plate = "XYZ-9876",
            Model = "Master",
            Brand = "Renault",
            Year = 2021,
            Type = VehicleType.Van,
            Status = VehicleStatus.Available,
            Mileage = 32000
        };

        var vehicle3 = new Vehicle
        {
            Plate = "DEF-5678",
            Model = "Accelo",
            Brand = "Mercedes-Benz",
            Year = 2020,
            Type = VehicleType.Truck,
            Status = VehicleStatus.Available,
            Mileage = 48000
        };

        context.Vehicles.AddRange(vehicle1, vehicle2, vehicle3);

        await context.SaveChangesAsync();

        // Criar algumas manutenções de exemplo
        var maintenance1 = new Maintenance
        {
            VehicleId = vehicle2.Id,
            Type = MaintenanceType.Preventive,
            Description = "Revisão dos 30.000 km - Troca de óleo e filtros",
            Cost = 850.00m,
            ScheduledAt = DateTime.UtcNow.AddDays(7),
            Status = MaintenanceStatus.Scheduled
        };

        var maintenance2 = new Maintenance
        {
            VehicleId = vehicle3.Id,
            Type = MaintenanceType.Preventive,
            Description = "Revisão dos 50.000 km",
            Cost = 1200.00m,
            ScheduledAt = DateTime.UtcNow.AddDays(3),
            Status = MaintenanceStatus.Scheduled
        };

        context.Maintenances.AddRange(maintenance1, maintenance2);

        await context.SaveChangesAsync();
    }
}
