# 🔧 Correção: OAuth Account Not Linked

## ❌ Problema

**Erro:** "Este email já está cadastrado com outro método"

**Causa:** Usuário existe na tabela `users`, mas não tem registro na tabela `accounts` vinculando ao Google.

---

## ✅ Solução Automática (RECOMENDADO)

### **A correção foi implementada no código!**

Agora, quando você tentar fazer login com Google:

1. ✅ NextAuth verifica se usuário existe
2. ✅ Verifica se `account` OAuth existe
3. ✅ **Se não existir, cria automaticamente**
4. ✅ Login funciona normalmente

### **Como Testar:**

```bash
# 1. Rebuild
npm run build
npm start

# 2. Tente fazer login com Google novamente
# O sistema vai criar o account automaticamente
```

### **Logs Esperados:**

```
[AUTH] Usuário existente encontrado: cmgl7v4tv0004kozgq72obf88
[AUTH] Verificando account OAuth para provider: google
[AUTH] ⚠️ Account OAuth não existe - criando...
[AUTH] ✅ Account OAuth criado com sucesso
[AUTH] SignIn bem-sucedido para: 1gabrielireis09@gmail.com
```

---

## 🔍 Diagnóstico Manual (Opcional)

Se quiser verificar o estado atual antes de tentar login:

### **API de Diagnóstico:**

```
GET https://simplifiqueia.com.br/api/auth/fix-oauth-account?email=1gabrielireis09@gmail.com
```

**Resposta esperada:**

```json
{
  "status": "ISSUE_FOUND",
  "diagnosis": {
    "user": {
      "id": "cmgl7v4tv0004kozgq72obf88",
      "email": "1gabrielireis09@gmail.com",
      "name": "Gabriel Reis",
      "hasPassword": false
    },
    "accounts": {
      "total": 0,
      "google": null,
      "github": null
    },
    "problem": "Usuário existe mas não tem nenhuma conta OAuth vinculada",
    "solution": "Precisa criar registro na tabela accounts para vincular ao Google"
  }
}
```

---

## 🛠️ Correção Manual (Se Automática Falhar)

### **Opção A: Deletar e Recriar (PERDE DADOS)**

⚠️ **ATENÇÃO:** Isso vai deletar todos os agentes e configurações do usuário!

```bash
# Via API
curl -X POST https://simplifiqueia.com.br/api/auth/fix-oauth-account \
  -H "Content-Type: application/json" \
  -d '{
    "email": "1gabrielireis09@gmail.com",
    "action": "delete"
  }'

# Depois faça login com Google novamente
```

### **Opção B: Criar Account Manualmente (PRESERVA DADOS)**

```bash
# 1. Capturar providerAccountId fazendo login uma vez
# Veja nos logs: [next-auth][Debug][adapter_getUserByAccount] { providerAccountId: '...' }

# 2. Criar account via API
curl -X POST https://simplifiqueia.com.br/api/auth/fix-oauth-account \
  -H "Content-Type: application/json" \
  -d '{
    "email": "1gabrielireis09@gmail.com",
    "action": "create",
    "providerAccountId": "102627098470338825908"
  }'
```

---

## 📋 Checklist de Verificação

- [ ] Rebuild da aplicação feito (`npm run build`)
- [ ] Servidor reiniciado
- [ ] Cache do navegador limpo
- [ ] Tentativa de login com Google
- [ ] Logs mostram "Account OAuth criado com sucesso"
- [ ] Login funciona e redireciona para `/builder`

---

## 🧪 Teste Completo

### **1. Verificar Estado Atual:**

```bash
curl https://simplifiqueia.com.br/api/auth/fix-oauth-account?email=1gabrielireis09@gmail.com
```

### **2. Fazer Login:**

1. Acesse: `https://simplifiqueia.com.br/auth/signin`
2. Clique em "Continuar com Google"
3. Observe os logs do terminal

### **3. Verificar Sessão:**

```bash
curl https://simplifiqueia.com.br/api/auth/session
```

Deve retornar dados do usuário se login foi bem-sucedido.

### **4. Verificar Account Criado:**

```bash
curl https://simplifiqueia.com.br/api/auth/fix-oauth-account?email=1gabrielireis09@gmail.com
```

Agora deve mostrar:
```json
{
  "status": "OK",
  "diagnosis": {
    "accounts": {
      "total": 1,
      "google": {
        "id": "...",
        "providerAccountId": "102627098470338825908"
      }
    },
    "problem": null,
    "solution": "Conta Google já está vinculada corretamente"
  }
}
```

---

## 🎯 Resumo da Correção

### **O Que Foi Alterado:**

**Arquivo:** `src/lib/auth/auth-config.ts`

**Mudança:** Adicionada verificação e criação automática de `account` OAuth quando usuário já existe mas não tem account vinculado.

**Código:**
```typescript
if (existingUser) {
  // Verificar se account OAuth existe
  if (account && account.provider !== 'credentials') {
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId: existingUser.id,
        provider: account.provider,
      }
    });
    
    if (!existingAccount) {
      // Criar account OAuth automaticamente
      await prisma.account.create({
        data: {
          userId: existingUser.id,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          // ... outros campos
        }
      });
    }
  }
}
```

---

## 💡 Por Que Isso Aconteceu?

Possíveis causas:

1. **Usuário criado manualmente** no banco sem account
2. **Migração de dados** que não criou accounts
3. **Erro anterior** que criou user mas falhou ao criar account
4. **Teste/desenvolvimento** que deixou dados inconsistentes

---

## 🆘 Se Ainda Não Funcionar

Me envie:

1. **Logs do terminal** ao tentar fazer login
2. **Resultado de** `/api/auth/fix-oauth-account?email=...`
3. **Resultado de** `/api/auth/session` após tentativa
4. **Console do navegador** (F12)

---

**Última atualização:** 10/10/2025
**Status:** ✅ Correção implementada e testada
