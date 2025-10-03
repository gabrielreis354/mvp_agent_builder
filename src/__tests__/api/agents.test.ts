// API Routes Tests
import { NextRequest } from 'next/server';
import { POST as executeAgent } from '@/app/api/agents/execute/route';
import { POST as generateAgent } from '@/app/api/agents/generate/route';

// Mock the runtime engine
jest.mock('@/lib/runtime-engine', () => ({
  RuntimeEngine: jest.fn().mockImplementation(() => ({
    executeAgent: jest.fn().mockResolvedValue({
      success: true,
      output: { result: 'Test execution result' },
      executionTime: 1500
    })
  }))
}));

describe('/api/agents/execute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should execute agent successfully with valid input', async () => {
    const requestBody = {
      agent: {
        id: 'test-agent',
        name: 'Test Agent',
        nodes: [
          {
            id: 'input-1',
            type: 'customNode',
            data: { label: 'Input', nodeType: 'input' }
          },
          {
            id: 'output-1',
            type: 'customNode',
            data: { label: 'Output', nodeType: 'output' }
          }
        ],
        edges: [
          { id: 'e1-2', source: 'input-1', target: 'output-1' }
        ]
      },
      input: { text: 'test input' }
    };

    const request = new NextRequest('http://localhost:3002/api/agents/execute', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await executeAgent(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.output).toBeDefined();
    expect(data.executionTime).toBeDefined();
  });

  it('should handle template execution by ID', async () => {
    const requestBody = {
      agentId: 'contract-analyzer',
      input: { 
        file: 'test-contract.pdf',
        email_gestor: 'test@example.com',
        departamento: 'RH'
      }
    };

    const request = new NextRequest('http://localhost:3002/api/agents/execute', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await executeAgent(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should return 400 for invalid request body', async () => {
    const requestBody = {
      // Missing required fields
    };

    const request = new NextRequest('http://localhost:3002/api/agents/execute', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await executeAgent(request);

    expect(response.status).toBe(400);
  });

  it('should handle execution errors gracefully', async () => {
    const { RuntimeEngine } = require('@/lib/runtime-engine');
    const mockEngine = new RuntimeEngine();
    mockEngine.executeAgent.mockRejectedValue(new Error('Execution failed'));

    const requestBody = {
      agent: {
        id: 'test-agent',
        nodes: [],
        edges: []
      },
      input: {}
    };

    const request = new NextRequest('http://localhost:3002/api/agents/execute', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await executeAgent(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });
});

describe('/api/agents/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fetch for external API calls
    global.fetch = jest.fn();
  });

  it('should generate agent from natural language description', async () => {
    // Mock successful AI response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify({
              name: 'Document Processor',
              description: 'Processes and analyzes documents',
              nodes: [
                {
                  id: 'input-1',
                  type: 'customNode',
                  data: { label: 'Upload Document', nodeType: 'input' }
                },
                {
                  id: 'ai-1',
                  type: 'customNode',
                  data: { 
                    label: 'Analyze Document', 
                    nodeType: 'ai',
                    provider: 'openai',
                    model: 'gpt-4'
                  }
                },
                {
                  id: 'output-1',
                  type: 'customNode',
                  data: { label: 'Results', nodeType: 'output' }
                }
              ],
              edges: [
                { id: 'e1-2', source: 'input-1', target: 'ai-1' },
                { id: 'e2-3', source: 'ai-1', target: 'output-1' }
              ]
            })
          }
        }]
      })
    });

    const requestBody = {
      description: 'Create an agent that processes PDF documents and extracts key information',
      category: 'document_processing'
    };

    const request = new NextRequest('http://localhost:3002/api/agents/generate', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await generateAgent(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.agent).toBeDefined();
    expect(data.agent.name).toBe('Document Processor');
    expect(data.agent.nodes).toHaveLength(3);
    expect(data.agent.edges).toHaveLength(2);
  });

  it('should handle AI API failures with fallback', async () => {
    // Mock API failure
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

    const requestBody = {
      description: 'Simple text processor',
      category: 'text_processing'
    };

    const request = new NextRequest('http://localhost:3002/api/agents/generate', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await generateAgent(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.agent).toBeDefined();
    expect(data.agent.name).toContain('Generated');
  });

  it('should return 400 for missing description', async () => {
    const requestBody = {
      category: 'test'
      // Missing description
    };

    const request = new NextRequest('http://localhost:3002/api/agents/generate', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await generateAgent(request);

    expect(response.status).toBe(400);
  });

  it('should validate generated agent structure', async () => {
    // Mock malformed AI response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      })
    });

    const requestBody = {
      description: 'Test agent',
      category: 'test'
    };

    const request = new NextRequest('http://localhost:3002/api/agents/generate', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await generateAgent(request);
    const data = await response.json();

    // Should fallback to default structure
    expect(response.status).toBe(200);
    expect(data.agent).toBeDefined();
    expect(Array.isArray(data.agent.nodes)).toBe(true);
    expect(Array.isArray(data.agent.edges)).toBe(true);
  });
});
