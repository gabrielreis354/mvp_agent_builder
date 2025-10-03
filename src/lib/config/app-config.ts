/**
 * Configurações centralizadas da aplicação
 * Gerencia URLs, portas e configurações específicas por ambiente
 */

export const APP_CONFIG = {
  // URLs base por ambiente
  BASE_URL: process.env.NEXTAUTH_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://yourdomain.com' 
      : 'http://localhost:3001'),
  
  // Configurações de API
  API: {
    BASE_URL: process.env.NEXTAUTH_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://yourdomain.com' 
        : 'http://localhost:3001'),
    TIMEOUT: 30000, // 30 segundos
    RETRY_ATTEMPTS: 3,
  },
  
  // Configurações de autenticação
  AUTH: {
    SIGN_IN_URL: '/auth/signin',
    SIGN_UP_URL: '/auth/signup',
    CALLBACK_URL: process.env.NEXTAUTH_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://yourdomain.com' 
        : 'http://localhost:3001'),
  },
  
  // Configurações de upload
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['application/pdf', 'text/plain', 'text/csv'],
    UPLOAD_DIR: './uploads',
  },
  
  // Configurações de rate limiting
  RATE_LIMIT: {
    API: { requests: 100, window: 15 * 60 * 1000 }, // 100 req/15min
    EXECUTION: { requests: 10, window: 60 * 1000 }, // 10 req/min
    AUTH: { requests: 5, window: 15 * 60 * 1000 }, // 5 req/15min
    UPLOAD: { requests: 20, window: 60 * 1000 }, // 20 req/min
  },
  
  // Configurações de desenvolvimento
  DEV: {
    ENABLE_LOGS: process.env.NODE_ENV !== 'production',
    ENABLE_DEBUG: process.env.NODE_ENV === 'development',
    MOCK_AI: process.env.MOCK_AI === 'true',
  },
  
  // Configurações de produção
  PRODUCTION: {
    ENABLE_COMPRESSION: true,
    ENABLE_CACHING: true,
    ENABLE_MONITORING: true,
    SECURE_COOKIES: true,
  },
} as const;

/**
 * Utilitários para construir URLs
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = APP_CONFIG.API.BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}/api${cleanEndpoint}`;
};

export const buildUrl = (path: string): string => {
  const baseUrl = APP_CONFIG.BASE_URL.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Verificar se estamos em produção
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Verificar se estamos em desenvolvimento
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Obter configurações específicas do ambiente
 */
export const getEnvironmentConfig = () => {
  if (isProduction()) {
    return {
      ...APP_CONFIG,
      ...APP_CONFIG.PRODUCTION,
    };
  }
  
  return {
    ...APP_CONFIG,
    ...APP_CONFIG.DEV,
  };
};
