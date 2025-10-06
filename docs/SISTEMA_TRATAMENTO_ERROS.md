# 🛡️ Sistema Robusto de Tratamento de Erros

## 📋 Resumo Executivo

Sistema centralizado de tratamento de erros implementado com:

- ✅ **Mensagens amigáveis** para usuários RH
- ✅ **Logs técnicos** detalhados para debug
- ✅ **Fallbacks automáticos** entre provedores de IA
- ✅ **Retry inteligente** com backoff exponencial
- ✅ **Validações robustas** em todas as camadas
- ✅ **Rate limiting** e timeout automático

---

## 📦 Arquivos Criados

### **1. Error Handler Central**

**Arquivo:** `src/lib/errors/error-handler.ts`

- Classe `AppError` com tipos e severidades
- Conversão automática de erros nativos
- Logging estruturado por severidade
- Estratégias de retry configuráveis
- Helpers: `withErrorHandling()`, `retryWithBackoff()`

### **2. API Error Middleware**

**Arquivo:** `src/lib/errors/api-error-middleware.ts`

- `withErrorHandling()` - Tratamento automático
- `validateRequestBody()` - Validação de input
- `withRateLimit()` - Rate limiting em memória
- `withTimeout()` - Timeout automático
- `withLogging()` - Logging de requisições
- `withStandardMiddleware()` - Middleware completo

### **3. Runtime Error Handler**

**Arquivo:** `src/lib/errors/runtime-error-handler.ts`

- `validateNode()` - Validação de nós
- `executeNodeSafely()` - Execução segura
- `executeAINodeWithFallback()` - Fallback entre providers
- `validateExtractedText()` - Validação de PDF
- `validateDocumentRequirement()` - Validação de prompt
- `createUserFriendlyError()` - Mensagens amigáveis

---

## 🎯 Como Usar

### **Em APIs:**

```typescript
import { withStandardMiddleware } from '@/lib/errors/api-error-middleware'

export const POST = withStandardMiddleware(async (req) => {
  // Seu código aqui
  // Erros são tratados automaticamente
})
```

### **No Runtime Engine:**

```typescript
import { executeAINodeWithFallback } from '@/lib/errors/runtime-error-handler'

// Fallback automático: OpenAI → Google → Anthropic
const result = await executeAINodeWithFallback(
  node,
  aiProviderManager,
  prompt
)
```

### **Em Componentes React:**

```typescript
import { createUserFriendlyError } from '@/lib/errors/runtime-error-handler'

try {
  await executeAgent()
} catch (error) {
  const friendly = createUserFriendlyError(error)
  showError(friendly.message, friendly.suggestedAction)
}
```

---

## 📊 Tipos de Erro e Respostas

| Tipo | Severidade | HTTP Status | Retryable |
|------|-----------|-------------|-----------|
| VALIDATION_ERROR | MEDIUM | 400 | ✅ |
| FILE_PROCESSING_ERROR | HIGH | 422 | ✅ |
| AI_PROVIDER_ERROR | HIGH | 503 | ✅ |
| AI_QUOTA_EXCEEDED | CRITICAL | 429 | ✅ (após 1min) |
| NODE_EXECUTION_ERROR | HIGH | 500 | ✅ |
| EMAIL_ERROR | MEDIUM | 503 | ✅ |
| TIMEOUT_ERROR | MEDIUM | 504 | ✅ |
| NETWORK_ERROR | MEDIUM | 503 | ✅ |

---

## 🔄 Estratégias de Retry

### **AI Quota Exceeded:**

- Delay: 60 segundos
- Max retries: 3
- Fallback para outro provider

### **Network/Timeout:**

- Delay: 5 segundos
- Max retries: 3
- Backoff exponencial

### **AI Provider Error:**

- Delay: 2 segundos
- Max retries: 2
- Fallback automático

---

## 🚀 Próximos Passos

1. ✅ Sistema de erros implementado
2. ⏳ Integrar no hybrid-engine.ts
3. ⏳ Integrar nas APIs principais
4. ⏳ Criar Error Boundary React
5. ⏳ Adicionar Sentry para erros críticos
6. ⏳ Dashboard de monitoramento de erros

---

## 📝 Exemplo Completo

```typescript
// API com todos os middlewares
import { 
  withStandardMiddleware, 
  validateRequestBody 
} from '@/lib/errors/api-error-middleware'

export const POST = withStandardMiddleware(async (req) => {
  const { agentId, input } = await validateRequestBody(req, {
    required: ['agentId', 'input']
  })

  const result = await executeAgent(agentId, input)
  
  return NextResponse.json({ success: true, data: result })
})
```

**Resposta de Erro Automática:**

```json
{
  "success": false,
  "error": {
    "type": "AI_QUOTA_EXCEEDED",
    "message": "Limite de uso da IA atingido. Tente novamente em alguns minutos.",
    "suggestedAction": "Aguarde alguns minutos ou entre em contato com o suporte.",
    "retryable": true,
    "timestamp": "2025-10-06T15:00:00.000Z"
  }
}
```
