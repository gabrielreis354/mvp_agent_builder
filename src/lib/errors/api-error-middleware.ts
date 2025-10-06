/**
 * Middleware de Tratamento de Erros para APIs Next.js
 */

import { NextRequest, NextResponse } from 'next/server'
import { ErrorHandler, AppError } from './error-handler'
import { logger } from '@/lib/utils/logger'

export type APIHandler = (req: NextRequest) => Promise<NextResponse>

/**
 * Wrapper para handlers de API com tratamento de erro automático
 */
export function withErrorHandling(handler: APIHandler): APIHandler {
  return async (req: NextRequest) => {
    try {
      return await handler(req)
    } catch (error) {
      return handleAPIError(error, req)
    }
  }
}

/**
 * Trata erro e retorna resposta HTTP apropriada
 */
function handleAPIError(error: unknown, req: NextRequest): NextResponse {
  const appError = ErrorHandler.handle(error, {
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers.entries())
  })

  const isDevelopment = process.env.NODE_ENV === 'development'
  const response = ErrorHandler.toHTTPResponse(appError, isDevelopment)

  return NextResponse.json(response.body, { status: response.status })
}

/**
 * Valida request body
 */
export async function validateRequestBody<T>(
  req: NextRequest,
  schema: {
    required?: string[]
    optional?: string[]
    validate?: (data: any) => { valid: boolean; errors?: string[] }
  }
): Promise<T> {
  let body: any

  try {
    body = await req.json()
  } catch (error) {
    throw new AppError({
      type: 'INVALID_INPUT' as any,
      severity: 'MEDIUM' as any,
      userMessage: 'Dados inválidos no corpo da requisição',
      technicalMessage: 'Failed to parse JSON body',
      suggestedAction: 'Verifique se os dados estão no formato JSON correto',
      retryable: false
    })
  }

  // Validar campos obrigatórios
  if (schema.required) {
    const missingFields = schema.required.filter(field => !(field in body))
    if (missingFields.length > 0) {
      throw new AppError({
        type: 'MISSING_REQUIRED_FIELD' as any,
        severity: 'MEDIUM' as any,
        userMessage: `Campos obrigatórios faltando: ${missingFields.join(', ')}`,
        technicalMessage: `Missing required fields: ${missingFields.join(', ')}`,
        context: { missingFields, receivedFields: Object.keys(body) },
        suggestedAction: 'Preencha todos os campos obrigatórios',
        retryable: false
      })
    }
  }

  // Validação customizada
  if (schema.validate) {
    const validation = schema.validate(body)
    if (!validation.valid) {
      throw new AppError({
        type: 'VALIDATION_ERROR' as any,
        severity: 'MEDIUM' as any,
        userMessage: `Validação falhou: ${validation.errors?.join(', ')}`,
        technicalMessage: 'Custom validation failed',
        context: { errors: validation.errors, body },
        suggestedAction: 'Corrija os erros de validação e tente novamente',
        retryable: false
      })
    }
  }

  return body as T
}

/**
 * Rate limiting simples (em memória)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  options: { maxRequests: number; windowMs: number } = { maxRequests: 100, windowMs: 60000 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    // Nova janela
    const resetTime = now + options.windowMs
    rateLimitMap.set(identifier, { count: 1, resetTime })
    return { allowed: true, remaining: options.maxRequests - 1, resetTime }
  }

  if (record.count >= options.maxRequests) {
    // Limite excedido
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }

  // Incrementar contador
  record.count++
  rateLimitMap.set(identifier, record)
  return { allowed: true, remaining: options.maxRequests - record.count, resetTime: record.resetTime }
}

/**
 * Middleware de rate limiting
 */
export function withRateLimit(
  handler: APIHandler,
  options?: { maxRequests?: number; windowMs?: number }
): APIHandler {
  return async (req: NextRequest) => {
    // Usar IP como identificador (em produção, usar user ID)
    const identifier = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    
    const rateLimit = checkRateLimit(identifier, options)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: 'RATE_LIMIT_EXCEEDED',
            message: 'Muitas requisições. Tente novamente em alguns minutos.',
            retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
          }
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(options?.maxRequests || 100),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
            'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000))
          }
        }
      )
    }

    const response = await handler(req)
    
    // Adicionar headers de rate limit
    response.headers.set('X-RateLimit-Limit', String(options?.maxRequests || 100))
    response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining))
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(rateLimit.resetTime / 1000)))

    return response
  }
}

/**
 * Timeout para requisições
 */
export function withTimeout(handler: APIHandler, timeoutMs: number = 30000): APIHandler {
  return async (req: NextRequest) => {
    const timeoutPromise = new Promise<NextResponse>((_, reject) => {
      setTimeout(() => {
        reject(new AppError({
          type: 'TIMEOUT_ERROR' as any,
          severity: 'MEDIUM' as any,
          userMessage: 'A requisição demorou muito tempo e foi cancelada',
          technicalMessage: `Request timeout after ${timeoutMs}ms`,
          suggestedAction: 'Tente novamente com dados menores ou aguarde alguns minutos',
          retryable: true
        }))
      }, timeoutMs)
    })

    return Promise.race([handler(req), timeoutPromise])
  }
}

/**
 * Logging de requisições
 */
export function withLogging(handler: APIHandler): APIHandler {
  return async (req: NextRequest) => {
    const startTime = Date.now()
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    logger.info(`→ ${req.method} ${req.url}`, 'API', { requestId })

    try {
      const response = await handler(req)
      const duration = Date.now() - startTime

      logger.info(`← ${response.status} ${req.method} ${req.url} (${duration}ms)`, 'API', {
        requestId,
        status: response.status,
        duration
      })

      return response
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(`✗ ${req.method} ${req.url} (${duration}ms)`, 'API', {
        requestId,
        duration,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }
}

/**
 * Combina múltiplos middlewares
 */
export function composeMiddlewares(...middlewares: ((handler: APIHandler) => APIHandler)[]): (handler: APIHandler) => APIHandler {
  return (handler: APIHandler) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler)
  }
}

/**
 * Middleware completo padrão
 */
export const withStandardMiddleware = composeMiddlewares(
  withLogging,
  withErrorHandling,
  (handler) => withTimeout(handler, 30000),
  (handler) => withRateLimit(handler, { maxRequests: 100, windowMs: 60000 })
)
