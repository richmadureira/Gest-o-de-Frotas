# Setup do Backend .NET

## 📋 Pré-requisitos

1. **Instalar .NET 8 SDK**
   - Download: https://dotnet.microsoft.com/download/dotnet/8.0
   - Verificar instalação: `dotnet --version`

2. **Instalar SQL Server** (escolha uma opção):
   - SQL Server Express: https://www.microsoft.com/sql-server/sql-server-downloads
   - Docker: `docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword@123" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest`
   - Ou use o docker-compose.yml na raiz do projeto

## 🚀 Comandos de Setup

Execute estes comandos **na pasta `packages/backend`**:

### 1. Criar Solution e Projetos

```bash
# Criar Solution
dotnet new sln -n GestaoFrotas

# Criar projetos Clean Architecture
dotnet new webapi -n GestaoFrotas.API -o src/GestaoFrotas.API
dotnet new classlib -n GestaoFrotas.Application -o src/GestaoFrotas.Application
dotnet new classlib -n GestaoFrotas.Domain -o src/GestaoFrotas.Domain
dotnet new classlib -n GestaoFrotas.Infrastructure -o src/GestaoFrotas.Infrastructure

# Criar projetos de teste (opcional)
dotnet new xunit -n GestaoFrotas.API.Tests -o tests/GestaoFrotas.API.Tests
dotnet new xunit -n GestaoFrotas.Application.Tests -o tests/GestaoFrotas.Application.Tests
dotnet new xunit -n GestaoFrotas.Domain.Tests -o tests/GestaoFrotas.Domain.Tests
```

### 2. Adicionar Projetos à Solution

```bash
dotnet sln add src/GestaoFrotas.API/GestaoFrotas.API.csproj
dotnet sln add src/GestaoFrotas.Application/GestaoFrotas.Application.csproj
dotnet sln add src/GestaoFrotas.Domain/GestaoFrotas.Domain.csproj
dotnet sln add src/GestaoFrotas.Infrastructure/GestaoFrotas.Infrastructure.csproj
```

### 3. Configurar Referências Entre Projetos

```bash
# API depende de Application e Infrastructure
dotnet add src/GestaoFrotas.API reference src/GestaoFrotas.Application
dotnet add src/GestaoFrotas.API reference src/GestaoFrotas.Infrastructure

# Application depende de Domain
dotnet add src/GestaoFrotas.Application reference src/GestaoFrotas.Domain

# Infrastructure depende de Domain
dotnet add src/GestaoFrotas.Infrastructure reference src/GestaoFrotas.Domain
```

### 4. Instalar Pacotes NuGet

#### API Project
```bash
cd src/GestaoFrotas.API

dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.0.0
dotnet add package Swashbuckle.AspNetCore --version 6.5.0
dotnet add package Serilog.AspNetCore --version 8.0.0
dotnet add package BCrypt.Net-Next --version 4.0.3

cd ../..
```

#### Application Project
```bash
cd src/GestaoFrotas.Application

dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection --version 12.0.1
dotnet add package FluentValidation.DependencyInjectionExtensions --version 11.9.0

cd ../..
```

#### Infrastructure Project
```bash
cd src/GestaoFrotas.Infrastructure

dotnet add package Microsoft.EntityFrameworkCore.SqlServer --version 8.0.0
dotnet add package Microsoft.EntityFrameworkCore.Tools --version 8.0.0
dotnet add package Microsoft.EntityFrameworkCore.Design --version 8.0.0

cd ../..
```

### 5. Configurar Connection String

Edite `src/GestaoFrotas.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=GestaoFrotas;User Id=sa;Password=SuaSenha@123;TrustServerCertificate=True"
  },
  "Jwt": {
    "Key": "gestao-frotas-super-secret-key-min-32-chars-long-2024",
    "Issuer": "GestaoFrotas.API",
    "Audience": "GestaoFrotas.Frontend",
    "ExpiresInDays": 7
  }
}
```

### 6. Criar e Aplicar Migrations

```bash
cd src/GestaoFrotas.API

# Criar migration inicial
dotnet ef migrations add InitialCreate --project ../GestaoFrotas.Infrastructure --context AppDbContext

# Aplicar migration ao banco
dotnet ef database update --project ../GestaoFrotas.Infrastructure --context AppDbContext

cd ../..
```

### 7. Executar o Projeto

```bash
cd src/GestaoFrotas.API
dotnet run
```

Ou em modo watch (auto-reload):
```bash
dotnet watch run
```

A API estará disponível em:
- HTTP: http://localhost:5000
- HTTPS: https://localhost:5001
- Swagger: https://localhost:5001/swagger

## 📦 Comandos Úteis

```bash
# Restaurar dependências
dotnet restore

# Build do projeto
dotnet build

# Build em modo Release
dotnet build -c Release

# Executar testes
dotnet test

# Limpar build
dotnet clean

# Listar projetos na solution
dotnet sln list

# Adicionar nova migration
dotnet ef migrations add NomeDaMigration --project src/GestaoFrotas.Infrastructure

# Reverter última migration
dotnet ef migrations remove --project src/GestaoFrotas.Infrastructure

# Atualizar banco para migration específica
dotnet ef database update NomeDaMigration --project src/GestaoFrotas.Infrastructure

# Gerar script SQL das migrations
dotnet ef migrations script --project src/GestaoFrotas.Infrastructure -o migration.sql
```

## 🐛 Troubleshooting

### Erro: "dotnet não é reconhecido"
- Instale o .NET SDK
- Reinicie o terminal após instalação
- Verifique PATH: `echo $env:PATH` (PowerShell) ou `echo %PATH%` (CMD)

### Erro de conexão com SQL Server
- Verifique se o SQL Server está rodando
- Confirme usuário e senha
- Teste conexão: `sqlcmd -S localhost -U sa -P SuaSenha@123`

### Erro: "A migration já existe"
- Remova a migration: `dotnet ef migrations remove`
- Ou crie com nome diferente

### Porta já em uso
- Altere a porta em `src/GestaoFrotas.API/Properties/launchSettings.json`
- Ou mate o processo: `netstat -ano | findstr :5000` e `taskkill /PID <pid> /F`

## 📚 Próximos Passos

Após o setup, consulte:
- `docs/ARCHITECTURE.md` - Arquitetura do projeto
- `docs/API.md` - Documentação da API
- `docs/DATABASE.md` - Estrutura do banco de dados

