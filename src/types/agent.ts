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

export interface NodeTemplate {
  type: AgentNode['type'];
  label: string;
  description: string;
  icon: string;
  defaultData: Partial<AgentNode['data']>;
  requiredFields: string[];
  category: string;
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
