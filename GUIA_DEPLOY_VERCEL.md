# 🚀 Guia Completo de Deploy na Vercel

**Status:** ✅ Pronto para Deploy  
**Data:** 08/10/2025

---

## 📋 Pré-requisitos

- [x] Conta no GitHub
- [x] Repositório criado
- [x] Código commitado
- [x] Banco de dados PostgreSQL (Neon/Supabase/Railway)

---

## 🎯 Passo 1: Preparar Banco de Dados

### **Opção A: Neon (Recomendado - Gratuito)**

1. **Acesse:** https://neon.tech
2. **Crie conta** (pode usar GitHub)
3. **Criar novo projeto:**
   - Nome: SimplifiqueIA
   - Região: AWS East (us-east-1)
4. **Copiar Connection String:**
   ```
   postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
   ```

### **Opção B: Supabase (Gratuito)**

1. **Acesse:** https://supabase.com
2. **Criar projeto:**
   - Nome: SimplifiqueIA
   - Senha do banco: (anote!)
   - Região: East US
3. **Copiar Connection String:**
   - Settings → Database → Connection String
   - Use o formato "Connection pooling"

### **Opção C: Railway (Gratuito)**

1. **Acesse:** https://railway.app
2. **New Project → Provision PostgreSQL**
3. **Copiar Connection String:**
   - PostgreSQL → Connect → Connection URL

---

## 🎯 Passo 2: Aplicar Migrações no Banco

### **Localmente (antes do deploy):**

```bash
# Configurar DATABASE_URL temporariamente
export DATABASE_URL="sua-connection-string-aqui"

# Aplicar migrações
npx prisma migrate deploy

# Verificar
npx prisma studio
```

### **Ou via Neon/Supabase Dashboard:**

Execute este SQL no console do banco:

```sql
-- Verificar se tabelas existem
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Se não existir, aplicar migrações manualmente
-- (copiar SQL das migrations em prisma/migrations/)
```

---

## 🎯 Passo 3: Deploy na Vercel

### **Método 1: Via Dashboard (Mais Fácil)**

1. **Acesse:** https://vercel.com
2. **Login com GitHub**
3. **New Project**
4. **Import Repository:**
   - Selecione: `AutomateAI/mvp-agent-builder`
5. **Configure Project:**
   - Framework Preset: **Next.js**
   - Root Directory: `./` (raiz)
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. **Environment Variables** (adicione todas):

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# NextAuth
NEXTAUTH_URL=https://seu-app.vercel.app
NEXTAUTH_SECRET=gere-secret-seguro-32-caracteres

# Google OAuth
GOOGLE_CLIENT_ID=seu-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-secret

# OpenAI (opcional)
OPENAI_API_KEY=sk-...

# Anthropic (opcional)
ANTHROPIC_API_KEY=sk-ant-...

# Google AI (opcional)
GOOGLE_AI_API_KEY=...

# Email (Locaweb)
SMTP_HOST=smtp.simplifiqueia.com.br
SMTP_PORT=587
SMTP_USER=suporte@simplifiqueia.com.br
SMTP_PASS=sua-senha-email
SMTP_FROM=suporte@simplifiqueia.com.br
```

7. **Deploy!**

---

### **Método 2: Via CLI**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Seguir prompts:
# - Set up and deploy? Y
# - Which scope? (sua conta)
# - Link to existing project? N
# - Project name? simplifiqueia-rh
# - Directory? ./
# - Override settings? N
```

---

## 🎯 Passo 4: Configurar Variáveis de Ambiente

### **Via Dashboard:**

1. **Projeto → Settings → Environment Variables**
2. **Adicionar uma por uma:**
   - Name: `DATABASE_URL`
   - Value: `sua-connection-string`
   - Environment: **Production, Preview, Development**
3. **Repetir para todas as variáveis**

### **Via CLI:**

```bash
# Adicionar variável
vercel env add DATABASE_URL production

# Listar variáveis
vercel env ls

# Remover variável
vercel env rm DATABASE_URL production
```

---

## 🎯 Passo 5: Atualizar Google OAuth

### **Adicionar URLs de Produção:**

1. **Google Cloud Console:**
   - APIs & Services → Credentials
   - Seu OAuth Client → Edit

2. **Authorized JavaScript origins:**
   ```
   https://seu-app.vercel.app
   ```

3. **Authorized redirect URIs:**
   ```
   https://seu-app.vercel.app/api/auth/callback/google
   ```

4. **Save**

---

## 🎯 Passo 6: Testar Deploy

### **1. Acessar URL:**
```
https://seu-app.vercel.app
```

### **2. Testar Funcionalidades:**

- [ ] Página inicial carrega
- [ ] Login com Google funciona
- [ ] Cadastro manual funciona
- [ ] Builder carrega
- [ ] Templates funcionam
- [ ] Execução de agentes funciona

### **3. Verificar Logs:**

```bash
# Via CLI
vercel logs

# Ou no Dashboard:
# Projeto → Deployments → Logs
```

---

## 🔧 Troubleshooting

### **Erro: "Prisma Client not generated"**

**Solução:**
```bash
# Adicionar ao package.json
"build": "prisma generate && next build"
```

Já está configurado! ✅

---

### **Erro: "Database connection failed"**

**Verificar:**
1. `DATABASE_URL` está correta?
2. Banco está acessível publicamente?
3. SSL está habilitado? (adicione `?sslmode=require`)

**Testar localmente:**
```bash
export DATABASE_URL="sua-url"
npx prisma db pull
```

---

### **Erro: "NEXTAUTH_URL must use HTTPS"**

**Solução:**
```bash
# No Vercel, use:
NEXTAUTH_URL=https://seu-app.vercel.app
```

Nunca use `http://` em produção!

---

### **Erro: "Google OAuth redirect_uri_mismatch"**

**Solução:**
1. Verificar URL no Google Cloud Console
2. Deve ser exatamente: `https://seu-app.vercel.app/api/auth/callback/google`
3. Sem barra no final!

---

### **Erro: "Build failed"**

**Verificar:**
```bash
# Testar build localmente
npm run build

# Se funcionar local, problema é no Vercel
# Verificar logs do build
```

---

## 📊 Monitoramento

### **Vercel Analytics (Grátis):**

1. **Projeto → Analytics**
2. **Habilitar Web Analytics**
3. **Ver métricas:**
   - Page views
   - Unique visitors
   - Top pages
   - Performance

### **Vercel Speed Insights:**

1. **Projeto → Speed Insights**
2. **Habilitar**
3. **Ver métricas de performance**

---

## 🔐 Segurança

### **Gerar NEXTAUTH_SECRET Seguro:**

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# OpenSSL
openssl rand -base64 32

# Online (apenas para teste)
https://generate-secret.vercel.app/32
```

### **Proteger Variáveis:**

- ✅ Nunca commitar `.env` ou `.env.local`
- ✅ Usar variáveis de ambiente do Vercel
- ✅ Diferentes secrets para dev/prod
- ✅ Rotacionar secrets periodicamente

---

## 🚀 Deploy Contínuo

### **Configurar Auto-Deploy:**

1. **Vercel Dashboard:**
   - Settings → Git
   - Production Branch: `main`
   - Deploy Hooks: (opcional)

2. **Cada push para `main` = deploy automático**

3. **Pull Requests = Preview Deploy**

---

## 📝 Checklist Final

Antes de considerar deploy completo:

- [ ] Banco de dados configurado e acessível
- [ ] Migrações aplicadas no banco
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Google OAuth configurado com URLs de produção
- [ ] Build passa sem erros
- [ ] Aplicação acessível na URL
- [ ] Login funciona
- [ ] Cadastro funciona
- [ ] Funcionalidades principais testadas
- [ ] Logs verificados (sem erros críticos)
- [ ] Performance aceitável (< 3s load time)

---

## 🎯 URLs Importantes

### **Produção:**
```
https://seu-app.vercel.app
```

### **Dashboard Vercel:**
```
https://vercel.com/seu-usuario/simplifiqueia-rh
```

### **Logs:**
```
https://vercel.com/seu-usuario/simplifiqueia-rh/logs
```

### **Analytics:**
```
https://vercel.com/seu-usuario/simplifiqueia-rh/analytics
```

---

## 📞 Suporte

### **Vercel:**
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord
- Support: support@vercel.com

### **Neon:**
- Docs: https://neon.tech/docs
- Discord: https://discord.gg/neon
- Support: support@neon.tech

---

## 🎉 Próximos Passos

Após deploy bem-sucedido:

1. **Configurar domínio customizado:**
   - Vercel → Settings → Domains
   - Adicionar: `simplifiqueia.com.br`

2. **Configurar SSL:**
   - Automático na Vercel! ✅

3. **Configurar Email:**
   - Atualizar SMTP para produção
   - Testar envio de emails

4. **Monitorar:**
   - Configurar alertas
   - Verificar logs diariamente
   - Monitorar performance

5. **Backup:**
   - Configurar backup do banco
   - Exportar dados regularmente

---

**Status:** ✅ Guia completo criado  
**Pronto para deploy!** 🚀

---

## 🔄 Atualizações Futuras

Para atualizar o deploy:

```bash
# Fazer mudanças no código
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# Vercel faz deploy automático!
```

Ou manualmente:

```bash
vercel --prod
```

---

**Boa sorte com o deploy! 🎉**
