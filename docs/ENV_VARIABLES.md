# Variáveis de Ambiente Necessárias

## 🔐 Segurança

### INTERNAL_API_KEY
**Obrigatório para chamadas internas entre APIs**

Chave secreta usada para autorizar chamadas entre APIs internas do sistema (ex: `/api/agents/execute` → `/api/generate-document`).

```env
INTERNAL_API_KEY=seu-token-secreto-aqui-min-32-chars
```

**Geração recomendada:**
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Desenvolvimento:**
```env
INTERNAL_API_KEY=dev-internal-key-12345
```

**Produção:**
```env
INTERNAL_API_KEY=prod-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## 📧 Email (SMTP)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
EMAIL_FROM=seu-email@gmail.com
EMAIL_FROM_NAME=SimplifiqueIA RH
```

---

## 🔑 NextAuth

```env
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=seu-secret-aqui-min-32-chars
```

---

## 🤖 Provedores de IA

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
```

---

## 📊 Database

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

---

## 🔴 Redis (Opcional)

```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## 📄 Microserviço PDF (Opcional)

```env
NEXT_PUBLIC_PDF_SERVICE_URL=http://localhost:8001
```

---

## ✅ Arquivo .env.local Completo

Crie um arquivo `.env.local` na raiz do projeto com:

```env
# Segurança
INTERNAL_API_KEY=dev-internal-key-12345

# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=seu-secret-aqui-min-32-chars

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
EMAIL_FROM=seu-email@gmail.com
EMAIL_FROM_NAME=SimplifiqueIA RH

# IA Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Redis (Opcional)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# PDF Service (Opcional)
NEXT_PUBLIC_PDF_SERVICE_URL=http://localhost:8001
```

---

## 🚀 Após Configurar

1. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Verifique se não há erros no console relacionados a variáveis de ambiente

3. Teste o envio de email com anexo PDF
