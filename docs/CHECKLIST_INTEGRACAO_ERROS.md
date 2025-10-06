# ✅ Checklist de Integração - Sistema de Tratamento de Erros

## 📋 Status Atual

### **✅ Implementado:**

1. ✅ Error Handler Central (`error-handler.ts`)
2. ✅ API Error Middleware (`api-error-middleware.ts`)
3. ✅ Runtime Error Handler (`runtime-error-handler.ts`)
4. ✅ Documentação completa

### **⏳ Próximos Passos:**

---

## 🔧 Fase 1: Integração no Runtime Engine (2-3 horas) ✅ CONCLUÍDO

### **1.1 Atualizar hybrid-engine.ts**

- [x] Importar error handlers

  ```typescript
  import { 
    executeNodeSafely, 
    executeAINodeWithFallback,
    validateDocumentRequirement,
    validateExtractedText 
  } from '@/lib/errors/runtime-error-handler'
  ```

- [x] Substituir `executeAINodeWithCache()` para usar fallback

  ```typescript
  // ANTES:
  const response = await this.cachedAIProvider.generateCompletion(...)
  
  // DEPOIS:
  const response = await executeAINodeWithFallback(
    node,
    this.aiProviderManager,
    aiContext,
    { preferredProvider: provider, model, temperature }
  )
  ```

- [x] Adicionar validações robustas

  ```typescript
  // Validar texto extraído
  if (needsDocument) {
    validateDocumentRequirement(prompt, variables.extractedText, {
      nodeId: node.id,
      nodeLabel: node.data.label
    })
  }
  ```

- [x] Usar `executeNodeSafely()` no loop de execução

  ```typescript
  for (const node of orderedNodes) {
    const result = await executeNodeSafely(
      node,
      () => this.executeNode(node, context.variables, context),
      { executionId, agentId }
    )
    
    if (!result.success) {
      // Erro já está logado e formatado
      throw result.error
    }
    
    nodeResults[node.id] = result.data
  }
  ```

---

## 🌐 Fase 2: Integração nas APIs (3-4 horas) ✅ CONCLUÍDO

### **2.1 API de Execução de Agentes**

**Arquivo:** `src/app/api/agents/execute/route.ts`

- [x] Importar middleware

  ```typescript
  import { withStandardMiddleware, validateRequestBody } from '@/lib/errors/api-error-middleware'
  ```

- [ ] Aplicar middleware

  ```typescript
  export const POST = withStandardMiddleware(async (req) => {
    const { agentId, input, userId } = await validateRequestBody(req, {
      required: ['agentId', 'input'],
      optional: ['userId']
    })
    
    // Resto do código...
  })
  ```

### **2.2 API de Upload de Arquivos**

**Arquivo:** `src/app/api/upload-and-process/route.ts`

- [ ] Adicionar validação de arquivo

  ```typescript
  import { FileProcessingError } from '@/lib/errors/error-handler'
  
  if (!file) {
    throw new FileProcessingError('arquivo', 'Nenhum arquivo foi enviado')
  }
  
  if (file.size > 10 * 1024 * 1024) {
    throw new FileProcessingError(file.name, 'Arquivo muito grande (máx 10MB)')
  }
  ```

### **2.3 API de Salvamento de Agentes**

**Arquivo:** `src/app/api/agents/save/route.ts`

- [ ] Validar estrutura do agente

  ```typescript
  import { ValidationError } from '@/lib/errors/error-handler'
  
  if (!agent.nodes || agent.nodes.length === 0) {
    throw new ValidationError('nodes', 'Agente deve ter pelo menos um nó')
  }
  ```

### **2.4 APIs de Relatórios**

**Arquivos:** `src/app/api/reports/*`

- [ ] Aplicar middleware padrão em todas as rotas
- [ ] Adicionar validações específicas

---

## ⚛️ Fase 3: Componentes React (2-3 horas) ✅ CONCLUÍDO

### **3.1 Error Boundary Global**

**Arquivo:** `src/components/error-boundary.tsx` (criar)

```typescript
'use client'

import React from 'react'
import { createUserFriendlyError } from '@/lib/errors/runtime-error-handler'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error?: {
    title: string
    message: string
    suggestedAction: string
  }
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    const friendly = createUserFriendlyError(error)
    return {
      hasError: true,
      error: {
        title: friendly.title,
        message: friendly.message,
        suggestedAction: friendly.suggestedAction
      }
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-red-900 mb-2">
              {this.state.error.title}
            </h2>
            <p className="text-gray-700 mb-4">
              {this.state.error.message}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              {this.state.error.suggestedAction}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

- [x] Criar componente ErrorBoundary
- [ ] Envolver aplicação no layout principal

  ```typescript
  // src/app/layout.tsx
  import { ErrorBoundary } from '@/components/error-boundary'
  
  export default function RootLayout({ children }) {
    return (
      <html>
        <body>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </body>
      </html>
    )
  }
  ```

### **3.2 Execution Panel**

**Arquivo:** `src/components/agent-builder/execution-panel.tsx`

- [x] Atualizar tratamento de erros

  ```typescript
  import { createUserFriendlyError } from '@/lib/errors/runtime-error-handler'
  
  const handleExecute = async () => {
    try {
      const response = await fetch('/api/agents/execute', {
        method: 'POST',
        body: JSON.stringify({ agentId, input })
      })
      
      const data = await response.json()
      
      if (!data.success) {
        const friendly = createUserFriendlyError(new Error(data.error.message))
        setError(friendly)
        return
      }
      
      setResult(data.data)
    } catch (error) {
      const friendly = createUserFriendlyError(error)
      setError(friendly)
    }
  }
  ```

### **3.3 File Upload Component**

**Arquivo:** `src/components/agent-builder/file-upload.tsx`

- [ ] Validação de arquivo no frontend

  ```typescript
  const validateFile = (file: File) => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['application/pdf', 'application/msword', 'text/plain']
    
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Máximo: 10MB')
    }
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo não suportado. Use PDF, Word ou TXT')
    }
  }
  ```

---

## 🧪 Fase 4: Testes (2-3 horas)

### **4.1 Testes Unitários**

**Arquivo:** `src/__tests__/lib/error-handler.test.ts` (criar)

- [ ] Testar conversão de erros nativos
- [ ] Testar estratégias de retry
- [ ] Testar formatação de mensagens

### **4.2 Testes de Integração**

**Arquivo:** `src/__tests__/api/error-handling.test.ts` (criar)

- [ ] Testar middleware de erro em APIs
- [ ] Testar validação de request body
- [ ] Testar rate limiting
- [ ] Testar timeout

### **4.3 Testes de Runtime**

**Arquivo:** `src/__tests__/lib/runtime-error-handler.test.ts` (criar)

- [ ] Testar fallback de IA
- [ ] Testar validação de nós
- [ ] Testar validação de texto extraído

---

## 📊 Fase 5: Monitoramento (1-2 horas)

### **5.1 Dashboard de Erros**

**Arquivo:** `src/app/admin/errors/page.tsx` (criar)

- [ ] Criar página de monitoramento
- [ ] Listar erros recentes
- [ ] Filtrar por tipo e severidade
- [ ] Gráficos de tendências

### **5.2 Integração com Sentry (opcional)**

- [ ] Instalar Sentry SDK

  ```bash
  npm install @sentry/nextjs
  ```

- [ ] Configurar Sentry

  ```typescript
  // sentry.client.config.ts
  import * as Sentry from '@sentry/nextjs'
  
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    beforeSend(event, hint) {
      // Filtrar erros de baixa severidade
      if (hint.originalException instanceof AppError) {
        if (hint.originalException.severity === 'LOW') {
          return null
        }
      }
      return event
    }
  })
  ```

- [ ] Enviar erros críticos para Sentry

  ```typescript
  // Em error-handler.ts
  if (error.severity === ErrorSeverity.CRITICAL) {
    Sentry.captureException(error, {
      level: 'error',
      tags: { type: error.type },
      extra: error.context
    })
  }
  ```

---

## 📝 Fase 6: Documentação (1 hora)

### **6.1 Atualizar README**

- [ ] Adicionar seção sobre tratamento de erros
- [ ] Exemplos de uso
- [ ] Guia de troubleshooting

### **6.2 Guia para Desenvolvedores**

- [ ] Como adicionar novos tipos de erro
- [ ] Como customizar mensagens
- [ ] Como testar erros

### **6.3 Guia para Usuários**

- [ ] O que fazer quando vê cada tipo de erro
- [ ] FAQ de erros comuns
- [ ] Como reportar bugs

---

## ✅ Checklist Final

### **Antes de Deploy:**

- [ ] Todos os testes passando
- [ ] Logs estruturados funcionando
- [ ] Mensagens amigáveis validadas com usuários
- [ ] Rate limiting configurado
- [ ] Timeout configurado
- [ ] Error boundary testado
- [ ] Sentry configurado (se aplicável)
- [ ] Documentação atualizada

### **Após Deploy:**

- [ ] Monitorar logs de erro
- [ ] Verificar taxa de retry
- [ ] Validar fallbacks de IA
- [ ] Coletar feedback de usuários
- [ ] Ajustar mensagens se necessário

---

## 📈 Métricas de Sucesso

### **Objetivos:**

- ✅ **Taxa de erro < 5%** das execuções
- ✅ **Tempo de recovery < 30s** (com retry)
- ✅ **100% dos erros logados** estruturadamente
- ✅ **0 erros silenciosos** (todos têm mensagem amigável)
- ✅ **Taxa de fallback de IA > 90%** (quando provider falha)

### **Monitorar:**

- Erros por tipo (dashboard)
- Erros por severidade
- Taxa de retry bem-sucedido
- Tempo médio de recovery
- Feedback de usuários sobre mensagens

---

## 🚀 Próxima Ação Imediata

**Começar por:**

1. ✅ Integrar no hybrid-engine.ts (Fase 1)
2. ✅ Testar com agente de análise de contrato
3. ✅ Validar mensagens de erro com usuário
4. ✅ Ajustar conforme feedback

**Tempo estimado total:** 10-15 horas de desenvolvimento
