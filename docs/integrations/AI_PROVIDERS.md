# 🤖 Configuração de Provedores de IA

## 🎯 **Objetivo**

Configurar integração real com provedores de IA (OpenAI, Anthropic, Google) para substituir as respostas simuladas.

---

## 📊 **Status Atual**

- ✅ **Infraestrutura:** Implementada e funcionando
- ✅ **Fallback:** Sistema inteligente quando API falha
- ⚠️ **APIs:** Precisam de configuração (chaves de API)

---

## 🔧 **Configuração Rápida (5 minutos)**

### **1. Escolha um Provedor (Recomendado: OpenAI)**

```bash
# .env.local
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### **2. Teste a Configuração**

```bash
# Acesse: http://localhost:3001/builder
# Crie um agente com nó de IA
# Execute e veja se retorna resposta real (não simulada)
```

### **3. Pronto! 🎉**

O sistema agora usa IA real ao invés de respostas simuladas.

---

## 🏢 **Configuração Completa para Produção**

### **🟢 OpenAI (Recomendado)**

#### **Por que escolher:**

- ✅ Mais popular e documentado
- ✅ Modelos GPT-4 muito bons para análise de documentos
- ✅ API estável e confiável
- ✅ Bom custo-benefício

#### **Como configurar:**

1. **Criar conta:** [platform.openai.com](https://platform.openai.com)
2. **Gerar API Key:** API Keys → Create new secret key
3. **Configurar billing:** Adicionar cartão de crédito
4. **Configurar limites:** Usage limits (recomendado: $50/mês)

```bash
# .env.local
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
OPENAI_ORG_ID="org-xxxxxxxxxxxxxxxxxxxxxxxx"  # Opcional
```

#### **Modelos Recomendados:**

```typescript
// Para análise de documentos RH
const models = {
  'gpt-4': 'Melhor qualidade, mais caro',
  'gpt-4-turbo': 'Boa qualidade, mais rápido',
  'gpt-3.5-turbo': 'Mais barato, qualidade ok'
}
```

#### **Custos Estimados:**

- **GPT-3.5-turbo:** $0.002/1K tokens (~$20/mês uso médio)
- **GPT-4:** $0.03/1K tokens (~$150/mês uso médio)
- **GPT-4-turbo:** $0.01/1K tokens (~$50/mês uso médio)

---

### **🟣 Anthropic Claude (Alternativa Premium)**

#### **Por que escolher:**

- ✅ Excelente para análise de textos longos
- ✅ Muito bom com documentos jurídicos/RH
- ✅ Contexto de 200K tokens (vs 8K do GPT-3.5)
- ✅ Menos tendencioso que GPT

#### **Como configurar:**

1. **Criar conta:** [console.anthropic.com](https://console.anthropic.com)
2. **Gerar API Key:** Settings → API Keys
3. **Configurar billing:** Billing → Add payment method

```bash
# .env.local
ANTHROPIC_API_KEY="sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

#### **Modelos Recomendados:**

```typescript
const models = {
  'claude-3-opus-20240229': 'Melhor qualidade, mais caro',
  'claude-3-sonnet-20240229': 'Equilibrio qualidade/preço',
  'claude-3-haiku-20240307': 'Mais rápido e barato'
}
```

#### **Custos Estimados:**

- **Claude Haiku:** $0.00025/1K tokens (~$5/mês uso médio)
- **Claude Sonnet:** $0.003/1K tokens (~$30/mês uso médio)
- **Claude Opus:** $0.015/1K tokens (~$150/mês uso médio)

---

### **🔵 Google Gemini (Mais Barato)**

#### **Por que escolher:**

- ✅ Mais barato de todos
- ✅ Bom para tarefas simples
- ✅ Integração com Google Workspace
- ✅ Multimodal (texto + imagem)

#### **Como configurar:**

1. **Criar projeto:** [console.cloud.google.com](https://console.cloud.google.com)
2. **Ativar API:** AI Platform → Vertex AI API
3. **Gerar API Key:** Credentials → Create API Key

```bash
# .env.local
GOOGLE_AI_API_KEY="AIzaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

#### **Modelos Recomendados:**

```typescript
const models = {
  'gemini-pro': 'Texto geral',
  'gemini-pro-vision': 'Texto + imagem'
}
```

#### **Custos Estimados:**

- **Gemini Pro:** $0.0005/1K tokens (~$10/mês uso médio)
- **Gemini Pro Vision:** $0.002/1K tokens (~$20/mês uso médio)

---

## ⚙️ **Configuração Avançada**

### **Múltiplos Provedores (Recomendado)**

```bash
# .env.local - Configure todos para redundância
OPENAI_API_KEY="sk-proj-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_AI_API_KEY="AIza..."
```

### **Configuração por Template:**

```typescript
// Diferentes provedores para diferentes casos
const templateProviders = {
  'contract-analysis': 'anthropic',  // Claude é melhor para documentos longos
  'resume-screening': 'openai',      // GPT-4 é bom para estruturação
  'email-generation': 'google',      // Gemini é mais barato para textos simples
}
```

### **Limites e Rate Limiting:**

```typescript
// src/lib/ai-providers/index.ts
const providerLimits = {
  openai: {
    requestsPerMinute: 60,
    tokensPerMinute: 90000,
    maxRetries: 3
  },
  anthropic: {
    requestsPerMinute: 50,
    tokensPerMinute: 40000,
    maxRetries: 3
  },
  google: {
    requestsPerMinute: 300,
    tokensPerMinute: 32000,
    maxRetries: 3
  }
}
```

---

## 🧪 **Testes e Validação**

### **Script de Teste Automático:**

```javascript
// scripts/test-ai-providers.js
const { AIProviderManager } = require('../src/lib/ai-providers')

const aiManager = new AIProviderManager({
  openai: { apiKey: process.env.OPENAI_API_KEY },
  anthropic: { apiKey: process.env.ANTHROPIC_API_KEY },
  google: { apiKey: process.env.GOOGLE_AI_API_KEY }
})

async function testProviders() {
  const providers = ['openai', 'anthropic', 'google']
  const testPrompt = 'Responda apenas "OK" se você está funcionando.'
  
  for (const provider of providers) {
    if (!aiManager.isProviderAvailable(provider)) {
      console.log(`⚠️ ${provider}: Não configurado`)
      continue
    }
    
    try {
      const result = await aiManager.generateCompletion(
        provider,
        testPrompt,
        '',
        { maxTokens: 10 }
      )
      
      if (result.content.toLowerCase().includes('ok')) {
        console.log(`✅ ${provider}: Funcionando`)
      } else {
        console.log(`⚠️ ${provider}: Resposta inesperada: ${result.content}`)
      }
    } catch (error) {
      console.log(`❌ ${provider}: Erro - ${error.message}`)
    }
  }
}

testProviders()
```

### **Executar Teste:**

```bash
node scripts/test-ai-providers.js
```

### **Teste Manual no Sistema:**

1. Acesse `/builder`
2. Crie agente com nó de IA
3. Configure prompt: "Responda apenas 'FUNCIONANDO' se você é uma IA real"
4. Execute o agente
5. Se retornar "FUNCIONANDO" = IA real ✅
6. Se retornar dados simulados = Ainda em fallback ⚠️

---

## 🚨 **Troubleshooting**

### **Problema: "AI Provider not configured"**

```bash
# Verificar se variável está definida
echo $OPENAI_API_KEY

# Se vazio, adicionar ao .env.local
echo 'OPENAI_API_KEY="sua-chave-aqui"' >> .env.local

# Reiniciar servidor
npm run dev
```

### **Problema: "Rate limit exceeded"**

```bash
# Aguardar 1 minuto e tentar novamente
# Ou configurar outro provedor como backup
```

### **Problema: "Invalid API key"**

```bash
# Verificar se chave está correta
# Regenerar chave no dashboard do provedor
# Verificar se billing está configurado
```

### **Problema: "Quota exceeded"**

```bash
# Verificar usage no dashboard
# Aumentar limite de billing
# Ou usar provedor mais barato (Google)
```

---

## 💰 **Otimização de Custos**

### **Estratégias:**

1. **Usar modelo mais barato para tarefas simples:**

```typescript
const modelSelection = {
  'simple-classification': 'gpt-3.5-turbo',  // $0.002/1K
  'document-analysis': 'gpt-4-turbo',        // $0.01/1K
  'complex-reasoning': 'gpt-4'               // $0.03/1K
}
```

2. **Limitar tokens de resposta:**

```typescript
const tokenLimits = {
  'classification': 100,
  'summary': 500,
  'full-analysis': 2000
}
```

3. **Cache de respostas:**

```typescript
// Implementar cache para prompts similares
const responseCache = new Map()
```

4. **Fallback inteligente:**

```typescript
// Usar provedor mais barato primeiro, depois mais caro
const providerFallback = ['google', 'openai', 'anthropic']
```

---

## 📊 **Monitoramento**

### **Métricas Importantes:**

- Requests por minuto
- Tokens consumidos
- Custo por request
- Taxa de erro
- Latência média

### **Dashboard Simples:**

```javascript
// Adicionar ao sistema de logs
const aiMetrics = {
  totalRequests: 0,
  totalTokens: 0,
  totalCost: 0,
  errorRate: 0,
  avgLatency: 0
}
```

---

## 🎯 **Recomendações Finais**

### **Para Desenvolvimento:**

- Configure apenas OpenAI com GPT-3.5-turbo
- Limite de $20/mês
- Use fallback para economizar

### **Para Produção:**

- Configure OpenAI + Anthropic (redundância)
- GPT-4-turbo para análises importantes
- Claude Sonnet para documentos longos
- Monitoring e alertas ativos

### **Para Escala:**

- Todos os 3 provedores configurados
- Load balancing inteligente
- Cache de respostas
- Otimização automática de custos

---

*💡 Dica: Comece com OpenAI GPT-3.5-turbo e evolua conforme a necessidade*
*💰 Monitore custos semanalmente para evitar surpresas*
