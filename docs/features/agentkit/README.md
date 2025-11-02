# 🤖 AgentKit - Agentes Conversacionais com Memória

**Status:** 🚧 Em Desenvolvimento (90% completo)  
**Branch:** `feature/agentkit-conversational-agents`  
**Versão alvo:** v2.1.0

---

## 📋 Visão Geral

O **AgentKit** é uma extensão do SimplifiqueIA RH que adiciona capacidades conversacionais aos agentes, permitindo:

- 💬 **Conversas multi-turno** com contexto persistente
- 🧠 **Memória de longo prazo** usando Pinecone Vector Database
- 🔄 **Threads persistentes** para múltiplas sessões
- 🎯 **Handoffs inteligentes** entre agentes especializados
- ⚡ **Streaming em tempo real** de respostas

---

## 🎯 Casos de Uso

### **1. Assistente de RH Conversacional**
```
Usuário: "Preciso contratar um desenvolvedor"
Agente: "Entendi! Vou ajudá-lo. Qual o nível de senioridade?"
Usuário: "Sênior, com experiência em React"
Agente: "Perfeito. Vou criar a descrição da vaga e sugerir perguntas de triagem..."
```

### **2. Onboarding Interativo**
```
Agente: "Olá João! Bem-vindo à empresa. Vou guiá-lo no processo de onboarding."
Usuário: "Obrigado! Por onde começamos?"
Agente: "Primeiro, vamos configurar seu email corporativo..."
```

### **3. Suporte RH com Contexto**
```
Usuário: "Como solicito férias?"
Agente: "Você pode solicitar pelo sistema. Quantos dias deseja?"
[2 dias depois]
Usuário: "Sobre aquelas férias..."
Agente: "Sim, você mencionou que queria solicitar. Já decidiu as datas?"
```

---

## 📚 Documentação

### **Guias de Implementação:**
- [📊 Status de Implementação](./IMPLEMENTATION_STATUS.md) - Progresso atual (90%)
- [🗺️ Roadmap Completo](./ROADMAP.md) - Planejamento de 6 meses
- [⚙️ Guia de Setup](./SETUP_GUIDE.md) - Configuração passo a passo
- [🚀 Quick Start](./QUICKSTART.md) - Começar rapidamente
- [🔧 Como Funciona](./HOW_IT_WORKS.md) - Arquitetura técnica
- [📈 Análise de Impacto](./IMPACT_ANALYSIS.md) - Benefícios e ROI

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────┐
│  UI: Chat Interface                         │
│  - message-list.tsx                         │
│  - message-input.tsx                        │
│  - thread-sidebar.tsx                       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  API: Chat & Threads                        │
│  - /api/agents/chat                         │
│  - /api/agents/threads                      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Core: Conversational Engine                │
│  - conversational-engine.ts                 │
│  - thread-manager.ts                        │
│  - memory-store.ts                          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Storage                                    │
│  - PostgreSQL (threads, messages)           │
│  - Pinecone (memória vetorial)              │
└─────────────────────────────────────────────┘
```

---

## ✅ Implementado

- ✅ Core components (ThreadManager, MemoryStore, ConversationalEngine)
- ✅ API endpoints (/api/agents/chat, /api/agents/threads)
- ✅ Schema Prisma (AgentThread, ThreadMessage)
- ✅ Tipos TypeScript completos
- ✅ Documentação técnica

---

## 🚧 Pendente

- ⏳ UI Components (chat interface)
- ⏳ Testes automatizados
- ⏳ Configuração Pinecone em produção
- ⏳ Deploy e validação

---

## 🚀 Como Começar

1. **Leia o [Quick Start](./QUICKSTART.md)** para setup rápido
2. **Configure as dependências** seguindo o [Setup Guide](./SETUP_GUIDE.md)
3. **Teste a API** com os exemplos fornecidos
4. **Implemente a UI** seguindo os componentes de referência

---

## 📞 Suporte

- **Issues:** Criar issue no GitHub com tag `agentkit`
- **Documentação:** Consultar os guias neste diretório
- **Branch:** `feature/agentkit-conversational-agents`

---

**Última atualização:** 20/10/2025
