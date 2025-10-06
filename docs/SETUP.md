# 🚀 Setup - AutomateAI MVP

Guia completo de configuração local e produção.

---

## 📋 Pré-requisitos

- Node.js 18+
- Docker Desktop (para PostgreSQL)
- Git

---

## 🔧 Setup Local

### **1. Clonar e Instalar:**

```bash
git clone [repo-url]
cd mvp-agent-builder
npm install
```

### **2. Configurar Banco de Dados:**

```bash
# Iniciar PostgreSQL (Docker)
cd ..
docker-compose up -d postgres

# Voltar para o projeto
cd mvp-agent-builder
```

### **3. Configurar Variáveis de Ambiente:**

Criar `.env.local`:

```bash
# Banco de Dados
DATABASE_URL="postgresql://automateai:automateai123@localhost:5432/automateai?schema=public"

# Autenticação
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="[gerar com: openssl rand -base64 32]"

# Pelo menos 1 provedor de IA
OPENAI_API_KEY="sk-proj-..."
# OU
GOOGLE_AI_API_KEY="AIza..."
# OU
ANTHROPIC_API_KEY="sk-ant-..."
```

### **4. Executar Migrations:**

```bash
npm run db:generate
npm run db:migrate
```

### **5. Rodar Projeto:**

```bash
npm run dev
```

**Acesse:** <http://localhost:3001>

---

## 🌐 Setup Produção (Vercel)

### **1. Configurar Variáveis no Vercel:**

Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://[supabase-ou-neon-url]
NEXTAUTH_URL=https://seu-app.vercel.app
NEXTAUTH_SECRET=[gerar novo para produção]
OPENAI_API_KEY=sk-proj-...
```

### **2. Deploy:**

```bash
git push origin main
```

Vercel faz deploy automaticamente!

---

## 🐳 Serviços Docker

```bash
# Iniciar todos
docker-compose up -d

# Apenas PostgreSQL
docker-compose up -d postgres

# Ver logs
docker-compose logs -f postgres

# Parar
docker-compose down
```

**Serviços disponíveis:**

- PostgreSQL: localhost:5432
- PgAdmin: <http://localhost:8081>
- Redis: localhost:6379

---

## 📊 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Rodar app
npm run db:studio        # Prisma Studio
npm run db:migrate       # Migrations

# Build
npm run build:clean      # Build com limpeza
npm run type-check       # Verificar tipos

# Testes
npm test                 # Rodar testes
```

---

## ✅ Verificar Setup

Tudo funcionando se:

- [ ] `npm run dev` abre em localhost:3001
- [ ] `npm run db:studio` abre Prisma Studio
- [ ] Login funciona
- [ ] Pode criar agentes
