# 🤖 Guia de Implementação: Criação de Agentes via Linguagem Natural no DocSimples

**Versão:** 1.0.0  
**Data:** 04/12/2025  
**Baseado em:** SimplifiqueIA RH (mvp-agent-builder)

---

## 📋 Índice

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Componentes Principais](#2-componentes-principais)
3. [Fluxo de Criação de Agentes](#3-fluxo-de-criação-de-agentes)
4. [Implementação Passo a Passo](#4-implementação-passo-a-passo)
5. [Estruturas de Dados](#5-estruturas-de-dados)
6. [Endpoints da API](#6-endpoints-da-api)
7. [Sistema de Templates](#7-sistema-de-templates)
8. [Engine de Execução](#8-engine-de-execução)
9. [Integração com Provedores de IA](#9-integração-com-provedores-de-ia)
10. [Banco de Dados](#10-banco-de-dados)
11. [UI/UX - Componentes Frontend](#11-uiux---componentes-frontend)
12. [Checklist de Implementação](#12-checklist-de-implementação)

---

## 1. Visão Geral da Arquitetura

### 1.1 Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DocSimples - Agent Builder                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐            │
│  │   Templates  │   │    Visual    │   │   Natural    │            │
│  │   Gallery    │   │    Canvas    │   │   Language   │            │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘            │
│         │                  │                  │                     │
│         └─────────────────┬┘──────────────────┘                     │
│                           │                                         │
│                  ┌────────▼────────┐                               │
│                  │  Agent Builder  │                               │
│                  │   (Orchestrator)│                               │
│                  └────────┬────────┘                               │
│                           │                                         │
│         ┌─────────────────┼─────────────────┐                      │
│         │                 │                 │                      │
│  ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐              │
│  │ AI Provider │   │   Runtime   │   │   Agent     │              │
│  │   Manager   │   │   Engine    │   │  Repository │              │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘              │
│         │                 │                 │                      │
│  ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐              │
│  │  OpenAI     │   │   Node      │   │  PostgreSQL │              │
│  │  Anthropic  │   │  Executor   │   │   Prisma    │              │
│  │  Google     │   │             │   │             │              │
│  └─────────────┘   └─────────────┘   └─────────────┘              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Stack Tecnológica Recomendada

| Camada | Tecnologia | Descrição |
|--------|------------|-----------|
| **Frontend** | Next.js 14 + React 18 | Framework para aplicação |
| **Componentes** | shadcn/ui + Tailwind CSS | UI components e estilos |
| **State Management** | React Context/Zustand | Estado da aplicação |
| **Canvas Visual** | React Flow | Editor visual de nós |
| **Backend** | Next.js API Routes | Endpoints da API |
| **Database** | PostgreSQL + Prisma | Persistência de dados |
| **IA** | OpenAI, Anthropic, Google | Provedores de IA |
| **Filas** | Redis + BullMQ (opcional) | Processamento assíncrono |

---

## 2. Componentes Principais

### 2.1 Estrutura de Diretórios Recomendada

```
src/
├── app/
│   ├── api/
│   │   ├── agents/
│   │   │   ├── route.ts                    # CRUD de agentes
│   │   │   ├── generate-from-nl/
│   │   │   │   └── route.ts               # Geração via linguagem natural
│   │   │   ├── execute/
│   │   │   │   └── route.ts               # Execução de agentes
│   │   │   └── [id]/
│   │   │       ├── route.ts               # Operações por ID
│   │   │       └── execute/
│   │   │           └── route.ts           # Execução por ID
│   │   └── prompts/
│   │       └── improve/
│   │           └── route.ts               # Melhoria de prompts
│   ├── (app)/
│   │   └── builder/
│   │       └── page.tsx                   # Página do builder
│   └── page.tsx
├── components/
│   └── agent-builder/
│       ├── agent-builder.tsx              # Componente principal
│       ├── natural-language-builder.tsx   # Interface de linguagem natural
│       ├── template-gallery.tsx           # Galeria de templates
│       ├── visual-canvas.tsx              # Editor visual
│       ├── custom-node.tsx                # Nós customizados
│       ├── node-palette.tsx               # Paleta de nós
│       ├── save-agent-dialog.tsx          # Dialog de salvar
│       └── agent-execution-modal.tsx      # Modal de execução
├── lib/
│   ├── ai-providers/
│   │   ├── index.ts                       # AIProviderManager
│   │   ├── openai.ts                      # Provider OpenAI
│   │   ├── anthropic.ts                   # Provider Anthropic
│   │   └── google.ts                      # Provider Google
│   ├── runtime/
│   │   └── engine.ts                      # Motor de execução
│   ├── database/
│   │   ├── prisma.ts                      # Cliente Prisma
│   │   └── repositories/
│   │       └── agent-repository.ts        # Repository de agentes
│   └── templates.ts                       # Templates pré-definidos
├── types/
│   └── agent.ts                           # Tipos TypeScript
└── prisma/
    └── schema.prisma                      # Schema do banco
```

---

## 3. Fluxo de Criação de Agentes

### 3.1 Fluxo via Linguagem Natural

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO: LINGUAGEM NATURAL                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. ENTRADA DO USUÁRIO                                          │
│     ┌─────────────────────────────────────────────────────┐     │
│     │ "Crie um agente que analisa contratos de trabalho   │     │
│     │  e extrai informações sobre salário e benefícios"   │     │
│     └────────────────────────┬────────────────────────────┘     │
│                              │                                   │
│  2. MELHORIA DE PROMPT (OPCIONAL)                               │
│     ┌────────────────────────▼────────────────────────────┐     │
│     │ API: /api/prompts/improve                           │     │
│     │ - Adiciona contexto específico do domínio           │     │
│     │ - Especifica formatos de entrada/saída              │     │
│     │ - Define estrutura do resultado esperado            │     │
│     └────────────────────────┬────────────────────────────┘     │
│                              │                                   │
│  3. GERAÇÃO DO AGENTE                                           │
│     ┌────────────────────────▼────────────────────────────┐     │
│     │ API: /api/agents/generate-from-nl                   │     │
│     │ - Envia prompt para IA (Anthropic/OpenAI/Google)    │     │
│     │ - IA retorna estrutura JSON do agente               │     │
│     │ - Valida e processa resposta                        │     │
│     └────────────────────────┬────────────────────────────┘     │
│                              │                                   │
│  4. ESTRUTURA DO AGENTE GERADA                                  │
│     ┌────────────────────────▼────────────────────────────┐     │
│     │ {                                                    │     │
│     │   "name": "Analisador de Contratos",                 │     │
│     │   "nodes": [...],                                    │     │
│     │   "edges": [...]                                     │     │
│     │ }                                                    │     │
│     └────────────────────────┬────────────────────────────┘     │
│                              │                                   │
│  5. VISUALIZAÇÃO NO CANVAS                                      │
│     ┌────────────────────────▼────────────────────────────┐     │
│     │ - Usuário visualiza fluxo gerado                    │     │
│     │ - Pode editar visualmente (drag-and-drop)           │     │
│     │ - Configura nós individualmente                     │     │
│     └────────────────────────┬────────────────────────────┘     │
│                              │                                   │
│  6. SALVAR E EXECUTAR                                           │
│     ┌────────────────────────▼────────────────────────────┐     │
│     │ - Salva no banco de dados                           │     │
│     │ - Executa com dados reais                           │     │
│     │ - Gera relatórios                                   │     │
│     └─────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Implementação Passo a Passo

### Fase 1: Estruturas de Dados Base

#### 4.1.1 Criar tipos TypeScript (`src/types/agent.ts`)

```typescript
// Tipos para os nós do agente
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

// Tipos para as conexões entre nós
export interface AgentEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
}

// Tipo principal do agente
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

// Tipos para execução
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

// Tipos para provedores de IA
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

// Tipos para templates
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

// Tipos para requisições de linguagem natural
export interface NaturalLanguageRequest {
  id: string;
  prompt: string;
  generatedAgent?: Agent;
  status: 'processing' | 'completed' | 'failed';
  suggestions?: string[];
  refinements?: string[];
}

// Tipos para resultados de execução
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
```

### Fase 2: API de Geração via Linguagem Natural

#### 4.2.1 Endpoint Principal (`src/app/api/agents/generate-from-nl/route.ts`)

```typescript
import { NextResponse } from 'next/server';
import { AIProviderManager } from '@/lib/ai-providers';

export async function POST(request: Request) {
  const { prompt } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  try {
    // Inicializar gerenciador de IA com fallback automático
    const aiManager = new AIProviderManager({
      anthropic: { apiKey: process.env.ANTHROPIC_API_KEY || '' },
      openai: { apiKey: process.env.OPENAI_API_KEY || '' },
      google: { apiKey: process.env.GOOGLE_API_KEY || '' },
    });

    // System prompt especializado para geração de agentes
    const systemPrompt = `
      Você é um arquiteto de sistemas que traduz requisitos de negócios em fluxos de trabalho JSON detalhados.

      **PROCESSO DE PENSAMENTO OBRIGATÓRIO (Chain of Thought):**
      1. **DECOMPOR**: Analise o prompt do usuário e decomponha em passos lógicos e sequenciais.
      2. **MAPEAMENTO DE NÓS**: Para cada passo, crie um nó JSON correspondente ('input', 'ai', 'logic', 'api', 'output').
      3. **CONSTRUIR JSON**: Monte o objeto JSON final com 'name', 'nodes' e 'edges'.

      **REGRAS ESTRITAS:**
      - **NÃO SIMPLIFIQUE**: Se o usuário pedir 5 passos, crie pelo menos 5 nós de processamento.
      - **PROMPTS INTERNOS**: Para cada nó 'ai', gere um campo 'prompt' específico e claro.
      - **LÓGICA EXPLÍCITA**: Para cada nó 'logic', defina o campo 'condition' claramente.
      - **SCHEMA DE ENTRADA**: Para o nó 'input', gere sempre um 'inputSchema' descritivo.
      - **NOME GERADO**: O campo 'name' deve ser um título descritivo criado por você.
      - **SAÍDA LIMPA**: Responda APENAS com o objeto JSON final.

      **ESTRUTURA ESPERADA:**
      {
        "name": "Nome descritivo do agente",
        "nodes": [
          {
            "id": "node-1",
            "type": "customNode",
            "position": { "x": 100, "y": 200 },
            "data": {
              "label": "Nome do nó",
              "nodeType": "input|ai|logic|api|output",
              "prompt": "Para nós AI",
              "inputSchema": { /* Para nós input */ }
            }
          }
        ],
        "edges": [
          { "id": "edge-1", "source": "node-1", "target": "node-2" }
        ]
      }
    `;

    // Gerar agente usando IA com fallback automático
    const response = await aiManager.generateCompletion(
      'anthropic', // Preferência inicial
      `**PROMPT DO USUÁRIO:**\n${prompt}`,
      'claude-3-5-haiku-20241022',
      {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 4096,
        enableFallback: true
      }
    );

    console.log(`✅ Agente gerado usando: ${response.provider} (${response.model})`);

    // Limpar e parsear resposta JSON
    let jsonString = response.content;
    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').replace(/\n/g, '');
    
    const generatedJson = JSON.parse(jsonString);

    // Validação e correção do Input Schema
    if (generatedJson.nodes && Array.isArray(generatedJson.nodes)) {
      generatedJson.nodes.forEach((node: any) => {
        if (node.data && node.data.nodeType === 'input') {
          const label = node.data.label.toLowerCase();
          if (label.includes('arquivo') || label.includes('pdf') || label.includes('upload')) {
            if (node.data.inputSchema && node.data.inputSchema.properties) {
              for (const key in node.data.inputSchema.properties) {
                node.data.inputSchema.properties[key].type = 'string';
                node.data.inputSchema.properties[key].format = 'binary';
              }
            }
          }
        }
      });
    }

    // Validação básica da estrutura
    if (!generatedJson.name || !generatedJson.nodes || !generatedJson.edges) {
      throw new Error('Invalid JSON structure returned from AI');
    }

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
    console.error('Error generating agent:', error);
    return NextResponse.json({ 
      error: 'Failed to generate agent',
      details: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Tente reformular sua descrição ou use o builder visual.'
    }, { status: 500 });
  }
}
```

#### 4.2.2 Endpoint de Melhoria de Prompt (`src/app/api/prompts/improve/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt é obrigatório' },
        { status: 400 }
      )
    }

    const improvedPrompt = improvePromptLocally(prompt)

    return NextResponse.json({
      success: true,
      originalPrompt: prompt,
      improvedPrompt,
      improvements: [
        'Adicionado contexto específico para o domínio',
        'Especificado formato de entrada e saída',
        'Incluído critérios de qualidade',
        'Definido estrutura do resultado'
      ]
    })

  } catch (error) {
    console.error('Erro ao melhorar prompt:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function improvePromptLocally(originalPrompt: string): string {
  const prompt = originalPrompt.toLowerCase()
  let improved = originalPrompt

  // Detectar tipo de documento e adicionar contexto específico
  if (prompt.includes('contrato') || prompt.includes('jurídico')) {
    improved += `

**CONTEXTO ESPECÍFICO:**
- Extraia informações como partes envolvidas, valores, prazos, cláusulas importantes
- Identifique riscos e pontos de não conformidade
- Forneça recomendações de melhorias

**FORMATO DE ENTRADA:** Aceite arquivos PDF, DOC ou DOCX

**FORMATO DE SAÍDA:** Gere relatório HTML estruturado para visualização profissional`
  } else if (prompt.includes('currículo') || prompt.includes('cv')) {
    improved += `

**CONTEXTO ESPECÍFICO:**
- Analise experiência profissional, formação, habilidades
- Forneça pontuação de 0-100 com recomendação

**FORMATO DE ENTRADA:** Aceite arquivos PDF, DOC ou DOCX

**FORMATO DE SAÍDA:** Gere relatório de triagem estruturado em HTML`
  }
  // Adicionar mais contextos conforme o domínio...

  return improved.trim()
}
```

### Fase 3: Componente Frontend - Natural Language Builder

#### 4.3.1 Componente Principal (`src/components/agent-builder/natural-language-builder.tsx`)

```typescript
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Brain, Sparkles, Loader2, Wand2 } from 'lucide-react'
import { Agent, AgentNode, AgentEdge } from '@/types/agent'
import { Button } from '@/components/ui/button'

interface Message {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  agent?: Partial<Agent>
}

interface NaturalLanguageBuilderProps {
  onAgentGenerated: (agent: Partial<Agent>) => void
}

const examplePrompts = [
  "Crie um agente que analisa contratos e extrai informações importantes",
  "Automatize a triagem de currículos com pontuação automática",
  "Processe documentos e gere relatórios em PDF",
]

export function NaturalLanguageBuilder({ onAgentGenerated }: NaturalLanguageBuilderProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'Olá! Descreva o que você gostaria de automatizar e eu criarei um agente personalizado.',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleImprovePrompt = async () => {
    if (!input.trim() || isImprovingPrompt) return
    setIsImprovingPrompt(true)

    try {
      const response = await fetch('/api/prompts/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input })
      })

      if (response.ok) {
        const data = await response.json()
        setInput(data.improvedPrompt)
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'system',
          content: '💡 Prompt melhorado! Quanto mais específico, melhor o agente gerado.',
          timestamp: new Date()
        }])
      }
    } catch (error) {
      console.error('Erro ao melhorar prompt:', error)
    } finally {
      setIsImprovingPrompt(false)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/agents/generate-from-nl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentInput }),
      })

      if (!response.ok) {
        throw new Error('Falha ao gerar agente')
      }

      const agentStructure = await response.json()

      const generatedAgent: Partial<Agent> = {
        name: agentStructure.name,
        description: currentInput,
        nodes: agentStructure.nodes,
        edges: agentStructure.edges,
        status: 'draft',
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'assistant',
        content: `Agente criado com ${generatedAgent.nodes?.length} nós! Clique em "Usar Agente" para visualizar e executar.`,
        timestamp: new Date(),
        agent: generatedAgent,
      }])

    } catch (error) {
      console.error('Erro ao gerar agente:', error)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Erro ao gerar o agente. Tente reformular sua solicitação.',
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-purple-500" />
          <div>
            <h2 className="text-xl font-semibold text-white">Criação por Linguagem Natural</h2>
            <p className="text-gray-400">Descreva o que precisa e a IA criará seu agente</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl rounded-lg p-4 ${
                message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
              }`}>
                <p className="text-sm">{message.content}</p>
                
                {message.agent && (
                  <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-white">{message.agent.name}</h4>
                        <p className="text-xs text-gray-400">{message.agent.nodes?.length} nós</p>
                      </div>
                      <Button
                        onClick={() => message.agent && onAgentGenerated(message.agent)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Usar Agente
                      </Button>
                    </div>
                    
                    {/* Preview do fluxo */}
                    <div className="flex items-center gap-2 text-xs">
                      {message.agent.nodes?.map((node, index) => (
                        <React.Fragment key={node.id}>
                          <span className={`px-2 py-1 rounded ${
                            node.data.nodeType === 'input' ? 'bg-blue-900/50 text-blue-300' :
                            node.data.nodeType === 'ai' ? 'bg-purple-900/50 text-purple-300' :
                            'bg-green-900/50 text-green-300'
                          }`}>
                            {node.data.label}
                          </span>
                          {index < (message.agent?.nodes?.length ?? 0) - 1 && (
                            <span className="text-gray-500">→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-purple-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Criando seu agente...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Examples */}
      {messages.length === 1 && (
        <div className="p-6 border-t border-gray-700">
          <p className="text-sm text-gray-400 mb-3">Exemplos para começar:</p>
          <div className="grid gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => setInput(example)}
                className="text-left p-3 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-gray-300"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-6 border-t border-gray-700">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Descreva o agente que você gostaria de criar..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
              rows={3}
              disabled={isLoading}
            />
            
            {input.trim() && (
              <Button
                onClick={handleImprovePrompt}
                disabled={isImprovingPrompt}
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 h-8 px-3 bg-purple-600/20 border-purple-500/30 text-purple-300"
              >
                {isImprovingPrompt ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Wand2 className="h-3 w-3" />
                )}
                <span className="ml-1 text-xs">Melhorar</span>
              </Button>
            )}
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="px-6 bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
```

---

## 5. Estruturas de Dados

### 5.1 Tipos de Nós Disponíveis

| Tipo | Descrição | Campos Obrigatórios |
|------|-----------|---------------------|
| `input` | Recebe dados de entrada | `inputSchema` |
| `ai` | Processa com IA | `provider`, `model`, `prompt` |
| `logic` | Lógica condicional | `logicType`, `condition` |
| `api` | Chamada a API externa | `apiEndpoint`, `apiMethod` |
| `output` | Saída/resultado | `outputSchema` |

### 5.2 Exemplo de Estrutura de Agente Completo

```json
{
  "id": "agent-123",
  "name": "Analisador de Contratos",
  "description": "Analisa contratos trabalhistas e extrai informações",
  "category": "juridico",
  "version": "1.0.0",
  "status": "published",
  "nodes": [
    {
      "id": "input-1",
      "type": "customNode",
      "position": { "x": 100, "y": 100 },
      "data": {
        "label": "Upload Contrato PDF",
        "nodeType": "input",
        "inputSchema": {
          "type": "object",
          "properties": {
            "file": {
              "type": "string",
              "format": "binary",
              "description": "Arquivo PDF do contrato"
            }
          },
          "required": ["file"]
        }
      }
    },
    {
      "id": "ai-1",
      "type": "customNode",
      "position": { "x": 300, "y": 100 },
      "data": {
        "label": "Análise Jurídica",
        "nodeType": "ai",
        "provider": "openai",
        "model": "gpt-4o-mini",
        "temperature": 0.2,
        "maxTokens": 2500,
        "prompt": "Analise o contrato e extraia: partes, salário, cláusulas importantes, riscos."
      }
    },
    {
      "id": "output-1",
      "type": "customNode",
      "position": { "x": 500, "y": 100 },
      "data": {
        "label": "Relatório HTML",
        "nodeType": "output",
        "outputSchema": {
          "type": "object",
          "properties": {
            "relatorio": { "type": "string", "format": "html" },
            "dados_extraidos": { "type": "object" }
          }
        }
      }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "input-1", "target": "ai-1" },
    { "id": "e2-3", "source": "ai-1", "target": "output-1" }
  ],
  "tags": ["contratos", "juridico", "gpt-4"]
}
```

---

## 6. Endpoints da API

### 6.1 Resumo dos Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/agents/generate-from-nl` | Gera agente via linguagem natural |
| `POST` | `/api/prompts/improve` | Melhora prompt do usuário |
| `GET` | `/api/agents` | Lista agentes do usuário |
| `POST` | `/api/agents` | Cria novo agente |
| `GET` | `/api/agents/[id]` | Busca agente por ID |
| `PUT` | `/api/agents/[id]` | Atualiza agente |
| `DELETE` | `/api/agents/[id]` | Remove agente |
| `POST` | `/api/agents/execute` | Executa agente |
| `POST` | `/api/agents/[id]/execute` | Executa agente específico |

---

## 7. Sistema de Templates

### 7.1 Estrutura de Template

```typescript
// src/lib/templates.ts
import { AgentTemplate } from '@/types/agent'

export const agentTemplates: AgentTemplate[] = [
  {
    id: 'contract-analyzer',
    name: 'Analisador de Contratos',
    description: 'Analisa contratos e gera relatórios de conformidade',
    category: 'Jurídico',
    useCase: 'Automatizar análise de contratos com relatórios detalhados',
    difficulty: 'intermediate',
    estimatedTime: '3-5 min',
    nodes: [
      // ... definição dos nós
    ],
    edges: [
      // ... definição das conexões
    ],
    tags: ['contratos', 'juridico', 'pdf'],
    preview: 'Input → AI → Output'
  },
  // ... mais templates
]
```

---

## 8. Engine de Execução

### 8.1 Classe AgentRuntimeEngine

A engine de execução é responsável por:
1. Ordenar nós topologicamente (ordem de execução)
2. Executar cada nó sequencialmente
3. Passar dados entre nós
4. Registrar logs de execução
5. Tratar erros

```typescript
// src/lib/runtime/engine.ts
export class AgentRuntimeEngine {
  private aiProviderManager: AIProviderManager

  constructor() {
    this.initializeProviders()
  }

  async executeAgent(agent: Agent, input: any, userId: string): Promise<ExecutionResult> {
    const executionId = this.generateExecutionId()
    const context = {
      executionId,
      agentId: agent.id,
      userId,
      input,
      variables: { ...input },
      startTime: new Date()
    }

    try {
      // Ordenar nós para execução
      const orderedNodes = this.getExecutionOrder(agent.nodes, agent.edges)
      const nodeResults: Record<string, any> = {}

      // Executar cada nó
      for (const nodeId of orderedNodes) {
        const node = agent.nodes.find(n => n.id === nodeId)
        if (!node) continue

        const result = await this.executeNode(node, context.variables, context)
        nodeResults[node.id] = result
        
        // Atualizar variáveis do contexto
        if (result && typeof result === 'object') {
          context.variables = { ...context.variables, ...result }
        }
      }

      return {
        executionId,
        success: true,
        output: context.variables,
        executionTime: Date.now() - context.startTime.getTime(),
        nodeResults
      }
    } catch (error) {
      return {
        executionId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - context.startTime.getTime(),
        nodeResults: {}
      }
    }
  }

  private async executeNode(node: AgentNode, input: any, context: any): Promise<any> {
    switch (node.data.nodeType) {
      case 'input':
        return this.executeInputNode(node, input, context)
      case 'ai':
        return this.executeAINode(node, input, context)
      case 'logic':
        return this.executeLogicNode(node, input, context)
      case 'api':
        return this.executeAPINode(node, input, context)
      case 'output':
        return this.executeOutputNode(node, input, context)
      default:
        throw new Error(`Unknown node type: ${node.data.nodeType}`)
    }
  }

  // Métodos de execução de cada tipo de nó...
}
```

---

## 9. Integração com Provedores de IA

### 9.1 AIProviderManager

O gerenciador de provedores suporta:
- **OpenAI**: GPT-4, GPT-4o-mini
- **Anthropic**: Claude 3.5 Haiku, Sonnet
- **Google**: Gemini Pro, Gemini Flash
- **Fallback automático** entre provedores

```typescript
// src/lib/ai-providers/index.ts
export class AIProviderManager {
  private providers: Map<AIProviderType, any> = new Map()

  constructor(config: AIProviderConfig) {
    this.initializeProviders(config)
  }

  async generateCompletion(
    provider: AIProviderType,
    prompt: string,
    model: string,
    options: {
      temperature?: number
      maxTokens?: number
      systemPrompt?: string
      enableFallback?: boolean
    } = {}
  ): Promise<AIResponse> {
    const { enableFallback = true } = options

    // Ordem de fallback otimizada para velocidade
    const fallbackOrder: AIProviderType[] = ['anthropic', 'google', 'openai']
    const providersToTry = provider 
      ? [provider, ...fallbackOrder.filter(p => p !== provider)]
      : fallbackOrder

    for (const currentProvider of providersToTry) {
      const providerInstance = this.providers.get(currentProvider)
      if (!providerInstance) continue

      try {
        const result = await providerInstance.generateCompletion(prompt, model, options)
        return { ...result, provider: currentProvider }
      } catch (error) {
        console.error(`Provider ${currentProvider} failed:`, error)
        if (!enableFallback) throw error
        continue
      }
    }

    throw new Error('All AI providers failed')
  }
}
```

---

## 10. Banco de Dados

### 10.1 Schema Prisma Essencial

```prisma
// prisma/schema.prisma

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
  nodes          Json             // Armazena AgentNode[]
  edges          Json             // Armazena AgentEdge[]
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

## 11. UI/UX - Componentes Frontend

### 11.1 Componentes Essenciais

| Componente | Descrição | Dependências |
|------------|-----------|--------------|
| `AgentBuilder` | Orquestrador principal | Todos os componentes |
| `NaturalLanguageBuilder` | Interface de chat | framer-motion, lucide-react |
| `TemplateGallery` | Galeria de templates | shadcn/ui |
| `VisualCanvas` | Editor visual de nós | react-flow |
| `CustomNode` | Nós customizados | react-flow |
| `NodePalette` | Paleta de nós disponíveis | - |
| `SaveAgentDialog` | Dialog para salvar | shadcn/ui |
| `AgentExecutionModal` | Modal de execução | - |

### 11.2 Dependências NPM

```json
{
  "dependencies": {
    "@reactflow/core": "^11.x",
    "@reactflow/background": "^11.x",
    "@reactflow/controls": "^11.x",
    "@radix-ui/react-dialog": "^1.x",
    "@radix-ui/react-dropdown-menu": "^2.x",
    "framer-motion": "^10.x",
    "lucide-react": "^0.x",
    "zustand": "^4.x"
  }
}
```

---

## 12. Checklist de Implementação

### Fase 1: Fundação (Semana 1-2)
- [ ] Configurar estrutura de diretórios
- [ ] Criar tipos TypeScript (`types/agent.ts`)
- [ ] Configurar Prisma schema
- [ ] Implementar AIProviderManager
- [ ] Criar endpoint `/api/agents/generate-from-nl`

### Fase 2: Backend (Semana 3-4)
- [ ] Implementar AgentRuntimeEngine
- [ ] Criar AgentRepository
- [ ] Implementar endpoint de melhoria de prompt
- [ ] Criar endpoints CRUD de agentes
- [ ] Implementar endpoint de execução

### Fase 3: Frontend - Linguagem Natural (Semana 5-6)
- [ ] Criar componente NaturalLanguageBuilder
- [ ] Implementar chat interface
- [ ] Adicionar preview de agente gerado
- [ ] Implementar botão "Melhorar Prompt"
- [ ] Testar fluxo completo

### Fase 4: Frontend - Visual (Semana 7-8)
- [ ] Integrar React Flow
- [ ] Criar componentes de nós customizados
- [ ] Implementar paleta de nós
- [ ] Criar conexões entre nós
- [ ] Implementar drag-and-drop

### Fase 5: Templates e Execução (Semana 9-10)
- [ ] Criar templates pré-definidos
- [ ] Implementar galeria de templates
- [ ] Criar modal de execução
- [ ] Implementar visualização de resultados
- [ ] Testar execução end-to-end

### Fase 6: Refinamento (Semana 11-12)
- [ ] Otimizar performance
- [ ] Adicionar tratamento de erros
- [ ] Implementar logging detalhado
- [ ] Criar documentação do usuário
- [ ] Testes de integração

---

## 📝 Notas Finais

### Considerações Importantes

1. **Multi-tenancy**: Todos os agentes devem estar associados a uma organização
2. **Segurança**: Validar todas as entradas do usuário
3. **Rate Limiting**: Implementar limites de requisições para APIs de IA
4. **Custos**: Monitorar uso de tokens e custos dos provedores
5. **Fallback**: Sempre ter fallback entre provedores de IA

### Recursos Adicionais

- [Documentação React Flow](https://reactflow.dev/)
- [Documentação OpenAI API](https://platform.openai.com/docs)
- [Documentação Anthropic API](https://docs.anthropic.com/)
- [Documentação Prisma](https://www.prisma.io/docs)

---

**Última Atualização:** 04/12/2025  
**Autor:** Baseado na análise do SimplifiqueIA (mvp-agent-builder)
