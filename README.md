# Sistema de Gestão de Frotas

Sistema completo de gestão de frotas com checklist veicular, desenvolvido como TCC Fatec 2024.

## Arquitetura

Este projeto é organizado em **monorepo** com:

- **Frontend**: React + TypeScript + Material-UI (porta 3000)
- **Backend**: ASP.NET Core 9.0 Web API + Clean Architecture (porta 5119)
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
└── README.md
```

## Pré-requisitos

### 1. .NET 9.0 SDK
- Download: https://dotnet.microsoft.com/download/dotnet/9.0
- Verificar: `dotnet --version` (deve mostrar 9.x.x)

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

### Passo 1: Instalar .NET 9.0 SDK

Se ainda não tiver o .NET instalado:

1. Baixe o instalador do .NET 9.0 SDK
2. Execute o instalador
3. Reinicie o terminal
4. Verifique: `dotnet --version`

### Passo 2: Restaurar Dependências Backend

```powershell
cd packages\backend
dotnet restore
```

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

### Passo 4: Aplicar Migrations

As migrations são aplicadas automaticamente ao iniciar a aplicação. Se precisar aplicar manualmente:

```powershell
cd packages\backend\src\GestaoFrotas.API
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
- HTTP: http://localhost:5119
- Swagger: http://localhost:5119/swagger

### Iniciar Frontend (Terminal 2)

```powershell
cd packages\frontend
npm start
```

✅ Frontend rodando em: http://localhost:3000

## 📚 Funcionalidades

### ✅ Funcionalidades Implementadas

**Frontend:**
- Dashboard com estatísticas e KPIs em tempo real
- Gestão de veículos (CRUD completo)
- Gestão de condutores/usuários (CRUD completo)
- Checklist veicular diário com upload de fotos de avarias
- Gestão de manutenções
- Histórico de veículos (checklists e manutenções)
- Relatórios e exportação (CSV/Excel)
- Autenticação com 3 perfis (Administrador, Gestor, Condutor)
- Logs de auditoria (apenas Administrador)
- Interface responsiva (mobile/desktop)
- PWA (Progressive Web App) com suporte offline

**Backend:**
- API RESTful completa
- Autenticação JWT
- CRUD de Usuários/Condutores
- CRUD de Veículos
- CRUD de Checklists
- CRUD de Manutenções
- Upload e armazenamento de imagens
- Dashboard com estatísticas e relatórios
- Sistema de auditoria (logs de ações)
- Clean Architecture com separação de camadas

## 🛠️ Tecnologias

**Frontend:**
- React 18 + TypeScript
- Material-UI (MUI) 6
- React Router 6
- Chart.js + Recharts
- Axios
- Date-fns

**Backend:**
- ASP.NET Core 9.0
- Entity Framework Core 9.0
- SQL Server
- JWT Bearer Authentication
- BCrypt.Net (hash de senhas)
- Swagger/OpenAPI

## 📖 Documentação Adicional

- [Setup Completo do Backend](packages/backend/README.md)
- Documentação da API disponível via Swagger: `http://localhost:5119/swagger`

## 🐛 Troubleshooting

### "dotnet não é reconhecido"
- Instale o .NET 9.0 SDK
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

## 👤 Usuários de Teste

Após executar a aplicação, os seguintes usuários estarão disponíveis:

### Administrador
- **Email**: `admin@gestaodefrotas.com`
- **Senha**: `123456` (deve ser alterada no primeiro login)
- **Permissões**: Acesso total ao sistema, incluindo exclusão de registros e logs de auditoria

### Gestor
- **Email**: `gestor@gestaodefrotas.com`
- **Senha**: `123456` (deve ser alterada no primeiro login)
- **Permissões**: Gerenciar veículos, checklists e manutenções (sem exclusão)

### Condutor
- **Email**: `condutor@gestaodefrotas.com`
- **Senha**: `123456` (deve ser alterada no primeiro login)
- **Permissões**: Criar e visualizar checklists

## 👥 Equipe

TCC Fatec 2024

## 📄 Licença

Este projeto é parte de um Trabalho de Conclusão de Curso (TCC).
