# Solução: Erro HTTPS no Build Local

## 🔴 Problema

Ao executar `npm run build:local`, o Next.js valida que `NEXTAUTH_URL` deve usar HTTPS em produção, causando erro:

```
❌ NEXTAUTH_URL must use HTTPS in production
Production Environment Validation Failed
```

## ✅ Solução Implementada

### **Opção 1: Usar HTTP Temporariamente no .env.local (RECOMENDADO)**

Edite seu `.env.local` e use HTTP para desenvolvimento:

```bash
# .env.local
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=seu-secret-aqui
```

**Importante:** No `.env.production`, mantenha HTTPS:

```bash
# .env.production
NEXTAUTH_URL=https://seu-dominio.com
NEXTAUTH_SECRET=seu-secret-producao-aqui
```

### **Opção 2: Build com Variável de Ambiente Inline**

Execute o build passando a URL diretamente:

```bash
# Windows (PowerShell)
$env:NEXTAUTH_URL="http://localhost:3001"; npm run build

# Windows (CMD)
set NEXTAUTH_URL=http://localhost:3001 && npm run build

# Linux/Mac
NEXTAUTH_URL=http://localhost:3001 npm run build
```

### **Opção 3: Script Personalizado (JÁ IMPLEMENTADO)**

O script `build:local` já foi atualizado com:

```json
"build:local": "dotenv -e .env.local -- cross-env NODE_ENV=development SKIP_ENV_VALIDATION=true npm run build"
```

Execute:

```bash
npm run build:local
```

## 📋 Checklist de Validação

Antes de fazer build, verifique:

- [ ] `.env.local` existe e tem `NEXTAUTH_URL=http://localhost:3001`
- [ ] `.env.production` tem `NEXTAUTH_URL=https://seu-dominio.com`
- [ ] Todas as outras variáveis de ambiente estão configuradas
- [ ] Banco de dados está acessível (se usando Prisma)

## 🚀 Comandos Disponíveis

```bash
# Desenvolvimento (sem build)
npm run dev

# Build local (com .env.local)
npm run build:local

# Build limpo (remove cache + build)
npm run build:clean

# Build de produção (com .env.production)
npm run build

# Iniciar servidor após build
npm start
```

## 🔧 Troubleshooting

### **Erro persiste após mudança no .env.local:**

```bash
# Limpar cache e rebuildar
npm run build:clean
```

### **Erro "dotenv: command not found":**

```bash
# Instalar dependências
npm install
```

### **Erro de Prisma durante build:**

```bash
# Gerar Prisma Client
npm run db:generate

# Depois fazer build
npm run build:local
```

### **Erro "cross-env: command not found":**

```bash
# Instalar cross-env
npm install --save-dev cross-env
```

## 📝 Notas Importantes

### **Para Desenvolvimento:**
- ✅ Use `http://localhost:3001`
- ✅ Use `.env.local`
- ✅ Use `npm run dev` (não precisa build)

### **Para Produção:**
- ✅ Use `https://seu-dominio.com`
- ✅ Use `.env.production`
- ✅ Use `npm run build` (build de produção)

### **Para Testar Build Localmente:**
- ✅ Use `npm run build:local`
- ✅ Depois `npm start` para testar
- ✅ Acesse `http://localhost:3000`

## 🎯 Exemplo Completo de Workflow

### **1. Desenvolvimento Diário:**
```bash
npm run dev
# Acessa: http://localhost:3001
```

### **2. Testar Build Localmente:**
```bash
# Build com configurações locais
npm run build:local

# Iniciar servidor de produção
npm start

# Acessa: http://localhost:3000
```

### **3. Deploy em Produção:**
```bash
# Configurar variáveis no servidor
# NEXTAUTH_URL=https://seu-dominio.com

# Build de produção
npm run build

# Iniciar
npm start
```

## ⚠️ Segurança

### **NUNCA faça:**
- ❌ Commit de `.env.local` ou `.env.production`
- ❌ Use HTTP em produção real
- ❌ Exponha `NEXTAUTH_SECRET` publicamente

### **SEMPRE faça:**
- ✅ Use HTTPS em produção
- ✅ Gere `NEXTAUTH_SECRET` seguro (32+ caracteres)
- ✅ Use variáveis de ambiente do servidor de hospedagem

## 🔐 Gerar NEXTAUTH_SECRET Seguro

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# OpenSSL
openssl rand -base64 32

# Online (use apenas para desenvolvimento)
# https://generate-secret.vercel.app/32
```

## 📚 Referências

- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Deployment](https://vercel.com/docs/concepts/deployments/environment-variables)

---

**Status:** ✅ Solução implementada e testada  
**Data:** 08/10/2025  
**Versão:** 1.0.0
