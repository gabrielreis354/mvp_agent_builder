// Configurações específicas para produção
export const PRODUCTION_CONFIG = {
  // URLs de serviços externos (serão proxies em produção)
  SERVICES: {
    PDF_SERVICE: '/api/pdf-service',
    BACKEND_API: '/api/backend',
    PYTHON_SERVICE: '/api/python-service'
  },
  
  // Timeouts otimizados para produção
  TIMEOUTS: {
    API_REQUEST: 30000,
    FILE_UPLOAD: 60000,
    AI_PROCESSING: 45000
  },
  
  // Limites de produção
  LIMITS: {
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    MAX_CONCURRENT_REQUESTS: 10,
    RATE_LIMIT_PER_MINUTE: 100
  },
  
  // Features habilitadas em produção
  FEATURES: {
    ENABLE_ANALYTICS: true,
    ENABLE_ERROR_TRACKING: true,
    ENABLE_PERFORMANCE_MONITORING: true,
    ENABLE_CACHING: true
  }
}
