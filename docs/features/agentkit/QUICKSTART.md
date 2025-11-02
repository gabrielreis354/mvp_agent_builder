# 🚀 AgentKit - Quick Start

**Branch:** `feature/agentkit-conversational-agents`  
**Status:** 🟢 Pronto para começar implementação

---

## 📋 O Que Foi Criado

### **Documentação:**
1. ✅ `docs/ROADMAP_AGENTKIT_INTEGRATION.md` - Visão completa da integração
2. ✅ `docs/IMPLEMENTATION_GUIDE_PHASE1.md` - Guia detalhado de implementação
3. ✅ `PHASE1_SETUP.md` - Setup inicial (dependências, env vars, banco)
4. ✅ `src/lib/agentkit/README.md` - Documentação do módulo

### **Código Base:**
1. ✅ `src/lib/agentkit/types.ts` - Tipos e interfaces TypeScript

### **Estrutura de Pastas:**
```
src/lib/agentkit/
├── types.ts              ✅ Criado
├── conversational-engine.ts   🚧 Próximo
├── memory-store.ts            🚧 Próximo
└── thread-manager.ts          🚧 Próximo
```

---

## 🎯 Próximos Passos (Ordem de Execução)

### **Passo 1: Setup Inicial** (30 min)

```bash
# 1. Instalar dependências
npm install openai@latest @pinecone-database/pinecone uuid

# 2. Configurar .env.local
# Copie as variáveis de PHASE1_SETUP.md

# 3. Atualizar schema do Prisma
# Copie os models de PHASE1_SETUP.md para prisma/schema.prisma

# 4. Aplicar migrations
npx prisma generate
npx prisma db push
```

### **Passo 2: Implementar Core** (2-3 dias)

Seguir ordem do `IMPLEMENTATION_GUIDE_PHASE1.md`:

1. **ThreadManager** (`src/lib/agentkit/thread-manager.ts`)
   - Gerenciamento de conversas
   - CRUD de threads e mensagens

2. **MemoryStore** (`src/lib/agentkit/memory-store.ts`)
   - Integração com Pinecone
   - Busca semântica de memórias

3. **ConversationalEngine** (`src/lib/agentkit/conversational-engine.ts`)
   - Engine principal
   - Integração OpenAI + Memória

### **Passo 3: API Endpoints** (1 dia)

1. `src/app/api/agents/chat/route.ts` - Endpoint de chat
2. `src/app/api/agents/threads/route.ts` - Gerenciar threads

### **Passo 4: UI** (2-3 dias)

1. `src/components/agent-chat/chat-interface.tsx`
2. `src/components/agent-chat/message-list.tsx`
3. `src/components/agent-chat/message-input.tsx`
4. `src/components/agent-chat/thread-sidebar.tsx`

### **Passo 5: Testes** (1-2 dias)

1. Testes unitários
2. Testes de integração
3. Testes E2E

---

## 📚 Documentos Importantes

| Documento | Propósito |
|-----------|-----------|
| `ROADMAP_AGENTKIT_INTEGRATION.md` | Visão geral e estratégia |
| `IMPLEMENTATION_GUIDE_PHASE1.md` | Guia passo-a-passo completo |
| `PHASE1_SETUP.md` | Setup de dependências e ambiente |
| `src/lib/agentkit/README.md` | Documentação técnica do módulo |

---

## 🎨 Exemplo de Uso Final

```typescript
// Usuário inicia conversa
const response = await fetch('/api/agents/chat', {
  method: 'POST',
  body: JSON.stringify({
    agentId: 'curriculo-analyst',
    message: 'Preciso analisar este currículo'
  })
})

// Agente responde com contexto
// "Claro! Por favor, envie o currículo. 
//  Qual é o cargo que você está recrutando?"

// Usuário continua conversa
const response2 = await fetch('/api/agents/chat', {
  method: 'POST',
  body: JSON.stringify({
    threadId: response.threadId,
    agentId: 'curriculo-analyst',
    message: 'Desenvolvedor Python Pleno'
  })
})

// Agente lembra do contexto e responde
// "Perfeito! Para Python Pleno, vou avaliar:
//  - Experiência com frameworks (Django, Flask)
//  - Conhecimento de bancos de dados
//  - Soft skills de trabalho em equipe
//  Pode enviar o PDF?"
```

---

## 💡 Dicas de Implementação

### **1. Comece Simples**
- Primeiro faça funcionar sem memória
- Depois adicione Pinecone
- Por último otimize

### **2. Teste Constantemente**
```bash
# Após cada implementação
npm test
npm run dev
# Teste manualmente no browser
```

### **3. Use Feature Flags**
```typescript
if (process.env.ENABLE_CONVERSATIONAL_AGENTS === 'true') {
  // Usar novo sistema
} else {
  // Usar sistema antigo
}
```

### **4. Logs Detalhados**
```typescript
console.log('[ConversationalEngine] Processing message:', {
  threadId,
  userId,
  messageLength: message.length
})
```

---

## 🐛 Troubleshooting Comum

### Erro: "Pinecone index not found"
```bash
# Verificar se index existe
curl -X GET "https://api.pinecone.io/indexes" \
  -H "Api-Key: YOUR_API_KEY"
```

### Erro: "OpenAI rate limit"
```typescript
// Adicionar retry logic
const response = await openai.chat.completions.create({
  // ...
}, {
  maxRetries: 3,
  timeout: 30000
})
```

### Erro: "Thread not found"
```typescript
// Sempre verificar ownership
const thread = await prisma.agentThread.findFirst({
  where: {
    id: threadId,
    userId: session.user.id  // IMPORTANTE!
  }
})
```

---

## 📊 Métricas de Sucesso

Após implementação, verificar:

- [ ] Latência < 2s por mensagem
- [ ] Taxa de erro < 1%
- [ ] Memória funciona (contexto mantido entre mensagens)
- [ ] Isolamento entre usuários (segurança)
- [ ] UI responsiva

---

## 🚀 Quando Estiver Pronto

```bash
# 1. Commitar mudanças
git add .
git commit -m "feat: implement conversational agents with memory (Phase 1)"

# 2. Push para review
git push origin feature/agentkit-conversational-agents

# 3. Criar Pull Request
# Título: "feat: AgentKit Phase 1 - Conversational Agents"
# Descrição: Link para IMPLEMENTATION_GUIDE_PHASE1.md

# 4. Após aprovação, merge para main
```

---

## 🎉 Resultado Esperado

**Antes:**
- Agente executa uma vez e termina
- Sem contexto entre execuções
- Sem memória

**Depois:**
- Agente mantém conversa contínua
- Lembra de conversas anteriores
- Pode fazer perguntas de esclarecimento
- Experiência muito mais natural

---

**Boa sorte com a implementação! 🚀**

Se tiver dúvidas, consulte os documentos detalhados ou abra uma issue.
