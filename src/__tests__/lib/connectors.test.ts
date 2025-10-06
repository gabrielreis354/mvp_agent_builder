// Connector System Tests
import { ConnectorRegistry, BaseConnector, ConnectorConfig, ConnectorResult } from '@/lib/connectors/base';
import { EmailConnector, EmailConfig, EmailInput } from '@/lib/connectors/email';
import { AIProviderConnector, AIProviderConfig, AIInput } from '@/lib/connectors/ai-providers';

// Mock connector for testing
class MockConnector extends BaseConnector {
  name = 'mock-connector';
  description = 'Mock connector for testing';
  configSchema = {
    type: 'object',
    properties: {
      apiKey: { type: 'string' }
    },
    required: ['apiKey']
  };

  async execute(config: ConnectorConfig, input: any): Promise<ConnectorResult> {
    if (config.shouldFail) {
      throw new Error('Mock connector failure');
    }
    
    return this.createResult(true, {
      processed: input,
      config: config.apiKey
    });
  }

  validate(config: ConnectorConfig): boolean {
    return !!config.apiKey;
  }

  async test(config: ConnectorConfig): Promise<boolean> {
    return this.validate(config);
  }
}

describe('Connector System', () => {
  let registry: ConnectorRegistry;
  let mockConnector: MockConnector;

  beforeEach(() => {
    registry = new ConnectorRegistry();
    mockConnector = new MockConnector();
  });

  describe('ConnectorRegistry', () => {
    it('should register and retrieve connectors', () => {
      registry.register(mockConnector);
      
      const retrieved = registry.get('mock-connector');
      expect(retrieved).toBe(mockConnector);
      expect(retrieved?.name).toBe('mock-connector');
    });

    it('should list registered connectors', () => {
      registry.register(mockConnector);
      
      const list = registry.list();
      expect(list).toContain('mock-connector');
      expect(list).toHaveLength(1);
    });

    it('should return undefined for non-existent connectors', () => {
      const retrieved = registry.get('non-existent');
      expect(retrieved).toBeUndefined();
    });

    it('should execute registered connectors', async () => {
      registry.register(mockConnector);
      
      const config = { apiKey: 'test-key' };
      const input = { data: 'test-data' };
      
      const result = await registry.execute('mock-connector', config, input);
      
      expect(result.success).toBe(true);
      expect(result.data.processed).toEqual(input);
      expect(result.data.config).toBe('test-key');
      expect(result.metadata?.duration).toBeGreaterThanOrEqual(0);
      expect(result.metadata?.timestamp).toBeDefined();
    });

    it('should handle connector execution errors', async () => {
      registry.register(mockConnector);
      
      const config = { apiKey: 'test-key', shouldFail: true };
      const input = { data: 'test-data' };
      
      const result = await registry.execute('mock-connector', config, input);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Mock connector failure');
      expect(result.metadata?.duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle non-existent connector execution', async () => {
      const result = await registry.execute('non-existent', {}, {});
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Connector 'non-existent' not found");
      expect(result.metadata?.duration).toBe(0);
    });
  });

  describe('EmailConnector', () => {
    let emailConnector: EmailConnector;

    beforeEach(() => {
      emailConnector = new EmailConnector();
    });

    it('should have correct metadata', () => {
      expect(emailConnector.name).toBe('email');
      expect(emailConnector.description).toContain('Send emails');
      expect(emailConnector.configSchema).toBeDefined();
    });

    it('should validate SMTP configuration', () => {
      const validConfig: EmailConfig = {
        provider: 'smtp',
        fromEmail: 'test@example.com',
        smtpHost: 'smtp.example.com',
        smtpPort: 587,
        smtpUser: 'user',
        smtpPassword: 'password'
      };

      expect(emailConnector.validate(validConfig)).toBe(true);
    });

    it('should validate SendGrid configuration', () => {
      const validConfig: EmailConfig = {
        provider: 'sendgrid',
        fromEmail: 'test@example.com',
        apiKey: 'sg-test-key'
      };

      expect(emailConnector.validate(validConfig)).toBe(true);
    });

    it('should reject invalid configurations', () => {
      const invalidConfigs = [
        { provider: 'smtp', fromEmail: 'test@example.com' }, // Missing SMTP details
        { provider: 'sendgrid', fromEmail: 'test@example.com' }, // Missing API key
        { provider: 'smtp' }, // Missing fromEmail
        {}
      ];

      invalidConfigs.forEach(config => {
        expect(emailConnector.validate(config as EmailConfig)).toBe(false);
      });
    });

    it('should execute email sending successfully', async () => {
      const config: EmailConfig = {
        provider: 'sendgrid',
        fromEmail: 'sender@example.com',
        apiKey: 'test-key'
      };

      const input: EmailInput = {
        to: 'recipient@example.com',
        subject: 'Test Email',
        body: 'This is a test email'
      };

      const result = await emailConnector.execute(config, input);

      expect(result.success).toBe(true);
      expect(result.data.messageId).toBeDefined();
      expect(result.data.status).toBe('sent');
      expect(result.data.recipients).toEqual(['recipient@example.com']);
      expect(result.data.provider).toBe('sendgrid');
    });

    it('should handle multiple recipients', async () => {
      const config: EmailConfig = {
        provider: 'sendgrid',
        fromEmail: 'sender@example.com',
        apiKey: 'test-key'
      };

      const input: EmailInput = {
        to: ['recipient1@example.com', 'recipient2@example.com'],
        subject: 'Test Email',
        body: 'This is a test email'
      };

      const result = await emailConnector.execute(config, input);

      expect(result.success).toBe(true);
      expect(result.data.recipients).toEqual(['recipient1@example.com', 'recipient2@example.com']);
    });

    it('should test email configuration', async () => {
      const config: EmailConfig = {
        provider: 'sendgrid',
        fromEmail: 'test@example.com',
        apiKey: 'test-key'
      };

      const testResult = await emailConnector.test(config);
      expect(testResult).toBe(true);
    });
  });

  describe('AIProviderConnector', () => {
    let aiConnector: AIProviderConnector;

    beforeEach(() => {
      aiConnector = new AIProviderConnector();
    });

    it('should have correct metadata', () => {
      expect(aiConnector.name).toBe('ai-provider');
      expect(aiConnector.description).toContain('AI model requests');
      expect(aiConnector.configSchema).toBeDefined();
    });

    it('should validate AI provider configuration', () => {
      const validConfigs = [
        {
          provider: 'openai',
          apiKey: 'sk-test-key',
          model: 'gpt-4'
        },
        {
          provider: 'anthropic',
          apiKey: 'claude-key',
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 1000
        },
        {
          provider: 'google',
          apiKey: 'google-key',
          model: 'gemini-pro'
        }
      ];

      validConfigs.forEach(config => {
        expect(aiConnector.validate(config as AIProviderConfig)).toBe(true);
      });
    });

    it('should reject invalid configurations', () => {
      // Test missing apiKey
      expect(aiConnector.validate({ provider: 'openai', model: 'gpt-3.5-turbo' } as any)).toBe(false);
      
      // Test missing model
      expect(aiConnector.validate({ provider: 'openai', apiKey: 'test-key' } as any)).toBe(false);
      
      // Test invalid provider (ainda válido se tiver os campos obrigatórios)
      expect(aiConnector.validate({ provider: 'invalid', apiKey: 'test-key', model: 'test-model' } as any)).toBe(true);
    });

    it('should execute AI requests successfully', async () => {
      const config: AIProviderConfig = {
        provider: 'openai',
        apiKey: 'sk-test-key',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000
      };

      const input: AIInput = {
        prompt: 'What is the capital of France?',
        systemPrompt: 'You are a helpful assistant.',
        format: 'text'
      };

      const result = await aiConnector.execute(config, input);

      expect(result.success).toBe(true);
      expect(result.data.response).toBeDefined();
      expect(result.data.usage).toBeDefined();
      expect(result.data.model).toBe('gpt-4');
      expect(result.data.provider).toBe('openai');
    });

    it('should handle different AI providers', async () => {
      const providers = ['openai', 'anthropic', 'google'] as const;

      for (const provider of providers) {
        const config: AIProviderConfig = {
          provider,
          apiKey: 'test-key',
          model: provider === 'openai' ? 'gpt-4' : provider === 'anthropic' ? 'claude-3-sonnet' : 'gemini-pro'
        };

        const input: AIInput = {
          prompt: 'Test prompt'
        };

        const result = await aiConnector.execute(config, input);

        expect(result.success).toBe(true);
        expect(result.data.provider).toBe(provider);
      }
    }, 10000); // Aumentar timeout para 10 segundos

    it('should test AI provider configuration', async () => {
      const config: AIProviderConfig = {
        provider: 'openai',
        apiKey: 'sk-test-key',
        model: 'gpt-4'
      };

      const testResult = await aiConnector.test(config);
      expect(testResult).toBe(true);
    });
  });

  describe('BaseConnector', () => {
    it('should create proper result objects', () => {
      const result = mockConnector['createResult'](true, { test: 'data' });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ test: 'data' });
      expect(result.metadata?.timestamp).toBeDefined();
      expect(result.metadata?.duration).toBe(0);
    });

    it('should create error result objects', () => {
      const result = mockConnector['createResult'](false, null, 'Test error');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error');
      expect(result.data).toBeNull();
    });
  });
});
