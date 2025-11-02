# 🚀 Guia de Implementação - Fase 1: Agentes Conversacionais

**Branch:** `feature/agentkit-conversational-agents`  
**Duração:** 4 semanas  
**Objetivo:** Implementar agentes conversacionais com memória usando AgentKit

---

## 📋 Checklist de Implementação

### **Semana 1: Setup e Fundação** ✅

#### **1.1 Dependências**
```bash
npm install openai@latest
npm install @pinecone-database/pinecone  # Para vector store (memória)
npm install uuid
```

#### **1.2 Variáveis de Ambiente**
Adicionar ao `.env.local`:
```env
# OpenAI AgentKit
OPENAI_API_KEY=sk-...
OPENAI_ASSISTANT_ID=asst_...  # Será criado depois

# Vector Database (Pinecone)
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
PINECONE_INDEX_NAME=simplifiqueia-memory

# Feature Flags
ENABLE_CONVERSATIONAL_AGENTS=true
```

#### **1.3 Estrutura de Pastas**
```
src/
├── lib/
│   ├── agentkit/
│   │   ├── conversational-engine.ts      # NOVO
│   │   ├── memory-store.ts               # NOVO
│   │   ├── thread-manager.ts             # NOVO
│   │   └── types.ts                      # NOVO
│   └── runtime/
│       └── engine.ts                     # Existente
├── app/
│   └── api/
│       └── agents/
│           ├── chat/
│           │   ├── route.ts              # NOVO - Endpoint de chat
│           │   └── [threadId]/
│           │       └── route.ts          # NOVO - Thread específico
│           └── threads/
│               └── route.ts              # NOVO - Gerenciar threads
└── components/
    └── agent-chat/
        ├── chat-interface.tsx            # NOVO
        ├── message-list.tsx              # NOVO
        ├── message-input.tsx             # NOVO
        └── thread-sidebar.tsx            # NOVO
```

---

### **Semana 2: Core Implementation**

#### **2.1 Schema do Banco de Dados**
Adicionar ao `prisma/schema.prisma`:

```prisma
// Thread de conversação com agente
model AgentThread {
  id            String   @id @default(cuid())
  userId        String
  agentId       String
  title         String?  // Título gerado automaticamente
  status        ThreadStatus @default(ACTIVE)
  metadata      Json?    // Contexto adicional
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  agent         Agent    @relation(fields: [agentId], references: [id], onDelete: Cascade)
  messages      ThreadMessage[]
  
  @@index([userId])
  @@index([agentId])
  @@index([status])
}

enum ThreadStatus {
  ACTIVE
  ARCHIVED
  COMPLETED
}

// Mensagens dentro de um thread
model ThreadMessage {
  id            String   @id @default(cuid())
  threadId      String
  role          MessageRole
  content       String   @db.Text
  metadata      Json?    // Ferramentas usadas, tokens, etc.
  createdAt     DateTime @default(now())
  
  thread        AgentThread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  
  @@index([threadId])
  @@index([createdAt])
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}
```

Executar:
```bash
npx prisma generate
npx prisma db push
```

---

#### **2.2 Types e Interfaces**

Criar `src/lib/agentkit/types.ts`:

```typescript
export interface ConversationalAgent {
  id: string
  name: string
  instructions: string
  model: string
  tools?: AgentTool[]
  memoryEnabled: boolean
}

export interface AgentTool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, any>
      required?: string[]
    }
  }
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: Date
  metadata?: {
    tokensUsed?: number
    toolsCalled?: string[]
    executionTime?: number
  }
}

export interface Thread {
  id: string
  userId: string
  agentId: string
  title?: string
  status: 'active' | 'archived' | 'completed'
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatRequest {
  threadId?: string  // Opcional: criar novo ou continuar existente
  agentId: string
  message: string
  userId: string
}

export interface ChatResponse {
  threadId: string
  message: ChatMessage
  suggestions?: string[]  // Sugestões de próximas perguntas
}
```

---

#### **2.3 Memory Store**

Criar `src/lib/agentkit/memory-store.ts`:

```typescript
import { Pinecone } from '@pinecone-database/pinecone'

export class MemoryStore {
  private pinecone: Pinecone
  private indexName: string

  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENVIRONMENT!,
    })
    this.indexName = process.env.PINECONE_INDEX_NAME || 'simplifiqueia-memory'
  }

  /**
   * Armazena uma mensagem no vector store para busca semântica
   */
  async storeMessage(
    threadId: string,
    messageId: string,
    content: string,
    metadata: Record<string, any>
  ): Promise<void> {
    const index = this.pinecone.index(this.indexName)
    
    // Gerar embedding usando OpenAI
    const embedding = await this.generateEmbedding(content)
    
    await index.upsert([
      {
        id: messageId,
        values: embedding,
        metadata: {
          threadId,
          content,
          timestamp: Date.now(),
          ...metadata,
        },
      },
    ])
  }

  /**
   * Busca mensagens relevantes de threads anteriores
   */
  async searchRelevantMemories(
    query: string,
    userId: string,
    limit: number = 5
  ): Promise<Array<{ content: string; metadata: any }>> {
    const index = this.pinecone.index(this.indexName)
    const queryEmbedding = await this.generateEmbedding(query)

    const results = await index.query({
      vector: queryEmbedding,
      topK: limit,
      filter: { userId },
      includeMetadata: true,
    })

    return results.matches.map((match) => ({
      content: match.metadata?.content as string,
      metadata: match.metadata,
    }))
  }

  /**
   * Gera embedding usando OpenAI
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    })

    const data = await response.json()
    return data.data[0].embedding
  }

  /**
   * Limpa memórias antigas (LGPD compliance)
   */
  async cleanOldMemories(daysOld: number = 90): Promise<void> {
    const cutoffDate = Date.now() - daysOld * 24 * 60 * 60 * 1000
    const index = this.pinecone.index(this.indexName)

    // Implementar lógica de limpeza
    // TODO: Pinecone não tem delete by filter direto, precisar iterar
  }
}
```

---

#### **2.4 Thread Manager**

Criar `src/lib/agentkit/thread-manager.ts`:

```typescript
import { prisma } from '@/lib/db'
import { Thread, ChatMessage } from './types'

export class ThreadManager {
  /**
   * Cria um novo thread de conversação
   */
  async createThread(
    userId: string,
    agentId: string,
    initialMessage?: string
  ): Promise<Thread> {
    const thread = await prisma.agentThread.create({
      data: {
        userId,
        agentId,
        title: initialMessage?.substring(0, 50) || 'Nova conversa',
        status: 'ACTIVE',
      },
      include: {
        messages: true,
      },
    })

    return this.mapToThread(thread)
  }

  /**
   * Adiciona mensagem ao thread
   */
  async addMessage(
    threadId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Record<string, any>
  ): Promise<ChatMessage> {
    const message = await prisma.threadMessage.create({
      data: {
        threadId,
        role: role.toUpperCase() as any,
        content,
        metadata,
      },
    })

    // Atualizar updatedAt do thread
    await prisma.agentThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    })

    return this.mapToMessage(message)
  }

  /**
   * Busca thread por ID
   */
  async getThread(threadId: string, userId: string): Promise<Thread | null> {
    const thread = await prisma.agentThread.findFirst({
      where: {
        id: threadId,
        userId, // Segurança: apenas threads do usuário
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return thread ? this.mapToThread(thread) : null
  }

  /**
   * Lista threads do usuário
   */
  async listThreads(
    userId: string,
    agentId?: string,
    limit: number = 20
  ): Promise<Thread[]> {
    const threads = await prisma.agentThread.findMany({
      where: {
        userId,
        ...(agentId && { agentId }),
        status: 'ACTIVE',
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 10, // Últimas 10 mensagens para preview
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    })

    return threads.map(this.mapToThread)
  }

  /**
   * Arquiva thread
   */
  async archiveThread(threadId: string, userId: string): Promise<void> {
    await prisma.agentThread.updateMany({
      where: {
        id: threadId,
        userId, // Segurança
      },
      data: {
        status: 'ARCHIVED',
      },
    })
  }

  /**
   * Deleta thread (LGPD)
   */
  async deleteThread(threadId: string, userId: string): Promise<void> {
    await prisma.agentThread.deleteMany({
      where: {
        id: threadId,
        userId, // Segurança
      },
    })
  }

  /**
   * Mapeia Prisma model para tipo interno
   */
  private mapToThread(thread: any): Thread {
    return {
      id: thread.id,
      userId: thread.userId,
      agentId: thread.agentId,
      title: thread.title,
      status: thread.status.toLowerCase(),
      messages: thread.messages?.map(this.mapToMessage) || [],
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    }
  }

  private mapToMessage(message: any): ChatMessage {
    return {
      id: message.id,
      role: message.role.toLowerCase(),
      content: message.content,
      createdAt: message.createdAt,
      metadata: message.metadata,
    }
  }
}
```

---

### **Semana 3: Conversational Engine**

#### **3.1 Conversational Engine**

Criar `src/lib/agentkit/conversational-engine.ts`:

```typescript
import OpenAI from 'openai'
import { ThreadManager } from './thread-manager'
import { MemoryStore } from './memory-store'
import { ChatRequest, ChatResponse, ConversationalAgent } from './types'

export class ConversationalEngine {
  private openai: OpenAI
  private threadManager: ThreadManager
  private memoryStore: MemoryStore

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    this.threadManager = new ThreadManager()
    this.memoryStore = new MemoryStore()
  }

  /**
   * Processa mensagem do usuário e retorna resposta do agente
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const { threadId, agentId, message, userId } = request

    // 1. Criar ou recuperar thread
    let thread
    if (threadId) {
      thread = await this.threadManager.getThread(threadId, userId)
      if (!thread) {
        throw new Error('Thread não encontrado')
      }
    } else {
      thread = await this.threadManager.createThread(userId, agentId, message)
    }

    // 2. Adicionar mensagem do usuário
    await this.threadManager.addMessage(thread.id, 'user', message)

    // 3. Buscar memórias relevantes (contexto de conversas anteriores)
    const relevantMemories = await this.memoryStore.searchRelevantMemories(
      message,
      userId,
      3
    )

    // 4. Construir contexto para o agente
    const systemMessage = this.buildSystemMessage(agentId, relevantMemories)
    const conversationHistory = thread.messages.slice(-10) // Últimas 10 mensagens

    // 5. Chamar OpenAI
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemMessage },
        ...conversationHistory.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const assistantMessage = completion.choices[0].message.content || ''

    // 6. Salvar resposta do agente
    const savedMessage = await this.threadManager.addMessage(
      thread.id,
      'assistant',
      assistantMessage,
      {
        tokensUsed: completion.usage?.total_tokens,
        model: completion.model,
      }
    )

    // 7. Armazenar na memória de longo prazo
    await this.memoryStore.storeMessage(
      thread.id,
      savedMessage.id,
      assistantMessage,
      { userId, agentId }
    )

    // 8. Gerar sugestões de próximas perguntas (opcional)
    const suggestions = await this.generateSuggestions(assistantMessage)

    return {
      threadId: thread.id,
      message: savedMessage,
      suggestions,
    }
  }

  /**
   * Constrói mensagem de sistema com contexto
   */
  private buildSystemMessage(
    agentId: string,
    relevantMemories: Array<{ content: string; metadata: any }>
  ): string {
    // TODO: Buscar instruções do agente do banco
    const baseInstructions = `Você é um assistente de RH especializado.
Você ajuda profissionais de RH com análise de currículos, contratos, onboarding e compliance.
Seja profissional, claro e objetivo.`

    let contextFromMemory = ''
    if (relevantMemories.length > 0) {
      contextFromMemory = `\n\nContexto de conversas anteriores:\n${relevantMemories
        .map((m) => `- ${m.content}`)
        .join('\n')}`
    }

    return baseInstructions + contextFromMemory
  }

  /**
   * Gera sugestões de próximas perguntas
   */
  private async generateSuggestions(
    lastResponse: string
  ): Promise<string[]> {
    // Implementação simples: pode ser melhorada com outro call à IA
    return [
      'Me explique mais sobre isso',
      'Quais são as próximas etapas?',
      'Tem algum exemplo prático?',
    ]
  }
}
```

---

### **Semana 4: API e UI**

#### **4.1 API Endpoint - Chat**

Criar `src/app/api/agents/chat/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ConversationalEngine } from '@/lib/agentkit/conversational-engine'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { threadId, agentId, message } = body

    if (!agentId || !message) {
      return NextResponse.json(
        { error: 'agentId e message são obrigatórios' },
        { status: 400 }
      )
    }

    const engine = new ConversationalEngine()
    const response = await engine.chat({
      threadId,
      agentId,
      message,
      userId: session.user.id,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erro no chat:', error)
    return NextResponse.json(
      { error: 'Erro ao processar mensagem' },
      { status: 500 }
    )
  }
}
```

---

#### **4.2 API Endpoint - Threads**

Criar `src/app/api/agents/threads/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ThreadManager } from '@/lib/agentkit/thread-manager'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')

    const manager = new ThreadManager()
    const threads = await manager.listThreads(
      session.user.id,
      agentId || undefined
    )

    return NextResponse.json({ threads })
  } catch (error) {
    console.error('Erro ao listar threads:', error)
    return NextResponse.json(
      { error: 'Erro ao listar conversas' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const threadId = searchParams.get('threadId')

    if (!threadId) {
      return NextResponse.json(
        { error: 'threadId é obrigatório' },
        { status: 400 }
      )
    }

    const manager = new ThreadManager()
    await manager.deleteThread(threadId, session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar thread:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar conversa' },
      { status: 500 }
    )
  }
}
```

---

#### **4.3 UI - Chat Interface**

Criar `src/components/agent-chat/chat-interface.tsx`:

```typescript
'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageList } from './message-list'
import { MessageInput } from './message-input'
import { ThreadSidebar } from './thread-sidebar'
import { ChatMessage, Thread } from '@/lib/agentkit/types'

interface ChatInterfaceProps {
  agentId: string
  agentName: string
}

export function ChatInterface({ agentId, agentName }: ChatInterfaceProps) {
  const [currentThread, setCurrentThread] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    // Adicionar mensagem do usuário imediatamente (otimista)
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: message,
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: currentThread?.id,
          agentId,
          message,
        }),
      })

      if (!response.ok) throw new Error('Erro ao enviar mensagem')

      const data = await response.json()
      
      // Atualizar com resposta real
      setMessages((prev) => [...prev, data.message])
      
      // Atualizar thread ID se for novo
      if (!currentThread) {
        setCurrentThread({ id: data.threadId } as Thread)
      }
    } catch (error) {
      console.error('Erro:', error)
      // TODO: Mostrar erro para usuário
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar com histórico de threads */}
      <ThreadSidebar
        agentId={agentId}
        currentThreadId={currentThread?.id}
        onSelectThread={(thread) => {
          setCurrentThread(thread)
          setMessages(thread.messages)
        }}
        onNewThread={() => {
          setCurrentThread(null)
          setMessages([])
        }}
      />

      {/* Área principal de chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <h2 className="text-xl font-semibold text-white">{agentName}</h2>
          <p className="text-sm text-gray-400">
            {currentThread ? 'Conversa em andamento' : 'Nova conversa'}
          </p>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <p className="text-lg mb-2">👋 Olá! Como posso ajudar?</p>
                <p className="text-sm">
                  Faça uma pergunta sobre RH, currículos, contratos ou onboarding
                </p>
              </div>
            </div>
          ) : (
            <MessageList messages={messages} isLoading={isLoading} />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de mensagem */}
        <MessageInput
          onSend={handleSendMessage}
          disabled={isLoading}
          placeholder="Digite sua mensagem..."
        />
      </div>
    </div>
  )
}
```

---

## 🧪 Testes

### **Teste Manual - Checklist:**

- [ ] Criar novo thread
- [ ] Enviar mensagem
- [ ] Receber resposta do agente
- [ ] Continuar conversa no mesmo thread
- [ ] Criar novo thread
- [ ] Verificar que contexto é mantido
- [ ] Arquivar thread
- [ ] Deletar thread
- [ ] Testar com múltiplos usuários (isolamento)

### **Teste Automatizado:**

Criar `__tests__/lib/conversational-engine.test.ts`:

```typescript
import { ConversationalEngine } from '@/lib/agentkit/conversational-engine'

describe('ConversationalEngine', () => {
  it('should create new thread and respond', async () => {
    const engine = new ConversationalEngine()
    const response = await engine.chat({
      agentId: 'test-agent',
      message: 'Olá, preciso de ajuda com currículos',
      userId: 'test-user',
    })

    expect(response.threadId).toBeDefined()
    expect(response.message.role).toBe('assistant')
    expect(response.message.content).toBeTruthy()
  })

  it('should maintain context in same thread', async () => {
    const engine = new ConversationalEngine()
    
    // Primeira mensagem
    const response1 = await engine.chat({
      agentId: 'test-agent',
      message: 'Meu nome é João',
      userId: 'test-user',
    })

    // Segunda mensagem no mesmo thread
    const response2 = await engine.chat({
      threadId: response1.threadId,
      agentId: 'test-agent',
      message: 'Qual é o meu nome?',
      userId: 'test-user',
    })

    expect(response2.message.content.toLowerCase()).toContain('joão')
  })
})
```

---

## 📊 Métricas de Sucesso

- [ ] Latência < 2s por mensagem
- [ ] Taxa de erro < 1%
- [ ] 100% de isolamento entre usuários
- [ ] Memória funciona (contexto mantido)
- [ ] UI responsiva e intuitiva

---

## 🚀 Deploy

### **Checklist antes do merge:**

- [ ] Todos os testes passando
- [ ] Documentação atualizada
- [ ] Variáveis de ambiente documentadas
- [ ] Migration do banco executada
- [ ] Code review aprovado
- [ ] Testado em staging

### **Comando de merge:**

```bash
git checkout main
git merge feature/agentkit-conversational-agents
git push origin main
```

---

**Status:** 🟡 Em Desenvolvimento  
**Próxima Fase:** Swarm de Agentes (Fase 2)
