# 📚 Documentação: Integração DocSimples - Agent Builder

Esta pasta contém a documentação completa para implementar a funcionalidade de criação de agentes via linguagem natural no DocSimples, baseada na análise do SimplifiqueIA (mvp-agent-builder).

---

## 📁 Arquivos Disponíveis

### 1. [GUIA_IMPLEMENTACAO_AGENTES_DOCSIMPLES.md](./GUIA_IMPLEMENTACAO_AGENTES_DOCSIMPLES.md)
**Guia completo de implementação** contendo:
- Arquitetura de alto nível
- Componentes principais
- Fluxo de criação de agentes
- Implementação passo a passo
- Estruturas de dados detalhadas
- Endpoints da API
- Sistema de templates
- Engine de execução
- Integração com provedores de IA
- Schema de banco de dados
- Componentes frontend
- Checklist de implementação com cronograma

### 2. [CODIGO_COMPLETO_IMPLEMENTACAO.md](./CODIGO_COMPLETO_IMPLEMENTACAO.md)
**Código pronto para copiar** contendo:
- Tipos TypeScript completos
- AI Provider Manager com fallback
- APIs de geração e melhoria de prompt
- Runtime Engine simplificado
- Schema Prisma
- Variáveis de ambiente
- Lista de dependências NPM

---

## 🚀 Como Usar

### Passo 1: Leia o Guia de Implementação
Comece pelo arquivo `GUIA_IMPLEMENTACAO_AGENTES_DOCSIMPLES.md` para entender a arquitetura completa.

### Passo 2: Copie o Código
Use o arquivo `CODIGO_COMPLETO_IMPLEMENTACAO.md` para copiar os blocos de código necessários.

### Passo 3: Siga o Checklist
Use o checklist no final do guia para acompanhar o progresso da implementação.

---

## 📋 Resumo da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    DocSimples Agent Builder                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  MODOS DE CRIAÇÃO:                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Templates  │  │    Visual    │  │   Natural    │      │
│  │   Gallery    │  │    Canvas    │  │   Language   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         └─────────────────┼─────────────────┘              │
│                           │                                 │
│  PROCESSAMENTO:           ▼                                 │
│  ┌─────────────────────────────────────────────────┐       │
│  │              AI Provider Manager                 │       │
│  │    (OpenAI → Anthropic → Google com fallback)   │       │
│  └─────────────────────────┬───────────────────────┘       │
│                            │                                │
│  EXECUÇÃO:                 ▼                                │
│  ┌─────────────────────────────────────────────────┐       │
│  │              Agent Runtime Engine                │       │
│  │    (Input → AI → Logic → API → Output)          │       │
│  └─────────────────────────┬───────────────────────┘       │
│                            │                                │
│  PERSISTÊNCIA:             ▼                                │
│  ┌─────────────────────────────────────────────────┐       │
│  │           PostgreSQL + Prisma ORM               │       │
│  │    (Agents, Executions, Users, Organizations)   │       │
│  └─────────────────────────────────────────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Funcionalidades Principais

1. **Criação via Linguagem Natural**
   - Usuário descreve o que deseja em português
   - IA gera automaticamente a estrutura do agente
   - Preview visual do fluxo gerado

2. **Editor Visual (React Flow)**
   - Drag-and-drop de nós
   - Conexões visuais entre componentes
   - Configuração individual de cada nó

3. **Galeria de Templates**
   - Templates pré-configurados por categoria
   - Um clique para usar
   - Personalizável após seleção

4. **Execução de Agentes**
   - Upload de arquivos (PDF, DOC, etc.)
   - Processamento via IA
   - Geração de relatórios HTML/PDF

5. **Multi-tenancy**
   - Isolamento por organização
   - Controle de acesso
   - Compartilhamento de agentes públicos

---

## ⏱️ Cronograma Sugerido

| Fase | Descrição | Semanas |
|------|-----------|---------|
| 1 | Fundação (tipos, schema, providers) | 1-2 |
| 2 | Backend (APIs, engine) | 3-4 |
| 3 | Frontend - Linguagem Natural | 5-6 |
| 4 | Frontend - Visual Editor | 7-8 |
| 5 | Templates e Execução | 9-10 |
| 6 | Refinamento e Testes | 11-12 |

**Total estimado:** 10-12 semanas para implementação completa

---

## 📞 Referências

- **Repositório base:** SimplifiqueIA (mvp-agent-builder)
- **Documentação React Flow:** https://reactflow.dev/
- **Documentação OpenAI:** https://platform.openai.com/docs
- **Documentação Anthropic:** https://docs.anthropic.com/
- **Documentação Prisma:** https://www.prisma.io/docs

---

**Última atualização:** 04/12/2025
