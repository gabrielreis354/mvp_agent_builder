# 🔧 CORRIGIR BANCO DE DADOS - TABELA AGENT_THREADS

## ❌ PROBLEMA

```
Error: The table `public.agent_threads` does not exist
Error: P3009 (migrations failed)
```

**Causa:** Migrations não foram aplicadas ao novo banco de dados

---

## ✅ SOLUÇÃO

### **1. Atualizar DATABASE_URL no `.env.local`**

Você mencionou que criou um novo banco. Atualize a URL:

```bash
# No arquivo: mvp-agent-builder/.env.local
# Linha 2:

DATABASE_URL="postgresql://usuario:senha@host:porta/nome_do_banco"

# Exemplo local:
DATABASE_URL="postgresql://automateai:automateai123@localhost:5432/automateai"

# Exemplo Neon (novo):
DATABASE_URL="postgresql://usuario:senha@ep-XXXXX.aws.neon.tech:5432/neondb?sslmode=require"
```

---

### **2. Aplicar Migrations ao Novo Banco**

Após atualizar o DATABASE_URL:

```bash
cd mvp-agent-builder

# Opção A: Forçar schema (desenvolvimento)
npx prisma db push

# OU Opção B: Aplicar migrations (produção)
npx prisma migrate deploy
```

---

### **3. Gerar Client Prisma**

```bash
npx prisma generate
```

---

### **4. Reiniciar Servidor**

```bash
# Ctrl+C no Next.js
npm run dev
```

---

## 🔍 VERIFICAR SE FUNCIONOU

### **1. Checar tabelas criadas:**

```bash
npx prisma studio
```

Deve mostrar todas as tabelas, incluindo:
- ✅ `agent_threads`
- ✅ `users`
- ✅ `agents`
- ✅ etc.

### **2. Testar no app:**

Execute um agente conversacional - não deve dar erro.

---

## ⚠️ SE DER ERRO AINDA

### **Erro: "Can't reach database server"**

**Causa:** DATABASE_URL incorreta

**Solução:**
1. Verifique se o banco está rodando
2. Teste conexão:
   ```bash
   # PostgreSQL local:
   psql -h localhost -U automateai -d automateai
   
   # Neon:
   # Use a URL fornecida no dashboard Neon
   ```

---

### **Erro: "Migration failed"**

**Causa:** Migration antiga incompatível

**Solução:** Forçar reset (⚠️ PERDE DADOS):

```bash
# CUIDADO: Apaga e recria tudo
npx prisma migrate reset

# Confirme: y
```

**Alternativa segura:**

```bash
# 1. Backup dos dados importantes
# 2. Drop database manualmente
# 3. Criar database novamente
# 4. Rodar:
npx prisma db push
```

---

## 📋 CHECKLIST RÁPIDO

- [ ] Atualizei `DATABASE_URL` no `.env.local` com novo banco
- [ ] Rodei `npx prisma db push`
- [ ] Rodei `npx prisma generate`
- [ ] Reiniciei Next.js
- [ ] Testei executar agente
- [ ] Sem erro de `agent_threads`

---

## 🎯 RESUMO

**Problema:** Novo banco não tem as tabelas
**Solução:** Aplicar schema com `npx prisma db push`

**Passos:**
1. Atualizar DATABASE_URL
2. `npx prisma db push`
3. `npx prisma generate`
4. Reiniciar servidor

**Resultado:** ✅ Todas as tabelas criadas e funcionando!
