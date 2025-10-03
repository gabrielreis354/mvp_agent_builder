import axios from 'axios'
import { Agent, AgentExecution, AIProvider } from '@/types/agent'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// Request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const agentAPI = {
  // Agent CRUD operations
  async createAgent(agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agent> {
    const response = await api.post('/agents', agent)
    return response.data
  },

  async getAgents(): Promise<Agent[]> {
    const response = await api.get('/agents')
    return response.data
  },

  async getAgent(id: string): Promise<Agent> {
    const response = await api.get(`/agents/${id}`)
    return response.data
  },

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
    const response = await api.put(`/agents/${id}`, updates)
    return response.data
  },

  async deleteAgent(id: string): Promise<void> {
    await api.delete(`/agents/${id}`)
  },

  // Agent execution
  async executeAgent(agentId: string, input: any): Promise<AgentExecution> {
    const response = await api.post(`/agents/${agentId}/execute`, { input })
    return response.data
  },

  async getExecution(executionId: string): Promise<AgentExecution> {
    const response = await api.get(`/executions/${executionId}`)
    return response.data
  },

  async getExecutions(agentId?: string): Promise<AgentExecution[]> {
    const url = agentId ? `/executions?agentId=${agentId}` : '/executions'
    const response = await api.get(url)
    return response.data
  },

  // Natural language generation
  async generateAgentFromPrompt(prompt: string): Promise<Agent> {
    const response = await api.post('/agents/generate', { prompt })
    return response.data
  },

  async refineAgent(agentId: string, refinement: string): Promise<Agent> {
    const response = await api.post(`/agents/${agentId}/refine`, { refinement })
    return response.data
  },

  // AI providers
  async getProviders(): Promise<AIProvider[]> {
    const response = await api.get('/providers')
    return response.data
  },

  async testProvider(providerId: string, model: string, prompt: string): Promise<any> {
    const response = await api.post('/providers/test', {
      providerId,
      model,
      prompt
    })
    return response.data
  },

  // Cost tracking
  async getCostAnalysis(agentId?: string, timeRange?: string): Promise<any> {
    const params = new URLSearchParams()
    if (agentId) params.append('agentId', agentId)
    if (timeRange) params.append('timeRange', timeRange)
    
    const response = await api.get(`/analytics/costs?${params}`)
    return response.data
  },

  // Performance metrics
  async getPerformanceMetrics(agentId?: string): Promise<any> {
    const url = agentId ? `/analytics/performance?agentId=${agentId}` : '/analytics/performance'
    const response = await api.get(url)
    return response.data
  }
}

export const llmAPI = {
  // Direct LLM calls for testing
  async callLLM(provider: string, model: string, prompt: string, options: any = {}): Promise<any> {
    const response = await api.post('/llm/call', {
      provider,
      model,
      prompt,
      ...options
    })
    return response.data
  },

  // Multi-AI routing
  async routeRequest(prompt: string, taskType?: string): Promise<{
    provider: string
    model: string
    reasoning: string
    estimatedCost: number
  }> {
    const response = await api.post('/llm/route', {
      prompt,
      taskType
    })
    return response.data
  },

  // Batch processing
  async batchProcess(requests: Array<{
    provider: string
    model: string
    prompt: string
    options?: any
  }>): Promise<any[]> {
    const response = await api.post('/llm/batch', { requests })
    return response.data
  }
}

export const workflowAPI = {
  // Workflow validation
  async validateWorkflow(nodes: any[], edges: any[]): Promise<{
    isValid: boolean
    errors: string[]
    warnings: string[]
    suggestions: string[]
  }> {
    const response = await api.post('/workflow/validate', { nodes, edges })
    return response.data
  },

  // Workflow optimization
  async optimizeWorkflow(nodes: any[], edges: any[]): Promise<{
    optimizedNodes: any[]
    optimizedEdges: any[]
    improvements: string[]
    costReduction: number
  }> {
    const response = await api.post('/workflow/optimize', { nodes, edges })
    return response.data
  },

  // Workflow templates
  async getTemplates(category?: string): Promise<any[]> {
    const url = category ? `/workflow/templates?category=${category}` : '/workflow/templates'
    const response = await api.get(url)
    return response.data
  },

  async createTemplate(template: any): Promise<any> {
    const response = await api.post('/workflow/templates', template)
    return response.data
  }
}

export default api
