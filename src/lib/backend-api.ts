// Backend API integration for connecting to real FastAPI backend
import axios from 'axios'
import { Agent, AgentExecution } from '@/types/agent'

// Create axios instance for backend API
const backendAPI = axios.create({
  baseURL: process.env.BACKEND_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth
backendAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
backendAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Backend API Error:', error)
    return Promise.reject(error)
  }
)

export const backendAgentAPI = {
  // Health check
  async healthCheck(): Promise<any> {
    const response = await backendAPI.get('/health')
    return response.data
  },

  // Auth endpoints
  async login(email: string, password: string): Promise<any> {
    const response = await backendAPI.post('/auth/login', { email, password })
    return response.data
  },

  async register(email: string, password: string, full_name: string): Promise<any> {
    const response = await backendAPI.post('/auth/register', { email, password, full_name })
    return response.data
  },

  async getCurrentUser(): Promise<any> {
    const response = await backendAPI.get('/user/me')
    return response.data
  },

  // Workflow operations (adapted for agents)
  async createWorkflow(agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Promise<any> {
    const workflowData = {
      name: agent.name,
      description: agent.description,
      workflow_type: 'ai_agent',
      steps: agent.nodes?.map((node, index) => ({
        step_order: index + 1,
        step_type: node.type,
        step_name: node.data.label || `Step ${index + 1}`,
        step_config: {
          nodeId: node.id,
          nodeData: node.data,
          position: node.position,
          type: node.type
        }
      })) || []
    }
    
    const response = await backendAPI.post('/workflows/advanced', workflowData)
    return response.data
  },

  async getWorkflows(): Promise<any[]> {
    const response = await backendAPI.get('/workflows')
    return response.data
  },

  async getWorkflow(id: string): Promise<any> {
    const response = await backendAPI.get(`/workflows/${id}`)
    return response.data
  },

  async getWorkflowSteps(id: string): Promise<any[]> {
    const response = await backendAPI.get(`/workflows/${id}/steps`)
    return response.data
  },

  async executeWorkflow(id: string, input: any): Promise<any> {
    const response = await backendAPI.post(`/workflows/${id}/execute/advanced`, {
      input_data: input
    })
    return response.data
  },

  // LLM Router integration
  async callLLM(provider: string, model: string, prompt: string, options: any = {}): Promise<any> {
    // This would integrate with the LLM Router from the backend
    // For now, we'll create a simple wrapper
    const response = await backendAPI.post('/llm/call', {
      provider,
      model,
      prompt,
      max_tokens: options.max_tokens || 1000,
      temperature: options.temperature || 0.7,
      task_type: options.task_type || 'general',
      complexity: options.complexity || 'medium'
    })
    return response.data
  },

  // MCP (Model Context Protocol) endpoints
  async getMCPTools(): Promise<any> {
    const response = await backendAPI.get('/mcp/tools')
    return response.data
  },

  async callMCPTool(toolName: string, params: any = {}): Promise<any> {
    const response = await backendAPI.post(`/mcp/call/${toolName}`, params)
    return response.data
  },

  // Analytics endpoints
  async getAnalyticsSummary(): Promise<any> {
    const response = await backendAPI.get('/analytics/user/summary')
    return response.data
  },

  async trackEvent(eventName: string, properties: any = {}): Promise<any> {
    const response = await backendAPI.post('/analytics/track', {
      event_name: eventName,
      properties
    })
    return response.data
  },

  // Temporal workflow monitoring
  async getTemporalStatus(workflowId: string, temporalWorkflowId: string): Promise<any> {
    const response = await backendAPI.get(`/workflows/${workflowId}/temporal-status?temporal_workflow_id=${temporalWorkflowId}`)
    return response.data
  },

  async terminateTemporalWorkflow(workflowId: string, temporalWorkflowId: string): Promise<any> {
    const response = await backendAPI.post(`/workflows/${workflowId}/temporal-terminate`, {
      temporal_workflow_id: temporalWorkflowId
    })
    return response.data
  },

  // Workflow versioning
  async createWorkflowVersion(workflowId: string, versionData: any): Promise<any> {
    const response = await backendAPI.post(`/workflows/${workflowId}/versions`, versionData)
    return response.data
  },

  async getWorkflowVersions(workflowId: string, includeDrafts: boolean = true): Promise<any> {
    const response = await backendAPI.get(`/workflows/${workflowId}/versions?include_drafts=${includeDrafts}`)
    return response.data
  },

  async publishWorkflowVersion(workflowId: string, versionId: string): Promise<any> {
    const response = await backendAPI.post(`/workflows/${workflowId}/versions/${versionId}/publish`)
    return response.data
  }
}

// Utility function to convert backend workflow to frontend agent format
export function convertWorkflowToAgent(workflow: any, steps: any[] = []): Agent {
  return {
    id: workflow.id.toString(),
    name: workflow.name,
    description: workflow.description || '',
    category: 'custom',
    nodes: steps.map((step, index) => ({
      id: step.step_config?.nodeId || `node-${index}`,
      type: step.step_type,
      position: step.step_config?.position || { x: index * 200, y: 100 },
      data: {
        label: step.step_name,
        ...step.step_config?.nodeData
      }
    })),
    edges: [], // Would need to reconstruct edges from step relationships
    createdAt: new Date(workflow.created_at),
    updatedAt: new Date(workflow.updated_at),
    isTemplate: false,
    author: 'system',
    version: '1.0.0',
    status: 'draft' as const,
    isPublic: false,
    tags: [],
    estimatedCost: 0,
    averageRuntime: 0
  }
}

// Utility function to convert frontend agent to backend workflow format
export function convertAgentToWorkflow(agent: Agent) {
  return {
    name: agent.name,
    description: agent.description,
    workflow_type: 'ai_agent',
    steps: agent.nodes?.map((node, index) => ({
      step_order: index + 1,
      step_type: node.type,
      step_name: node.data.label || `Step ${index + 1}`,
      step_config: {
        nodeId: node.id,
        nodeData: node.data,
        position: node.position,
        type: node.type
      }
    })) || []
  }
}

export default backendAPI
