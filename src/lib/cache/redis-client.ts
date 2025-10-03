/**
 * Redis Client para Cache de IA e Rate Limiting
 */

import Redis from 'ioredis'
import { logger } from '@/lib/utils/logger'

export interface CacheConfig {
  host?: string
  port?: number
  password?: string
  db?: number
  ttl?: number // Time to live em segundos
}

export interface AIResponse {
  content: string
  provider: string
  model: string
  tokens: number
  cost: number
  timestamp: number
}

export class RedisCache {
  private redis: Redis
  private defaultTTL: number

  constructor(config: CacheConfig = {}) {
    this.defaultTTL = config.ttl || 3600 // 1 hora por padrão
    
    this.redis = new Redis({
      host: config.host || process.env.REDIS_HOST || 'localhost',
      port: config.port || parseInt(process.env.REDIS_PORT || '6379'),
      password: config.password || process.env.REDIS_PASSWORD,
      db: config.db || 0,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    })

    this.redis.on('connect', () => {
      logger.info('Redis connected successfully', 'REDIS')
    })

    this.redis.on('error', (error) => {
      logger.error('Redis connection error', 'REDIS', { error: error.message }, error)
    })
  }

  /**
   * Gera chave única para cache baseada no prompt e configurações
   */
  private generateCacheKey(prompt: string, provider: string, model: string, temperature?: number): string {
    const hash = this.hashString(prompt + provider + model + (temperature || 0.7))
    return `ai_cache:${provider}:${model}:${hash}`
  }

  /**
   * Hash simples para gerar chaves consistentes
   */
  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * Busca resposta da IA no cache
   */
  async getCachedAIResponse(
    prompt: string, 
    provider: string, 
    model: string, 
    temperature?: number
  ): Promise<AIResponse | null> {
    try {
      const key = this.generateCacheKey(prompt, provider, model, temperature)
      const cached = await this.redis.get(key)
      
      if (cached) {
        const response: AIResponse = JSON.parse(cached)
        logger.info('AI response found in cache', 'REDIS_CACHE', {
          provider,
          model,
          promptLength: prompt.length,
          age: Date.now() - response.timestamp
        })
        return response
      }
      
      return null
    } catch (error) {
      logger.error('Error getting cached AI response', 'REDIS_CACHE', { provider, model }, error as Error)
      return null
    }
  }

  /**
   * Salva resposta da IA no cache
   */
  async setCachedAIResponse(
    prompt: string,
    provider: string,
    model: string,
    response: string,
    tokens: number,
    cost: number,
    temperature?: number,
    ttl?: number
  ): Promise<void> {
    try {
      const key = this.generateCacheKey(prompt, provider, model, temperature)
      const aiResponse: AIResponse = {
        content: response,
        provider,
        model,
        tokens,
        cost,
        timestamp: Date.now()
      }

      await this.redis.setex(key, ttl || this.defaultTTL, JSON.stringify(aiResponse))
      
      logger.info('AI response cached successfully', 'REDIS_CACHE', {
        provider,
        model,
        tokens,
        cost,
        ttl: ttl || this.defaultTTL
      })
    } catch (error) {
      logger.error('Error caching AI response', 'REDIS_CACHE', { provider, model }, error as Error)
    }
  }

  /**
   * Rate limiting para APIs de IA
   */
  async checkRateLimit(userId: string, provider: string, limit: number = 100, window: number = 3600): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
  }> {
    try {
      const key = `rate_limit:${provider}:${userId}`
      const current = await this.redis.incr(key)
      
      if (current === 1) {
        // Primeira chamada, definir expiração
        await this.redis.expire(key, window)
      }
      
      const ttl = await this.redis.ttl(key)
      const resetTime = Date.now() + (ttl * 1000)
      
      const allowed = current <= limit
      const remaining = Math.max(0, limit - current)
      
      if (!allowed) {
        logger.warn('Rate limit exceeded', 'RATE_LIMIT', {
          userId,
          provider,
          current,
          limit,
          resetTime
        })
      }
      
      return {
        allowed,
        remaining,
        resetTime
      }
    } catch (error) {
      logger.error('Error checking rate limit', 'RATE_LIMIT', { userId, provider }, error as Error)
      // Em caso de erro, permitir a chamada
      return {
        allowed: true,
        remaining: limit,
        resetTime: Date.now() + window * 1000
      }
    }
  }

  /**
   * Estatísticas de cache
   */
  async getCacheStats(): Promise<{
    totalKeys: number
    aiCacheKeys: number
    rateLimitKeys: number
    memoryUsage: string
  }> {
    try {
      const info = await this.redis.info('memory')
      const memoryMatch = info.match(/used_memory_human:(.+)/)
      const memoryUsage = memoryMatch ? memoryMatch[1].trim() : 'unknown'
      
      const allKeys = await this.redis.keys('*')
      const aiCacheKeys = allKeys.filter(key => key.startsWith('ai_cache:')).length
      const rateLimitKeys = allKeys.filter(key => key.startsWith('rate_limit:')).length
      
      return {
        totalKeys: allKeys.length,
        aiCacheKeys,
        rateLimitKeys,
        memoryUsage
      }
    } catch (error) {
      logger.error('Error getting cache stats', 'REDIS_STATS', {}, error as Error)
      return {
        totalKeys: 0,
        aiCacheKeys: 0,
        rateLimitKeys: 0,
        memoryUsage: 'error'
      }
    }
  }

  /**
   * Limpar cache expirado
   */
  async clearExpiredCache(): Promise<number> {
    try {
      const keys = await this.redis.keys('ai_cache:*')
      let cleared = 0
      
      for (const key of keys) {
        const ttl = await this.redis.ttl(key)
        if (ttl === -1) { // Sem expiração definida
          await this.redis.expire(key, this.defaultTTL)
        }
      }
      
      logger.info('Cache cleanup completed', 'REDIS_CLEANUP', { keysProcessed: keys.length, cleared })
      return cleared
    } catch (error) {
      logger.error('Error clearing expired cache', 'REDIS_CLEANUP', {}, error as Error)
      return 0
    }
  }

  /**
   * Fechar conexão Redis
   */
  async disconnect(): Promise<void> {
    await this.redis.quit()
    logger.info('Redis connection closed', 'REDIS')
  }
}

// Singleton instance
export const redisCache = new RedisCache()
export default redisCache
