// ExecutionPanel Component Tests
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ExecutionPanel } from '@/components/agent-builder/execution-panel';
import { Agent } from '@/types/agent';

// Mock the dynamic test engine
jest.mock('@/lib/testing/dynamic-test-engine', () => ({
  dynamicTestEngine: {
    runTests: jest.fn().mockResolvedValue({
      success: true,
      results: [
        { name: 'Test 1', passed: true, message: 'Success' },
        { name: 'Test 2', passed: true, message: 'Success' }
      ],
      summary: { total: 2, passed: 2, failed: 0 }
    })
  }
}));

// Mock the runtime engine
jest.mock('@/lib/runtime/engine', () => ({
  RuntimeEngine: jest.fn().mockImplementation(() => ({
    executeAgent: jest.fn().mockResolvedValue({
      executionId: 'test-execution-123',
      success: true,
      output: { result: 'Test execution successful' },
      executionTime: 1500,
      nodeResults: {
        'node-1': { success: true, output: 'Input processed' },
        'node-2': { success: true, output: 'AI processing complete' }
      }
    })
  }))
}));

// Mock file upload API
global.fetch = jest.fn();

const mockAgent: Agent = {
  id: 'test-agent-1',
  name: 'Test Agent',
  description: 'A test agent for unit testing',
  category: 'test',
  difficulty: 'beginner',
  nodes: [
    {
      id: 'node-1',
      type: 'input',
      position: { x: 100, y: 100 },
      data: {
        label: 'Input Node',
        nodeType: 'input',
        placeholder: 'Enter text'
      }
    },
    {
      id: 'node-2',
      type: 'ai',
      position: { x: 300, y: 100 },
      data: {
        label: 'AI Node',
        nodeType: 'ai',
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        prompt: 'Process the input'
      }
    }
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'node-1',
      target: 'node-2',
      type: 'default'
    }
  ],
  inputSchema: {
    type: 'object',
    properties: {
      text: { type: 'string', description: 'Input text' }
    }
  },
  outputSchema: {
    type: 'object',
    properties: {
      result: { type: 'string', description: 'Processed result' }
    }
  }
};

describe('ExecutionPanel', () => {
  const mockOnExecute = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, fileId: 'test-file-123' })
    });
  });

  describe('rendering', () => {
    it('should render execution panel with agent', () => {
      render(<ExecutionPanel agent={mockAgent} onExecute={mockOnExecute} />);

      expect(screen.getByText('Executar Agente')).toBeInTheDocument();
      expect(screen.getByText('Test Agent')).toBeInTheDocument();
      expect(screen.getByText('A test agent for unit testing')).toBeInTheDocument();
    });

    it('should render empty state when no agent provided', () => {
      render(<ExecutionPanel agent={null} onExecute={mockOnExecute} />);

      expect(screen.getByText('Nenhum agente selecionado')).toBeInTheDocument();
      expect(screen.getByText('Selecione um agente para executar')).toBeInTheDocument();
    });

    it('should render form and JSON tabs', () => {
      render(<ExecutionPanel agent={mockAgent} onExecute={mockOnExecute} />);

      expect(screen.getByRole('tab', { name: /formulário/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /json manual/i })).toBeInTheDocument();
    });
  });

  describe('form mode execution', () => {
    it('should handle text input execution', async () => {
      const user = userEvent.setup();
      render(<ExecutionPanel agent={mockAgent} onExecute={mockOnExecute} />);

      // Fill text input
      const textInput = screen.getByPlaceholderText('Digite o texto para processar...');
      await user.type(textInput, 'Test input text');

      // Click execute button
      const executeButton = screen.getByRole('button', { name: /executar agente/i });
      await user.click(executeButton);

      await waitFor(() => {
        expect(mockOnExecute).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            executionId: 'test-execution-123'
          })
        );
      });
    });

    it('should handle file upload', async () => {
      const user = userEvent.setup();
      render(<ExecutionPanel agent={mockAgent} onExecute={mockOnExecute} />);

      // Create a mock file
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

      // Upload file
      const fileInput = screen.getByLabelText(/upload de arquivo/i);
      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/upload', expect.any(Object));
      });
    });

    it('should handle email input', async () => {
      const user = userEvent.setup();
      render(<ExecutionPanel agent={mockAgent} onExecute={mockOnExecute} />);

      // Fill email input
      const emailInput = screen.getByPlaceholderText('email@exemplo.com');
      await user.type(emailInput, 'test@example.com');

      // Select department
      const departmentSelect = screen.getByRole('combobox');
      await user.click(departmentSelect);
      await user.click(screen.getByText('RH'));

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should validate required fields', async () => {
      const user = userEvent.setup();
      render(<ExecutionPanel agent={mockAgent} onExecute={mockOnExecute} />);

      // Try to execute without filling required fields
      const executeButton = screen.getByRole('button', { name: /executar agente/i });
      await user.click(executeButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/preencha todos os campos obrigatórios/i)).toBeInTheDocument();
      });
    });
  });

  describe('JSON mode execution', () => {
    it('should switch to JSON mode and execute', async () => {
      const user = userEvent.setup();
      render(<ExecutionPanel agent={mockAgent} onExecute={mockOnExecute} />);

      // Switch to JSON tab
      const jsonTab = screen.getByRole('tab', { name: /json manual/i });
      await user.click(jsonTab);

      // Fill JSON input
      const jsonTextarea = screen.getByPlaceholderText(/digite o json de entrada/i);
      await user.type(jsonTextarea, '{"text": "Test JSON input"}');

      // Execute
      const executeButton = screen.getByRole('button', { name: /executar agente/i });
      await user.click(executeButton);

      await waitFor(() => {
        expect(mockOnExecute).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            executionId: 'test-execution-123'
          })
        );
      });
    });

    it('should validate JSON syntax', async () => {
      const user = userEvent.setup();
      render(<ExecutionPanel agent={mockAgent} onExecute={mockOnExecute} />);

      // Switch to JSON tab
      const jsonTab = screen.getByRole('tab', { name: /json manual/i });
      await user.click(jsonTab);

      // Fill invalid JSON
      const jsonTextarea = screen.getByPlaceholderText(/digite o json de entrada/i);
      await user.type(jsonTextarea, '{"invalid": json}');

      // Execute
      const executeButton = screen.getByRole('button', { name: /executar agente/i });
      await user.click(executeButton);

      await waitFor(() => {
        expect(screen.getByText(/json inválido/i)).toBeInTheDocument();
      });
    });
  });

  describe('test execution', () => {
    it('should run agent tests', async () => {
      const user = userEvent.setup();
      render(<ExecutionPanel agent={mockAgent} onExecute={mockOnExecute} />);

      // Click test button
      const testButton = screen.getByRole('button', { name: /testar agente/i });
      await user.click(testButton);

      await waitFor(() => {
        expect(screen.getByText(/testes executados com sucesso/i)).toBeInTheDocument();
        expect(screen.getByText('2/2 testes passaram')).toBeInTheDocument();
      });
    });

    it('should handle test failures', async () => {
      const { dynamicTestEngine } = require('@/lib/testing/dynamic-test-engine');
      dynamicTestEngine.runTests.mockResolvedValueOnce({
        success: false,
        results: [
          { name: 'Test 1', passed: true, message: 'Success' },
          { name: 'Test 2', passed: false, message: 'Failed validation' }
        ],
        summary: { total: 2, passed: 1, failed: 1 }
      });

      const user = userEvent.setup();
      render(<ExecutionPanel agent={mockAgent} onExecute={mockOnExecute} />);

      const testButton = screen.getByRole('button', { name: /testar agente/i });
      await user.click(testButton);

      await waitFor(() => {
        expect(screen.getByText(/alguns testes falharam/i)).toBeInTheDocument();
        expect(screen.getByText('1/2 testes passaram')).toBeInTheDocument();
      });
    });
  });

  describe('execution states', () => {
    it('should show loading state during execution', async () => {
      const { RuntimeEngine } = require('@/lib/runtime/engine');
      const mockEngine = new RuntimeEngine();
      mockEngine.executeAgent.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          executionId: 'test-execution-123',
          success: true,
          output: { result: 'Success' },
          executionTime: 1500,
          nodeResults: {}
        }), 100))
      );

      const user = userEvent.setup();
      render(<ExecutionPanel agent={mockAgent} onExecute={mockOnExecute} />);

      // Fill input and execute
      const textInput = screen.getByPlaceholderText('Digite o texto para processar...');
      await user.type(textInput, 'Test input');

      const executeButton = screen.getByRole('button', { name: /executar agente/i });
      await user.click(executeButton);

      // Should show loading state
      expect(screen.getByText(/executando/i)).toBeInTheDocument();
      expect(executeButton).toBeDisabled();
    });

    it('should display execution results', async () => {
      const user = userEvent.setup();
      render(<ExecutionPanel agent={mockAgent} onExecute={mockOnExecute} />);

      // Execute agent
      const textInput = screen.getByPlaceholderText('Digite o texto para processar...');
      await user.type(textInput, 'Test input');

      const executeButton = screen.getByRole('button', { name: /executar agente/i });
      await user.click(executeButton);

      await waitFor(() => {
        expect(screen.getByText(/execução concluída com sucesso/i)).toBeInTheDocument();
        expect(screen.getByText(/tempo de execução: 1.5s/i)).toBeInTheDocument();
      });
    });

    it('should handle execution errors', async () => {
      const { RuntimeEngine } = require('@/lib/runtime/engine');
      const mockEngine = new RuntimeEngine();
      mockEngine.executeAgent.mockRejectedValueOnce(new Error('Execution failed'));

      const user = userEvent.setup();
      render(<ExecutionPanel agent={mockAgent} onExecute={mockOnExecute} />);

      const textInput = screen.getByPlaceholderText('Digite o texto para processar...');
      await user.type(textInput, 'Test input');

      const executeButton = screen.getByRole('button', { name: /executar agente/i });
      await user.click(executeButton);

      await waitFor(() => {
        expect(screen.getByText(/erro na execução/i)).toBeInTheDocument();
        expect(screen.getByText('Execution failed')).toBeInTheDocument();
      });
    });
  });

  describe('file validation', () => {
    it('should validate file types', async () => {
      const user = userEvent.setup();
      render(<ExecutionPanel agent={mockAgent} onExecute={mockOnExecute} />);

      // Try to upload invalid file type
      const invalidFile = new File(['test'], 'test.exe', { type: 'application/exe' });
      const fileInput = screen.getByLabelText(/upload de arquivo/i);
      
      await user.upload(fileInput, invalidFile);

      await waitFor(() => {
        expect(screen.getByText(/tipo de arquivo não suportado/i)).toBeInTheDocument();
      });
    });

    it('should validate file size', async () => {
      const user = userEvent.setup();
      render(<ExecutionPanel agent={mockAgent} onExecute={mockOnExecute} />);

      // Create large file (>10MB)
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { 
        type: 'application/pdf' 
      });
      
      const fileInput = screen.getByLabelText(/upload de arquivo/i);
      await user.upload(fileInput, largeFile);

      await waitFor(() => {
        expect(screen.getByText(/arquivo muito grande/i)).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ExecutionPanel agent={mockAgent} onExecute={mockOnExecute} />);

      expect(screen.getByLabelText(/upload de arquivo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email do destinatário/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/departamento/i)).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ExecutionPanel agent={mockAgent} onExecute={mockOnExecute} />);

      // Tab through form elements
      await user.tab();
      expect(screen.getByPlaceholderText('Digite o texto para processar...')).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/upload de arquivo/i)).toHaveFocus();
    });
  });
});
