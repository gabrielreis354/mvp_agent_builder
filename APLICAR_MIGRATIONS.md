# 🔧 Aplicar Migrações: Campo `company` Faltando

**Problema:** Coluna `users.company` não existe no banco de dados  
**Causa:** Migrações não foram aplicadas durante deploy  
**Status:** 🔴 Crítico

---

## ✅ Solução Rápida

### **Opção 1: Forçar Sincronização (RECOMENDADO)**

Este comando cria/atualiza as colunas sem criar migração:

```bash
# Para PRODUÇÃO (Vercel/Neon):
DATABASE_URL="sua-connection-string-de-producao" npm run db:push

# Para LOCAL (usa .env.local automaticamente):
npm run db:push
```

**Vantagens:**

- ✅ Rápido (30 segundos)
- ✅ Não cria arquivos de migração
- ✅ Sincroniza schema atual

---

### **Opção 2: Aplicar Migrações Existentes**

```bash
# Para PRODUÇÃO:
DATABASE_URL="sua-connection-string-de-producao" npx prisma migrate deploy

# Para LOCAL (usa .env.local automaticamente):
npm run db:migrate
```

---

### **Opção 3: SQL Manual (Se Tiver Acesso ao Banco)**

Execute este SQL diretamente no banco:

```sql
-- Adicionar coluna company
ALTER TABLE users ADD COLUMN IF NOT EXISTS company TEXT;

-- Adicionar outras colunas RH (se faltarem)
ALTER TABLE users ADD COLUMN IF NOT EXISTS "jobTitle" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "companySize" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "primaryUseCase" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "linkedIn" TEXT;
```

---

## 🎯 Passo a Passo Detalhado

### **Para Produção (Vercel + Neon/Supabase):**

#### **1. Obter Connection String de Produção:**

**Neon:**

- Dashboard → Connection Details
- Copiar "Connection string"

**Supabase:**

- Settings → Database → Connection string
- Usar "Connection pooling"

**Vercel:**

- Project → Settings → Environment Variables
- Copiar valor de `DATABASE_URL`

#### **2. Aplicar Migrações:**

```bash
# Substituir pela sua connection string real
DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require" npm run db:push
```

#### **3. Verificar no Prisma Studio:**

```bash
DATABASE_URL="sua-connection-string" npx prisma studio
```

Verifique se a coluna `company` aparece na tabela `users`.

#### **4. Fazer Redeploy na Vercel:**

```bash
# Via CLI
vercel --prod

# Ou via Dashboard:
# Deployments → ... → Redeploy
```

---

### **Para Local:**

```bash
# 1. Aplicar migrações (usa .env.local automaticamente)
npm run db:push

# 2. Verificar
npm run db:studio

# 3. Reiniciar servidor
npm run dev
```

---

## 🔍 Verificar se Funcionou

### **Teste 1: Prisma Studio**

```bash
npx prisma studio
```

1. Abrir tabela `users`
2. Verificar se coluna `company` existe
3. Verificar outras colunas RH

### **Teste 2: Query Direta**

```bash
npx prisma db execute --stdin <<EOF
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('company', 'jobTitle', 'department');
EOF
```

### **Teste 3: Criar Usuário**

Tente criar uma conta novamente:

- Local: `http://localhost:3001/auth/signup`
- Produção: `https://seu-app.vercel.app/auth/signup`

---

## 🐛 Troubleshooting

### **Erro: "Can't reach database server"**

**Causa:** Connection string incorreta ou banco inacessível

**Solução:**

1. Verificar se banco está online
2. Verificar credenciais
3. Verificar firewall/IP whitelist

---

### **Erro: "SSL connection required"**

**Causa:** Banco requer SSL mas connection string não tem

**Solução:**

```bash
# Adicionar ao final da connection string:
?sslmode=require
```

---

### **Erro: "Permission denied"**

**Causa:** Usuário do banco não tem permissão para ALTER TABLE

**Solução:**

- Usar usuário admin do banco
- Ou executar SQL manualmente via dashboard

---

### **Erro: "Migration already applied"**

**Causa:** Migração já foi aplicada mas coluna não existe

**Solução:**

```bash
# Forçar sincronização
npx prisma db push --force-reset
```

⚠️ **CUIDADO:** Isso apaga dados!

---

## 📊 Verificar Estado Atual do Banco

### **Ver todas as colunas da tabela users:**

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

### **Ver migrações aplicadas:**

```sql
SELECT * FROM _prisma_migrations
ORDER BY finished_at DESC;
```

---

## 🚀 Após Aplicar Migrações

### **1. Limpar Cache do Prisma:**

```bash
npx prisma generate
```

### **2. Reiniciar Aplicação:**

**Local:**

```bash
npm run dev
```

**Vercel:**

- Fazer redeploy ou
- Aguardar próximo commit

### **3. Testar Registro:**

Criar conta de teste com dados RH:

```json
{
  "name": "Teste",
  "email": "teste@teste.com",
  "password": "123456",
  "company": "Teste Corp",
  "jobTitle": "Gerente RH"
}
```

---

## 📝 Checklist Completo

Execute na ordem:

- [ ] Obter connection string de produção
- [ ] Executar `npx prisma db push` com DATABASE_URL
- [ ] Verificar no Prisma Studio se coluna existe
- [ ] Fazer redeploy na Vercel
- [ ] Testar criação de conta
- [ ] Verificar logs (não deve ter erro de `company`)
- [ ] Confirmar que dados RH são salvos

---

## 🎯 Comando Único (Copiar e Colar)

**Para Produção:**

```bash
# Substituir pela sua connection string
export DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
npx prisma db push
npx prisma generate
```

**Para Local:**

```bash
npx prisma db push && npx prisma generate && npm run dev
```

---

## 📞 Se Não Funcionar

Me envie:

1. **Output completo de:**

   ```bash
   npx prisma db push
   ```

2. **Lista de colunas:**

   ```bash
   npx prisma studio
   # Screenshot da tabela users
   ```

3. **Logs do erro:**
   ```
   Copiar mensagem de erro completa
   ```

---

**Execute `npx prisma db push` agora e o problema será resolvido! 🚀**

**Status:** ✅ Solução documentada  
**Ação:** Aplicar migrações no banco de produção  
**Tempo estimado:** 2-5 minutos
