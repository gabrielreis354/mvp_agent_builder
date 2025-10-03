# 🆘 Troubleshooting - Soluções para Problemas Comuns

## 🎯 **Como Usar Este Guia**

1. 🔍 **Identifique o problema** na seção correspondente
2. 🛠️ **Siga os passos** na ordem apresentada
3. ✅ **Teste** se o problema foi resolvido
4. 📞 **Escale** se nada funcionar

---

## 🔥 **Problemas Mais Comuns**

### 🚨 **1. "Sistema não inicia / Erro de porta"**

#### **Sintomas:**

```
Error: listen EADDRINUSE: address already in use :::3001
```

#### **Soluções:**

```bash
# Opção 1: Usar porta diferente
npm run dev -- --port 3002

# Opção 2: Matar processo na porta 3001
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F

# Mac/Linux:
lsof -ti:3001 | xargs kill -9
```

#### **Prevenção:**

```bash
# Adicionar ao package.json
"scripts": {
  "dev:3002": "next dev --port 3002",
  "dev:3003": "next dev --port 3003"
}
```

---

### 🔐 **2. "Login não funciona / Erro de autenticação"**

#### **Sintomas:**

- Botão de login não responde
- Erro "Invalid credentials"
- Redirecionamento infinito

#### **Diagnóstico:**

```bash
# Verificar variáveis de ambiente
node -e "console.log('NEXTAUTH_SECRET:', !!process.env.NEXTAUTH_SECRET)"
node -e "console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)"
```

#### **Soluções:**

##### **Problema: NEXTAUTH_SECRET não configurado**

```bash
# .env.local
NEXTAUTH_SECRET="sua-string-secreta-muito-longa-aqui-32-caracteres-minimo"
```

##### **Problema: NEXTAUTH_URL incorreto**

```bash
# .env.local
NEXTAUTH_URL="http://localhost:3001"  # Desenvolvimento
NEXTAUTH_URL="https://seudominio.com"  # Produção
```

##### **Problema: Banco de dados não conectado**

```bash
# Verificar conexão
npx prisma db push
npx prisma studio  # Abrir interface do banco
```

#### **Teste:**

```bash
# Testar login direto
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

---

### 🤖 **3. "Agente não executa / IA não responde"**

#### **Sintomas:**

- Execução trava em "Executando..."
- Erro "AI Provider not configured"
- Resposta sempre simulada

#### **Diagnóstico:**

```javascript
// Testar no console do navegador
fetch('/api/llm/call', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    prompt: 'Teste',
    maxTokens: 10
  })
}).then(r => r.json()).then(console.log)
```

#### **Soluções:**

##### **Problema: API Keys não configuradas**

```bash
# .env.local - Configure pelo menos uma
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_AI_API_KEY="AIza..."
```

##### **Problema: Cota da API esgotada**

- Verificar dashboard do provedor (OpenAI, Anthropic, etc.)
- Verificar limites de billing
- Trocar para outro provedor temporariamente

##### **Problema: Nó mal configurado**

```javascript
// Verificar se nó AI tem:
{
  nodeType: 'ai',
  provider: 'openai',  // Deve estar configurado
  model: 'gpt-3.5-turbo',  // Modelo válido
  prompt: 'Seu prompt aqui'  // Não pode estar vazio
}
```

#### **Fallback Manual:**

Se IA não funcionar, o sistema usa respostas simuladas. Para forçar IA real:

```typescript
// No runtime-engine.ts, comentar linha de fallback:
// return this.generateRealisticResponse(prompt, provider, model)
```

---

### 📧 **4. "Email não envia"**

#### **Sintomas:**

- Email fica "enviando" para sempre
- Erro "SMTP connection failed"
- Email vai para spam

#### **Diagnóstico:**

```bash
# Testar configuração SMTP
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  auth: { user: 'seu@email.com', pass: 'sua-senha' }
});
transporter.verify((error, success) => {
  console.log(error ? 'ERRO:' + error : 'SMTP OK');
});
"
```

#### **Soluções:**

##### **Gmail/Google Workspace:**

```bash
# .env.local
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-de-app  # NÃO a senha normal!
```

**⚠️ Importante:** Use "Senha de App", não a senha normal do Gmail!

##### **Outlook/Hotmail:**

```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=seu-email@outlook.com
SMTP_PASSWORD=sua-senha
```

##### **SendGrid (Recomendado para produção):**

```bash
SENDGRID_API_KEY=SG.xxxxx
```

#### **Teste Manual:**

```javascript
// test-email.js
const { EmailConnector } = require('./src/lib/connectors/email')

const connector = new EmailConnector()
connector.execute({
  provider: 'smtp',
  fromEmail: 'seu@email.com',
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpUser: 'seu@email.com',
  smtpPassword: 'sua-senha-de-app'
}, {
  to: 'destino@email.com',
  subject: 'Teste AutomateAI',
  body: 'Email de teste funcionando!'
}).then(console.log)
```

---

### 📄 **5. "Upload de arquivo falha"**

#### **Sintomas:**

- Erro "File too large"
- Upload trava em 99%
- Arquivo não é processado

#### **Soluções:**

##### **Aumentar limite de arquivo:**

```javascript
// next.config.js
module.exports = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',  // Aumentar de 1mb para 10mb
    },
  },
}
```

##### **Verificar tipos permitidos:**

```typescript
// src/lib/processors/file-processor.ts
const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png'
]
```

##### **Limpar uploads antigos:**

```bash
# Limpar pasta uploads
rm -rf uploads/*
mkdir -p uploads
```

---

### 🎨 **6. "Interface quebrada / CSS não carrega"**

#### **Sintomas:**

- Página sem estilo
- Componentes sobrepostos
- Botões não funcionam

#### **Soluções:**

##### **Limpar cache do Next.js:**

```bash
rm -rf .next
npm run dev
```

##### **Reinstalar dependências:**

```bash
rm -rf node_modules package-lock.json
npm install
```

##### **Verificar Tailwind:**

```bash
# Verificar se Tailwind está compilando
npm run build
```

---

## 🔧 **Ferramentas de Diagnóstico**

### **Script de Diagnóstico Completo:**

```javascript
// scripts/diagnose.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function diagnose() {
  console.log('🔍 DIAGNÓSTICO COMPLETO\n')
  
  // 1. Variáveis de ambiente
  console.log('📋 VARIÁVEIS DE AMBIENTE:')
  const envs = [
    'NODE_ENV',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'DATABASE_URL',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY'
  ]
  
  envs.forEach(env => {
    const value = process.env[env]
    console.log(`${value ? '✅' : '❌'} ${env}: ${value ? 'Configurado' : 'FALTANDO'}`)
  })
  
  // 2. Banco de dados
  console.log('\n🗄️ BANCO DE DADOS:')
  try {
    await prisma.$connect()
    const userCount = await prisma.user.count()
    console.log(`✅ Conexão: OK (${userCount} usuários)`)
  } catch (error) {
    console.log(`❌ Conexão: ERRO - ${error.message}`)
  }
  
  // 3. Portas
  console.log('\n🌐 PORTAS:')
  const net = require('net')
  const ports = [3001, 5432, 6379]
  
  for (const port of ports) {
    const server = net.createServer()
    try {
      await new Promise((resolve, reject) => {
        server.listen(port, () => {
          server.close()
          console.log(`✅ Porta ${port}: Disponível`)
          resolve()
        })
        server.on('error', reject)
      })
    } catch (error) {
      console.log(`⚠️ Porta ${port}: Em uso`)
    }
  }
  
  await prisma.$disconnect()
}

diagnose()
```

### **Executar Diagnóstico:**

```bash
node scripts/diagnose.js
```

---

## 📞 **Quando Escalar o Problema**

### **Escale SE:**

- ✅ Seguiu todos os passos do troubleshooting
- ✅ Problema persiste após 30 minutos
- ✅ Afeta funcionalidade crítica
- ✅ Tem logs de erro específicos

### **Informações para Incluir:**

1. **Descrição do problema** (o que estava fazendo)
2. **Mensagem de erro completa** (screenshot/copy-paste)
3. **Ambiente** (desenvolvimento/produção)
4. **Navegador e versão**
5. **Resultado do script de diagnóstico**
6. **Passos já tentados**

### **Template de Issue:**

```markdown
## 🚨 Problema: [Título descritivo]

**Ambiente:** Desenvolvimento/Produção
**Navegador:** Chrome 118
**Data/Hora:** 17/09/2025 12:30

### Descrição
[O que estava fazendo quando o erro ocorreu]

### Erro
```

[Mensagem de erro completa]

```

### Passos Tentados
- [ ] Reiniciei o servidor
- [ ] Verifiquei variáveis de ambiente
- [ ] Executei script de diagnóstico
- [ ] [Outros passos]

### Logs de Diagnóstico
```

[Resultado do script diagnose.js]

```
```

---

## 🎯 **Prevenção de Problemas**

### **Checklist Diário:**

- [ ] Backup do banco funcionando
- [ ] Logs sem erros críticos
- [ ] APIs de IA com cota disponível
- [ ] Sistema de email funcionando

### **Checklist Semanal:**

- [ ] Atualizar dependências
- [ ] Revisar logs de erro
- [ ] Testar funcionalidades críticas
- [ ] Verificar performance

---

*🆘 Mantenha este guia atualizado conforme novos problemas aparecem*
*📞 Para problemas não cobertos aqui, abra uma issue no GitHub*
