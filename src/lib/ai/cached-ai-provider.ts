/**
 * AI Provider com Cache Redis Integrado
 */

import { AIProviderManager } from '@/lib/ai-providers'
import { redisCache } from '@/lib/cache/redis-client'
import { logger } from '@/lib/utils/logger'

export interface CachedAIOptions {
  useCache?: boolean
  cacheTTL?: number // segundos
  bypassCache?: boolean
  userId?: string
}

export interface AICallResult {
  content: string
  fromCache: boolean
  tokens: number
  cost: number
  duration: number
  provider: string
  model: string
}

export class CachedAIProvider {
  private aiManager: AIProviderManager
  private defaultCacheTTL: number = 3600 // 1 hora

  constructor(aiManager: AIProviderManager) {
    this.aiManager = aiManager
  }

  /**
   * Chamada de IA com cache inteligente
   */
  async generateCompletion(
    provider: string,
    prompt: string,
    model: string,
    options: CachedAIOptions & any = {}
  ): Promise<AICallResult> {
    const startTime = Date.now()
    const { useCache = true, cacheTTL, bypassCache = false, userId = 'anonymous', ...aiOptions } = options

    // 1. Verificar rate limiting se userId fornecido
    if (userId !== 'anonymous') {
      const rateLimit = await redisCache.checkRateLimit(userId, provider, 100, 3600)
      if (!rateLimit.allowed) {
        throw new Error(`Rate limit exceeded for ${provider}. Try again in ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds.`)
      }
    }

    // 2. Tentar buscar no cache (se habilitado)
    if (useCache && !bypassCache) {
      const cached = await redisCache.getCachedAIResponse(
        prompt, 
        provider, 
        model, 
        aiOptions.temperature
      )

      if (cached) {
        const duration = Date.now() - startTime
        logger.ai(provider, 'Response served from cache', {
          model,
          tokens: cached.tokens,
          cost: cached.cost,
          duration,
          age: Date.now() - cached.timestamp
        })

        return {
          content: cached.content,
          fromCache: true,
          tokens: cached.tokens,
          cost: cached.cost,
          duration,
          provider,
          model
        }
      }
    }

    // 3. Fazer chamada real para IA
    try {
      logger.ai(provider, 'Making real AI call', { model, promptLength: prompt.length })
      
      const response = await this.aiManager.generateCompletion(provider as any, prompt, model, aiOptions)
      const duration = Date.now() - startTime

      // Calcular custo estimado (valores aproximados)
      const estimatedCost = this.calculateCost(provider, model, response.tokens_used || 0)

      // 4. Salvar no cache (se habilitado)
      if (useCache && response.content) {
        await redisCache.setCachedAIResponse(
          prompt,
          provider,
          model,
          response.content,
          response.tokens_used || 0,
          estimatedCost,
          aiOptions.temperature,
          cacheTTL || this.defaultCacheTTL
        )
      }

      logger.ai(provider, 'Real AI call completed', {
        model,
        tokens: response.tokens_used,
        cost: estimatedCost,
        duration,
        cached: useCache
      })

      return {
        content: response.content,
        fromCache: false,
        tokens: response.tokens_used || 0,
        cost: estimatedCost,
        duration,
        provider,
        model
      }

    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('AI call failed', `AI:${provider}`, {
        model,
        duration,
        promptLength: prompt.length
      }, error as Error)
      
      throw error
    }
  }

  /**
   * Calcular custo estimado por provider/model
   */
  private calculateCost(provider: string, model: string, tokens: number): number {
    // Preços aproximados por 1K tokens (input + output médio)
    const pricing: Record<string, Record<string, number>> = {
      openai: {
        'gpt-4': 0.03,
        'gpt-4-turbo': 0.01,
        'gpt-3.5-turbo': 0.002
      },
      anthropic: {
        'claude-3-opus': 0.015,
        'claude-3-sonnet': 0.003,
        'claude-3-haiku': 0.00025
      },
      google: {
        'gemini-pro': 0.0005,
        'gemini-pro-vision': 0.0025
      }
    }

    const providerPricing = pricing[provider.toLowerCase()]
    if (!providerPricing) return 0

    const modelPricing = providerPricing[model.toLowerCase()]
    if (!modelPricing) return 0

    return (tokens / 1000) * modelPricing
  }

  /**
   * Invalidar cache para um prompt específico
   */
  async invalidateCache(prompt: string, provider?: string, model?: string): Promise<void> {
    // Implementação simplificada - em produção seria mais sofisticada
    logger.info('Cache invalidation requested', 'CACHE', { provider, model, promptLength: prompt.length })
  }

  /**
   * Estatísticas de uso
   */
  async getUsageStats(userId?: string): Promise<{
    totalCalls: number
    cachedCalls: number
    cacheHitRate: number
    totalCost: number
    totalTokens: number
  }> {
    // Em uma implementação real, isso viria de métricas armazenadas
    const stats = await redisCache.getCacheStats()
    
    return {
      totalCalls: 0, // Seria calculado de métricas
      cachedCalls: stats.aiCacheKeys,
      cacheHitRate: 0, // Seria calculado
      totalCost: 0, // Seria somado das chamadas
      totalTokens: 0 // Seria somado das chamadas
    }
  }
}

// Factory function para criar instância
export function createCachedAIProvider(aiManager: AIProviderManager): CachedAIProvider {
  return new CachedAIProvider(aiManager)
}
