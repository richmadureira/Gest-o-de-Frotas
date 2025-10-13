# Backend - Gestão de Frotas API

API RESTful desenvolvida em ASP.NET Core para gerenciamento de frotas e checklists veiculares.

## 🚀 Tecnologias

- **.NET 9.0** - Framework principal
- **ASP.NET Core Web API** - Framework web
- **Entity Framework Core 8.0** - ORM
- **SQL Server** - Banco de dados
- **JWT Bearer** - Autenticação
- **Swagger/OpenAPI** - Documentação da API
- **BCrypt.Net** - Hash de senhas

## 📋 Pré-requisitos

- [.NET SDK 9.0](https://dotnet.microsoft.com/download/dotnet/9.0)
- SQL Server Express ou LocalDB

## 🔧 Instalação

1. Clone o repositório e navegue até a pasta do backend:
```bash
cd packages/backend
```

2. Restaure as dependências:
```bash
dotnet restore
```

3. Configure a string de conexão no `appsettings.json` (se necessário)

4. Execute as migrations:
```bash
dotnet ef database update --project src/GestaoFrotas.Infrastructure --startup-project src/GestaoFrotas.API
```

5. Execute o projeto:
```bash
cd src/GestaoFrotas.API
dotnet run
```

A API estará disponível em:
- **HTTPS**: `https://localhost:7000`
- **HTTP**: `http://localhost:5000`
- **Swagger**: `https://localhost:7000/swagger`

## 👤 Usuários de Teste

Após executar a aplicação, os seguintes usuários estarão disponíveis:

### Administrador
- **Email**: `admin@gestaodefrotas.com`
- **Senha**: `admin123`
- **Permissões**: Acesso total ao sistema

### Gestor
- **Email**: `gestor@gestaodefrotas.com`
- **Senha**: `gestor123`
- **Permissões**: Gerenciar veículos, checklists e manutenções

### Condutor
- **Email**: `condutor@gestaodefrotas.com`
- **Senha**: `condutor123`
- **Permissões**: Criar e visualizar checklists

## 📡 Endpoints Principais

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro

### Usuários
- `GET /api/users` - Listar usuários (Admin/Gestor)
- `GET /api/users/{id}` - Obter usuário (Admin/Gestor)
- `PUT /api/users/{id}` - Atualizar usuário (Admin)
- `DELETE /api/users/{id}` - Excluir usuário (Admin)

### Veículos
- `GET /api/vehicles` - Listar veículos
- `GET /api/vehicles/{id}` - Obter veículo
- `POST /api/vehicles` - Criar veículo (Admin/Gestor)
- `PUT /api/vehicles/{id}` - Atualizar veículo (Admin/Gestor)
- `DELETE /api/vehicles/{id}` - Excluir veículo (Admin)

### Checklists
- `GET /api/checklists` - Listar checklists
- `GET /api/checklists/{id}` - Obter checklist
- `POST /api/checklists` - Criar checklist
- `PUT /api/checklists/{id}` - Atualizar checklist
- `PUT /api/checklists/{id}/status` - Atualizar status (Admin/Gestor)
- `DELETE /api/checklists/{id}` - Excluir checklist (Admin)

### Manutenções
- `GET /api/maintenances` - Listar manutenções (Admin/Gestor)
- `GET /api/maintenances/{id}` - Obter manutenção (Admin/Gestor)
- `POST /api/maintenances` - Criar manutenção (Admin/Gestor)
- `PUT /api/maintenances/{id}` - Atualizar manutenção (Admin/Gestor)
- `PUT /api/maintenances/{id}/status` - Atualizar status (Admin/Gestor)
- `DELETE /api/maintenances/{id}` - Excluir manutenção (Admin)

## 🏗️ Arquitetura

O projeto segue os princípios de **Clean Architecture** e está organizado em camadas:

```
GestaoFrotas.API/           # Camada de apresentação (Controllers, DTOs)
GestaoFrotas.Application/   # Camada de aplicação (Services, Validators)
GestaoFrotas.Domain/        # Camada de domínio (Entities, Enums)
GestaoFrotas.Infrastructure/ # Camada de infraestrutura (DbContext, Repositories)
```

## 🔒 Autenticação

A API usa **JWT Bearer Token** para autenticação. Para acessar endpoints protegidos:

1. Faça login em `/api/auth/login`
2. Use o token retornado no header: `Authorization: Bearer {token}`

## 🗄️ Banco de Dados

O projeto usa **Entity Framework Core** com **SQL Server**. As migrations são aplicadas automaticamente ao iniciar a aplicação em modo de desenvolvimento.

### Estrutura das Tabelas:
- **Users** - Usuários do sistema
- **Vehicles** - Veículos da frota
- **Checklists** - Checklists veiculares
- **Maintenances** - Manutenções dos veículos

## 📝 Desenvolvimento

### Criar nova migration:
```bash
dotnet ef migrations add NomeDaMigration --project src/GestaoFrotas.Infrastructure --startup-project src/GestaoFrotas.API
```

### Aplicar migrations:
```bash
dotnet ef database update --project src/GestaoFrotas.Infrastructure --startup-project src/GestaoFrotas.API
```

### Compilar:
```bash
dotnet build
```

### Executar testes:
```bash
dotnet test
```

## 🌐 CORS

O CORS está configurado para aceitar requisições do frontend em `http://localhost:3000`.

Para alterar, edite o arquivo `Program.cs`:
```csharp
policy.WithOrigins("http://localhost:3000")
```

## 📄 Licença

Este projeto é privado e de uso interno.