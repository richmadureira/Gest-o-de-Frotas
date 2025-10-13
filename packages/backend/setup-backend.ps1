# Script de Setup do Backend .NET
# Execute este script na pasta packages/backend

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Setup do Backend - Gestão de Frotas" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o .NET está instalado
Write-Host "Verificando .NET SDK..." -ForegroundColor Yellow
try {
    $dotnetVersion = dotnet --version
    Write-Host "✓ .NET SDK $dotnetVersion encontrado" -ForegroundColor Green
} catch {
    Write-Host "✗ .NET SDK não encontrado!" -ForegroundColor Red
    Write-Host "  Por favor, instale o .NET 8 SDK:" -ForegroundColor Red
    Write-Host "  https://dotnet.microsoft.com/download/dotnet/8.0" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "1. Criando Solution..." -ForegroundColor Yellow
dotnet new sln -n GestaoFrotas --force

Write-Host ""
Write-Host "2. Criando projetos..." -ForegroundColor Yellow
dotnet new webapi -n GestaoFrotas.API -o src/GestaoFrotas.API --force
dotnet new classlib -n GestaoFrotas.Application -o src/GestaoFrotas.Application --force
dotnet new classlib -n GestaoFrotas.Domain -o src/GestaoFrotas.Domain --force
dotnet new classlib -n GestaoFrotas.Infrastructure -o src/GestaoFrotas.Infrastructure --force

Write-Host ""
Write-Host "3. Adicionando projetos à solution..." -ForegroundColor Yellow
dotnet sln add src/GestaoFrotas.API/GestaoFrotas.API.csproj
dotnet sln add src/GestaoFrotas.Application/GestaoFrotas.Application.csproj
dotnet sln add src/GestaoFrotas.Domain/GestaoFrotas.Domain.csproj
dotnet sln add src/GestaoFrotas.Infrastructure/GestaoFrotas.Infrastructure.csproj

Write-Host ""
Write-Host "4. Configurando referências entre projetos..." -ForegroundColor Yellow
dotnet add src/GestaoFrotas.API reference src/GestaoFrotas.Application
dotnet add src/GestaoFrotas.API reference src/GestaoFrotas.Infrastructure
dotnet add src/GestaoFrotas.Application reference src/GestaoFrotas.Domain
dotnet add src/GestaoFrotas.Infrastructure reference src/GestaoFrotas.Domain

Write-Host ""
Write-Host "5. Instalando pacotes NuGet..." -ForegroundColor Yellow

Write-Host "   - API packages..." -ForegroundColor Gray
Push-Location src/GestaoFrotas.API
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.0.0
dotnet add package Swashbuckle.AspNetCore --version 6.5.0
dotnet add package Serilog.AspNetCore --version 8.0.0
dotnet add package BCrypt.Net-Next --version 4.0.3
Pop-Location

Write-Host "   - Application packages..." -ForegroundColor Gray
Push-Location src/GestaoFrotas.Application
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection --version 12.0.1
dotnet add package FluentValidation.DependencyInjectionExtensions --version 11.9.0
Pop-Location

Write-Host "   - Infrastructure packages..." -ForegroundColor Gray
Push-Location src/GestaoFrotas.Infrastructure
dotnet add package Microsoft.EntityFrameworkCore.SqlServer --version 8.0.0
dotnet add package Microsoft.EntityFrameworkCore.Tools --version 8.0.0
dotnet add package Microsoft.EntityFrameworkCore.Design --version 8.0.0
Pop-Location

Write-Host ""
Write-Host "6. Restaurando dependências..." -ForegroundColor Yellow
dotnet restore

Write-Host ""
Write-Host "7. Compilando solução..." -ForegroundColor Yellow
dotnet build

Write-Host ""
Write-Host "===================================" -ForegroundColor Green
Write-Host "✓ Setup concluído com sucesso!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Configure a connection string em src/GestaoFrotas.API/appsettings.json"
Write-Host "2. Crie as entidades do domínio"
Write-Host "3. Configure o DbContext"
Write-Host "4. Execute: cd src/GestaoFrotas.API && dotnet ef migrations add InitialCreate"
Write-Host "5. Execute: dotnet ef database update"
Write-Host "6. Execute: dotnet run"
Write-Host ""
Write-Host "Para mais detalhes, consulte SETUP.md" -ForegroundColor Yellow

