# 🔐 IMPLEMENTAÇÃO: Verificação de Email Obrigatória

**Data:** 14/10/2025  
**Status:** ⏳ PENDENTE MIGRAÇÃO  
**Prioridade:** 🔴 CRÍTICA

---

## 🚨 **PROBLEMA IDENTIFICADO**

Usuários conseguem fazer login mesmo sem verificar o email, permitindo:
- ❌ Cadastros com emails falsos
- ❌ Uso do sistema sem email válido
- ❌ Contas inativas ocupando espaço

**Exemplo:**
```
Usuário: demo@empresa.com.br (não existe)
Status: ✅ Cadastrado
Login: ✅ Permitido (PROBLEMA!)
Email recebido: ❌ Não
```

---

## ✅ **SOLUÇÃO IMPLEMENTADA**

### **Sistema de Verificação de Email:**

1. Usuário se cadastra
2. Sistema gera código de 6 dígitos
3. Sistema envia email com código
4. Usuário digita código para ativar
5. **Login bloqueado** até verificar

---

## 📋 **MUDANÇAS REALIZADAS**

### **1. Schema do Banco (Prisma)**

**Arquivo:** `prisma/schema.prisma`

**Adicionado:**
```prisma
model User {
  // ... campos existentes
  emailVerified           DateTime?
  verificationCode        String?
  verificationCodeExpires DateTime?
}
```

---

### **2. Signup - Gerar e Enviar Código**

**Arquivo:** `src/app/api/auth/signup/route.ts`

**Mudanças:**
- Gera código de 6 dígitos
- Define expiração de 24 horas
- Envia email com código
- Marca `emailVerified` como `null`

**Código:**
```typescript
// Gerar código de verificação (6 dígitos)
const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
const verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

const newUser = await tx.user.create({
  data: {
    // ... outros campos
    verificationCode,
    verificationCodeExpires,
    emailVerified: null, // Email não verificado
  },
});
```

---

### **3. Rota de Verificação**

**Arquivo:** `src/app/api/auth/verify-email/route.ts` (NOVO)

**Funcionalidade:**
- Recebe email + código
- Valida código
- Verifica expiração
- Marca email como verificado

**Uso:**
```typescript
POST /api/auth/verify-email
{
  "email": "usuario@empresa.com.br",
  "code": "123456"
}
```

---

### **4. Bloqueio de Login**

**Arquivo:** `src/lib/auth/auth-config.ts`

**Adicionado:**
```typescript
// 🔒 VERIFICAR SE EMAIL FOI VERIFICADO
if (!user.emailVerified) {
  throw new Error('EMAIL_NOT_VERIFIED');
}
```

**Resultado:**
- ❌ Login bloqueado se email não verificado
- ✅ Mensagem clara ao usuário

---

## 🎨 **EMAIL DE VERIFICAÇÃO**

### **Design:**
```
┌─────────────────────────────────────┐
│   🔐 Verifique seu Email            │
├─────────────────────────────────────┤
│                                     │
│ Olá Gabriel,                        │
│                                     │
│ Bem-vindo ao SimplifiqueIA RH!      │
│ Use o código abaixo:                │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │   Seu Código de Verificação     │ │
│ │                                 │ │
│ │         1 2 3 4 5 6             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ⚠️ Expira em 24 horas               │
│                                     │
└─────────────────────────────────────┘
```

---

## 🚀 **COMO APLICAR**

### **Passo 1: Rodar Migração**

```bash
# Gerar Prisma Client
npx prisma generate

# Criar migração
npx prisma migrate dev --name add_email_verification

# Ou aplicar em produção
npx prisma migrate deploy
```

---

### **Passo 2: Reiniciar Servidor**

```bash
# Parar servidor (Ctrl + C)

# Reinstalar dependências (se necessário)
npm install

# Reiniciar
npm run dev
```

---

### **Passo 3: Testar**

```bash
# 1. Cadastrar novo usuário
http://localhost:3001/auth/signup

# 2. Verificar email recebido
# Copiar código de 6 dígitos

# 3. Verificar email
POST http://localhost:3001/api/auth/verify-email
{
  "email": "seu@email.com",
  "code": "123456"
}

# 4. Tentar fazer login
# Deve funcionar após verificação
```

---

## 📊 **FLUXO COMPLETO**

### **Antes (PROBLEMA):**
```
Cadastro → Email enviado → Login ✅ (PERMITIDO)
                ↓
         Email não entregue
                ↓
         Usuário usa sistema (PROBLEMA!)
```

### **Depois (SOLUÇÃO):**
```
Cadastro → Código enviado → Login ❌ (BLOQUEADO)
                ↓
         Email recebido?
                ↓
              SIM → Digita código → Email verificado → Login ✅
                ↓
              NÃO → Conta inativa → Nunca faz login
```

---

## 🎯 **RESULTADOS ESPERADOS**

### **Segurança:**
| Métrica | Antes | Depois |
|---------|-------|--------|
| **Emails falsos ativos** | 100% | 0% |
| **Login sem verificar** | ✅ Permitido | ❌ Bloqueado |
| **Contas inativas** | Usam sistema | Não usam |
| **Segurança** | ⭐⭐ | ⭐⭐⭐⭐⭐ |

---

### **UX:**
```
Usuário cadastra → Recebe email → Digita código → Usa sistema
                                      ↓
                              Simples e rápido (30 seg)
```

---

## 🔧 **PRÓXIMOS PASSOS**

### **Frontend (Você precisa criar):**

#### **1. Página de Verificação**

**Arquivo:** `src/app/auth/verify-email/page.tsx` (CRIAR)

```tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyEmailPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (res.ok) {
        // Sucesso! Redirecionar para login
        router.push('/auth/signin?verified=true');
      } else {
        setError(data.error || 'Código inválido');
      }
    } catch (err) {
      setError('Erro ao verificar código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Verifique seu Email</h1>
        <p className="text-gray-600 mb-6">
          Enviamos um código de 6 dígitos para <strong>{email}</strong>
        </p>

        <form onSubmit={handleVerify}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000"
            maxLength={6}
            className="w-full p-3 border rounded mb-4 text-center text-2xl tracking-widest"
            required
          />

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

#### **2. Redirecionar Após Cadastro**

**Arquivo:** `src/components/auth/signup-form.tsx`

**Modificar:**
```tsx
// Após sucesso no cadastro
if (response.ok) {
  const data = await response.json();
  
  if (data.requiresVerification) {
    // Redirecionar para página de verificação
    router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
  }
}
```

---

#### **3. Mensagem no Login**

**Arquivo:** `src/components/auth/signin-form.tsx`

**Adicionar:**
```tsx
// Capturar erro de email não verificado
if (result?.error === 'EMAIL_NOT_VERIFIED') {
  setError('Por favor, verifique seu email antes de fazer login. Verifique sua caixa de entrada.');
}
```

---

## 📋 **CHECKLIST**

### **Backend (Feito):**
- [x] Schema atualizado (verificationCode, verificationCodeExpires)
- [x] Signup gera e envia código
- [x] Rota de verificação criada
- [x] Login bloqueado se não verificado
- [x] Email de verificação bonito

### **Migração (Você precisa fazer):**
- [ ] Rodar `npx prisma generate`
- [ ] Rodar `npx prisma migrate dev`
- [ ] Reiniciar servidor

### **Frontend (Você precisa criar):**
- [ ] Página de verificação (`/auth/verify-email`)
- [ ] Redirecionar após cadastro
- [ ] Mensagem de erro no login
- [ ] Opção de reenviar código

---

## 🧪 **TESTE COMPLETO**

### **Cenário 1: Email Válido**
```
1. Cadastrar: usuario@petrobras.com.br
2. Verificar email recebido
3. Copiar código: 123456
4. Acessar: /auth/verify-email?email=usuario@petrobras.com.br
5. Digitar código
6. Resultado: ✅ Email verificado
7. Fazer login: ✅ Permitido
```

---

### **Cenário 2: Email Inválido**
```
1. Cadastrar: demo@empresa.com.br
2. Email não é entregue
3. Tentar fazer login
4. Resultado: ❌ "Por favor, verifique seu email"
5. Usuário não consegue usar sistema ✅
```

---

### **Cenário 3: Código Expirado**
```
1. Cadastrar
2. Aguardar 25 horas
3. Tentar verificar
4. Resultado: ❌ "Código expirado"
5. Solicitar novo código (implementar)
```

---

## 💡 **MELHORIAS FUTURAS**

### **1. Reenviar Código**

**Rota:** `POST /api/auth/resend-verification`

```typescript
// Gerar novo código
// Enviar novo email
// Atualizar expiração
```

---

### **2. Limpeza Automática**

**Cron Job:** Deletar contas não verificadas após 7 dias

```typescript
// Rodar diariamente
// Deletar usuários com emailVerified = null
// E createdAt < 7 dias atrás
```

---

### **3. Taxa de Limite**

**Prevenir spam:**
- Máximo 3 tentativas de verificação
- Máximo 5 reenvios de código por hora

---

## 📞 **SUPORTE**

**Erros de migração:**
```bash
# Resetar banco (CUIDADO: Perde dados!)
npx prisma migrate reset

# Aplicar todas as migrações
npx prisma migrate deploy
```

**Erros TypeScript:**
```bash
# Regenerar Prisma Client
npx prisma generate

# Reiniciar TypeScript server no VS Code
Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

---

**Status:** ⏳ **CÓDIGO PRONTO - AGUARDANDO MIGRAÇÃO**  
**Próxima ação:** Rodar `npx prisma migrate dev`  
**Tempo estimado:** 10 minutos  
**Última atualização:** 14/10/2025
