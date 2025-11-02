# 🚀 CONFIGURAR PDF EM PRODUÇÃO

## ❌ PROBLEMA RESOLVIDO

**Antes:** URL hardcoded `http://localhost:8001` no chat
**Depois:** Usa variável de ambiente `PDF_SERVICE_URL`

---

## ✅ O QUE FOI CORRIGIDO

**Arquivo:** `src/lib/agentkit/conversational-engine-v3.ts`

**Mudança:**
```typescript
// ❌ ANTES (linha 581)
const serviceUrl = 'http://localhost:8001/extract'

// ✅ DEPOIS
const pdfServiceUrl = process.env.NEXT_PUBLIC_PDF_SERVICE_URL || process.env.PDF_SERVICE_URL
const serviceUrl = `${pdfServiceUrl}/extract`
```

---

## 🔧 CONFIGURAR EM PRODUÇÃO (VERCEL)

### **Opção 1: Microserviço Externo (Recomendado)**

O Vercel **não suporta Python long-running**, então você precisa hospedar o microserviço em outro lugar:

#### **A. Railway.app** (Gratuito)
```bash
1. Crie conta em railway.app
2. New Project → Deploy from GitHub
3. Selecione: AutomateAI/pdf-service
4. Railway detecta Python automaticamente
5. Copie a URL gerada (ex: https://seu-app.railway.app)
```

#### **B. Render.com** (Gratuito)
```bash
1. Crie conta em render.com
2. New → Web Service
3. Connect: AutomateAI/pdf-service
4. Runtime: Python 3
5. Start Command: python app.py
6. Copie a URL gerada
```

#### **C. Fly.io** (Gratuito)
```bash
# No diretório pdf-service/
flyctl launch
flyctl deploy
flyctl open
```

### **2. Configurar Variável no Vercel**

```bash
# Vá em: Vercel Dashboard → Seu Projeto → Settings → Environment Variables

# Adicione:
Nome: PDF_SERVICE_URL
Valor: https://seu-microservico.railway.app
Ambiente: Production, Preview, Development
```

### **3. Redeployraiseway.app
```

### **3. Redeploy**

```bash
git push origin main
# Vercel faz deploy automático
```

---

## 🧪 TESTAR LOCALMENTE

### **1. Iniciar microserviço:**
```bash
cd pdf-service
venv\Scripts\activate
python app.py
```

### **2. Configurar .env.local:**
```bash
# mvp-agent-builder/.env.local
PDF_SERVICE_URL=http://localhost:8001
NEXT_PUBLIC_PDF_SERVICE_URL=http://localhost:8001
```

### **3. Iniciar Next.js:**
```bash
cd mvp-agent-builder
npm run dev
```

### **4. Testar chat:**
- Vá em `/chat`
- Envie um PDF
- Deve processar corretamente

---

## 📊 OPÇÕES DE DEPLOY DO MICROSERVIÇO

| Plataforma | Custo | Suporta Python | Setup |
|------------|-------|----------------|-------|
| **Railway** | Free 500h/mês | ✅ Sim | 5 min |
| **Render** | Free (sleep) | ✅ Sim | 5 min |
| **Fly.io** | Free 3GB | ✅ Sim | 10 min |
| **Heroku** | $7/mês | ✅ Sim | 5 min |
| **VPS** | ~$5/mês | ✅ Sim | 30 min |

---

## ⚠️ ALTERNATIVA: DESABILITAR PDF NO CHAT

Se não quiser hospedar o microserviço agora:

### **Opção: Retornar erro amigável**

Já está implementado! Se `PDF_SERVICE_URL` não estiver configurada:

```
"Erro: Serviço de processamento de PDF não configurado"
```

O resto do sistema continua funcionando normalmente.

---

## 🔍 VERIFICAR SE ESTÁ FUNCIONANDO

### **Logs Esperados (Produção):**

```bash
# Vercel Logs:
[ConversationalEngineV3] Enviando para: https://seu-microservico.railway.app/extract
[ConversationalEngineV3] Status da resposta: 200
[ConversationalEngineV3] Texto extraído: ... (200 chars)
```

### **Se der erro:**

```bash
# Erro de configuração:
"PDF_SERVICE_URL não configurada!"

# Erro de conexão:
"Erro ao processar PDF: Failed to fetch"

# Solução:
1. Verificar variável no Vercel
2. Testar URL do microserviço manualmente
3. Verificar logs do microserviço
```

---

## 📝 CHECKLIST PRODUÇÃO

- [ ] Microserviço deployado (Railway/Render/Fly)
- [ ] URL do microserviço acessível
- [ ] `PDF_SERVICE_URL` configurada no Vercel
- [ ] Código atualizado (sem localhost hardcoded)
- [ ] Redeploy feito no Vercel
- [ ] Testado com PDF no chat de produção
- [ ] Logs verificados (sem erros)

---

## 🎯 RESULTADO

**Modal (execute):** ✅ Funciona (não usa microserviço)
**Chat:** ✅ Funciona (usa variável de ambiente)

**Produção:** ✅ Pronto (após configurar PDF_SERVICE_URL)

---

## 💡 DICA PRO

**Railway.app é a opção mais fácil:**

1. ✅ Deploy automático do GitHub
2. ✅ HTTPS gratuito
3. ✅ 500h/mês grátis
4. ✅ Logs em tempo real
5. ✅ Restart automático

**Setup em 2 minutos:**
```bash
1. railway.app → Login com GitHub
2. New Project → Deploy AutomateAI/pdf-service
3. Copiar URL gerada
4. Colar no Vercel como PDF_SERVICE_URL
5. Done! 🚀
```

---

**Commit aplicado!** Faça push e configure a variável no Vercel! 🎉
