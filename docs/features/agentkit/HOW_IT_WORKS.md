# 🎯 AgentKit - Como Funciona a Execução via Chat

## 📋 Visão Geral

O AgentKit V2 executa o **fluxo completo configurado pelo usuário** quando recebe mensagens via chat. Não é apenas um chatbot - é uma interface conversacional para executar automações complexas.

---

## 🔄 Fluxo de Execução

### **1. Usuário Envia Mensagem**

```typescript
POST /api/agents/chat
{
  "agentId": "curriculo-analyst",
  "message": "Analise este currículo",
  "fileContent": "data:application/pdf;base64,..." // Opcional
}
```

### **2. Sistema Processa**

```
┌─────────────────────────────────────────────────┐
│  ConversationalEngineV2                         │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  1. Criar/Recuperar Thread                      │
│     - Mantém histórico da conversa              │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  2. Processar Arquivo (se houver)               │
│     - PDF → Microserviço Python                 │
│     - Extrai texto estruturado                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  3. Buscar Memórias Relevantes                  │
│     - Pinecone busca conversas anteriores       │
│     - Contexto semântico                        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  4. Executar Fluxo do Agente                    │
│     - AgentRuntimeEngine                        │
│     - Executa TODOS os nodes configurados       │
│     - Usa configuração do builder               │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  5. Formatar e Retornar Resposta                │
│     - Extrai output dos nodes                   │
│     - Formata para chat                         │
│     - Gera sugestões                            │
└─────────────────────────────────────────────────┘
```

---

## 🎨 Exemplo Prático

### **Agente Configurado no Builder:**

```
[Input Node] → [PDF Processor] → [AI Analysis] → [Output Node]
```

**Configuração:**
- **Input:** Recebe currículo
- **PDF Processor:** Extrai texto via microserviço
- **AI Analysis:** Analisa com GPT-4 (score, pontos fortes/fracos)
- **Output:** Retorna análise formatada

### **Conversa no Chat:**

```
👤 Usuário: "Analise este currículo"
   [Anexa curriculo.pdf]

🔄 Sistema executa:
   1. Extrai texto do PDF (microserviço Python)
   2. Passa para node "PDF Processor"
   3. Node "AI Analysis" processa com GPT-4
   4. Node "Output" formata resultado

🤖 Agente: "📋 Análise do Currículo - João Silva

⭐ Pontuação: 8.5/10

✅ Pontos Fortes:
- 5 anos de experiência em Python
- Forte conhecimento em Django e Flask
- Experiência com PostgreSQL e Redis

⚠️ Pontos de Atenção:
- Pouca experiência com testes automatizados
- Sem certificações formais

💡 Recomendação: Candidato qualificado para vaga de Python Senior. 
Recomendo entrevista técnica focada em arquitetura."

👤 Usuário: "Comparar com outro candidato"

🤖 Agente: "Claro! Pode enviar o currículo do próximo candidato."
   [Sistema mantém contexto da análise anterior]
```

---

## 🔧 Integração com Microserviço de PDF

### **Microserviço Python (Existente):**

```python
# backend-simple.py
@app.post("/extract")
async def extract_pdf(file: UploadFile):
    # Extrai texto do PDF
    # Retorna JSON estruturado
    return {
        "text": "...",
        "pages": 3,
        "confidence": 0.95,
        "method": "pdfplumber"
    }
```

### **Integração no AgentKit:**

```typescript
// conversational-engine-v2.ts
if (fileContent && fileContent.startsWith('data:application/pdf')) {
  // Converter base64 para File
  const file = this.base64ToFile(fileContent)
  
  // Chamar microserviço
  const pdfResult = await pdfServiceClient.extractPdfText(file)
  extractedText = pdfResult.text
  
  console.log('PDF processado:', {
    chars: pdfResult.character_count,
    method: pdfResult.method
  })
}
```

---

## 🧠 Como o Fluxo é Executado

### **AgentRuntimeEngine:**

```typescript
// runtime/engine.ts
async executeAgent(agent: Agent, input: any, userId: string) {
  // 1. Ordenar nodes topologicamente
  const orderedNodes = this.getExecutionOrder(agent.nodes, agent.edges)
  
  // 2. Executar cada node em ordem
  for (const node of orderedNodes) {
    const result = await this.executeNode(node, context)
    nodeResults[node.id] = result
  }
  
  // 3. Retornar resultado final
  return {
    success: true,
    output: finalOutput,
    nodeResults
  }
}
```

### **Input Preparado:**

```typescript
const agentInput = {
  message: "Analise este currículo",
  fileContent: "João Silva\n5 anos Python...", // Texto extraído
  conversationHistory: [
    { role: 'user', content: 'Olá' },
    { role: 'assistant', content: 'Olá! Como posso ajudar?' }
  ],
  relevantMemories: [
    "Usuário busca Python Senior",
    "Última análise teve score 7.5"
  ],
  threadId: "thread_abc123"
}
```

---

## 📊 Tipos de Nodes Suportados

### **1. Input Node**
- Recebe dados do usuário
- Valida formato
- Passa para próximo node

### **2. PDF Processor Node**
- Chama microserviço Python
- Extrai texto estruturado
- Retorna conteúdo limpo

### **3. AI Analysis Node**
- Usa GPT-4/Claude/Gemini
- Analisa conteúdo
- Retorna análise estruturada

### **4. Condition Node**
- Avalia condições
- Roteia fluxo
- Exemplo: "Se score > 8, aprovar"

### **5. Output Node**
- Formata resposta final
- Retorna para chat
- Gera sugestões

---

## 🎯 Vantagens da Abordagem

### **✅ Para o Usuário:**
- Interface natural (chat)
- Mantém contexto
- Executa automações complexas
- Sem necessidade de API calls manuais

### **✅ Para o Desenvolvedor:**
- Reutiliza engine existente
- Não duplica lógica
- Fácil adicionar novos nodes
- Testável e manutenível

### **✅ Para o Sistema:**
- Escalável
- Modular
- Auditável (logs de execução)
- Seguro (isolamento por usuário)

---

## 🔒 Segurança

### **Isolamento:**
```typescript
// Cada execução é isolada
const executionResult = await this.runtimeEngine.executeAgent(
  agentConfig,
  agentInput,
  userId // ← Garante isolamento
)
```

### **Validações:**
- ✅ Usuário só executa seus próprios agentes
- ✅ Threads isoladas por usuário
- ✅ Memórias filtradas por userId
- ✅ Arquivos validados (tipo, tamanho)

---

## 📈 Métricas e Logs

### **Logs Gerados:**

```
[ConversationalEngineV2] Processando mensagem: { threadId, agentId, hasFile: true }
[ConversationalEngineV2] PDF processado: { chars: 5234, method: 'pdfplumber' }
[ConversationalEngineV2] Memórias encontradas: 2
[ConversationalEngineV2] Executando fluxo do agente...
[AgentRuntimeEngine] Executing node: PDF Processor
[AgentRuntimeEngine] Executing node: AI Analysis
[AgentRuntimeEngine] Executing node: Output
[ConversationalEngineV2] Resposta gerada: { executionTime: '2341ms' }
```

### **Métricas Rastreadas:**
- Tempo de execução total
- Tempo por node
- Tokens usados (OpenAI)
- Tamanho de arquivos processados
- Taxa de sucesso/erro

---

## 🚀 Próximas Melhorias

### **Phase 2 (Futuro):**
- [ ] Streaming de respostas (SSE)
- [ ] Execução paralela de nodes
- [ ] Cache de resultados
- [ ] Webhooks para notificações
- [ ] Integração com mais ferramentas

---

## 📝 Resumo

**AgentKit V2 = Chat + Automação Completa**

- ✅ Executa fluxo configurado no builder
- ✅ Processa PDFs via microserviço Python
- ✅ Mantém contexto conversacional
- ✅ Memória de longo prazo (Pinecone)
- ✅ Interface natural para usuário
- ✅ Reutiliza toda infraestrutura existente

**Não é apenas um chatbot - é uma interface conversacional para executar automações complexas! 🎯**
