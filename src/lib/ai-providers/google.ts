import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GoogleConfig {
  apiKey: string;
  baseURL?: string;
}

export interface AIResponse {
  content: string;
  confidence: number;
  tokens_used: number;
  model: string;
  provider: string;
}

export class GoogleProvider {
  private client: GoogleGenerativeAI;
  private config: GoogleConfig;

  constructor(config: GoogleConfig) {
    this.config = config;
    this.client = new GoogleGenerativeAI(config.apiKey);
  }

  async generateCompletion(
    prompt: string,
    model: string = 'gemini-pro',
    options: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<AIResponse> {
    try {
      const genModel = this.client.getGenerativeModel({ 
        model: model,
        generationConfig: {
          temperature: options.temperature || 0.3,
          maxOutputTokens: options.maxTokens || 2000,
        }
      });

      // Combine system prompt with user prompt if provided
      const fullPrompt = options.systemPrompt 
        ? `${options.systemPrompt}\n\nUsuário: ${prompt}`
        : prompt;

      const result = await genModel.generateContent(fullPrompt);
      const response = await result.response;
      const content = response.text();

      // Google doesn't provide token usage in the free tier
      const estimatedTokens = Math.ceil(content.length / 4); // Rough estimation

      return {
        content,
        confidence: 0.90, // Google doesn't provide confidence scores
        tokens_used: estimatedTokens,
        model,
        provider: 'google'
      };
    } catch (error) {
      console.error('Google AI API error:', error);
      throw new Error(`Google AI API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateStreamCompletion(
    prompt: string,
    model: string = 'gemini-pro',
    options: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
      onChunk?: (chunk: string) => void;
    } = {}
  ): Promise<AIResponse> {
    try {
      const genModel = this.client.getGenerativeModel({ 
        model: model,
        generationConfig: {
          temperature: options.temperature || 0.3,
          maxOutputTokens: options.maxTokens || 2000,
        }
      });

      const fullPrompt = options.systemPrompt 
        ? `${options.systemPrompt}\n\nUsuário: ${prompt}`
        : prompt;

      const result = await genModel.generateContentStream(fullPrompt);
      let fullContent = '';

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullContent += chunkText;
        if (options.onChunk) {
          options.onChunk(chunkText);
        }
      }

      const estimatedTokens = Math.ceil(fullContent.length / 4);

      return {
        content: fullContent,
        confidence: 0.90,
        tokens_used: estimatedTokens,
        model,
        provider: 'google'
      };
    } catch (error) {
      console.error('Google AI streaming error:', error);
      throw new Error(`Google AI streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateEmbedding(text: string, model: string = 'embedding-001'): Promise<number[]> {
    try {
      const genModel = this.client.getGenerativeModel({ model: model });
      const result = await genModel.embedContent(text);
      
      return result.embedding?.values || [];
    } catch (error) {
      console.error('Google embedding error:', error);
      throw new Error(`Google embedding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
