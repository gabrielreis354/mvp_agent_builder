# ✅ Setup AgentKit - COMPLETO

**Data:** 20/10/2025  
**Status:** Schema e dependências configurados

---

## ✅ O Que Foi Feito

### **1. Schema Prisma Adicionado** ✅

**Arquivo:** `prisma/schema.prisma`

**Adicionado:**
- ✅ Model `AgentThread` com todos os campos e relações
- ✅ Model `ThreadMessage` com relação ao thread
- ✅ Enum `ThreadStatus` (ACTIVE, ARCHIVED, COMPLETED)
- ✅ Enum `MessageRole` (USER, ASSISTANT, SYSTEM)
- ✅ Relação `agentThreads` no model `User`
- ✅ Relação `threads` no model `Agent`

**Executado:**
```bash
npm run db:generate  # ✅ Prisma Client gerado
npm run db:push      # ✅ Schema aplicado ao banco
```

**Resultado:** 
- ✅ Tabelas `agent_threads` e `thread_messages` criadas
- ✅ Prisma Client atualizado com novos types

---

### **2. Dependências Instaladas** ✅

**Instalado:**
```bash
npm install @pinecone-database/pinecone  # ✅ Instalado
```

**Já Instaladas:**
- ✅ `openai` (v5.20.3)
- ✅ `uuid` (via @types/uuid)

---

## ⏳ Próximos Passos

### **Passo 1: Configurar Variáveis de Ambiente** (5 min)

**Arquivo:** `.env.local`

**Adicionar:**
```env
# ============================================
# AGENTKIT - AGENTES CONVERSACIONAIS
# ============================================

# Feature Flag (obrigatório)
ENABLE_CONVERSATIONAL_AGENTS=true

# OpenAI (obrigatório - já deve estar configurado)
OPENAI_API_KEY=sk-proj-...

# Pinecone (opcional - para memória de longo prazo)
ENABLE_MEMORY_STORE=false  # Mudar para true se configurar Pinecone
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=simplifiqueia-memory

# Configurações
MAX_THREAD_MESSAGES=100
MEMORY_RETENTION_DAYS=90
```

---

### **Passo 2: Testar Funcionamento** (10 min)

#### **Opção A: Via API (Postman/Insomnia)**

**1. Iniciar servidor:**
```bash
npm run dev
```

**2. Fazer login e pegar token de sessão**

**3. Testar endpoint de chat:**
```http
POST http://localhost:3001/api/agents/chat
Content-Type: application/json
Cookie: next-auth.session-token=SEU_TOKEN

{
  "agentId": "SEU_AGENT_ID",
  "message": "Olá! Você pode me ajudar a analisar um currículo?"
}
```

**Resposta esperada:**
```json
{
  "threadId": "clxxx...",
  "message": {
    "id": "clyyy...",
    "role": "assistant",
    "content": "Olá! Claro, posso ajudá-lo...",
    "createdAt": "2025-10-20T...",
    "metadata": {
      "executionId": "...",
      "executionTime": 2500
    }
  },
  "suggestions": [
    "Como avaliar soft skills?",
    "Quais critérios técnicos devo considerar?"
  ]
}
```

**4. Continuar conversa:**
```http
POST http://localhost:3001/api/agents/chat
Content-Type: application/json
Cookie: next-auth.session-token=SEU_TOKEN

{
  "threadId": "clxxx...",  // Do passo anterior
  "agentId": "SEU_AGENT_ID",
  "message": "Quais critérios devo considerar?"
}
```

**5. Listar threads:**
```http
GET http://localhost:3001/api/agents/threads
Cookie: next-auth.session-token=SEU_TOKEN
```

---

#### **Opção B: Via Código (Node.js)**

**Criar arquivo:** `test-agentkit.js`

```javascript
const fetch = require('node-fetch')

async function testAgentKit() {
  const baseUrl = 'http://localhost:3001'
  const sessionToken = 'SEU_TOKEN_AQUI'
  const agentId = 'SEU_AGENT_ID'
  
  console.log('🧪 Testando AgentKit...\n')
  
  try {
    // 1. Primeira mensagem
    console.log('1️⃣ Enviando primeira mensagem...')
    const res1 = await fetch(`${baseUrl}/api/agents/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `next-auth.session-token=${sessionToken}`
      },
      body: JSON.stringify({
        agentId,
        message: 'Olá! Você pode me ajudar a analisar um currículo?'
      })
    })
    
    const data1 = await res1.json()
    console.log('✅ Thread criado:', data1.threadId)
    console.log('💬 Resposta:', data1.message.content.substring(0, 100) + '...')
    console.log('💡 Sugestões:', data1.suggestions)
    
    // 2. Continuar conversa
    console.log('\n2️⃣ Continuando conversa...')
    const res2 = await fetch(`${baseUrl}/api/agents/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `next-auth.session-token=${sessionToken}`
      },
      body: JSON.stringify({
        threadId: data1.threadId,
        agentId,
        message: 'Quais critérios devo considerar?'
      })
    })
    
    const data2 = await res2.json()
    console.log('💬 Resposta:', data2.message.content.substring(0, 100) + '...')
    
    // 3. Listar threads
    console.log('\n3️⃣ Listando threads...')
    const res3 = await fetch(`${baseUrl}/api/agents/threads`, {
      headers: {
        'Cookie': `next-auth.session-token=${sessionToken}`
      }
    })
    
    const data3 = await res3.json()
    console.log('📋 Total de threads:', data3.threads.length)
    
    console.log('\n✅ Todos os testes passaram!')
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

testAgentKit()
```

**Executar:**
```bash
node test-agentkit.js
```

---

### **Passo 3: Criar Página de Teste** (30 min)

**Arquivo:** `src/app/(app)/chat-test/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { ChatInterface } from '@/components/agent-chat/chat-interface'

export default function ChatTestPage() {
  const [agentId, setAgentId] = useState('')
  const [started, setStarted] = useState(false)

  if (!started) {
    return (
      <div className="container mx-auto p-8 max-w-md">
        <h1 className="text-2xl font-bold mb-4">🤖 Teste AgentKit</h1>
        <p className="text-gray-600 mb-4">
          Teste os agentes conversacionais com memória persistente
        </p>
        <input
          type="text"
          placeholder="ID do Agente"
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
          className="w-full p-3 border rounded-lg mb-4"
        />
        <button
          onClick={() => setStarted(true)}
          disabled={!agentId}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition"
        >
          Iniciar Chat
        </button>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <h1 className="text-xl font-bold">Chat com Agente</h1>
        <p className="text-sm opacity-90">AgentKit v2.0</p>
      </div>
      <div className="flex-1">
        <ChatInterface agentId={agentId} />
      </div>
    </div>
  )
}
```

**Acessar:** http://localhost:3001/chat-test

---

## 📊 Status Atual

| Item | Status | Tempo |
|------|--------|-------|
| Schema Prisma | ✅ Completo | - |
| Dependências | ✅ Instaladas | - |
| Env Variables | ⏳ Pendente | 5 min |
| Teste Básico | ⏳ Pendente | 10 min |
| Página de Teste | ⏳ Pendente | 30 min |

**Tempo Total Restante:** ~45 minutos para sistema 100% funcional

---

## 🎯 Checklist de Validação

Após configurar env variables e testar:

- [ ] Servidor inicia sem erros
- [ ] Endpoint `/api/agents/chat` responde
- [ ] Thread é criado com sucesso
- [ ] Mensagens são salvas no banco
- [ ] Agente responde corretamente
- [ ] Contexto é mantido entre mensagens
- [ ] Sugestões são geradas
- [ ] Threads podem ser listados
- [ ] UI de chat funciona (se implementada)

---

## 🐛 Troubleshooting

### **Erro: ENABLE_CONVERSATIONAL_AGENTS não habilitado**
```
Solução: Adicionar ENABLE_CONVERSATIONAL_AGENTS=true ao .env.local
```

### **Erro: Thread não encontrado**
```
Causa: ThreadId inválido ou usuário sem permissão
Solução: Verificar se threadId existe e pertence ao usuário
```

### **Erro: OpenAI API error**
```
Causa: OPENAI_API_KEY inválida ou sem créditos
Solução: Verificar chave e saldo na OpenAI
```

### **Erro: Pinecone connection failed**
```
Causa: PINECONE_API_KEY inválida ou index não existe
Solução: Desabilitar memória (ENABLE_MEMORY_STORE=false) ou configurar Pinecone
```

---

## 📚 Documentação Relacionada

- [Análise de Implementação](./ANALISE_IMPLEMENTACAO_ATUAL.md)
- [Plano de Finalização](./PLANO_FINALIZACAO.md)
- [Status de Implementação](./IMPLEMENTATION_STATUS.md)
- [Roadmap](./ROADMAP.md)

---

**Próximo passo:** Configurar variáveis de ambiente e testar! 🚀

**Última atualização:** 20/10/2025
