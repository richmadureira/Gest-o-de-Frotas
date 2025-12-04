# Comparação: Diagrama de Casos de Uso - Versão Antiga vs. Atualizada

## Resumo das Mudanças

Este documento apresenta uma comparação entre o diagrama de casos de uso original e a versão atualizada, refletindo todas as funcionalidades implementadas no sistema.

---

## 📊 Comparação Visual

### Versão Antiga (Original)

**Atores:**
- Administrador
- Gestor de Frota
- Condutor

**Casos de Uso:**
- Login
- Logout
- Gerenciar Usuários e Permissões
- Recuperar Senha
- Preencher Checklist Diário
- Enviar Fotos de Avarias (<<extend>> Preencher Checklist)
- Iniciar Solicitação de manutenção
- Gerir (com Veículos e Condutores)
- Gerar Relatórios

**Limitações da Versão Antiga:**
- Casos de uso genéricos demais ("Gerir", "Gerar Relatórios")
- Falta de detalhamento de funcionalidades específicas
- Não mostrava diferenças de permissões entre Administrador e Gestor
- Não incluía funcionalidades importantes como Dashboard, Logs de Auditoria, Histórico de Veículos

---

### Versão Atualizada (Implementada)

**Atores:**
- Administrador (14 casos de uso)
- Gestor de Frota (12 casos de uso)
- Condutor (6 casos de uso)

**Casos de Uso Organizados por Módulo:**

#### 🔐 Autenticação e Perfil
- Login
- Logout
- Recuperar Senha
- Trocar Senha (<<extend>> Login - obrigatório no primeiro login)

#### 📋 Gestão de Checklists
- Preencher Checklist Diário
- Enviar Fotos de Avarias (<<extend>> Preencher Checklist - opcional)
- Visualizar Checklists Enviados
- Gerenciar Checklists

#### 👥 Gestão de Usuários
- Gerenciar Usuários e Permissões (apenas Administrador)
- Gerenciar Condutores (Administrador e Gestor)

#### 🚗 Gestão de Veículos
- Gerenciar Veículos (Administrador e Gestor - com diferenças de permissão)
- Visualizar Histórico de Veículos (Administrador e Gestor)

#### 🔧 Gestão de Manutenções
- Gerenciar Manutenções (Administrador e Gestor - com diferenças de permissão)

#### 📊 Monitoramento e Auditoria
- Visualizar Dashboard (Administrador e Gestor)
- Visualizar Logs de Auditoria (apenas Administrador)

---

## 🔄 Mudanças Principais

### 1. **Casos de Uso Adicionados**

| Novo Caso de Uso | Descrição | Atores |
|-----------------|-----------|--------|
| **Trocar Senha** | Obrigatório no primeiro login | Todos |
| **Visualizar Checklists Enviados** | Condutor visualiza seus checklists do dia | Condutor |
| **Gerenciar Checklists** | Administrador e Gestor visualizam e filtram todos os checklists | Admin, Gestor |
| **Gerenciar Condutores** | Gestor pode gerenciar condutores (sem excluir) | Admin, Gestor |
| **Visualizar Histórico de Veículos** | Histórico completo de checklists e manutenções de um veículo | Admin, Gestor |
| **Visualizar Dashboard** | KPIs e indicadores em tempo real | Admin, Gestor |
| **Visualizar Logs de Auditoria** | Rastreamento de todas as ações do sistema | Apenas Admin |

### 2. **Casos de Uso Removidos/Substituídos**

| Caso de Uso Antigo | Substituído Por |
|-------------------|-----------------|
| **Gerir** (genérico) | **Gerenciar Veículos**, **Gerenciar Condutores**, **Gerenciar Manutenções** (específicos) |
| **Gerar Relatórios** | **Visualizar Dashboard** (mais específico e implementado) |
| **Iniciar Solicitação de manutenção** | **Gerenciar Manutenções** (inclui criar, editar, alterar status) |

### 3. **Melhorias na Organização**

- **Agrupamento por Módulos:** Casos de uso organizados em sub-pacotes lógicos
- **Detalhamento de Permissões:** Diferenciação clara entre permissões de Administrador e Gestor
- **Relacionamentos Claros:** Relacionamentos <<extend>> bem definidos
- **Cobertura Completa:** Todos os casos de uso refletem funcionalidades realmente implementadas

### 4. **Diferenças de Permissões Detalhadas**

#### Gerenciar Veículos
- **Antes:** Não especificava diferenças
- **Agora:** 
  - Administrador: Criar, Editar, **Excluir**
  - Gestor: Criar, Editar, Visualizar (sem excluir)

#### Gerenciar Manutenções
- **Antes:** Apenas "Iniciar Solicitação"
- **Agora:**
  - Administrador: Criar, Editar, Alterar Status, **Excluir**
  - Gestor: Criar, Editar, Alterar Status (sem excluir)

#### Gerenciar Usuários
- **Antes:** Apenas Administrador
- **Agora:**
  - Administrador: Gerenciar todos os usuários (criar, editar, excluir)
  - Gestor: Gerenciar apenas condutores (criar, editar, sem excluir)

---

## 📈 Estatísticas

| Métrica | Versão Antiga | Versão Atualizada |
|---------|---------------|-------------------|
| **Total de Casos de Uso** | 9 | 15 |
| **Casos de Uso do Administrador** | 3 | 14 |
| **Casos de Uso do Gestor** | 3 | 12 |
| **Casos de Uso do Condutor** | 3 | 6 |
| **Módulos Funcionais** | Não organizados | 6 módulos |
| **Relacionamentos <<extend>>** | 1 | 2 |

---

## ✅ Benefícios da Versão Atualizada

1. **Completude:** Reflete todas as funcionalidades implementadas no sistema
2. **Clareza:** Organização por módulos facilita a compreensão
3. **Precisão:** Diferenciação clara de permissões entre perfis
4. **Manutenibilidade:** Estrutura que facilita atualizações futuras
5. **Documentação:** Alinhado com a documentação técnica completa

---

## 📝 Notas para Implementação

Ao atualizar a documentação oficial:

1. **Substituir** o diagrama antigo pelo novo diagrama Mermaid
2. **Atualizar** a seção de casos de uso com os 15 casos detalhados
3. **Incluir** a tabela de comparação de permissões
4. **Referenciar** os casos de uso de baixo nível já documentados

---

## 🔗 Referências

- **Diagrama Atualizado:** `DIAGRAMA_CASOS_USO_ATUALIZADO.md`
- **Casos de Uso Detalhados:** Ver seção "Detalhamento dos Casos de Uso" na documentação completa
- **Documentação Técnica:** `DOCUMENTACAO_COMPLETA.md`

---

**Data de Atualização:** Janeiro 2025  
**Versão do Sistema:** 1.0.0





