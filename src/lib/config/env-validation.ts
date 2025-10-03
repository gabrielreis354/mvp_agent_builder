/**
 * Validação de variáveis de ambiente obrigatórias
 * Executado no startup da aplicação
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
] as const;

const optionalButRecommended = [
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
  'GOOGLE_AI_API_KEY',
] as const;

export function validateEnv() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Verificar variáveis obrigatórias
  requiredEnvVars.forEach(key => {
    if (!process.env[key]) {
      errors.push(`❌ Missing required environment variable: ${key}`);
    }
  });

  // Validar formato do DATABASE_URL
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    errors.push('❌ DATABASE_URL must be a valid PostgreSQL connection string (postgresql://...)');
  }

  // Validar NEXTAUTH_SECRET (mínimo 32 caracteres)
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    errors.push('❌ NEXTAUTH_SECRET must be at least 32 characters long');
  }

  // Verificar se pelo menos uma chave de IA está configurada
  const hasAnyAIKey = optionalButRecommended.some(key => process.env[key]);
  if (!hasAnyAIKey) {
    warnings.push('⚠️  No AI provider API key configured. AI features will use fallback mode.');
    warnings.push('   Configure at least one: ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_AI_API_KEY');
  }

  // Verificar NODE_ENV
  if (!process.env.NODE_ENV) {
    warnings.push('⚠️  NODE_ENV not set. Defaulting to development mode.');
  }

  // Se houver erros, lançar exceção
  if (errors.length > 0) {
    console.error('\n🚨 Environment Validation Failed:\n');
    errors.forEach(err => console.error(err));
    console.error('\n📝 Please check your .env file and ensure all required variables are set.\n');
    throw new Error('Environment validation failed. See errors above.');
  }

  // Mostrar warnings
  if (warnings.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('\n⚠️  Environment Warnings:\n');
    warnings.forEach(warn => console.warn(warn));
    console.warn('');
  }

  // Sucesso
  if (process.env.NODE_ENV !== 'production') {
    console.log('✅ Environment variables validated successfully\n');
  }
}

/**
 * Validação específica para produção
 */
export function validateProductionEnv() {
  const productionErrors: string[] = [];

  // Em produção, exigir HTTPS
  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.startsWith('https://')) {
    productionErrors.push('❌ NEXTAUTH_URL must use HTTPS in production');
  }

  // Exigir pelo menos uma chave de IA em produção
  const hasAnyAIKey = optionalButRecommended.some(key => process.env[key]);
  if (!hasAnyAIKey) {
    productionErrors.push('❌ At least one AI provider API key is required in production');
  }

  // Verificar se NEXTAUTH_SECRET não é o valor padrão
  if (process.env.NEXTAUTH_SECRET === 'your-secret-key-here') {
    productionErrors.push('❌ NEXTAUTH_SECRET must be changed from default value');
  }

  if (productionErrors.length > 0) {
    console.error('\n🚨 Production Environment Validation Failed:\n');
    productionErrors.forEach(err => console.error(err));
    throw new Error('Production environment validation failed');
  }
}

/**
 * Executar validação apropriada baseada no ambiente
 */
export function validateEnvironment() {
  validateEnv();
  
  if (process.env.NODE_ENV === 'production') {
    validateProductionEnv();
  }
}
