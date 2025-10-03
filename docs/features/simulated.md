# ⚠️ Funcionalidades Simuladas - Guia de Implementação

## 📋 **Visão Geral**

Este documento lista todas as funcionalidades que estão **simuladas** no MVP e como implementá-las para produção.

---

## 🔴 **1. Sistema de Email**

### **Status Atual:** Simulado
**Arquivo:** `src/lib/connectors/email.ts`
**Linha:** 51-52 (apenas `setTimeout` simulando envio)

### **Como Implementar:**

#### **Opção A: SMTP (Recomendado para empresas)**
```typescript
// Instalar dependência
npm install nodemailer @types/nodemailer

// Substituir no EmailConnector:
import nodemailer from 'nodemailer'

async execute(config: EmailConfig, input: EmailInput): Promise<ConnectorResult> {
  const transporter = nodemailer.createTransporter({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
  })

  const result = await transporter.sendMail({
    from: `${config.fromName} <${config.fromEmail}>`,
    to: Array.isArray(input.to) ? input.to.join(', ') : input.to,
    subject: input.subject,
    text: input.body,
    html: input.html,
    attachments: input.attachments,
  })

  return this.createResult(true, {
    messageId: result.messageId,
    status: 'sent',
    recipients: Array.isArray(input.to) ? input.to : [input.to],
    provider: config.provider
  })
}
```

#### **Variáveis de Ambiente:**
```bash
# .env.local
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@empresa.com
SMTP_PASSWORD=sua-senha-de-app
```

#### **Opção B: SendGrid**
```typescript
// Instalar dependência
npm install @sendgrid/mail

import sgMail from '@sendgrid/mail'

async execute(config: EmailConfig, input: EmailInput): Promise<ConnectorResult> {
  sgMail.setApiKey(config.apiKey!)
  
  const msg = {
    to: input.to,
    from: config.fromEmail,
    subject: input.subject,
    text: input.body,
    html: input.html,
  }

  const result = await sgMail.send(msg)
  // ... resto da implementação
}
```

### **Tempo Estimado:** 4 horas
### **Prioridade:** 🔴 Alta

---

## 🔴 **2. LinkedIn OAuth**

### **Status Atual:** UI implementada, provider não configurado
**Arquivo:** `src/lib/auth/auth-config.ts`

### **Como Implementar:**

#### **1. Criar LinkedIn App:**
1. Acesse [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Crie nova aplicação
3. Configure redirect URI: `http://localhost:3001/api/auth/callback/linkedin`

#### **2. Instalar Provider:**
```bash
npm install next-auth-linkedin-provider
```

#### **3. Atualizar Configuração:**
```typescript
// src/lib/auth/auth-config.ts
import LinkedInProvider from 'next-auth/providers/linkedin'

export const authOptions: NextAuthOptions = {
  providers: [
    // ... outros providers
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      scope: 'r_liteprofile r_emailaddress',
    }),
  ],
  // ... resto da config
}
```

#### **4. Variáveis de Ambiente:**
```bash
# .env.local
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

### **Tempo Estimado:** 2 horas
### **Prioridade:** 🟡 Média

---

## 🔴 **3. APIs Externas**

### **Status Atual:** Retorna dados simulados
**Arquivo:** `src/lib/runtime/engine.ts`
**Linha:** 309-318

### **Como Implementar:**

```typescript
private async executeAPINode(node: AgentNode, input: any, context: ExecutionContext): Promise<any> {
  const { apiEndpoint, apiMethod = 'POST', apiHeaders = {} } = node.data
  
  try {
    const response = await fetch(apiEndpoint, {
      method: apiMethod,
      headers: {
        'Content-Type': 'application/json',
        ...apiHeaders
      },
      body: apiMethod !== 'GET' ? JSON.stringify(input) : undefined
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    
    return {
      status: 'success',
      endpoint: apiEndpoint,
      method: apiMethod,
      response: result,
      statusCode: response.status,
      input_sent: input
    }
  } catch (error) {
    return {
      status: 'error',
      endpoint: apiEndpoint,
      method: apiMethod,
      error: error instanceof Error ? error.message : 'Unknown error',
      input_sent: input
    }
  }
}
```

### **Tempo Estimado:** 6 horas
### **Prioridade:** 🟡 Média

---

## 🔴 **4. OCR Real para Documentos**

### **Status Atual:** Simulado
**Arquivo:** `src/lib/processors/file-processor.ts`

### **Como Implementar:**

#### **Opção A: Tesseract.js (Gratuito)**
```bash
npm install tesseract.js
```

```typescript
import { createWorker } from 'tesseract.js'

async processDocument(file: File): Promise<ProcessingResult> {
  if (file.type === 'application/pdf') {
    return this.processPDF(file)
  }
  
  if (file.type.startsWith('image/')) {
    return this.processImageOCR(file)
  }
  
  // ... outros tipos
}

private async processImageOCR(file: File): Promise<ProcessingResult> {
  const worker = await createWorker('por') // português
  
  const { data: { text } } = await worker.recognize(file)
  await worker.terminate()
  
  return {
    success: true,
    extractedText: text,
    confidence: 0.85,
    processingTime: Date.now() - startTime
  }
}
```

#### **Opção B: Google Vision API (Mais Preciso)**
```bash
npm install @google-cloud/vision
```

```typescript
import vision from '@google-cloud/vision'

private async processImageOCR(file: File): Promise<ProcessingResult> {
  const client = new vision.ImageAnnotatorClient({
    apiKey: process.env.GOOGLE_VISION_API_KEY
  })
  
  const [result] = await client.textDetection({
    image: { content: await file.arrayBuffer() }
  })
  
  const text = result.textAnnotations?.[0]?.description || ''
  
  return {
    success: true,
    extractedText: text,
    confidence: 0.95,
    processingTime: Date.now() - startTime
  }
}
```

### **Tempo Estimado:** 8 horas
### **Prioridade:** 🟡 Média

---

## 🔴 **5. Sistema de Filas (Redis + Bull)**

### **Status Atual:** Não implementado (execução síncrona)

### **Como Implementar:**

#### **1. Instalar Dependências:**
```bash
npm install bull redis @types/bull
```

#### **2. Configurar Redis:**
```typescript
// src/lib/queue/queue-manager.ts
import Queue from 'bull'
import Redis from 'redis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export const agentExecutionQueue = new Queue('agent execution', {
  redis: {
    port: 6379,
    host: 'localhost',
  },
})

agentExecutionQueue.process(async (job) => {
  const { agent, input, userId } = job.data
  const engine = new AgentRuntimeEngine()
  return await engine.executeAgent(agent, input, userId)
})
```

#### **3. Atualizar Runtime Engine:**
```typescript
async executeAgentAsync(agent: Agent, input: any, userId: string): Promise<string> {
  const job = await agentExecutionQueue.add('execute', {
    agent,
    input,
    userId
  })
  
  return job.id
}

async getExecutionResult(jobId: string): Promise<ExecutionResult | null> {
  const job = await agentExecutionQueue.getJob(jobId)
  if (!job) return null
  
  if (job.finishedOn) {
    return job.returnvalue
  }
  
  return null // Still processing
}
```

### **Tempo Estimado:** 12 horas
### **Prioridade:** 🟢 Baixa

---

## 📊 **Resumo de Implementação**

| Funcionalidade | Prioridade | Tempo | Complexidade | Dependências |
|----------------|------------|-------|--------------|--------------|
| 📧 Email System | 🔴 Alta | 4h | Média | nodemailer/sendgrid |
| 🔐 LinkedIn OAuth | 🟡 Média | 2h | Baixa | linkedin provider |
| 🔗 APIs Externas | 🟡 Média | 6h | Média | - |
| 📄 OCR Real | 🟡 Média | 8h | Alta | tesseract/vision |
| ⚡ Sistema Filas | 🟢 Baixa | 12h | Alta | redis/bull |

**Total Estimado:** 32 horas de desenvolvimento

---

## 🎯 **Ordem Recomendada de Implementação**

### **Semana 1:**
1. ✅ Email System (4h)
2. ✅ LinkedIn OAuth (2h)
3. ✅ APIs Externas (6h)

### **Semana 2:**
4. ✅ OCR Real (8h)
5. ✅ Sistema de Filas (12h)

---

## 🔧 **Scripts de Teste**

### **Testar Email:**
```typescript
// test-email.ts
import { EmailConnector } from './src/lib/connectors/email'

const connector = new EmailConnector()
await connector.execute({
  provider: 'smtp',
  fromEmail: 'test@empresa.com',
  // ... config
}, {
  to: 'destino@empresa.com',
  subject: 'Teste',
  body: 'Email de teste'
})
```

### **Testar OCR:**
```typescript
// test-ocr.ts
import { FileProcessor } from './src/lib/processors/file-processor'

const processor = new FileProcessor()
const result = await processor.processDocument(imageFile)
console.log(result.extractedText)
```

---

*Última atualização: 17/09/2025*
