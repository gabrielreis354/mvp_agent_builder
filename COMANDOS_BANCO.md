# 🚀 Comandos do Banco de Dados - Usando .env.local

**Status:** ✅ Configurado com dotenv-cli

---

## 📋 Novos Comandos (Usam .env.local)

### **1. Gerar Prisma Client:**
```bash
npm run db:generate
```

### **2. Executar Migrations:**
```bash
npm run db:migrate
```

### **3. Abrir Prisma Studio:**
```bash
npm run db:studio
```

### **4. Push Schema (sem migrations):**
```bash
npm run db:push
```

### **5. Seed do Banco:**
```bash
npm run db:seed
```

---

## ✅ Configuração do .env.local

Certifique-se de ter esta linha no `.env.local`:

```bash
DATABASE_URL="postgresql://automateai:automateai123@localhost:5432/automateai?schema=public"
```

---

## 🎯 Fluxo Completo de Setup

```bash
# 1. Iniciar PostgreSQL (Docker)
cd c:\G-STUFF\projects\automate_ai\AutomateAI
docker-compose up -d postgres

# 2. Voltar para o projeto
cd mvp-agent-builder

# 3. Gerar Prisma Client
npm run db:generate

# 4. Executar Migrations
npm run db:migrate

# 5. Abrir Prisma Studio
npm run db:studio
```

---

## 🔍 Verificar Configuração

Para ver qual DATABASE_URL está sendo usada:

```bash
# Windows PowerShell
$env:DATABASE_URL = (Get-Content .env.local | Select-String "DATABASE_URL").ToString().Split("=")[1]
echo $env:DATABASE_URL
```

---

## 📊 Comandos Docker

### **Iniciar PostgreSQL:**
```bash
docker-compose up -d postgres
```

### **Ver logs:**
```bash
docker-compose logs -f postgres
```

### **Parar PostgreSQL:**
```bash
docker-compose down
```

### **Resetar banco (CUIDADO!):**
```bash
docker-compose down -v
docker-compose up -d postgres
npm run db:migrate
```

---

## 🎉 Pronto!

Agora todos os comandos do Prisma usarão automaticamente o `.env.local`!

**Próximo passo:**
```bash
npm run db:studio
```

Deve abrir sem erros em: http://localhost:5555
