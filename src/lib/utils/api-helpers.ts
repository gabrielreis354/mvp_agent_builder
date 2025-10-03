import { NextResponse } from 'next/server';

interface ErrorResponse {
  error: string;
  code: string;
  details?: string;
}

/**
 * Cria uma resposta de erro padronizada para a API
 * @param message Mensagem de erro principal
 * @param code Código de erro interno
 * @param status Código de status HTTP
 * @param originalError Erro original (para log em dev)
 */
export function createErrorResponse(
  message: string,
  code: string,
  status: number,
  originalError?: any
): NextResponse<ErrorResponse> {
  
  // Log do erro completo apenas no servidor e em desenvolvimento
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
    console.error(`[API Error - ${code}]`, {
      message,
      status,
      originalError: originalError?.message || originalError,
    });
  }

  const response: ErrorResponse = {
    error: message,
    code,
  };

  // Adicionar detalhes do erro apenas em desenvolvimento
  if (process.env.NODE_ENV === 'development' && originalError) {
    response.details = originalError.message || String(originalError);
  }

  return NextResponse.json(response, { status });
}

/**
 * Cria uma resposta de sucesso padronizada
 * @param data Dados a serem retornados
 * @param status Código de status HTTP (padrão 200)
 */
export function createSuccessResponse<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}
