/**
 * Inicialização da aplicação
 * Valida ambiente e configurações críticas
 */

import { validateEnvironment } from './env-validation';

// Executar validação no startup
if (typeof window === 'undefined') {
  // Apenas no servidor
  try {
    validateEnvironment();
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}
