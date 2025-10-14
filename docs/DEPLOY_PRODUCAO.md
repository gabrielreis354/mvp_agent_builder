# 🚀 DEPLOY EM PRODUÇÃO - Guia Completo

**Data:** 14/10/2025  
**Objetivo:** Aplicar verificação de email no banco de produção

---

## 🎯 **ESCOLHA SUA OPÇÃO**

### **Opção 1: Deploy Automático via Vercel** ⭐ RECOMENDADO
- ✅ Mais simples
- ✅ Sem risco
- ✅ Rollback fácil

### **Opção 2: SQL Manual via Painel**
- ✅ Controle total
- ⚠️ Requer acesso ao painel

### **Opção 3: Script PowerShell**
- ✅ Rápido
- ⚠️ Requer DATABASE_URL de produção

---

## 📋 **OPÇÃO 1: DEPLOY AUTOMÁTICO (VERCEL)**

### **Passo 1: Verificar Build Command**

Abra: `package.json`

Verifique se tem:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

**Se NÃO tiver**, adicione:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

---

### **Passo 2: Commit e Push**

```bash
# Adicionar todas as mudanças
git add .

# Commit
git commit -m "feat: adicionar verificação de email obrigatória

- Adicionar campos verificationCode e verificationCodeExpires
- Bloquear login até verificar email
- Criar página de verificação
- Enviar email com código de 6 dígitos"

# Push para produção
git push origin main
```

---

### **Passo 3: Verificar Deploy no Vercel**

1. Acesse: https://vercel.com/seu-projeto
2. Vá em "Deployments"
3. Aguarde build completar
4. Verificar logs:

```
✅ Running "prisma generate"
✅ Running "prisma migrate deploy"
✅ Running "next build"
```

---

### **Passo 4: Testar em Produção**

```
1. Acessar: https://simplifiqueia.com.br/auth/signup
2. Cadastrar novo usuário
3. Verificar email recebido
4. Digitar código
5. Fazer login
```

---

## 📋 **OPÇÃO 2: SQL MANUAL (NEON/SUPABASE)**

### **Passo 1: Gerar SQL**

Execute localmente:

```bash
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migration-production.sql
```

Ou use o SQL abaixo:

```sql
-- Adicionar campos de verificação de email
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "verificationCode" TEXT,
ADD COLUMN IF NOT EXISTS "verificationCodeExpires" TIMESTAMP(3);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS "users_verificationCode_idx" 
ON "users"("verificationCode");
```

---

### **Passo 2: Executar no Painel**

#### **Se usar Neon:**

1. Acesse: https://console.neon.tech/
2. Selecione seu projeto
3. Vá em "SQL Editor"
4. Cole o SQL acima
5. Clique em "Run"

#### **Se usar Supabase:**

1. Acesse: https://app.supabase.com/
2. Selecione seu projeto
3. Vá em "SQL Editor"
4. Cole o SQL acima
5. Clique em "Run"

#### **Se usar outro provedor:**

1. Acesse o painel do seu provedor
2. Encontre o SQL Editor
3. Execute o SQL

---

### **Passo 3: Verificar Mudanças**

Execute no SQL Editor:

```sql
-- Verificar se colunas foram adicionadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('verificationCode', 'verificationCodeExpires');
```

**Resultado esperado:**
```
verificationCode        | text
verificationCodeExpires | timestamp(3)
```

---

### **Passo 4: Deploy do Código**

```bash
git add .
git commit -m "feat: adicionar verificação de email"
git push origin main
```

---

## 📋 **OPÇÃO 3: SCRIPT POWERSHELL**

### **Passo 1: Configurar DATABASE_URL**

Abra PowerShell como Administrador:

```powershell
# Definir DATABASE_URL temporariamente
$env:DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Verificar
echo $env:DATABASE_URL
```

**⚠️ CUIDADO:** Use a URL de **PRODUÇÃO**, não de desenvolvimento!

---

### **Passo 2: Executar Script**

```powershell
# Navegar até o projeto
cd C:\G-STUFF\projects\automate_ai\AutomateAI\mvp-agent-builder

# Executar script
.\scripts\deploy-production.ps1
```

---

### **Passo 3: Verificar Output**

```
🚀 Iniciando deploy em produção...
✅ DATABASE_URL configurada
📦 Gerando Prisma Client...
✅ Prisma Client gerado
🔄 Aplicando migrações no banco de produção...
✅ Migrações aplicadas
📊 Verificando status das migrações...
🎉 Deploy concluído com sucesso!
```

---

### **Passo 4: Deploy do Código**

```bash
git add .
git commit -m "feat: adicionar verificação de email"
git push origin main
```

---

## ⚠️ **IMPORTANTE: BACKUP ANTES DE APLICAR**

### **Fazer Backup do Banco:**

#### **Neon:**
```
1. Console → Branches → Create branch
2. Nome: "backup-before-email-verification"
```

#### **Supabase:**
```
1. Database → Backups → Create backup
```

#### **Outro provedor:**
```bash
# Via pg_dump
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

---

## 🧪 **TESTAR APÓS DEPLOY**

### **1. Verificar Migração:**

```bash
# Conectar ao banco de produção
npx prisma studio --browser none

# Verificar tabela users
# Deve ter: verificationCode, verificationCodeExpires
```

---

### **2. Testar Cadastro:**

```
1. Acessar: https://simplifiqueia.com.br/auth/signup
2. Cadastrar com email real
3. Verificar email recebido
4. Código deve ter 6 dígitos
```

---

### **3. Testar Verificação:**

```
1. Acessar: https://simplifiqueia.com.br/auth/verify-email?email=seu@email.com
2. Digitar código
3. Deve mostrar sucesso
4. Redirecionar para login
```

---

### **4. Testar Login:**

```
1. Tentar login SEM verificar
   Resultado: ❌ "Por favor, verifique seu email"

2. Verificar email

3. Tentar login APÓS verificar
   Resultado: ✅ Login permitido
```

---

## 🔧 **TROUBLESHOOTING**

### **Problema: Migração falha**

**Erro:**
```
Error: P3009: migrate found failed migrations
```

**Solução:**
```bash
# Marcar migração como aplicada
npx prisma migrate resolve --applied "NOME_DA_MIGRACAO"

# Tentar novamente
npx prisma migrate deploy
```

---

### **Problema: Usuários antigos não conseguem fazer login**

**Causa:** Usuários cadastrados antes da migração têm `emailVerified = null`

**Solução 1: Marcar todos como verificados**
```sql
-- Marcar usuários antigos como verificados
UPDATE users 
SET "emailVerified" = NOW() 
WHERE "emailVerified" IS NULL 
AND "createdAt" < '2025-10-14';
```

**Solução 2: Enviar código para todos**
```typescript
// Criar script para enviar código para usuários antigos
// src/scripts/send-verification-to-old-users.ts
```

---

### **Problema: Build falha no Vercel**

**Erro:**
```
Error: Prisma schema validation failed
```

**Solução:**
```bash
# Verificar schema localmente
npx prisma validate

# Corrigir erros
# Commit e push novamente
```

---

### **Problema: DATABASE_URL não encontrada**

**Erro:**
```
Error: Environment variable not found: DATABASE_URL
```

**Solução:**
```
1. Vercel Dashboard → Settings → Environment Variables
2. Adicionar: DATABASE_URL
3. Valor: Sua connection string de produção
4. Redeploy
```

---

## 📊 **CHECKLIST DE DEPLOY**

### **Antes do Deploy:**
- [ ] Backup do banco criado
- [ ] Código testado localmente
- [ ] Migrações testadas localmente
- [ ] Build command configurado

### **Durante o Deploy:**
- [ ] Commit e push realizados
- [ ] Build completou com sucesso
- [ ] Migrações aplicadas
- [ ] Sem erros nos logs

### **Após o Deploy:**
- [ ] Cadastro de novo usuário funciona
- [ ] Email de verificação chega
- [ ] Código de verificação funciona
- [ ] Login bloqueado sem verificar
- [ ] Login permitido após verificar

---

## 🎯 **ROLLBACK (SE NECESSÁRIO)**

### **Opção 1: Reverter Deploy no Vercel**

```
1. Vercel Dashboard → Deployments
2. Encontrar deploy anterior
3. Clicar nos 3 pontos → "Promote to Production"
```

---

### **Opção 2: Reverter Migração**

```sql
-- Remover colunas adicionadas
ALTER TABLE "users" 
DROP COLUMN IF EXISTS "verificationCode",
DROP COLUMN IF EXISTS "verificationCodeExpires";
```

---

### **Opção 3: Reverter Código**

```bash
# Reverter último commit
git revert HEAD

# Push
git push origin main
```

---

## 📞 **SUPORTE**

### **Erros Comuns:**

**1. "Cannot connect to database"**
- Verificar DATABASE_URL
- Verificar firewall/IP whitelist

**2. "Migration already applied"**
- Normal, significa que já foi aplicada
- Continuar com deploy

**3. "Column already exists"**
- Migração já foi aplicada antes
- Usar `IF NOT EXISTS` no SQL

---

## 📋 **RESUMO RÁPIDO**

### **Método Mais Simples (Vercel):**

```bash
# 1. Verificar package.json
"build": "prisma generate && prisma migrate deploy && next build"

# 2. Commit e push
git add .
git commit -m "feat: verificação de email"
git push origin main

# 3. Aguardar deploy
# 4. Testar
```

---

### **Método Manual (SQL):**

```sql
-- 1. Executar no painel do banco
ALTER TABLE "users" 
ADD COLUMN "verificationCode" TEXT,
ADD COLUMN "verificationCodeExpires" TIMESTAMP(3);

-- 2. Deploy do código
git push origin main

-- 3. Testar
```

---

**Status:** 📝 **GUIA COMPLETO**  
**Recomendação:** Usar Opção 1 (Vercel)  
**Tempo estimado:** 10-15 minutos  
**Última atualização:** 14/10/2025
