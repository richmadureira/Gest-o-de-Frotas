# Sistema de Gestão de Frotas

Sistema completo de gestão de frotas com checklist veicular, desenvolvido como TCC Fatec 2024.

## 🏗️ Arquitetura

Este projeto é organizado em **monorepo** com:

- **Frontend**: React + TypeScript + Material-UI (porta 3000)
- **Backend**: ASP.NET Core 8 Web API + Clean Architecture (porta 5000/5001)
- **Banco de Dados**: SQL Server LocalDB ou SQL Server Express

## 📁 Estrutura do Projeto

```
gestao-frotas/
├── packages/
│   ├── frontend/              # Aplicação React (checklist-veicular-ui)
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   └── backend/               # API .NET Core
│       ├── src/
│       │   ├── GestaoFrotas.API/           # Controllers, Program.cs
│       │   ├── GestaoFrotas.Application/   # Services, DTOs, Interfaces
│       │   ├── GestaoFrotas.Domain/        # Entities, Enums
│       │   └── GestaoFrotas.Infrastructure/# DbContext, Repositories
│       └── GestaoFrotas.sln
├── checklist-veicular-ui/     # (Frontend original - será movido)
└── README.md
```

## 🚀 Pré-requisitos

### 1. .NET 8 SDK
- Download: https://dotnet.microsoft.com/download/dotnet/8.0
- Verificar: `dotnet --version` (deve mostrar 8.x.x)

### 2. Node.js 18+
- Download: https://nodejs.org/
- Verificar: `node --version` e `npm --version`

### 3. SQL Server
Escolha uma opção:
- **SQL Server Express** (recomendado): https://www.microsoft.com/sql-server/sql-server-downloads
- **SQL Server LocalDB** (mais leve, já vem com Visual Studio)
- **SQL Server Developer Edition** (versão completa gratuita)

### 4. Ferramentas Opcionais
- **Visual Studio 2022** ou **Visual Studio Code**
- **SQL Server Management Studio (SSMS)**
- **Postman** ou **Insomnia** (testar API)

## 📦 Instalação Rápida

### Passo 1: Instalar .NET 8 SDK

Se ainda não tiver o .NET instalado:

1. Baixe o instalador do .NET 8 SDK
2. Execute o instalador
3. Reinicie o terminal
4. Verifique: `dotnet --version`

### Passo 2: Criar Projeto Backend

Execute o script de setup (requer .NET instalado):

```powershell
cd packages\backend
.\setup-backend.ps1
```

**OU** execute manualmente os comandos em `packages/backend/SETUP.md`

### Passo 3: Configurar Banco de Dados

Edite `packages/backend/src/GestaoFrotas.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=GestaoFrotas;Trusted_Connection=true;TrustServerCertificate=True"
  }
}
```

**Opções de Connection String:**

- **SQL Server LocalDB**: `Server=(localdb)\\mssqllocaldb;Database=GestaoFrotas;Trusted_Connection=true;TrustServerCertificate=True`
- **SQL Server Express**: `Server=localhost\\SQLEXPRESS;Database=GestaoFrotas;Trusted_Connection=true;TrustServerCertificate=True`
- **SQL Server com autenticação**: `Server=localhost;Database=GestaoFrotas;User Id=sa;Password=SuaSenha;TrustServerCertificate=True`

### Passo 4: Criar e Aplicar Migrations

```powershell
cd packages\backend\src\GestaoFrotas.API

# Criar migration
dotnet ef migrations add InitialCreate --project ..\GestaoFrotas.Infrastructure

# Aplicar ao banco
dotnet ef database update --project ..\GestaoFrotas.Infrastructure
```

### Passo 5: Instalar Dependências Frontend

```powershell
cd packages\frontend
npm install --legacy-peer-deps
```

## 🏃‍♂️ Executando o Projeto

### Iniciar Backend (Terminal 1)

```powershell
cd packages\backend\src\GestaoFrotas.API
dotnet run
```

ou em modo watch (auto-reload):

```powershell
dotnet watch run
```

✅ Backend rodando em:
- HTTP: http://localhost:5000
- HTTPS: https://localhost:5001
- Swagger: https://localhost:5001/swagger

### Iniciar Frontend (Terminal 2)

```powershell
cd packages\frontend
npm start
```

✅ Frontend rodando em: http://localhost:3000

## 📚 Funcionalidades

### ✅ Frontend (Implementado)
- Dashboard com estatísticas
- Gestão de veículos
- Gestão de motoristas
- Checklist veicular com upload de fotos
- Relatórios e exportação (CSV/Excel)
- Manutenções programadas
- Autenticação com 3 perfis (Admin, Gestor, Condutor)
- Interface responsiva (mobile/desktop)

### 🔄 Backend (Em Implementação)
- [ ] API RESTful completa
- [ ] Autenticação JWT
- [ ] CRUD de Usuários/Motoristas
- [ ] CRUD de Veículos
- [ ] CRUD de Checklists
- [ ] CRUD de Manutenções
- [ ] Upload e armazenamento de imagens
- [ ] Relatórios e estatísticas
- [ ] Validações com FluentValidation
- [ ] Logs com Serilog

## 🛠️ Tecnologias

**Frontend:**
- React 18 + TypeScript
- Material-UI (MUI) 6
- React Router 6
- Chart.js + Recharts
- Axios
- Date-fns

**Backend:**
- ASP.NET Core 8
- Entity Framework Core 8
- SQL Server
- JWT Bearer Authentication
- AutoMapper
- FluentValidation
- Serilog
- Swagger/OpenAPI

## 📖 Documentação Adicional

- [Setup Completo do Backend](packages/backend/SETUP.md)
- [Guia de Desenvolvimento](docs/DESENVOLVIMENTO.md) *(em breve)*
- [Arquitetura do Sistema](docs/ARQUITETURA.md) *(em breve)*
- [Documentação da API](docs/API.md) *(em breve)*

## 🐛 Troubleshooting

### "dotnet não é reconhecido"
- Instale o .NET 8 SDK
- Reinicie o terminal
- Adicione ao PATH se necessário

### Erro de conexão com SQL Server
- Verifique se o SQL Server está instalado e rodando
- Teste a connection string
- Use `(localdb)\\mssqllocaldb` para LocalDB

### Porta já em uso
- Backend: Altere em `launchSettings.json`
- Frontend: Altere PORT=3001 no `.env`

### Erro ao instalar dependências npm
- Use `npm install --legacy-peer-deps`
- Delete `node_modules` e `package-lock.json` e tente novamente

## 📝 Próximos Passos

1. ✅ Estrutura do monorepo
2. 🔄 Criar entidades do domínio
3. 🔄 Configurar DbContext e migrations
4. 🔄 Implementar autenticação JWT
5. 🔄 Criar controllers da API
6. 🔄 Integrar frontend com backend
7. 🔄 Testes
8. 🔄 Deploy

## 👥 Equipe

TCC Fatec 2024

## 📄 Licença

Este projeto é parte de um Trabalho de Conclusão de Curso (TCC).
