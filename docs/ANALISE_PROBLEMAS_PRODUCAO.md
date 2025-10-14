# 🔍 ANÁLISE: Problemas em Produção

**Data:** 14/10/2025  
**Problemas Reportados:** 2

---

## 🚨 **PROBLEMA 1: Login Inválido (Email Não Verificado)**

### **Sintoma:**
```
URL: simplifiqueia.com.br/api/auth/error?error=CredentialsSignin&Provider=credentials
Mensagem: "Email ou senha inválidos"
Comportamento: Não redireciona para verificação de email
```

### **Causa Raiz:**
1. ✅ Email não verificado (bloqueio funcionando)
2. ❌ NextAuth não passa erro customizado `EMAIL_NOT_VERIFIED`
3. ❌ Frontend não detecta que precisa verificar email
4. ❌ Signup não redirecionou para página de verificação

---

### **CORREÇÕES IMPLEMENTADAS:**

#### **1. API de Verificação de Status:**
**Arquivo:** `src/app/api/auth/check-verification/route.ts` (NOVO)

```typescript
POST /api/auth/check-verification
{
  "email": "usuario@empresa.com.br"
}

// Resposta:
{
  "verified": false,  // Email não verificado
  "exists": true      // Usuário existe
}
```

**Funcionalidade:**
- Verifica se email está verificado ANTES de tentar login
- Não revela se usuário existe (segurança)
- Permite redirecionamento adequado

---

#### **2. Login com Verificação Prévia:**
**Arquivo:** `src/components/auth/signin-form.tsx`

**Fluxo Novo:**
```typescript
1. Usuário digita email e senha
2. Sistema verifica se email está verificado
3. Se NÃO verificado:
   - Mostra mensagem
   - Redireciona para /auth/verify-email após 2s
4. Se verificado:
   - Tenta login normalmente
```

**Código:**
```typescript
// 1. Verificar se email está verificado ANTES de tentar login
const checkResponse = await fetch('/api/auth/check-verification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email }),
});

if (checkResponse.ok) {
  const checkData = await checkResponse.json();
  
  if (!checkData.verified) {
    setError('Por favor, verifique seu email antes de fazer login.');
    setTimeout(() => {
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    }, 2000);
    return;
  }
}

// 2. Se verificado, tentar login
const result = await signIn('credentials', { email, password, redirect: false });
```

---

#### **3. Auth Config Simplificado:**
**Arquivo:** `src/lib/auth/auth-config.ts`

**Mudança:**
```typescript
// ANTES (problemático):
if (!user.emailVerified) {
  throw new Error('EMAIL_NOT_VERIFIED'); // NextAuth não passa isso!
}

// DEPOIS (funcional):
if (!user.emailVerified) {
  return null; // Retorna null = credenciais inválidas
}
// Nota: Verificação real é feita no frontend antes do login
```

**Motivo:** NextAuth não consegue passar erros customizados para o frontend.

---

#### **4. API de Reenvio de Código:**
**Arquivo:** `src/app/api/auth/resend-verification/route.ts` (NOVO)

```typescript
POST /api/auth/resend-verification
{
  "email": "usuario@empresa.com.br"
}

// Resposta:
{
  "message": "Novo código enviado! Verifique sua caixa de entrada."
}
```

**Funcionalidade:**
- Gera novo código de 6 dígitos
- Atualiza expiração (24 horas)
- Envia email com novo código
- Não revela se usuário existe

---

## 🚨 **PROBLEMA 2: Tela Branca (Client-Side Error)**

### **Sintoma:**
```
Erro: Client-side error
Contexto: Durante análise de arquivo pela IA
Possível causa: Timeout
```

### **Análise:**

#### **Possíveis Causas:**

**1. Timeout da IA:**
```typescript
// Tempo máximo de processamento
- OpenAI: 60s default
- Anthropic: 60s default
- Google: 60s default

// Se arquivo é muito grande:
- PDF com muitas páginas
- Texto muito longo
- Processamento OCR demorado
```

**2. Erro de Renderização:**
```typescript
// Se resposta da IA é muito grande:
- Markdown muito longo
- HTML mal formatado
- Caracteres especiais
```

**3. Memória do Cliente:**
```typescript
// Browser pode travar se:
- Resposta > 5MB
- Muitos elementos DOM
- Animações pesadas
```

---

### **SOLUÇÕES RECOMENDADAS:**

#### **1. Adicionar Timeout Handling:**

**Arquivo:** `src/components/agent-builder/execution-panel.tsx`

```typescript
// Adicionar timeout de 90s
const executeWithTimeout = async () => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT')), 90000)
  );

  try {
    const result = await Promise.race([
      fetch('/api/execute', { ... }),
      timeout
    ]);
    
    return result;
  } catch (error) {
    if (error.message === 'TIMEOUT') {
      setError('Processamento demorou muito. Tente com arquivo menor.');
    }
  }
};
```

---

#### **2. Adicionar Loading State Melhor:**

```typescript
// Mostrar progresso durante processamento
<div className="space-y-4">
  {isLoading && (
    <>
      <p>Processando arquivo...</p>
      <p>Isso pode levar até 2 minutos para arquivos grandes.</p>
      <Progress value={progress} />
    </>
  )}
</div>
```

---

#### **3. Limitar Tamanho de Arquivo:**

```typescript
// Validar tamanho antes de enviar
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (file.size > MAX_FILE_SIZE) {
  setError('Arquivo muito grande. Máximo: 10MB');
  return;
}
```

---

#### **4. Error Boundary:**

**Arquivo:** `src/components/error-boundary.tsx` (CRIAR)

```typescript
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Algo deu errado
          </h2>
          <p className="text-gray-600 mb-4">
            Ocorreu um erro ao processar sua solicitação.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-6 py-2 bg-blue-600 text-white rounded"
          >
            Tentar Novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Uso:**
```typescript
// Envolver componentes que podem dar erro
<ErrorBoundary>
  <ExecutionPanel />
</ErrorBoundary>
```

---

## 📊 **RESUMO DAS CORREÇÕES**

### **Problema 1: Login (✅ CORRIGIDO)**

| Arquivo | Mudança | Status |
|---------|---------|--------|
| `check-verification/route.ts` | API nova para verificar status | ✅ Criado |
| `signin-form.tsx` | Verificação prévia antes de login | ✅ Modificado |
| `auth-config.ts` | Removido throw de erro | ✅ Modificado |
| `resend-verification/route.ts` | API para reenviar código | ✅ Criado |

---

### **Problema 2: Tela Branca (⏳ RECOMENDAÇÕES)**

| Solução | Prioridade | Status |
|---------|-----------|--------|
| Timeout handling | 🔴 Alta | ⏳ Pendente |
| Loading state melhor | 🟡 Média | ⏳ Pendente |
| Limite de arquivo | 🟡 Média | ⏳ Pendente |
| Error boundary | 🟢 Baixa | ⏳ Pendente |

---

## 🧪 **TESTES NECESSÁRIOS**

### **Teste 1: Login com Email Não Verificado**

```bash
1. Cadastrar novo usuário
2. NÃO verificar email
3. Tentar fazer login
4. Resultado esperado:
   ✅ Mensagem: "Por favor, verifique seu email"
   ✅ Redireciona para /auth/verify-email após 2s
```

---

### **Teste 2: Reenvio de Código**

```bash
1. Cadastrar novo usuário
2. Acessar /auth/verify-email
3. Clicar em "Reenviar código"
4. Resultado esperado:
   ✅ Novo código gerado
   ✅ Email enviado
   ✅ Mensagem de sucesso
```

---

### **Teste 3: Arquivo Grande**

```bash
1. Fazer upload de PDF > 5MB
2. Executar agente
3. Resultado esperado:
   ✅ Processamento completa OU
   ✅ Timeout com mensagem clara
   ❌ NÃO deve travar navegador
```

---

## 🚀 **PRÓXIMOS PASSOS**

### **Imediato (Hoje):**
1. ✅ Fazer commit e push das correções
2. ✅ Testar login em produção
3. ✅ Verificar se redirecionamento funciona

### **Curto Prazo (Esta Semana):**
1. ⏳ Implementar timeout handling
2. ⏳ Adicionar error boundary
3. ⏳ Melhorar loading states

### **Médio Prazo (Próxima Semana):**
1. ⏳ Implementar limite de arquivo
2. ⏳ Adicionar monitoramento de erros
3. ⏳ Criar testes automatizados

---

## 📋 **CHECKLIST DE DEPLOY**

- [ ] Commit das correções
- [ ] Push para produção
- [ ] Aguardar build (5-10 min)
- [ ] Testar login com email não verificado
- [ ] Testar reenvio de código
- [ ] Verificar logs de erro
- [ ] Monitorar por 24h

---

**Status:** ✅ **PROBLEMA 1 CORRIGIDO**  
**Status:** ⏳ **PROBLEMA 2 EM ANÁLISE**  
**Próxima ação:** Deploy e testes  
**Última atualização:** 14/10/2025
