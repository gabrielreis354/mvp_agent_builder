# 🔧 SOLUÇÃO: Erro de Migração P3018

**Erro:** `ERROR: column "acceptedByUserId" of relation "Invitation" already exists`  
**Código:** P3018 / 42701

---

## 🎯 **CAUSA DO PROBLEMA**

O banco de produção já tem colunas que a migração está tentando criar novamente.

**Isso acontece quando:**
- Migrações foram aplicadas manualmente antes
- Banco foi modificado diretamente
- Migrações foram aplicadas fora de ordem

---

## ✅ **SOLUÇÃO RÁPIDA (RECOMENDADA)**

### **Opção 1: Usar SQL com IF NOT EXISTS**

Já criei uma migração de correção que usa `IF NOT EXISTS`:

**Arquivo:** `prisma/migrations/20251014200000_fix_invitation_columns/migration.sql`

```sql
ALTER TABLE "Invitation" 
ADD COLUMN IF NOT EXISTS "acceptedByUserId" TEXT,
ADD COLUMN IF NOT EXISTS "invitedBy" TEXT,
ADD COLUMN IF NOT EXISTS "usedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "usedByIp" TEXT;
```

**Como aplicar:**

```bash
# Commit e push
git add .
git commit -m "fix: adicionar migração com IF NOT EXISTS"
git push origin main
```

---

### **Opção 2: Marcar Migração como Aplicada**

Se a migração problemática já foi aplicada manualmente:

```bash
# Conectar ao banco de produção
# Definir DATABASE_URL
$env:DATABASE_URL="sua_url_de_producao"

# Marcar como aplicada
npx prisma migrate resolve --applied "20251014193343_add_email_verification"
```

---

### **Opção 3: Aplicar SQL Manualmente no Painel**

**1. Acessar painel do banco:**
- Neon: https://console.neon.tech/
- Supabase: https://app.supabase.com/

**2. Executar SQL:**

```sql
-- Adicionar colunas de verificação de email (se não existirem)
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "verificationCode" TEXT,
ADD COLUMN IF NOT EXISTS "verificationCodeExpires" TIMESTAMP(3);

-- Adicionar colunas de convite (se não existirem)
ALTER TABLE "Invitation" 
ADD COLUMN IF NOT EXISTS "acceptedByUserId" TEXT,
ADD COLUMN IF NOT EXISTS "invitedBy" TEXT,
ADD COLUMN IF NOT EXISTS "usedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "usedByIp" TEXT;
```

**3. Marcar migrações como aplicadas:**

```bash
# Conectar ao banco de produção
$env:DATABASE_URL="sua_url_de_producao"

# Marcar todas as migrações como aplicadas
npx prisma migrate resolve --applied "20251001175620_add_invitations"
npx prisma migrate resolve --applied "20251014193343_add_email_verification"
npx prisma migrate resolve --applied "20251014200000_fix_invitation_columns"
```

**4. Fazer deploy do código:**

```bash
git add .
git commit -m "fix: resolver conflitos de migração"
git push origin main
```

---

## 🔍 **VERIFICAR SE FUNCIONOU**

### **1. Verificar no Painel do Banco:**

```sql
-- Verificar colunas da tabela users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('verificationCode', 'verificationCodeExpires');

-- Verificar colunas da tabela Invitation
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Invitation' 
AND column_name IN ('acceptedByUserId', 'invitedBy', 'usedAt', 'usedByIp');
```

**Resultado esperado:**
```
verificationCode        | text
verificationCodeExpires | timestamp(3)
acceptedByUserId        | text
invitedBy               | text
usedAt                  | timestamp(3)
usedByIp                | text
```

---

### **2. Testar Build Localmente:**

```bash
# Definir DATABASE_URL de produção
$env:DATABASE_URL="sua_url_de_producao"

# Testar migração
npx prisma migrate deploy

# Deve mostrar:
# ✅ No pending migrations
```

---

## 📋 **PASSO A PASSO COMPLETO**

### **Método Mais Seguro:**

```bash
# 1. Aplicar SQL manualmente no painel
# (ver SQL acima)

# 2. Marcar migrações como aplicadas
$env:DATABASE_URL="sua_url_de_producao"
npx prisma migrate resolve --applied "20251001175620_add_invitations"
npx prisma migrate resolve --applied "20251014193343_add_email_verification"

# 3. Verificar status
npx prisma migrate status
# Deve mostrar: Database schema is up to date!

# 4. Commit e push
git add .
git commit -m "fix: resolver conflitos de migração"
git push origin main

# 5. Verificar build no Vercel
# Deve completar sem erros
```

---

## ⚠️ **SE AINDA DER ERRO**

### **Opção: Resetar Histórico de Migrações**

**⚠️ CUIDADO:** Isso marca TODAS as migrações como aplicadas.

```bash
# 1. Conectar ao banco de produção
$env:DATABASE_URL="sua_url_de_producao"

# 2. Resetar histórico
npx prisma migrate resolve --applied "20250916192126_add_hr_fields_to_user"
npx prisma migrate resolve --applied "20251001143629_add_multi_tenancy"
npx prisma migrate resolve --applied "20251001175620_add_invitations"
npx prisma migrate resolve --applied "20251004_add_report_model"
npx prisma migrate resolve --applied "20251014193343_add_email_verification"

# 3. Verificar
npx prisma migrate status
```

---

## 🎯 **PREVENÇÃO FUTURA**

### **1. Sempre usar IF NOT EXISTS:**

```sql
-- ✅ BOM
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "newColumn" TEXT;

-- ❌ RUIM
ALTER TABLE "users" 
ADD COLUMN "newColumn" TEXT;
```

---

### **2. Testar migrações localmente primeiro:**

```bash
# 1. Aplicar em desenvolvimento
npm run db:migrate

# 2. Verificar se funciona
npm run dev

# 3. Só depois fazer push
git push origin main
```

---

### **3. Manter histórico sincronizado:**

```bash
# Sempre verificar status antes de criar nova migração
npx prisma migrate status

# Se houver pending migrations, aplicar primeiro
npx prisma migrate deploy
```

---

## 📞 **TROUBLESHOOTING**

### **Erro: "Migration failed to apply"**

**Solução:**
```bash
# Ver detalhes do erro
npx prisma migrate status

# Marcar como aplicada se já foi aplicada manualmente
npx prisma migrate resolve --applied "NOME_DA_MIGRACAO"
```

---

### **Erro: "Database schema is not in sync"**

**Solução:**
```bash
# Aplicar migrações pendentes
npx prisma migrate deploy

# Ou resetar (CUIDADO: perde dados)
npx prisma migrate reset
```

---

### **Erro: "Cannot connect to database"**

**Solução:**
```bash
# Verificar DATABASE_URL
echo $env:DATABASE_URL

# Testar conexão
npx prisma db pull
```

---

## ✅ **CHECKLIST**

- [ ] SQL aplicado manualmente no painel
- [ ] Colunas verificadas (existem)
- [ ] Migrações marcadas como aplicadas
- [ ] Status verificado (up to date)
- [ ] Commit e push realizados
- [ ] Build no Vercel completou
- [ ] Teste de cadastro funcionando

---

**Status:** 📝 **GUIA DE SOLUÇÃO**  
**Recomendação:** Usar Opção 3 (SQL Manual)  
**Tempo:** 10 minutos  
**Última atualização:** 14/10/2025
