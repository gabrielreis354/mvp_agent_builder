# 🎯 Plano de Finalização - AgentKit

**Objetivo:** Tornar o AgentKit 100% funcional e testado  
**Tempo Estimado:** 30 minutos (funcional) + 3 dias (completo)  
**Prioridade:** ALTA

---

## ⚡ Fase 1: Tornar Funcional (30 minutos)

### **Tarefa 1: Adicionar Schema Prisma** ⏱️ 10 min

**Arquivo:** `prisma/schema.prisma`

**Ação:** Adicionar ao final do arquivo:

```prisma
// ============================================
// AGENTKIT - CONVERSATIONAL AGENTS
// ============================================

model AgentThread {
  id            String   @id @default(cuid())
  userId        String
  agentId       String
  title         String?
  status        ThreadStatus @default(ACTIVE)
  metadata      Json?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  agent         Agent    @relation(fields: [agentId], references: [id], onDelete: Cascade)
  messages      ThreadMessage[]
  
  @@index([userId])
  @@index([agentId])
  @@index([status])
  @@index([updatedAt])
  @@map("agent_threads")
}

enum ThreadStatus {
  ACTIVE
  ARCHIVED
  COMPLETED
}

model ThreadMessage {
  id            String   @id @default(cuid())
  threadId      String
  role          MessageRole
  content       String   @db.Text
  metadata      Json?
  createdAt     DateTime @default(now())
  
  thread        AgentThread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  
  @@index([threadId])
  @@index([createdAt])
  @@map("thread_messages")
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}
```

**Adicionar relações aos models existentes:**

```prisma
// No model User, adicionar:
model User {
  // ... campos existentes ...
  agentThreads  AgentThread[]
}

// No model Agent, adicionar:
model Agent {
  // ... campos existentes ...
  threads       AgentThread[]
}
```

**Executar:**
```bash
npx prisma generate
npx prisma db push
```

---

### **Tarefa 2: Instalar Dependências** ⏱️ 5 min

```bash
npm install openai@latest @pinecone-database/pinecone uuid
npm install @types/uuid --save-dev
```

---

### **Tarefa 3: Configurar Variáveis de Ambiente** ⏱️ 5 min

**Arquivo:** `.env.local`

**Adicionar:**
```env
# ============================================
# AGENTKIT - AGENTES CONVERSACIONAIS
# ============================================

# OpenAI API (obrigatório)
OPENAI_API_KEY=sk-proj-...

# Pinecone Vector Database (opcional)
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=simplifiqueia-memory

# Feature Flags
ENABLE_CONVERSATIONAL_AGENTS=true
ENABLE_MEMORY_STORE=false  # true se tiver Pinecone

# Configurações
MAX_THREAD_MESSAGES=100
MEMORY_RETENTION_DAYS=90
```

---

### **Tarefa 4: Teste Básico** ⏱️ 10 min

**Criar arquivo de teste:** `test-agentkit.js`

```javascript
// test-agentkit.js
async function testAgentKit() {
  const baseUrl = 'http://localhost:3001'
  
  console.log('🧪 Testando AgentKit...\n')
  
  // 1. Criar thread e enviar primeira mensagem
  console.log('1️⃣ Enviando primeira mensagem...')
  const response1 = await fetch(`${baseUrl}/api/agents/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'next-auth.session-token=SEU_TOKEN_AQUI'
    },
    body: JSON.stringify({
      agentId: 'SEU_AGENT_ID',
      message: 'Olá! Você pode me ajudar a analisar um currículo?'
    })
  })
  
  const data1 = await response1.json()
  console.log('✅ Resposta:', data1.message.content)
  console.log('📝 Thread ID:', data1.threadId)
  console.log('💡 Sugestões:', data1.suggestions)
  
  // 2. Continuar conversa no mesmo thread
  console.log('\n2️⃣ Continuando conversa...')
  const response2 = await fetch(`${baseUrl}/api/agents/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'next-auth.session-token=SEU_TOKEN_AQUI'
    },
    body: JSON.stringify({
      threadId: data1.threadId,
      agentId: 'SEU_AGENT_ID',
      message: 'Quais critérios devo considerar?'
    })
  })
  
  const data2 = await response2.json()
  console.log('✅ Resposta:', data2.message.content)
  
  // 3. Listar threads
  console.log('\n3️⃣ Listando threads...')
  const response3 = await fetch(`${baseUrl}/api/agents/threads`, {
    headers: {
      'Cookie': 'next-auth.session-token=SEU_TOKEN_AQUI'
    }
  })
  
  const data3 = await response3.json()
  console.log('✅ Total de threads:', data3.threads.length)
  
  console.log('\n✅ Todos os testes passaram!')
}

testAgentKit().catch(console.error)
```

**Executar:**
```bash
node test-agentkit.js
```

---

## 🏗️ Fase 2: Completar UI (2 horas)

### **Tarefa 5: Criar Página de Teste** ⏱️ 30 min

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
        <h1 className="text-2xl font-bold mb-4">Teste AgentKit</h1>
        <input
          type="text"
          placeholder="ID do Agente"
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <button
          onClick={() => setStarted(true)}
          disabled={!agentId}
          className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
        >
          Iniciar Chat
        </button>
      </div>
    )
  }

  return (
    <div className="h-screen">
      <ChatInterface agentId={agentId} />
    </div>
  )
}
```

---

### **Tarefa 6: Implementar Thread Sidebar** ⏱️ 1h

**Arquivo:** `src/components/agent-chat/thread-sidebar.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Thread } from '@/lib/agentkit/types'

interface ThreadSidebarProps {
  agentId: string
  currentThreadId?: string
  onThreadSelect: (threadId: string) => void
  onNewThread: () => void
}

export function ThreadSidebar({
  agentId,
  currentThreadId,
  onThreadSelect,
  onNewThread
}: ThreadSidebarProps) {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadThreads()
  }, [agentId])

  async function loadThreads() {
    try {
      const response = await fetch(`/api/agents/threads?agentId=${agentId}`)
      const data = await response.json()
      setThreads(data.threads || [])
    } catch (error) {
      console.error('Erro ao carregar threads:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-64 bg-gray-50 border-r h-full overflow-y-auto">
      <div className="p-4">
        <button
          onClick={onNewThread}
          className="w-full bg-blue-500 text-white p-2 rounded mb-4"
        >
          + Nova Conversa
        </button>

        {loading ? (
          <div className="text-center text-gray-500">Carregando...</div>
        ) : (
          <div className="space-y-2">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => onThreadSelect(thread.id)}
                className={`w-full text-left p-3 rounded transition ${
                  thread.id === currentThreadId
                    ? 'bg-blue-100 border-blue-500'
                    : 'bg-white hover:bg-gray-100'
                } border`}
              >
                <div className="font-medium truncate">
                  {thread.title || 'Nova conversa'}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(thread.updatedAt).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

---

### **Tarefa 7: Atualizar ChatInterface** ⏱️ 30 min

Adicionar suporte ao ThreadSidebar no `chat-interface.tsx`

---

## 🧪 Fase 3: Testes (2-3 dias)

### **Tarefa 8: Testes Unitários** ⏱️ 1 dia

**Arquivos a criar:**
- `src/lib/agentkit/__tests__/thread-manager.test.ts`
- `src/lib/agentkit/__tests__/memory-store.test.ts`
- `src/lib/agentkit/__tests__/conversational-engine.test.ts`

**Exemplo:**
```typescript
// thread-manager.test.ts
import { ThreadManager } from '../thread-manager'

describe('ThreadManager', () => {
  let manager: ThreadManager

  beforeEach(() => {
    manager = new ThreadManager()
  })

  it('deve criar um novo thread', async () => {
    const thread = await manager.createThread('user-1', 'agent-1', 'Olá')
    expect(thread.id).toBeDefined()
    expect(thread.userId).toBe('user-1')
    expect(thread.agentId).toBe('agent-1')
  })

  it('deve adicionar mensagem ao thread', async () => {
    const thread = await manager.createThread('user-1', 'agent-1')
    const message = await manager.addMessage(thread.id, 'user', 'Teste')
    expect(message.content).toBe('Teste')
    expect(message.role).toBe('user')
  })

  // ... mais testes
})
```

---

### **Tarefa 9: Testes de Integração** ⏱️ 1 dia

**Arquivos a criar:**
- `src/app/api/agents/chat/__tests__/route.test.ts`
- `src/app/api/agents/threads/__tests__/route.test.ts`

---

### **Tarefa 10: Testes E2E** ⏱️ 1 dia

**Usando Playwright:**
```typescript
// e2e/agentkit.spec.ts
import { test, expect } from '@playwright/test'

test('deve iniciar conversa com agente', async ({ page }) => {
  await page.goto('/chat-test')
  
  // Inserir ID do agente
  await page.fill('input[placeholder="ID do Agente"]', 'test-agent')
  await page.click('button:has-text("Iniciar Chat")')
  
  // Enviar mensagem
  await page.fill('textarea', 'Olá, como você pode me ajudar?')
  await page.click('button:has-text("Enviar")')
  
  // Verificar resposta
  await expect(page.locator('.message-assistant')).toBeVisible()
})
```

---

## 📋 Checklist de Finalização

### **Funcional (30 min):**
- [ ] Schema Prisma adicionado
- [ ] Dependências instaladas
- [ ] Variáveis de ambiente configuradas
- [ ] Teste básico executado com sucesso

### **UI Completa (2h):**
- [ ] Página de teste criada
- [ ] Thread sidebar implementada
- [ ] ChatInterface atualizada
- [ ] Navegação entre threads funcional

### **Testes (3 dias):**
- [ ] Testes unitários (ThreadManager)
- [ ] Testes unitários (MemoryStore)
- [ ] Testes unitários (ConversationalEngine)
- [ ] Testes de integração (APIs)
- [ ] Testes E2E (UI completa)
- [ ] Cobertura > 80%

### **Documentação:**
- [ ] README atualizado
- [ ] Guia de uso criado
- [ ] Exemplos práticos documentados
- [ ] Troubleshooting guide

### **Deploy:**
- [ ] Deploy em staging
- [ ] Validação com usuários beta
- [ ] Correções de bugs
- [ ] Deploy em produção

---

## 🎯 Próximo Passo Imediato

**COMEÇAR AGORA:**
1. Adicionar schema Prisma
2. Instalar dependências
3. Configurar env variables
4. Testar

**Tempo:** 30 minutos  
**Resultado:** AgentKit funcional!

---

**Última atualização:** 20/10/2025
