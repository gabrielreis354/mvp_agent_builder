# 🚀 Setup Fase 1 - Agentes Conversacionais

## 📦 Instalação de Dependências

Execute os seguintes comandos:

```bash
# OpenAI SDK (última versão com suporte a Assistants API)
npm install openai@latest

# Pinecone para vector store (memória de longo prazo)
npm install @pinecone-database/pinecone

# Utilitários
npm install uuid
npm install @types/uuid --save-dev
```

## 🔐 Configuração de Variáveis de Ambiente

Adicione ao seu `.env.local`:

```env
# ============================================
# AGENTKIT - AGENTES CONVERSACIONAIS
# ============================================

# OpenAI API
OPENAI_API_KEY=sk-proj-...
OPENAI_ORGANIZATION=org-...  # Opcional

# Pinecone Vector Database (para memória)
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-east-1-aws  # Ou seu environment
PINECONE_INDEX_NAME=simplifiqueia-memory

# Feature Flags
ENABLE_CONVERSATIONAL_AGENTS=true
ENABLE_MEMORY_STORE=true

# Configurações
MAX_THREAD_MESSAGES=100  # Máximo de mensagens por thread
MEMORY_RETENTION_DAYS=90  # Dias para manter memórias (LGPD)
```

## 🗄️ Setup do Banco de Dados

### 1. Adicionar ao `prisma/schema.prisma`

Adicione os seguintes models ao final do arquivo:

```prisma
// ============================================
// AGENTKIT - CONVERSATIONAL AGENTS
// ============================================

// Thread de conversação com agente
model AgentThread {
  id            String   @id @default(cuid())
  userId        String
  agentId       String
  title         String?  // Título gerado automaticamente
  status        ThreadStatus @default(ACTIVE)
  metadata      Json?    // Contexto adicional
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  agent         Agent    @relation(fields: [agentId], references: [id], onDelete: Cascade)
  messages      ThreadMessage[]
  
  @@index([userId])
  @@index([agentId])
  @@index([status])
  @@index([updatedAt])
  @@map("agent_threads")
}

enum ThreadStatus {
  ACTIVE
  ARCHIVED
  COMPLETED
}

// Mensagens dentro de um thread
model ThreadMessage {
  id            String   @id @default(cuid())
  threadId      String
  role          MessageRole
  content       String   @db.Text
  metadata      Json?    // Ferramentas usadas, tokens, etc.
  createdAt     DateTime @default(now())
  
  thread        AgentThread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  
  @@index([threadId])
  @@index([createdAt])
  @@map("thread_messages")
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}
```

### 2. Atualizar Model Agent

Adicione a relação ao model `Agent` existente:

```prisma
model Agent {
  // ... campos existentes ...
  
  // NOVO: Relação com threads conversacionais
  threads       AgentThread[]
}
```

### 3. Atualizar Model User

Adicione a relação ao model `User` existente:

```prisma
model User {
  // ... campos existentes ...
  
  // NOVO: Relação com threads conversacionais
  agentThreads  AgentThread[]
}
```

### 4. Executar Migrations

```bash
# Gerar cliente Prisma
npx prisma generate

# Aplicar mudanças no banco
npx prisma db push

# Verificar se funcionou
npx prisma studio
```

## 🎨 Setup do Pinecone

### 1. Criar Conta

1. Acesse https://www.pinecone.io/
2. Crie uma conta gratuita (Starter Plan)
3. Crie um novo projeto

### 2. Criar Index

No dashboard do Pinecone:

```
Name: simplifiqueia-memory
Dimensions: 1536  (para text-embedding-3-small da OpenAI)
Metric: cosine
Cloud: AWS
Region: us-east-1
```

Ou via CLI:

```bash
curl -X POST "https://api.pinecone.io/indexes" \
  -H "Api-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "simplifiqueia-memory",
    "dimension": 1536,
    "metric": "cosine",
    "spec": {
      "serverless": {
        "cloud": "aws",
        "region": "us-east-1"
      }
    }
  }'
```

### 3. Obter Credenciais

Copie:
- **API Key**: Encontrado em "API Keys"
- **Environment**: Região do seu index (ex: `us-east-1-aws`)
- **Index Name**: Nome que você criou

## ✅ Verificação

Execute este script para verificar se tudo está configurado:

```bash
node scripts/verify-agentkit-setup.js
```

Ou crie o arquivo `scripts/verify-agentkit-setup.js`:

```javascript
const { Pinecone } = require('@pinecone-database/pinecone')
const OpenAI = require('openai')

async function verify() {
  console.log('🔍 Verificando configuração do AgentKit...\n')

  // 1. Verificar variáveis de ambiente
  const requiredEnvVars = [
    'OPENAI_API_KEY',
    'PINECONE_API_KEY',
    'PINECONE_ENVIRONMENT',
    'PINECONE_INDEX_NAME'
  ]

  let allEnvVarsPresent = true
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.log(`❌ ${envVar} não configurado`)
      allEnvVarsPresent = false
    } else {
      console.log(`✅ ${envVar} configurado`)
    }
  }

  if (!allEnvVarsPresent) {
    console.log('\n❌ Configure todas as variáveis de ambiente')
    process.exit(1)
  }

  // 2. Testar OpenAI
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    await openai.models.list()
    console.log('✅ OpenAI API funcionando')
  } catch (error) {
    console.log('❌ Erro ao conectar com OpenAI:', error.message)
    process.exit(1)
  }

  // 3. Testar Pinecone
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT
    })
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME)
    await index.describeIndexStats()
    console.log('✅ Pinecone conectado')
  } catch (error) {
    console.log('❌ Erro ao conectar com Pinecone:', error.message)
    process.exit(1)
  }

  console.log('\n🎉 Tudo configurado corretamente!')
}

verify()
```

Execute:

```bash
node scripts/verify-agentkit-setup.js
```

## 📚 Próximos Passos

Após concluir o setup:

1. ✅ Dependências instaladas
2. ✅ Variáveis de ambiente configuradas
3. ✅ Banco de dados atualizado
4. ✅ Pinecone configurado
5. ✅ Verificação executada

**Agora você pode começar a implementação!**

Siga o guia: [IMPLEMENTATION_GUIDE_PHASE1.md](./docs/IMPLEMENTATION_GUIDE_PHASE1.md)

## 🆘 Troubleshooting

### Erro: "Cannot find module 'openai'"

```bash
npm install openai@latest
```

### Erro: "Pinecone index not found"

Verifique se o nome do index no `.env.local` está correto.

### Erro: "Prisma Client not generated"

```bash
npx prisma generate
```

### Erro: "OpenAI API key invalid"

Verifique se a chave começa com `sk-proj-` e está ativa no dashboard da OpenAI.

## 📞 Suporte

Se tiver problemas, consulte:
- [Documentação OpenAI](https://platform.openai.com/docs)
- [Documentação Pinecone](https://docs.pinecone.io)
- [Guia de Implementação](./docs/IMPLEMENTATION_GUIDE_PHASE1.md)
