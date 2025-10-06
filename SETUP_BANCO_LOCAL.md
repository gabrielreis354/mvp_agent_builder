# 🚀 Setup Rápido - Banco de Dados Local

**Status:** ✅ PostgreSQL está rodando!

---

## 📋 Configuração do .env.local

Adicione esta linha no seu `.env.local`:

```bash
DATABASE_URL="postgresql://automateai:automateai123@localhost:5432/automateai?schema=public"
```

**Importante:** Use exatamente estas credenciais (do docker-compose.yml):
- Usuário: `automateai`
- Senha: `automateai123`
- Banco: `automateai`

---

## 🔧 Comandos para Executar

### **1. Gerar Prisma Client:**
```bash
cd mvp-agent-builder
npx prisma generate
```

### **2. Executar Migrations:**
```bash
npx prisma migrate dev --name init
```

### **3. Abrir Prisma Studio:**
```bash
npx prisma studio
```

**Deve abrir em:** http://localhost:5555

---

## 🐳 Gerenciar Docker

### **Iniciar todos os serviços:**
```bash
cd c:\G-STUFF\projects\automate_ai\AutomateAI
docker-compose up -d
```

### **Parar todos os serviços:**
```bash
docker-compose down
```

### **Ver logs do PostgreSQL:**
```bash
docker-compose logs -f postgres
```

### **Verificar se está rodando:**
```bash
docker ps
```

---

## 🎯 Serviços Disponíveis

Depois de rodar `docker-compose up -d`:

- **PostgreSQL:** localhost:5432
- **PgAdmin:** http://localhost:8081
  - Email: admin@automateai.com
  - Senha: admin123
- **Redis:** localhost:6379
- **PDF Service:** http://localhost:8001

---

## ✅ Checklist

- [x] PostgreSQL rodando (docker-compose up -d postgres)
- [ ] DATABASE_URL configurada no .env.local
- [ ] Prisma Client gerado (npx prisma generate)
- [ ] Migrations executadas (npx prisma migrate dev)
- [ ] Prisma Studio funcionando (npx prisma studio)

---

## 🚀 Próximo Passo

Depois que o Prisma Studio estiver funcionando:

```bash
npm run dev
```

Seu app estará em: http://localhost:3001
