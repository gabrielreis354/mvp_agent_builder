// Runtime Engine Tests
import { runtimeEngine } from '@/lib/runtime/engine';
import { AgentNode, AgentEdge } from '@/types/agent';

describe('RuntimeEngine', () => {
  beforeEach(() => {
    // Mock fetch for API calls
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('executeAgent', () => {
    it('should execute a simple agent with input and output nodes', async () => {
      const nodes: AgentNode[] = [
        {
          id: 'input-1',
          type: 'customNode',
          position: { x: 0, y: 0 },
          data: { 
            label: 'Input Node', 
            nodeType: 'input',
            inputSchema: { type: 'object', properties: { text: { type: 'string' } } }
          }
        },
        {
          id: 'output-1',
          type: 'customNode',
          position: { x: 200, y: 0 },
          data: { 
            label: 'Output Node', 
            nodeType: 'output',
            outputSchema: { type: 'object', properties: { result: { type: 'string' } } }
          }
        }
      ];

      const edges: AgentEdge[] = [
        { id: 'e1-2', source: 'input-1', target: 'output-1' }
      ];

      const input = { text: 'Hello World' };

      const mockAgent = {
        id: 'test-agent',
        name: 'Test Agent',
        description: 'Test agent for unit tests',
        category: 'test',
        nodes,
        edges,
        createdAt: new Date(),
        updatedAt: new Date(),
        isTemplate: false,
        tags: ['test'],
        author: 'test',
        version: '1.0.0',
        status: 'draft' as const
      };

      const result = await runtimeEngine.executeAgent(mockAgent, input, 'test-user');

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it('should handle AI node execution with fallback', async () => {
      const nodes: AgentNode[] = [
        {
          id: 'input-1',
          type: 'customNode',
          position: { x: 0, y: 0 },
          data: { 
            label: 'Input Node', 
            nodeType: 'input'
          }
        },
        {
          id: 'ai-1',
          type: 'customNode',
          position: { x: 100, y: 0 },
          data: { 
            label: 'AI Analysis', 
            nodeType: 'ai',
            provider: 'openai',
            model: 'gpt-4',
            prompt: 'Analyze this text: {input}'
          }
        },
        {
          id: 'output-1',
          type: 'customNode',
          position: { x: 200, y: 0 },
          data: { 
            label: 'Output Node', 
            nodeType: 'output'
          }
        }
      ];

      const edges: AgentEdge[] = [
        { id: 'e1-2', source: 'input-1', target: 'ai-1' },
        { id: 'e2-3', source: 'ai-1', target: 'output-1' }
      ];

      const input = { text: 'Sample text for analysis' };

      // Mock fetch to simulate API failure (will use fallback)
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      const mockAgent = {
        id: 'test-agent',
        name: 'Test Agent',
        description: 'Test agent for unit tests',
        category: 'test',
        nodes,
        edges,
        createdAt: new Date(),
        updatedAt: new Date(),
        isTemplate: false,
        tags: ['test'],
        author: 'test',
        version: '1.0.0',
        status: 'draft' as const
      };

      const result = await runtimeEngine.executeAgent(mockAgent, input, 'test-user');

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      expect(typeof result.output).toBe('object');
    });

    it('should handle logic node execution', async () => {
      const nodes: AgentNode[] = [
        {
          id: 'input-1',
          type: 'customNode',
          position: { x: 0, y: 0 },
          data: { 
            label: 'Input Node', 
            nodeType: 'input'
          }
        },
        {
          id: 'logic-1',
          type: 'customNode',
          position: { x: 100, y: 0 },
          data: { 
            label: 'Validation Logic', 
            nodeType: 'logic',
            logicType: 'condition',
            condition: 'input.value > 0'
          }
        },
        {
          id: 'output-1',
          type: 'customNode',
          position: { x: 200, y: 0 },
          data: { 
            label: 'Output Node', 
            nodeType: 'output'
          }
        }
      ];

      const edges: AgentEdge[] = [
        { id: 'e1-2', source: 'input-1', target: 'logic-1' },
        { id: 'e2-3', source: 'logic-1', target: 'output-1' }
      ];

      const input = { value: 10 };

      const mockAgent = {
        id: 'test-agent',
        name: 'Test Agent',
        description: 'Test agent for unit tests',
        category: 'test',
        nodes,
        edges,
        createdAt: new Date(),
        updatedAt: new Date(),
        isTemplate: false,
        tags: ['test'],
        author: 'test',
        version: '1.0.0',
        status: 'draft' as const
      };

      const result = await runtimeEngine.executeAgent(mockAgent, input, 'test-user');

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
    });

    it('should handle API node execution', async () => {
      const nodes: AgentNode[] = [
        {
          id: 'input-1',
          type: 'customNode',
          position: { x: 0, y: 0 },
          data: { 
            label: 'Input Node', 
            nodeType: 'input'
          }
        },
        {
          id: 'api-1',
          type: 'customNode',
          position: { x: 100, y: 0 },
          data: { 
            label: 'Send Email', 
            nodeType: 'api',
            apiEndpoint: '/api/send-email',
            apiMethod: 'POST'
          }
        },
        {
          id: 'output-1',
          type: 'customNode',
          position: { x: 200, y: 0 },
          data: { 
            label: 'Output Node', 
            nodeType: 'output'
          }
        }
      ];

      const edges: AgentEdge[] = [
        { id: 'e1-2', source: 'input-1', target: 'api-1' },
        { id: 'e2-3', source: 'api-1', target: 'output-1' }
      ];

      const input = { 
        email: 'test@example.com',
        subject: 'Test Email',
        body: 'Test message'
      };

      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, messageId: '12345' })
      });

      const mockAgent = {
        id: 'test-agent',
        name: 'Test Agent',
        description: 'Test agent for unit tests',
        category: 'test',
        nodes,
        edges,
        createdAt: new Date(),
        updatedAt: new Date(),
        isTemplate: false,
        tags: ['test'],
        author: 'test',
        version: '1.0.0',
        status: 'draft' as const
      };

      const result = await runtimeEngine.executeAgent(mockAgent, input, 'test-user');

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
    });

    it('should handle execution errors gracefully', async () => {
      const nodes: AgentNode[] = [
        {
          id: 'invalid-node',
          type: 'customNode',
          position: { x: 0, y: 0 },
          data: { 
            label: 'Invalid Node', 
            nodeType: 'unknown' as any
          }
        }
      ];

      const edges: AgentEdge[] = [];
      const input = {};

      const mockAgent = {
        id: 'test-agent',
        name: 'Test Agent',
        description: 'Test agent for unit tests',
        category: 'test',
        nodes,
        edges,
        createdAt: new Date(),
        updatedAt: new Date(),
        isTemplate: false,
        tags: ['test'],
        author: 'test',
        version: '1.0.0',
        status: 'draft' as const
      };

      const result = await runtimeEngine.executeAgent(mockAgent, input, 'test-user');

      // Runtime engine handles unknown nodes gracefully by skipping them
      expect(result.success).toBe(true);
      expect(result.executionTime).toBeGreaterThan(0);
    });
  });

  describe('agent execution validation', () => {
    it('should execute agent with proper node types', async () => {
      const nodes: AgentNode[] = [
        {
          id: 'input-1',
          type: 'customNode',
          position: { x: 0, y: 0 },
          data: { label: 'Input', nodeType: 'input' }
        },
        {
          id: 'output-1',
          type: 'customNode',
          position: { x: 200, y: 0 },
          data: { label: 'Output', nodeType: 'output' }
        }
      ];

      const edges: AgentEdge[] = [
        { id: 'e1-2', source: 'input-1', target: 'output-1' }
      ];

      const input = { test: 'data' };
      const mockAgent = {
        id: 'test-agent',
        name: 'Test Agent',
        description: 'Test agent for unit tests',
        category: 'test',
        nodes,
        edges,
        createdAt: new Date(),
        updatedAt: new Date(),
        isTemplate: false,
        tags: ['test'],
        author: 'test',
        version: '1.0.0',
        status: 'draft' as const
      };

      const result = await runtimeEngine.executeAgent(mockAgent, input, 'test-user');

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
    });

    it('should handle agents with only output nodes', async () => {
      const nodes: AgentNode[] = [
        {
          id: 'output-1',
          type: 'customNode',
          position: { x: 200, y: 0 },
          data: { label: 'Output', nodeType: 'output' }
        }
      ];

      const edges: AgentEdge[] = [];
      const input = { test: 'data' };

      const mockAgent = {
        id: 'test-agent',
        name: 'Test Agent',
        description: 'Test agent for unit tests',
        category: 'test',
        nodes,
        edges,
        createdAt: new Date(),
        updatedAt: new Date(),
        isTemplate: false,
        tags: ['test'],
        author: 'test',
        version: '1.0.0',
        status: 'draft' as const
      };

      const result = await runtimeEngine.executeAgent(mockAgent, input, 'test-user');

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
    });
  });
});
