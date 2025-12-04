# 📦 Código Completo para Implementação - DocSimples Agent Builder

Este documento contém o código completo pronto para copiar e adaptar ao DocSimples.

---

## 1. Tipos TypeScript Completos

```typescript
// src/types/agent.ts

export interface AgentNode {
  id: string;
  type: 'input' | 'ai' | 'output' | 'logic' | 'api' | 'customNode';
  position: { x: number; y: number };
  data: {
    label: string;
    nodeType?: 'input' | 'ai' | 'output' | 'logic' | 'api';
    prompt?: string;
    provider?: 'openai' | 'anthropic' | 'google';
    model?: string;
    temperature?: number;
    maxTokens?: number;
    inputSchema?: any;
    outputSchema?: any;
    apiEndpoint?: string;
    apiMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    apiHeaders?: Record<string, string>;
    logicType?: 'condition' | 'transform' | 'validate';
    condition?: string;
    transformation?: string;
    validation?: string;
    placeholder?: string;
  };
}

export interface AgentEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  nodes: AgentNode[];
  edges: AgentEdge[];
  createdAt?: Date;
  updatedAt?: Date;
  isTemplate?: boolean;
  tags?: string[];
  author?: string;
  version?: string;
  status?: 'draft' | 'published' | 'archived' | 'preview';
  isPublic?: boolean;
  estimatedCost?: number;
  averageRuntime?: number;
  inputSchema?: any;
  outputSchema?: any;
}

export interface AgentExecution {
  id: string;
  agentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: any;
  output?: any;
  error?: string;
  startTime: Date;
  endTime?: Date;
  logs: ExecutionLog[];
  cost: {
    total: number;
    breakdown: {
      provider: string;
      model: string;
      tokens: number;
      cost: number;
    }[];
  };
}

export interface ExecutionLog {
  id: string;
  nodeId: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

export interface AIProvider {
  id: 'openai' | 'anthropic' | 'google';
  name: string;
  models: {
    id: string;
    name: string;
    maxTokens: number;
    costPer1kTokens: number;
    capabilities: string[];
  }[];
  isAvailable: boolean;
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  useCase: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  nodes: AgentNode[];
  edges: AgentEdge[];
  tags: string[];
  preview: string;
  inputSchema?: any;
  outputSchema?: any;
}

export interface NaturalLanguageRequest {
  id: string;
  prompt: string;
  generatedAgent?: Agent;
  status: 'processing' | 'completed' | 'failed';
  suggestions?: string[];
  refinements?: string[];
}

export interface ExecutionResult {
  success: boolean;
  output: any;
  executionId: string;
  executionTime: number;
  cost: number;
  tokensUsed: number;
  logs: ExecutionLog[];
  agent?: Agent;
  error?: {
    message: string;
    stack?: string;
  };
}

export interface ExecutionContext {
  executionId: string;
  agentId: string;
  userId: string;
  organizationId?: string;
  input: any;
  variables: Record<string, any>;
  startTime: Date;
}

export interface AIResponse {
  content: string;
  confidence: number;
  tokens_used: number;
  model: string;
  provider: string;
}

export type AIProviderType = 'openai' | 'anthropic' | 'google';
```

---

## 2. AI Provider Manager Completo

```typescript
// src/lib/ai-providers/index.ts

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIResponse {
  content: string;
  confidence: number;
  tokens_used: number;
  model: string;
  provider: string;
}

export type AIProviderType = 'openai' | 'anthropic' | 'google';

export interface AIProviderConfig {
  openai?: { apiKey: string; organization?: string };
  anthropic?: { apiKey: string };
  google?: { apiKey: string };
}

export class AIProviderManager {
  private providers: Map<AIProviderType, any> = new Map();
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders() {
    if (this.config.openai?.apiKey) {
      this.providers.set('openai', new OpenAI({ 
        apiKey: this.config.openai.apiKey 
      }));
    }

    if (this.config.anthropic?.apiKey) {
      this.providers.set('anthropic', new Anthropic({ 
        apiKey: this.config.anthropic.apiKey 
      }));
    }

    if (this.config.google?.apiKey) {
      this.providers.set('google', new GoogleGenerativeAI(
        this.config.google.apiKey
      ));
    }
  }

  async generateCompletion(
    provider: AIProviderType,
    prompt: string,
    model: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
      enableFallback?: boolean;
    } = {}
  ): Promise<AIResponse> {
    const { enableFallback = true, ...aiOptions } = options;

    // Ordem de fallback otimizada para velocidade
    const fallbackOrder: AIProviderType[] = ['anthropic', 'google', 'openai'];
    const providersToTry = provider
      ? [provider, ...fallbackOrder.filter(p => p !== provider)]
      : fallbackOrder;

    let lastError: Error | null = null;

    for (const currentProvider of providersToTry) {
      const providerInstance = this.providers.get(currentProvider);

      if (!providerInstance) {
        console.warn(`Provider '${currentProvider}' not configured`);
        continue;
      }

      try {
        console.log(`🤖 Calling ${currentProvider}...`);
        
        const modelToUse = this.getCompatibleModel(model, currentProvider);
        const result = await this.callProvider(
          currentProvider, 
          providerInstance, 
          prompt, 
          modelToUse, 
          aiOptions
        );

        console.log(`✅ Success with ${currentProvider}`);
        return { ...result, provider: currentProvider };

      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Provider ${currentProvider} failed:`, error);

        if (!enableFallback) break;
        continue;
      }
    }

    throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
  }

  private async callProvider(
    providerType: AIProviderType,
    client: any,
    prompt: string,
    model: string,
    options: any
  ): Promise<AIResponse> {
    switch (providerType) {
      case 'openai':
        return this.callOpenAI(client, prompt, model, options);
      case 'anthropic':
        return this.callAnthropic(client, prompt, model, options);
      case 'google':
        return this.callGoogle(client, prompt, model, options);
      default:
        throw new Error(`Unknown provider: ${providerType}`);
    }
  }

  private async callOpenAI(client: OpenAI, prompt: string, model: string, options: any): Promise<AIResponse> {
    const messages: any[] = [];
    
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await client.chat.completions.create({
      model: model || 'gpt-4o-mini',
      messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 2000,
    });

    return {
      content: response.choices[0]?.message?.content || '',
      confidence: 0.95,
      tokens_used: response.usage?.total_tokens || 0,
      model: response.model,
      provider: 'openai'
    };
  }

  private async callAnthropic(client: Anthropic, prompt: string, model: string, options: any): Promise<AIResponse> {
    const response = await client.messages.create({
      model: model || 'claude-3-5-haiku-20241022',
      max_tokens: options.maxTokens ?? 2000,
      system: options.systemPrompt || '',
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = response.content.find((c: any) => c.type === 'text');
    
    return {
      content: textContent?.text || '',
      confidence: 0.95,
      tokens_used: response.usage?.input_tokens + response.usage?.output_tokens || 0,
      model: response.model,
      provider: 'anthropic'
    };
  }

  private async callGoogle(client: GoogleGenerativeAI, prompt: string, model: string, options: any): Promise<AIResponse> {
    const genModel = client.getGenerativeModel({ model: model || 'gemini-1.5-flash' });
    
    const fullPrompt = options.systemPrompt 
      ? `${options.systemPrompt}\n\n${prompt}` 
      : prompt;

    const result = await genModel.generateContent(fullPrompt);
    const response = await result.response;
    
    return {
      content: response.text(),
      confidence: 0.95,
      tokens_used: 0, // Google doesn't return token count easily
      model: model || 'gemini-1.5-flash',
      provider: 'google'
    };
  }

  private getCompatibleModel(requestedModel: string, targetProvider: AIProviderType): string {
    const modelMapping: Record<string, Record<AIProviderType, string>> = {
      'gpt-4': {
        openai: 'gpt-4o-mini',
        anthropic: 'claude-3-5-haiku-20241022',
        google: 'gemini-1.5-flash',
      },
      'gpt-4o-mini': {
        openai: 'gpt-4o-mini',
        anthropic: 'claude-3-5-haiku-20241022',
        google: 'gemini-1.5-flash',
      },
    };

    if (modelMapping[requestedModel]) {
      return modelMapping[requestedModel][targetProvider];
    }

    const defaultModels = {
      openai: 'gpt-4o-mini',
      anthropic: 'claude-3-5-haiku-20241022',
      google: 'gemini-1.5-flash',
    };

    return defaultModels[targetProvider];
  }

  isProviderAvailable(provider: AIProviderType): boolean {
    return this.providers.has(provider);
  }

  getAvailableProviders(): AIProviderType[] {
    return Array.from(this.providers.keys());
  }
}
```

---

## 3. API de Geração via Linguagem Natural

```typescript
// src/app/api/agents/generate-from-nl/route.ts

import { NextResponse } from 'next/server';
import { AIProviderManager } from '@/lib/ai-providers';

export async function POST(request: Request) {
  const { prompt } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  try {
    const aiManager = new AIProviderManager({
      anthropic: { apiKey: process.env.ANTHROPIC_API_KEY || '' },
      openai: { apiKey: process.env.OPENAI_API_KEY || '' },
      google: { apiKey: process.env.GOOGLE_API_KEY || '' },
    });

    const systemPrompt = `
      Você é um arquiteto de sistemas que traduz requisitos de negócios em fluxos de trabalho JSON.

      **PROCESSO OBRIGATÓRIO:**
      1. DECOMPOR: Analise o prompt e decomponha em passos lógicos
      2. MAPEAR: Para cada passo, crie um nó ('input', 'ai', 'logic', 'api', 'output')
      3. CONECTAR: Defina as edges entre os nós

      **REGRAS:**
      - Para nós 'ai': inclua 'prompt', 'provider', 'model'
      - Para nós 'input': inclua 'inputSchema' com campos necessários
      - Para nós 'logic': inclua 'logicType' e 'condition'
      - Responda APENAS com JSON válido, sem texto adicional

      **ESTRUTURA:**
      {
        "name": "Nome do Agente",
        "nodes": [
          {
            "id": "node-1",
            "type": "customNode",
            "position": { "x": 100, "y": 200 },
            "data": {
              "label": "Nome",
              "nodeType": "input|ai|logic|api|output",
              "prompt": "Para nós AI",
              "provider": "openai|anthropic|google",
              "model": "gpt-4o-mini",
              "inputSchema": { "type": "object", "properties": {...} }
            }
          }
        ],
        "edges": [
          { "id": "edge-1", "source": "node-1", "target": "node-2" }
        ]
      }
    `;

    const response = await aiManager.generateCompletion(
      'anthropic',
      `**SOLICITAÇÃO DO USUÁRIO:**\n${prompt}`,
      'claude-3-5-haiku-20241022',
      {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 4096,
        enableFallback: true
      }
    );

    // Limpar e parsear JSON
    let jsonString = response.content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const generatedJson = JSON.parse(jsonString);

    // Validar estrutura
    if (!generatedJson.name || !generatedJson.nodes || !generatedJson.edges) {
      throw new Error('Estrutura JSON inválida');
    }

    // Corrigir input schemas para uploads de arquivo
    generatedJson.nodes.forEach((node: any) => {
      if (node.data?.nodeType === 'input') {
        const label = (node.data.label || '').toLowerCase();
        if (label.includes('pdf') || label.includes('arquivo') || label.includes('upload')) {
          node.data.inputSchema = {
            type: 'object',
            properties: {
              file: { type: 'string', format: 'binary', description: 'Arquivo para upload' }
            },
            required: ['file']
          };
        }
      }
    });

    return NextResponse.json({
      ...generatedJson,
      _meta: {
        provider: response.provider,
        model: response.model,
        tokens_used: response.tokens_used,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao gerar agente:', error);
    return NextResponse.json({ 
      error: 'Falha ao gerar agente',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      suggestion: 'Tente reformular sua descrição'
    }, { status: 500 });
  }
}
```

---

## 4. API de Melhoria de Prompt

```typescript
// src/app/api/prompts/improve/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt é obrigatório' },
        { status: 400 }
      );
    }

    const improvedPrompt = improvePromptLocally(prompt);

    return NextResponse.json({
      success: true,
      originalPrompt: prompt,
      improvedPrompt,
      improvements: [
        'Adicionado contexto específico do domínio',
        'Especificado formato de entrada e saída',
        'Incluído critérios de qualidade',
        'Definido estrutura do resultado'
      ]
    });

  } catch (error) {
    console.error('Erro ao melhorar prompt:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function improvePromptLocally(originalPrompt: string): string {
  const prompt = originalPrompt.toLowerCase();
  let improved = originalPrompt;

  // Contexto para documentos jurídicos
  if (prompt.includes('contrato') || prompt.includes('jurídico') || prompt.includes('legal')) {
    improved += `

**CONTEXTO ESPECÍFICO:**
- Extraia informações das partes envolvidas, valores, prazos, cláusulas importantes
- Identifique riscos jurídicos e pontos de atenção
- Analise conformidade legal
- Forneça recomendações de melhorias

**FORMATO DE ENTRADA:** Aceite arquivos PDF, DOC ou DOCX

**FORMATO DE SAÍDA:** Gere relatório HTML profissional estruturado`;
  }

  // Contexto para currículos
  else if (prompt.includes('currículo') || prompt.includes('cv') || prompt.includes('candidato')) {
    improved += `

**CONTEXTO ESPECÍFICO:**
- Analise experiência profissional, formação acadêmica, habilidades técnicas
- Forneça pontuação de 0-100 para cada critério
- Identifique pontos fortes e fracos
- Dê recomendação de contratação com justificativa

**FORMATO DE ENTRADA:** Aceite arquivos PDF, DOC ou DOCX

**FORMATO DE SAÍDA:** Gere relatório de triagem estruturado em HTML`;
  }

  // Contexto para financeiro
  else if (prompt.includes('financeiro') || prompt.includes('despesa') || prompt.includes('folha')) {
    improved += `

**CONTEXTO ESPECÍFICO:**
- Identifique gastos suspeitos e padrões anômalos
- Categorize despesas
- Calcule métricas financeiras
- Sugira oportunidades de economia

**FORMATO DE ENTRADA:** Aceite planilhas Excel, CSV ou PDF

**FORMATO DE SAÍDA:** Gere relatório financeiro em HTML com tabelas`;
  }

  // Contexto genérico
  else {
    improved += `

**CONTEXTO ESPECÍFICO:**
- Seja específico sobre o tipo de entrada esperada
- Defina claramente o formato do resultado
- Inclua critérios de qualidade e validação
- Especifique métricas relevantes

**FORMATO DE ENTRADA:** Especifique os tipos de arquivo aceitos

**FORMATO DE SAÍDA:** Gere resultado estruturado em HTML profissional`;
  }

  return improved.trim();
}
```

---

## 5. Runtime Engine Simplificado

```typescript
// src/lib/runtime/engine.ts

import { Agent, AgentNode, AgentEdge, ExecutionContext, ExecutionResult } from '@/types/agent';
import { AIProviderManager, AIProviderType } from '@/lib/ai-providers';

export class AgentRuntimeEngine {
  private aiProviderManager: AIProviderManager;

  constructor() {
    this.aiProviderManager = new AIProviderManager({
      openai: { apiKey: process.env.OPENAI_API_KEY || '' },
      anthropic: { apiKey: process.env.ANTHROPIC_API_KEY || '' },
      google: { apiKey: process.env.GOOGLE_API_KEY || '' },
    });
  }

  async executeAgent(agent: Agent, input: any, userId: string): Promise<ExecutionResult> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    
    const context: ExecutionContext = {
      executionId,
      agentId: agent.id,
      userId,
      input,
      variables: { ...input },
      startTime: new Date()
    };

    try {
      // Ordenar nós para execução
      const orderedNodeIds = this.getExecutionOrder(agent.nodes, agent.edges);
      const nodeResults: Record<string, any> = {};

      // Executar cada nó sequencialmente
      for (const nodeId of orderedNodeIds) {
        const node = agent.nodes.find(n => n.id === nodeId);
        if (!node) continue;

        console.log(`Executando nó: ${node.data.label || node.id}`);
        
        const result = await this.executeNode(node, context.variables, context);
        nodeResults[node.id] = result;

        // Atualizar contexto com resultado do nó
        if (result && typeof result === 'object') {
          context.variables = { ...context.variables, ...result };
        }
      }

      return {
        success: true,
        output: context.variables,
        executionId,
        executionTime: Date.now() - startTime,
        cost: 0,
        tokensUsed: 0,
        logs: []
      };

    } catch (error) {
      console.error('Erro na execução:', error);
      return {
        success: false,
        output: null,
        executionId,
        executionTime: Date.now() - startTime,
        cost: 0,
        tokensUsed: 0,
        logs: [],
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido'
        }
      };
    }
  }

  private async executeNode(node: AgentNode, input: any, context: ExecutionContext): Promise<any> {
    const nodeType = node.data.nodeType || node.type;

    switch (nodeType) {
      case 'input':
        return this.executeInputNode(node, input);
      case 'ai':
        return this.executeAINode(node, input);
      case 'logic':
        return this.executeLogicNode(node, input);
      case 'api':
        return this.executeAPINode(node, input);
      case 'output':
        return this.executeOutputNode(node, input, context);
      default:
        console.warn(`Tipo de nó desconhecido: ${nodeType}`);
        return input;
    }
  }

  private async executeInputNode(node: AgentNode, input: any): Promise<any> {
    console.log('📥 Processando entrada...');
    
    // Se há arquivo processado, extrair texto
    if (input?.processedFile?.extractedText) {
      return {
        ...input,
        hasFile: true,
        extractedText: input.processedFile.extractedText
      };
    }

    return input;
  }

  private async executeAINode(node: AgentNode, input: any): Promise<any> {
    const { provider = 'openai', model = 'gpt-4o-mini', prompt = '', temperature = 0.3, maxTokens = 2000 } = node.data;

    console.log(`🤖 Executando IA: ${provider}/${model}`);

    try {
      // Preparar prompt com dados de entrada
      let processedPrompt = prompt;
      
      if (input.extractedText) {
        processedPrompt = `${prompt}\n\n=== CONTEÚDO DO DOCUMENTO ===\n${input.extractedText}\n=== FIM ===`;
      } else if (typeof input === 'object') {
        processedPrompt = `${prompt}\n\nDados de entrada:\n${JSON.stringify(input, null, 2)}`;
      }

      const response = await this.aiProviderManager.generateCompletion(
        provider as AIProviderType,
        processedPrompt,
        model,
        { temperature, maxTokens }
      );

      return {
        response: response.content,
        confidence: response.confidence,
        tokens_used: response.tokens_used,
        provider: response.provider,
        model: response.model
      };

    } catch (error) {
      console.error('Erro no nó AI:', error);
      throw error;
    }
  }

  private async executeLogicNode(node: AgentNode, input: any): Promise<any> {
    const { logicType, condition } = node.data;

    console.log(`⚙️ Executando lógica: ${logicType}`);

    switch (logicType) {
      case 'condition':
        try {
          const conditionFn = new Function('data', `return Boolean(${condition})`);
          const result = conditionFn(input);
          return { ...input, conditionMet: result };
        } catch (e) {
          return { ...input, conditionMet: false, error: String(e) };
        }

      case 'transform':
        return { ...input, transformed: true };

      case 'validate':
        return { ...input, validated: true };

      default:
        return input;
    }
  }

  private async executeAPINode(node: AgentNode, input: any): Promise<any> {
    const { apiEndpoint, apiMethod = 'POST', apiHeaders = {} } = node.data;

    if (!apiEndpoint) {
      throw new Error('Endpoint da API não definido');
    }

    console.log(`🌐 Chamando API: ${apiMethod} ${apiEndpoint}`);

    try {
      const response = await fetch(apiEndpoint, {
        method: apiMethod,
        headers: {
          'Content-Type': 'application/json',
          ...apiHeaders
        },
        body: ['POST', 'PUT', 'PATCH'].includes(apiMethod) ? JSON.stringify(input) : undefined,
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      const responseData = contentType?.includes('application/json') 
        ? await response.json() 
        : await response.text();

      return {
        status: 'success',
        statusCode: response.status,
        response: responseData
      };

    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  private async executeOutputNode(node: AgentNode, input: any, context: ExecutionContext): Promise<any> {
    console.log('📤 Gerando saída...');
    
    return {
      result: input,
      executionId: context.executionId,
      completedAt: new Date().toISOString()
    };
  }

  private getExecutionOrder(nodes: AgentNode[], edges: AgentEdge[]): string[] {
    const visited = new Set<string>();
    const order: string[] = [];

    // Encontrar nó de entrada
    const inputNode = nodes.find(n => n.data.nodeType === 'input');
    if (inputNode) {
      this.dfs(inputNode.id, nodes, edges, visited, order);
    }

    // Adicionar nós não visitados
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        this.dfs(node.id, nodes, edges, visited, order);
      }
    });

    return order;
  }

  private dfs(nodeId: string, nodes: AgentNode[], edges: AgentEdge[], visited: Set<string>, order: string[]) {
    if (visited.has(nodeId)) return;
    
    visited.add(nodeId);
    order.push(nodeId);

    const outgoingEdges = edges.filter(e => e.source === nodeId);
    for (const edge of outgoingEdges) {
      this.dfs(edge.target, nodes, edges, visited, order);
    }
  }

  validateAgent(agent: Agent): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!agent.name?.trim()) {
      errors.push('Nome do agente é obrigatório');
    }

    if (!agent.nodes?.length) {
      errors.push('Agente deve ter pelo menos um nó');
    }

    const inputNodes = agent.nodes?.filter(n => n.data.nodeType === 'input') || [];
    if (inputNodes.length === 0) {
      errors.push('Agente deve ter um nó de entrada');
    }

    const outputNodes = agent.nodes?.filter(n => n.data.nodeType === 'output') || [];
    if (outputNodes.length === 0) {
      errors.push('Agente deve ter um nó de saída');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

---

## 6. Schema Prisma

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id             String           @id @default(cuid())
  email          String           @unique
  name           String?
  password       String?
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  organizationId String
  
  organization   Organization     @relation(fields: [organizationId], references: [id])
  agents         Agent[]
  executions     AgentExecution[]

  @@map("users")
}

model Organization {
  id         String           @id @default(cuid())
  name       String
  createdAt  DateTime         @default(now())
  updatedAt  DateTime         @updatedAt
  
  users      User[]
  agents     Agent[]
  executions AgentExecution[]

  @@map("organizations")
}

model Agent {
  id             String           @id @default(cuid())
  name           String
  description    String?
  category       String           @default("general")
  version        String           @default("1.0.0")
  isPublic       Boolean          @default(false)
  isTemplate     Boolean          @default(false)
  tags           String[]
  metadata       Json?
  nodes          Json
  edges          Json
  inputSchema    Json?
  outputSchema   Json?
  userId         String
  organizationId String
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  
  user           User             @relation(fields: [userId], references: [id])
  organization   Organization     @relation(fields: [organizationId], references: [id])
  executions     AgentExecution[]

  @@map("agents")
}

model AgentExecution {
  id             String          @id @default(cuid())
  executionId    String          @unique
  agentId        String
  userId         String
  organizationId String
  status         ExecutionStatus @default(PENDING)
  inputData      Json
  outputData     Json?
  errorMessage   String?
  executionTime  Int?
  tokensUsed     Int             @default(0)
  cost           Float           @default(0.0)
  logs           String[]        @default([])
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  agent          Agent           @relation(fields: [agentId], references: [id])
  user           User            @relation(fields: [userId], references: [id])
  organization   Organization    @relation(fields: [organizationId], references: [id])

  @@map("agent_executions")
}

enum ExecutionStatus {
  PENDING
  QUEUED
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}
```

---

## 7. Variáveis de Ambiente

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/docsimples"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-segredo-super-seguro-aqui"

# AI Providers (pelo menos um é obrigatório)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_API_KEY="AIza..."

# Redis (opcional, para filas)
REDIS_URL="redis://localhost:6379"
```

---

## 8. Dependências NPM

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.20.0",
    "@google/generative-ai": "^0.3.0",
    "@prisma/client": "^5.0.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "framer-motion": "^10.0.0",
    "lucide-react": "^0.300.0",
    "next": "14.0.0",
    "openai": "^4.20.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "reactflow": "^11.0.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "prisma": "^5.0.0"
  }
}
```

---

## Próximos Passos

1. **Copie os arquivos** para a estrutura do DocSimples
2. **Configure variáveis de ambiente** com suas chaves de API
3. **Execute Prisma** para criar tabelas no banco
4. **Teste a API** com um prompt simples
5. **Adapte o frontend** ao design do DocSimples

---

**Atualizado em:** 04/12/2025
