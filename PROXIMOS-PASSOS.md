# 🚀 Próximos Passos - Guia Prático

## 📍 Você está aqui

```
[✅ Frontend Completo] → [⚠️ Backend Setup] → [ ] Backend Implementação → [ ] Integração
```

## 🎯 Passo a Passo para Começar o Backend

### ✅ Passo 1: Instalar .NET 8 SDK (OBRIGATÓRIO)

Sem o .NET SDK instalado, não é possível criar o backend.

**Windows - Download direto:**
1. Acesse: https://dotnet.microsoft.com/en-us/download/dotnet/8.0
2. Clique em "Download .NET SDK x64"
3. Execute o instalador (`dotnet-sdk-8.0.xxx-win-x64.exe`)
4. Siga o assistente de instalação
5. **Reinicie o PowerShell/Terminal**

**Verificar instalação:**
```powershell
dotnet --version
# Deve mostrar: 8.0.xxx
```

**Se o comando não for reconhecido:**
- Reinicie o terminal
- Verifique se `C:\Program Files\dotnet` está no PATH
- Faça logout/login no Windows

---

### ✅ Passo 2: Instalar SQL Server (OBRIGATÓRIO)

Escolha UMA das opções abaixo:

#### Opção A: SQL Server LocalDB (Mais Simples) ⭐ RECOMENDADO

**Já vem com Visual Studio!** Se você tem VS instalado, provavelmente já tem.

Verificar se já está instalado:
```powershell
sqllocaldb info
# Se mostrar versões, já está instalado!
```

Se não estiver instalado:
1. Baixe: https://download.microsoft.com/download/7/c/1/7c14e92e-bdcb-4f89-b7cf-93543e7112d1/SqlLocalDB.msi
2. Execute o instalador
3. Verifique: `sqllocaldb info`

#### Opção B: SQL Server Express (Completo)

1. Baixe: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
2. Clique em "Download now" na opção Express
3. Execute o instalador
4. Escolha "Basic Installation"

#### Opção C: SQL Server Developer Edition (Full)

- Download: https://www.microsoft.com/sql-server/sql-server-downloads
- Mesmos recursos da versão Enterprise, mas gratuito para dev

**Instalar SSMS (Opcional, mas útil):**
- Download: https://docs.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms
- Interface gráfica para gerenciar o banco

---

### ✅ Passo 3: Criar os Projetos Backend

Agora sim, vamos criar o backend!

```powershell
# 1. Abrir PowerShell no diretório correto
cd "D:\Projeto TCC Fatec 2024\app\Gest-o-de-Frotas\packages\backend"

# 2. Executar o script de setup
.\setup-backend.ps1

# O script vai:
# ✓ Criar a solution (.sln)
# ✓ Criar 4 projetos (.csproj)
# ✓ Configurar referências entre eles
# ✓ Instalar pacotes NuGet
# ✓ Compilar tudo
```

**Tempo estimado**: 5-10 minutos (download de pacotes)

**Se der erro "script não assinado":**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup-backend.ps1
```

**Resultado esperado:**
```
✓ .NET SDK 8.x.x encontrado
✓ Solution criada
✓ Projetos criados
✓ Referências configuradas
✓ Pacotes instalados
✓ Compilação bem-sucedida
```

---

### ✅ Passo 4: Estrutura Criada ✨

Após o setup, você terá:

```
packages/backend/
├── GestaoFrotas.sln                 ← Solution principal
├── src/
│   ├── GestaoFrotas.API/            ← Projeto da API (Controllers)
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   └── Controllers/
│   ├── GestaoFrotas.Application/    ← Lógica de negócio
│   │   ├── Services/
│   │   ├── DTOs/
│   │   └── Interfaces/
│   ├── GestaoFrotas.Domain/         ← Entidades
│   │   ├── Entities/
│   │   └── Enums/
│   └── GestaoFrotas.Infrastructure/ ← Banco de dados
│       ├── Data/
│       └── Repositories/
└── tests/                           ← Testes (opcional)
```

---

### ✅ Passo 5: Configurar appsettings.json

Edite o arquivo: `packages/backend/src/GestaoFrotas.API/appsettings.json`

**Para LocalDB:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=GestaoFrotas;Trusted_Connection=true;TrustServerCertificate=True"
  },
  "Jwt": {
    "Key": "gestao-frotas-super-secret-key-min-32-chars-long-2024",
    "Issuer": "GestaoFrotas.API",
    "Audience": "GestaoFrotas.Frontend",
    "ExpiresInDays": 7
  },
  "AllowedHosts": "*"
}
```

**Para SQL Server Express:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=GestaoFrotas;Trusted_Connection=true;TrustServerCertificate=True"
  }
}
```

---

### ✅ Passo 6: Próximas Implementações

Agora você precisa implementar (nessa ordem):

#### 6.1 Criar Entidades (Domain Layer)
Arquivos em: `src/GestaoFrotas.Domain/Entities/`

- [ ] `BaseEntity.cs` - Classe base com Id, CreatedAt, UpdatedAt
- [ ] `User.cs` - Usuário/Motorista
- [ ] `Vehicle.cs` - Veículo
- [ ] `Checklist.cs` - Checklist veicular
- [ ] `Maintenance.cs` - Manutenção

#### 6.2 Criar Enums (Domain Layer)
Arquivos em: `src/GestaoFrotas.Domain/Enums/`

- [ ] `UserRole.cs` - Admin, Gestor, Condutor
- [ ] `VehicleType.cs` - Car, Truck, Van, Motorcycle
- [ ] `VehicleStatus.cs` - Available, InUse, Maintenance, Inactive
- [ ] `ChecklistStatus.cs` - Pending, Approved, Rejected
- [ ] `FuelLevel.cs` - Empty, Quarter, Half, ThreeQuarters, Full

#### 6.3 Configurar DbContext (Infrastructure Layer)
Arquivo: `src/GestaoFrotas.Infrastructure/Data/AppDbContext.cs`

- [ ] Criar AppDbContext
- [ ] Adicionar DbSets
- [ ] Configurar SaveChanges para UpdatedAt

#### 6.4 Criar Configurations (Infrastructure Layer)
Arquivos em: `src/GestaoFrotas.Infrastructure/Configurations/`

- [ ] `UserConfiguration.cs` - Fluent API para User
- [ ] `VehicleConfiguration.cs`
- [ ] `ChecklistConfiguration.cs`
- [ ] `MaintenanceConfiguration.cs`

#### 6.5 Criar e Aplicar Migration
```powershell
cd src\GestaoFrotas.API
dotnet ef migrations add InitialCreate --project ..\GestaoFrotas.Infrastructure
dotnet ef database update --project ..\GestaoFrotas.Infrastructure
```

#### 6.6 Criar DTOs (Application Layer)
Estrutura de pastas em: `src/GestaoFrotas.Application/DTOs/`

#### 6.7 Criar Services (Application Layer)
Implementar lógica de negócio

#### 6.8 Criar Controllers (API Layer)
Criar endpoints REST

---

## 📚 Onde Está Cada Coisa?

| O que você precisa | Onde encontrar |
|-------------------|----------------|
| Guia completo de setup | `packages/backend/SETUP.md` |
| Documentação da API | `packages/backend/README.md` |
| Status do projeto | `PROJETO-STATUS.md` |
| Script de automação | `packages/backend/setup-backend.ps1` |
| Documentação principal | `README.md` |

---

## 🆘 Problemas Comuns

### "dotnet não é reconhecido"
**Solução**: Instale o .NET 8 SDK e reinicie o terminal

### "sqllocaldb não é reconhecido"
**Solução**: Instale SQL Server LocalDB ou Express

### "Script não pode ser carregado"
**Solução**:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### "Erro ao conectar no banco"
**Solução**: Verifique a connection string no `appsettings.json`

### "Migration falhou"
**Solução**: Certifique-se que implementou todas as entidades e configurations

---

## ✅ Checklist Rápido

Antes de começar a programar, certifique-se:

- [ ] .NET 8 SDK instalado (`dotnet --version`)
- [ ] SQL Server instalado (LocalDB ou Express)
- [ ] Script setup-backend.ps1 executado com sucesso
- [ ] Projetos compilando sem erros (`dotnet build`)
- [ ] appsettings.json configurado com connection string correta
- [ ] Visual Studio Code ou Visual Studio instalado

---

## 🎯 Meta

Ter a API rodando em:
- **HTTP**: http://localhost:5000
- **HTTPS**: https://localhost:5001
- **Swagger**: https://localhost:5001/swagger

E o frontend em:
- **React**: http://localhost:3000

---

## 💡 Dica Final

**Não pule etapas!** Siga a ordem:
1. Instalar ferramentas
2. Executar setup
3. Implementar entidades
4. Criar migrations
5. Implementar controllers
6. Integrar frontend

Cada etapa depende da anterior. 

**Boa sorte! 🚀**

