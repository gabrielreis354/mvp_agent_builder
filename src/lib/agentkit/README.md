# 🤖 AgentKit - Agentes Conversacionais

Implementação de agentes conversacionais com memória usando OpenAI AgentKit.

## 📁 Estrutura

```
agentkit/
├── types.ts                    # ✅ Tipos e interfaces
├── conversational-engine.ts    # 🚧 Engine principal de conversação
├── memory-store.ts             # 🚧 Armazenamento de memória (Pinecone)
├── thread-manager.ts           # 🚧 Gerenciamento de threads
└── README.md                   # Este arquivo
```

## 🚀 Status de Implementação

- ✅ **types.ts** - Tipos base definidos
- 🚧 **conversational-engine.ts** - Em desenvolvimento
- 🚧 **memory-store.ts** - Em desenvolvimento
- 🚧 **thread-manager.ts** - Em desenvolvimento

## 📖 Uso Básico

```typescript
import { ConversationalEngine } from '@/lib/agentkit/conversational-engine'

const engine = new ConversationalEngine()

// Iniciar nova conversa
const response = await engine.chat({
  agentId: 'agent-123',
  message: 'Olá, preciso de ajuda com currículos',
  userId: 'user-456'
})

console.log(response.message.content)
// "Olá! Claro, posso ajudar com análise de currículos. O que você precisa?"

// Continuar conversa
const response2 = await engine.chat({
  threadId: response.threadId,
  agentId: 'agent-123',
  message: 'Como avaliar soft skills?',
  userId: 'user-456'
})
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Pinecone (Vector Store)
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
PINECONE_INDEX_NAME=simplifiqueia-memory

# Feature Flag
ENABLE_CONVERSATIONAL_AGENTS=true
```

### Banco de Dados

Execute as migrations:

```bash
npx prisma generate
npx prisma db push
```

## 📚 Documentação

- [Guia de Implementação](../../../docs/IMPLEMENTATION_GUIDE_PHASE1.md)
- [Roadmap AgentKit](../../../docs/ROADMAP_AGENTKIT_INTEGRATION.md)

## 🧪 Testes

```bash
npm test -- agentkit
```

## 🎯 Próximos Passos

1. Implementar `conversational-engine.ts`
2. Implementar `memory-store.ts`
3. Implementar `thread-manager.ts`
4. Criar API endpoints
5. Criar UI de chat
6. Testes end-to-end
