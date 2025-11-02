# 🧠 Sistema Inteligente de Seleção de Modelos de IA

**Status:** 📋 Planejado  
**Prioridade:** Alta  
**Estimativa:** 3-5 dias  
**Versão alvo:** v2.1.0

---

## 🎯 Objetivo

Implementar um sistema inteligente que seleciona automaticamente o melhor modelo de IA baseado no contexto da tarefa, otimizando **custo**, **performance** e **qualidade**.

---

## 🔍 Problema Atual

Atualmente, o sistema usa modelos fixos ou permite que o usuário escolha manualmente:

- ❌ **Ineficiente:** Usa modelos caros para tarefas simples
- ❌ **Lento:** Usa modelos lentos quando velocidade é crítica
- ❌ **Limitado:** Não aproveita context windows maiores para documentos grandes
- ❌ **Manual:** Usuário precisa entender diferenças entre modelos

---

## ✅ Solução Proposta

### **Sistema de Seleção Baseado em Contexto**

```typescript
// Detecção automática do contexto
const context = {
  type: 'document_analysis',        // Tipo de tarefa
  complexity: 'complex',             // Complexidade
  inputSize: 150000,                 // Tamanho em caracteres
  requiresReasoning: true,           // Precisa de raciocínio avançado
  requiresMultimodal: true,          // Precisa processar imagens/PDFs
  budgetPriority: 'balanced'         // cost | balanced | quality
};

// Seleção inteligente
const { provider, model } = modelSelector.selectOptimalModel(context);
// → google/gemini-1.5-pro (2M context window, ótimo para docs grandes)
```

---

## 📊 Matriz de Decisão

### **Por Tipo de Tarefa:**

| Tipo | Modelo Recomendado | Razão |
|------|-------------------|-------|
| **Extração de dados simples** | `gemini-1.5-flash` | Muito rápido, barato ($0.075/M) |
| **Análise de texto** | `gpt-4o-mini` | Balanceado, boa qualidade |
| **Documentos grandes (>50 páginas)** | `gemini-1.5-pro` | Context window 2M tokens |
| **Raciocínio complexo** | `claude-3-5-sonnet` | Excelente reasoning |
| **Geração de código** | `claude-3-5-sonnet` | Especializado em código |
| **Conversação rápida** | `gpt-4o-mini` ou `claude-haiku` | Baixa latência |

### **Por Tamanho de Input:**

| Tamanho | Modelo | Context Window |
|---------|--------|----------------|
| < 4K chars | `gpt-4o-mini` | 128K tokens |
| 4K - 50K | `claude-3-5-haiku` | 200K tokens |
| 50K - 500K | `gemini-1.5-flash` | 1M tokens |
| > 500K | `gemini-1.5-pro` | 2M tokens |

### **Por Prioridade de Budget:**

| Prioridade | Estratégia | Modelos Preferidos |
|------------|------------|-------------------|
| **Cost** | Minimizar custo | `gemini-flash` → `gpt-4o-mini` → `claude-haiku` |
| **Balanced** | Custo-benefício | `gpt-4o-mini` → `claude-haiku` → `gemini-flash` |
| **Quality** | Máxima qualidade | `claude-sonnet` → `gpt-4o` → `gemini-pro` |

---

## 🏗️ Arquitetura

### **1. ModelSelector (Core)**

```typescript
// src/lib/ai-providers/model-selector.ts

export class IntelligentModelSelector {
  private modelDatabase: Record<string, Record<string, ModelCapabilities>>;
  
  selectOptimalModel(context: TaskContext): {
    provider: AIProviderType;
    model: string;
    reasoning: string;
  }
  
  detectContext(input: {
    prompt: string;
    fileSize?: number;
    fileType?: string;
  }): TaskContext
}
```

### **2. Integração com AIProviderManager**

```typescript
// src/lib/ai-providers/index.ts

export class AIProviderManager {
  async generateCompletionSmart(
    prompt: string,
    options: {
      context?: Partial<TaskContext>;
      fileSize?: number;
      fileType?: string;
      // ... outros
    }
  ): Promise<AIResponse>
}
```

### **3. Uso no RuntimeEngine**

```typescript
// src/lib/runtime/engine.ts

private async executeAINode(node: AgentNode, input: any): Promise<any> {
  // Detecção automática de contexto
  const taskContext = this.detectTaskType(node, input);
  
  // Seleção inteligente
  const response = await this.aiProviderManager.generateCompletionSmart(
    prompt,
    { context: taskContext, fileSize: input.file?.size }
  );
}
```

---

## 📈 Benefícios Esperados

### **Otimização de Custos:**
- ✅ **-60% custo** em tarefas simples (usar flash/mini em vez de pro/sonnet)
- ✅ **-40% custo médio** geral com seleção inteligente

### **Melhoria de Performance:**
- ✅ **-50% latência** em tarefas simples (modelos rápidos)
- ✅ **+200% throughput** com modelos adequados

### **Qualidade:**
- ✅ **+30% qualidade** em tarefas complexas (modelos avançados)
- ✅ **100% sucesso** em docs grandes (context window adequado)

### **UX:**
- ✅ **Zero configuração** - usuário não precisa escolher modelo
- ✅ **Transparência** - logs explicam escolha do modelo

---

## 🧪 Casos de Teste

### **Teste 1: Extração Simples**
```typescript
Input: "Extrair nome e email do texto: João Silva - joao@email.com"
Expected: gemini-1.5-flash (rápido, barato)
Cost: ~$0.0001
Time: ~500ms
```

### **Teste 2: Análise de Contrato (50 páginas)**
```typescript
Input: PDF 150KB + "Analisar conformidade CLT"
Expected: gemini-1.5-pro (context window 2M)
Cost: ~$0.15
Time: ~8s
```

### **Teste 3: Geração de Código**
```typescript
Input: "Criar função TypeScript para validação de CPF com testes"
Expected: claude-3-5-sonnet (especializado em código)
Cost: ~$0.02
Time: ~3s
```

### **Teste 4: Conversa Rápida**
```typescript
Input: "Olá, como posso ajudar?"
Expected: gpt-4o-mini (baixa latência)
Cost: ~$0.0001
Time: ~300ms
```

---

## 📋 Checklist de Implementação

### **Fase 1: Core (2 dias)**
- [ ] Criar `src/lib/ai-providers/model-selector.ts`
- [ ] Implementar `ModelCapabilities` database
- [ ] Implementar `selectOptimalModel()`
- [ ] Implementar `detectContext()`
- [ ] Testes unitários

### **Fase 2: Integração (1 dia)**
- [ ] Adicionar `generateCompletionSmart()` ao AIProviderManager
- [ ] Integrar com RuntimeEngine
- [ ] Atualizar RuntimeErrorHandler para usar seleção inteligente
- [ ] Logs estruturados

### **Fase 3: Testes (1 dia)**
- [ ] Testes de integração
- [ ] Testes com arquivos reais
- [ ] Validação de custos
- [ ] Benchmarks de performance

### **Fase 4: Documentação (1 dia)**
- [ ] Atualizar COPILOT_PROMPT_V2.md
- [ ] Criar guia de uso
- [ ] Documentar API
- [ ] Exemplos práticos

---

## 🔧 Configuração

### **Variáveis de Ambiente:**

```env
# Feature Flag
ENABLE_INTELLIGENT_MODEL_SELECTION=true

# Budget Priority Global (pode ser sobrescrito por agente)
DEFAULT_BUDGET_PRIORITY=balanced # cost | balanced | quality

# Limites de Custo (opcional)
MAX_COST_PER_REQUEST=1.00 # USD
WARN_COST_THRESHOLD=0.50 # USD
```

### **Por Agente (opcional):**

```typescript
// No AgentNode.data
{
  budgetPriority: 'cost', // Forçar prioridade de custo
  maxCostPerExecution: 0.10, // Limite de custo
  preferredProvider: 'google' // Preferência (não obrigatório)
}
```

---

## 📊 Monitoramento

### **Métricas a Coletar:**

```typescript
{
  modelSelections: {
    'gemini-1.5-flash': 450,
    'gpt-4o-mini': 320,
    'claude-3-5-sonnet': 80
  },
  avgCostPerRequest: 0.025,
  avgLatency: 2.3,
  costSavings: 0.45 // vs usar sempre modelos premium
}
```

### **Dashboard:**
- Distribuição de modelos usados
- Custo total por período
- Economia vs baseline (sempre usar gpt-4)
- Latência média por modelo

---

## 🚀 Roadmap Futuro

### **v2.2.0: Aprendizado**
- Machine learning para melhorar seleção baseado em histórico
- Feedback loop: qualidade do resultado → ajuste de seleção

### **v2.3.0: Otimização Avançada**
- Cache de resultados para queries similares
- Batch processing para múltiplas tarefas
- Streaming inteligente (escolher modelos que suportam)

### **v2.4.0: Multi-Agent**
- Coordenação entre múltiplos modelos
- Especialização: modelo A para extração, modelo B para análise
- Consensus: múltiplos modelos votam em resultado

---

## 📚 Referências

- [OpenAI Pricing](https://openai.com/pricing)
- [Anthropic Pricing](https://www.anthropic.com/pricing)
- [Google AI Pricing](https://ai.google.dev/pricing)
- [Context Window Comparison](https://artificialanalysis.ai/models)

---

**Última atualização:** 20/10/2025  
**Responsável:** Equipe de Desenvolvimento  
**Revisão:** Pendente
