# 🔍 DIAGNÓSTICO - Erro em Produção

## ❌ ERRO ATUAL:
```json
{"error": "Erro ao processar solicitação"}
```

---

## 🎯 CAUSA MAIS PROVÁVEL:

**A tabela `password_resets` NÃO EXISTE no banco de produção!**

A migration não foi aplicada ainda.

---

## ✅ VERIFICAR SE MIGRATION FOI APLICADA:

### **Opção 1: Via Prisma Studio**

```bash
# Abrir Prisma Studio em produção
npx dotenv -e .env.production -- prisma studio
```

Verifique se a tabela `password_resets` aparece na lista.

---

### **Opção 2: Via SQL Direto**

Conecte no banco de produção e execute:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'password_resets';
```

**Se retornar vazio:** Tabela não existe, migration não foi aplicada.

---

### **Opção 3: Verificar Migrations Aplicadas**

```bash
# Ver quais migrations foram aplicadas
npx dotenv -e .env.production -- prisma migrate status
```

**Você deve ver:**
```
✔ 20250109_add_password_reset (applied)
```

**Se aparecer "pending":** Migration não foi aplicada!

---

## 🚀 APLICAR MIGRATION AGORA:

### **Comando Correto:**

```bash
npx dotenv -e .env.production -- prisma migrate deploy
```

---

## 📊 CHECKLIST DE VERIFICAÇÃO:

### **1. Verificar Conexão com Banco**
```bash
# Testar conexão
npx dotenv -e .env.production -- prisma db pull
```

Se conectar com sucesso, o banco está acessível.

---

### **2. Verificar Variáveis de Ambiente**

Confirme que `.env.production` tem:

```env
DATABASE_URL="postgresql://user:pass@host:5432/database"
```

---

### **3. Verificar Permissões**

O usuário do banco precisa ter permissão para:
- CREATE TABLE
- CREATE INDEX
- INSERT/UPDATE/DELETE

---

### **4. Verificar Logs da Plataforma**

Se estiver usando Vercel/Netlify/Railway:
- Acesse o painel de logs
- Procure por erros de migration
- Verifique se o build executou migrations

---

## 🔧 SOLUÇÕES POR CENÁRIO:

### **Cenário A: Migration Não Foi Aplicada**

```bash
# Aplicar agora
npx dotenv -e .env.production -- prisma migrate deploy
```

---

### **Cenário B: Erro de Permissão**

```sql
-- Dar permissões ao usuário
GRANT CREATE ON DATABASE seu_banco TO seu_usuario;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO seu_usuario;
```

---

### **Cenário C: Tabela Existe Mas Erro Persiste**

```bash
# Regenerar Prisma Client
npx dotenv -e .env.production -- prisma generate

# Reiniciar aplicação
# (Vercel: novo deploy, Railway: restart, etc)
```

---

## 🎯 PLATAFORMAS ESPECÍFICAS:

### **Vercel:**

1. **Verificar Build Logs:**
   - Dashboard > Deployments > Latest > Logs
   - Procurar por "prisma migrate"

2. **Variáveis de Ambiente:**
   - Settings > Environment Variables
   - Confirmar `DATABASE_URL`

3. **Forçar Novo Deploy:**
   ```bash
   git commit --allow-empty -m "trigger deploy"
   git push
   ```

---

### **Railway:**

1. **Verificar Logs:**
   - Dashboard > Deployments > Logs
   - Procurar por erros de migration

2. **Executar Migration Manual:**
   - Dashboard > Variables > Add Variable
   - Ou usar Railway CLI

---

### **Netlify:**

1. **Build Settings:**
   - Site Settings > Build & Deploy
   - Verificar build command inclui migrations

2. **Build Command Correto:**
   ```bash
   prisma generate && prisma migrate deploy && next build
   ```

---

## 📝 COMANDO DE TESTE RÁPIDO:

Execute este comando para testar tudo:

```bash
# 1. Verificar status
npx dotenv -e .env.production -- prisma migrate status

# 2. Se houver pending, aplicar
npx dotenv -e .env.production -- prisma migrate deploy

# 3. Gerar client
npx dotenv -e .env.production -- prisma generate
```

---

## ✅ APÓS APLICAR MIGRATION:

1. **Reiniciar aplicação em produção**
2. **Limpar cache (se houver)**
3. **Testar novamente:**
   - Acesse `/auth/forgot-password`
   - Digite um email
   - Verificar se erro sumiu

---

## 🐛 SE AINDA DER ERRO:

**Adicione logs detalhados:**

Edite `forgot-password/route.ts` e adicione:

```typescript
console.log('[DEBUG] DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 30) + '...');
console.log('[DEBUG] Tentando criar passwordReset...');
```

Isso ajudará a identificar o problema exato.

---

## 📞 PRÓXIMOS PASSOS:

1. ✅ Execute: `npx dotenv -e .env.production -- prisma migrate status`
2. ✅ Me mostre o resultado
3. ✅ Vamos aplicar a migration se necessário

---

**Execute o comando de status e me mostre o resultado!**
