# Diagramas de Casos de Uso - Sistema de Gestão de Frotas

Este diretório contém os diagramas de casos de uso atualizados do Sistema de Gestão de Frotas.

---

## 📁 Arquivos Disponíveis

### 1. `DIAGRAMA_CASOS_USO_ATUALIZADO.md`
**Descrição:** Documento principal com o diagrama de casos de uso atualizado em formato Mermaid.

**Conteúdo:**
- Diagrama Mermaid completo e organizado
- Resumo dos casos de uso por ator
- Relacionamentos especiais (<<extend>>)
- Diferenças de permissões detalhadas
- Notas importantes sobre regras de negócio

**Como visualizar:**
- GitHub/GitLab: O diagrama Mermaid será renderizado automaticamente
- VS Code: Instale a extensão "Markdown Preview Mermaid Support"
- Online: Copie o código Mermaid para https://mermaid.live/

---

### 2. `DIAGRAMA_CASOS_USO_PLANTUML.puml`
**Descrição:** Diagrama de casos de uso em formato PlantUML.

**Conteúdo:**
- Diagrama completo em sintaxe PlantUML
- Organizado por módulos funcionais
- Notas explicativas sobre permissões
- Cores diferenciadas por módulo

**Como visualizar:**
- **PlantUML Online:** http://www.plantuml.com/plantuml/uml/
- **VS Code:** Instale a extensão "PlantUML"
- **IntelliJ IDEA:** Plugin PlantUML
- **Outras ferramentas:** Qualquer editor que suporte PlantUML

**Vantagens do PlantUML:**
- Exportação para PNG, SVG, PDF
- Melhor controle de layout
- Suporte a mais estilos e formatações

---

### 3. `COMPARACAO_DIAGRAMA_CASOS_USO.md`
**Descrição:** Documento comparativo entre a versão antiga e atualizada do diagrama.

**Conteúdo:**
- Comparação lado a lado das versões
- Lista de casos de uso adicionados
- Casos de uso removidos/substituídos
- Melhorias na organização
- Estatísticas comparativas
- Benefícios da versão atualizada

**Uso:** Referência para entender as mudanças e justificar atualizações na documentação.

---

## 🎯 Resumo do Diagrama Atualizado

### Atores
- **👤 Administrador:** 14 casos de uso (acesso total)
- **👤 Gestor de Frota:** 12 casos de uso (gestão operacional)
- **👤 Condutor:** 6 casos de uso (operações de checklist)

### Módulos Funcionais
1. **🔐 Autenticação e Perfil** (4 casos de uso)
2. **📋 Gestão de Checklists** (4 casos de uso)
3. **👥 Gestão de Usuários** (2 casos de uso)
4. **🚗 Gestão de Veículos** (2 casos de uso)
5. **🔧 Gestão de Manutenções** (1 caso de uso)
6. **📊 Monitoramento e Auditoria** (2 casos de uso)

**Total:** 15 casos de uso

---

## 📊 Visualização Rápida

### Opção 1: Mermaid (Recomendado para Markdown)
```markdown
Copie o código do arquivo DIAGRAMA_CASOS_USO_ATUALIZADO.md
e cole em: https://mermaid.live/
```

### Opção 2: PlantUML (Recomendado para exportação)
```
1. Abra o arquivo DIAGRAMA_CASOS_USO_PLANTUML.puml
2. Acesse: http://www.plantuml.com/plantuml/uml/
3. Cole o conteúdo e visualize
4. Exporte como PNG, SVG ou PDF
```

---

## 🔄 Atualizações

**Data da Última Atualização:** Janeiro 2025  
**Versão do Sistema:** 1.0.0

### Mudanças Principais em Relação à Versão Antiga:
- ✅ Adicionados 6 novos casos de uso
- ✅ Organização por módulos funcionais
- ✅ Diferenciação clara de permissões
- ✅ Relacionamentos <<extend>> bem definidos
- ✅ Cobertura completa das funcionalidades implementadas

---

## 📝 Notas para Documentação

Ao incluir o diagrama na documentação oficial:

1. **Para Markdown/GitHub:** Use o arquivo `DIAGRAMA_CASOS_USO_ATUALIZADO.md`
2. **Para Word/PDF:** Exporte o PlantUML como imagem e insira no documento
3. **Para Apresentações:** Use a versão PlantUML exportada como slide

---

## 📚 Referências Relacionadas

- **Documentação Completa:** `DOCUMENTACAO_COMPLETA.md`
- **Casos de Uso Detalhados:** Ver seção "Detalhamento dos Casos de Uso" na documentação completa
- **Especificação Técnica:** Ver seção "Arquitetura Técnica" na documentação completa

---

## ❓ Dúvidas Frequentes

**Q: Qual formato devo usar?**  
R: Use Mermaid se estiver trabalhando com Markdown (GitHub/GitLab). Use PlantUML se precisar exportar para imagem ou ter mais controle sobre o layout.

**Q: Como atualizar o diagrama?**  
R: Edite os arquivos `.md` ou `.puml` conforme necessário. Mantenha ambos os formatos sincronizados.

**Q: O diagrama está completo?**  
R: Sim, o diagrama reflete todas as funcionalidades implementadas no sistema até a versão 1.0.0.

---

**Última revisão:** Janeiro 2025





