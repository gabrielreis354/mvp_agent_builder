/**
 * Types para AgentKit - Agentes Conversacionais
 * Fase 1: Implementação de agentes com memória e contexto
 */

export interface ConversationalAgent {
  id: string
  name: string
  instructions: string
  model: string
  tools?: AgentTool[]
  memoryEnabled: boolean
}

export interface AgentTool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, any>
      required?: string[]
    }
  }
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: Date
  metadata?: {
    tokensUsed?: number
    toolsCalled?: string[]
    executionTime?: number
    executionId?: string
    executed?: boolean
    missingInfo?: string[]
    validationErrors?: string[]
  }
}

export interface Thread {
  id: string
  userId: string
  agentId: string
  title?: string
  status: 'active' | 'archived' | 'completed'
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatRequest {
  threadId?: string  // Opcional: criar novo ou continuar existente
  agentId: string
  message: string
  userId: string
}

export interface ChatResponse {
  threadId: string
  message: ChatMessage
  suggestions?: string[]  // Sugestões de próximas perguntas
}

export interface MemorySearchResult {
  content: string
  metadata: Record<string, any>
  score?: number
}
