# 🎯 Guia de Desenvolvimento - SimplifiqueIA RH

**Versão:** 2.0.0  
**Última Atualização:** 13/10/2025

---

## 📋 Índice

- [Contexto Central](#contexto-central)
- [Princípios Fundamentais](#princípios-fundamentais)
- [Padrões de Implementação](#padrões-de-implementação)
- [Anti-Padrões](#anti-padrões)
- [Checklist de Implementação](#checklist-de-implementação)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Contexto Central

**SimplifiqueIA RH** é uma plataforma SaaS multi-tenant de construção visual de agentes de IA para automação de processos de RH no mercado brasileiro. A plataforma permite que profissionais de RH **sem conhecimento técnico** criem fluxos automatizados usando interface drag-and-drop ou linguagem natural.

### **Stack Tecnológica Core:**

- **Frontend:** Next.js 14, React 18, TypeScript 5.5, Tailwind CSS, shadcn/ui, ReactFlow
- **Backend:** Next.js API Routes, Node.js
- **Banco:** PostgreSQL 14+ com Prisma ORM 6.17
- **Autenticação:** NextAuth.js 4.24 (OAuth Google/GitHub + credenciais)
- **IA Multi-Provider:** OpenAI GPT-4, Anthropic Claude, Google Gemini com fallback automático
- **Filas:** Redis 6+ com BullMQ para processamento assíncrono
- **Processamento:** pdf-parse, Tesseract.js (OCR), docx, Puppeteer
- **Deploy:** Vercel (primário), Docker, VPS

### **Arquitetura Atual (v2.0.0):**

- Multi-tenancy com isolamento total por organização (9.5/10 segurança)
- Sistema de convites e compartilhamento de agentes
- Email universal com renderização dinâmica de JSON
- Fallback inteligente entre provedores de IA (Anthropic → OpenAI → Google)
- Runtime engine híbrido com execução sequencial de nós
- UniversalPDFFormatter para geração de relatórios profissionais

---

## ⚡ Princípios Fundamentais (NÃO NEGOCIÁVEIS)

### **1. RESILIÊNCIA TOTAL - "Nunca Falhe em Silêncio"**

- **Fallbacks obrigatórios** para operações críticas (IA, processamento de arquivos, APIs externas)
- **Logs estruturados** em cada camada: `console.log('🔍 [Component] Action - details')` 
- **Tratamento de erros** com mensagens contextualizadas em português para o usuário
- **Padrão de referência:** `AIProviderManager.generateCompletionWithAutoFallback()` e `UnifiedProcessor` 

**Exemplo de implementação correta:**

```typescript
try {
  const result = await primaryMethod();
  console.log('✅ Primary method succeeded');
  return result;
} catch (error) {
  console.error('❌ Primary failed, trying fallback:', error);
  try {
    const fallbackResult = await fallbackMethod();
    console.log('🔄 Fallback succeeded');
    return { ...fallbackResult, fallbackUsed: true };
  } catch (fallbackError) {
    console.error('🚨 All methods failed:', fallbackError);
    throw new Error('Operação falhou. Tente novamente ou contate o suporte.');
  }
}
```

### **2. ZERO DADOS SIMULADOS EM PRODUÇÃO**

- **Problema recorrente identificado:** Mocks vazando para produção (João Silva Santos, Maria Silva Santos, etc.)
- **Regra absoluta:** Dados simulados APENAS em arquivos `*.test.ts` ou `*.mock.ts` 
- **Validação obrigatória:** Se não há dados reais, retorne erro claro ao usuário
- **Padrão correto:** `UniversalPDFFormatter` que processa dados reais ou retorna erro

**Anti-padrão (NUNCA fazer):**

```typescript
// ❌ ERRADO - Mock em código de produção
const mockData = { name: 'João Silva', salary: 5000 };
return generateReport(mockData);
```

**Padrão correto:**

```typescript
// ✅ CORRETO - Valida dados reais
if (!extractedText || extractedText.length < 100) {
  throw new Error('Arquivo não processado. Verifique se o PDF contém texto legível.');
}
return generateReport(parseRealData(extractedText));
```

### **3. FOCO NO USUÁRIO DE RH (UX First)**

- **Interfaces visuais** sobre JSON: formulários com validação, não campos de texto bruto
- **Relatórios formatados** (HTML/PDF) com CSS profissional, não texto puro
- **Mensagens em português** claro e contextualizado, sem jargão técnico
- **Feedback visual** em todas as operações: loading states, progress bars, toasts
- **Padrão de referência:** `ExecutionPanel` com modo formulário vs JSON manual

### **4. PRODUÇÃO-READY POR PADRÃO**

O sistema evoluiu para estado "pronto para produção". Toda nova funcionalidade deve incluir:

#### **Segurança:**

- Autenticação via NextAuth com validação de sessão
- Proteção de rotas via middleware (`middleware.ts`)
- Validação de input (XSS, SQL injection) usando DOMPurify
- Rate limiting com Upstash Redis
- Isolamento multi-tenant (organizationId em todas as queries)

#### **Escalabilidade:**

- Operações longas (>5s) devem usar BullMQ
- Configuração centralizada em `app-config.ts` (NUNCA hardcode URLs/portas)
- Paginação em listagens (padrão: 20 itens)
- Lazy loading de componentes pesados

#### **Observabilidade:**

- Logs estruturados: `[Component] Action - Result` 
- Auditoria em tabela `AuditLog` para ações críticas
- Métricas de performance (tokens usados, tempo de execução)
- Health checks em `/api/health/*` 

### **5. OTIMIZAÇÃO DE CUSTOS DE IA**

- **Modelos padrão:** `gpt-4o-mini` (OpenAI), `claude-3-5-haiku-20241022` (Anthropic), `gemini-1.5-flash` (Google)
- **Mapeamento automático:** Se usuário pede `gpt-4`, usar equivalente mais barato no provider disponível
- **Fallback inteligente:** Priorizar custo-benefício (Google → OpenAI → Anthropic)
- **Padrão de referência:** `AIProviderManager.getCompatibleModel()` 

### **6. CÓDIGO LIMPO E TESTÁVEL**

- **TypeScript strict mode** com tipos explícitos (evitar `any`)
- **Modularização:** Funções com responsabilidade única (<50 linhas)
- **Testes obrigatórios:** Para toda lógica de negócio (Jest + Testing Library)
- **Nomenclatura:** camelCase para variáveis, PascalCase para componentes/classes
- **Padrão de referência:** Estrutura de `src/lib/ai-providers/` 

### **7. DOCUMENTAÇÃO PRAGMÁTICA**

- **Atualizar apenas quando necessário:** README.md, CHANGELOG.md, arquivos em `docs/` 
- **NUNCA criar documentação desnecessária** - código auto-explicativo é preferível
- **Comentários inline** apenas para lógica complexa ou decisões não-óbvias
- **Identificar arquivos obsoletos** para remoção após implementações

---

## 🔧 Padrões de Implementação

### **Estrutura de API Routes:**

```typescript
// src/app/api/[feature]/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/database/prisma';

export async function POST(req: Request) {
  try {
    // 1. Autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // 2. Validação de input
    const body = await req.json();
    if (!body.requiredField) {
      return Response.json({ error: 'Campo obrigatório ausente' }, { status: 400 });
    }

    // 3. Isolamento multi-tenant
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    });
    
    if (!user?.organizationId) {
      return Response.json({ error: 'Organização não encontrada' }, { status: 403 });
    }

    // 4. Lógica de negócio
    const result = await processFeature(body, user.organizationId);

    // 5. Auditoria
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        organizationId: user.organizationId,
        action: 'FEATURE_ACTION',
        details: { input: body, output: result }
      }
    });

    // 6. Resposta padronizada
    return Response.json({ success: true, data: result });
    
  } catch (error) {
    console.error('❌ [API Feature] Error:', error);
    return Response.json({ 
      error: 'Erro ao processar solicitação',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
```

### **Componentes React:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export function FeatureComponent() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (status === 'authenticated') {
      loadData();
    }
  }, [status]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/feature');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao carregar dados');
      }
      
      setData(result.data);
    } catch (error) {
      console.error('❌ [FeatureComponent] Load error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') return <LoadingSpinner />;
  if (status === 'unauthenticated') return <LoginPrompt />;

  return (
    <div className="space-y-4">
      {loading ? <LoadingState /> : <DataDisplay data={data} />}
    </div>
  );
}
```

### **Processamento de Arquivos:**

```typescript
// Usar UnifiedProcessor como referência
import { UnifiedProcessor } from '@/lib/processors/unified-processor';

export async function processDocument(file: File) {
  const processor = new UnifiedProcessor();
  
  try {
    console.log('📄 Processing file:', file.name);
    
    // 1. Tentar método nativo (pdf-parse)
    const result = await processor.processFile(file);
    
    if (result.text.length < 100) {
      console.warn('⚠️ Low text extraction, trying OCR fallback');
      // 2. Fallback para OCR se necessário
      const ocrResult = await processor.processWithOCR(file);
      return ocrResult;
    }
    
    console.log('✅ File processed successfully:', result.text.length, 'chars');
    return result;
    
  } catch (error) {
    console.error('❌ File processing failed:', error);
    throw new Error('Não foi possível processar o arquivo. Verifique se é um PDF válido.');
  }
}
```

---

## 🚨 Anti-Padrões (EVITAR ABSOLUTAMENTE)

### **❌ Hardcoding de Configurações:**

```typescript
// ERRADO
const apiUrl = 'http://localhost:3001/api';

// CORRETO
import { buildApiUrl } from '@/lib/config/app-config';
const apiUrl = buildApiUrl('/api');
```

### **❌ Queries sem Isolamento Multi-Tenant:**

```typescript
// ERRADO - Vaza dados entre organizações
const agents = await prisma.agent.findMany();

// CORRETO - Isolamento obrigatório
const agents = await prisma.agent.findMany({
  where: { organizationId: user.organizationId }
});
```

### **❌ Operações Síncronas Longas:**

```typescript
// ERRADO - Bloqueia a aplicação
const result = await processLargeFile(file); // 30s+

// CORRETO - Usar fila
import { queueManager } from '@/lib/queue/queue-manager';
const job = await queueManager.addJob('process-file', { fileId });
return { jobId: job.id, status: 'processing' };
```

### **❌ Erros sem Contexto:**

```typescript
// ERRADO
throw new Error('Failed');

// CORRETO
throw new Error('Falha ao processar contrato: arquivo não contém cláusulas CLT obrigatórias');
```

---

## 📋 Checklist de Implementação

Antes de considerar uma feature completa, validar:

- [ ] **Autenticação:** Rota protegida via middleware ou getServerSession
- [ ] **Multi-tenant:** Todas as queries filtram por organizationId
- [ ] **Validação:** Input sanitizado (DOMPurify para HTML, validação de tipos)
- [ ] **Fallbacks:** Operações críticas têm pelo menos 1 fallback
- [ ] **Logs:** Console logs estruturados em pontos-chave
- [ ] **Erros:** Mensagens em português, contextualizadas
- [ ] **Testes:** Pelo menos testes unitários para lógica de negócio
- [ ] **Tipos:** TypeScript sem `any`, interfaces explícitas
- [ ] **Performance:** Operações >5s em fila, paginação em listas
- [ ] **Auditoria:** Ações críticas logadas em AuditLog
- [ ] **Documentação:** README atualizado se necessário (não criar docs desnecessários)

---

## 🔧 Troubleshooting Comum

### **Erro: "organizationId is required"**

**Causa:** Query sem isolamento multi-tenant  
**Solução:** Adicionar `where: { organizationId }` em todas as queries Prisma

### **Erro: "All AI providers failed"**

**Causa:** Chaves de API inválidas ou quota excedida  
**Solução:** Verificar .env.local e logs de fallback

### **Erro: "Port 3001 already in use"**

**Causa:** Processo anterior não foi encerrado  
**Solução:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### **Erro: "Prisma Client not generated"**

**Causa:** Schema alterado mas client não regenerado  
**Solução:**
```bash
npm run db:generate
```

---

## 📊 Métricas de Qualidade Esperadas

- **Cobertura de Testes:** >80% para lógica de negócio
- **Tempo de Resposta:** <2s para operações síncronas
- **Taxa de Fallback:** <5% em produção
- **Uptime:** >99.5%
- **Isolamento Multi-Tenant:** 100% das queries com organizationId

---

## 🗺️ Roadmap Técnico

### **Q1 2025:**
- [ ] Migração para Prisma 6.0
- [ ] Implementação de cache Redis
- [ ] Otimização de queries N+1

### **Q2 2025:**
- [ ] Sistema de webhooks
- [ ] API pública documentada
- [ ] Dashboard de métricas

---

**SimplifiqueIA RH v2.0.0** - Automação Inteligente para Recursos Humanos 🚀
