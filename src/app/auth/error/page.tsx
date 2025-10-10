'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Brain, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Suspense } from 'react';

const errorMessages: Record<string, { title: string; description: string; solution: string[] }> = {
  Configuration: {
    title: 'Erro de Configuração',
    description: 'Há um problema com a configuração do servidor.',
    solution: [
      'Entre em contato com o suporte técnico',
      'Verifique se o sistema está configurado corretamente',
    ],
  },
  AccessDenied: {
    title: 'Acesso Negado',
    description: 'Você não tem permissão para acessar este recurso.',
    solution: [
      'Verifique se está usando a conta correta',
      'Entre em contato com o administrador do sistema',
    ],
  },
  Verification: {
    title: 'Erro de Verificação',
    description: 'O link de verificação expirou ou é inválido.',
    solution: [
      'Solicite um novo link de verificação',
      'Tente fazer login novamente',
    ],
  },
  OAuthSignin: {
    title: 'Erro ao Iniciar Login OAuth',
    description: 'Não foi possível iniciar o processo de login com o provedor.',
    solution: [
      'Verifique sua conexão com a internet',
      'Tente novamente em alguns instantes',
      'Use login com email e senha como alternativa',
    ],
  },
  OAuthCallback: {
    title: 'Erro no Callback OAuth',
    description: 'Ocorreu um erro ao processar a resposta do provedor de login.',
    solution: [
      'Limpe os cookies do navegador',
      'Tente fazer login novamente',
      'Verifique se o email está correto',
    ],
  },
  OAuthCreateAccount: {
    title: 'Erro ao Criar Conta',
    description: 'Não foi possível criar sua conta automaticamente.',
    solution: [
      'Tente criar uma conta manualmente',
      'Verifique se o email já está cadastrado',
      'Entre em contato com o suporte',
    ],
  },
  EmailCreateAccount: {
    title: 'Erro ao Criar Conta por Email',
    description: 'Não foi possível criar sua conta com email.',
    solution: [
      'Verifique se o email é válido',
      'Tente usar outro email',
      'Entre em contato com o suporte',
    ],
  },
  Callback: {
    title: 'Erro de Callback',
    description: 'Ocorreu um erro ao processar o retorno da autenticação.',
    solution: [
      'Limpe o cache e cookies do navegador',
      'Tente fazer login novamente',
      'Use modo anônimo do navegador',
    ],
  },
  OAuthAccountNotLinked: {
    title: 'Conta Não Vinculada',
    description: 'Este email já está cadastrado com outro método de login.',
    solution: [
      'Faça login com o método original (email/senha)',
      'Ou use outro email para login com Google',
    ],
  },
  EmailSignin: {
    title: 'Erro no Login por Email',
    description: 'Não foi possível enviar o email de login.',
    solution: [
      'Verifique se o email está correto',
      'Tente usar senha ao invés de link mágico',
    ],
  },
  CredentialsSignin: {
    title: 'Credenciais Inválidas',
    description: 'Email ou senha incorretos.',
    solution: [
      'Verifique se digitou corretamente',
      'Use "Esqueci minha senha" se necessário',
      'Tente fazer login com Google',
    ],
  },
  SessionRequired: {
    title: 'Sessão Necessária',
    description: 'Você precisa estar logado para acessar esta página.',
    solution: [
      'Faça login para continuar',
      'Sua sessão pode ter expirado',
    ],
  },
  Default: {
    title: 'Erro de Autenticação',
    description: 'Ocorreu um erro inesperado durante a autenticação.',
    solution: [
      'Tente fazer login novamente',
      'Limpe os cookies do navegador',
      'Entre em contato com o suporte se o problema persistir',
    ],
  },
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error') || 'Default';
  
  const errorInfo = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600/20 via-transparent to-transparent -z-10" />
      <div className="fixed inset-0 bg-grid-white/[0.02] -z-10" />
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <Brain className="h-10 w-10 text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              SimplifiqueIA
            </h1>
          </Link>
        </div>

        {/* Error Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl"
        >
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-red-500/20 p-4">
              <AlertCircle className="h-12 w-12 text-red-400" />
            </div>
          </div>

          {/* Error Info */}
          <div className="text-center space-y-4 mb-6">
            <h2 className="text-2xl font-bold text-white">{errorInfo.title}</h2>
            <p className="text-gray-300">{errorInfo.description}</p>
            
            {/* Error Code */}
            <div className="inline-block px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg">
              <code className="text-xs text-red-300">Código: {error}</code>
            </div>
          </div>

          {/* Solutions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-300 mb-3">💡 Como Resolver:</h3>
            <ul className="space-y-2">
              {errorInfo.solution.map((step, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold text-white hover:shadow-lg transition-all"
            >
              <RefreshCw className="h-5 w-5" />
              Tentar Novamente
            </Link>
            
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-lg font-medium text-white hover:bg-white/20 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar para Início
            </Link>
          </div>

          {/* Debug Info (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 p-4 bg-black/20 rounded-lg">
              <summary className="text-xs text-gray-400 cursor-pointer">
                🔧 Informações de Debug
              </summary>
              <pre className="mt-2 text-xs text-gray-300 overflow-auto">
                {JSON.stringify(
                  {
                    error,
                    url: typeof window !== 'undefined' ? window.location.href : 'N/A',
                    timestamp: new Date().toISOString(),
                  },
                  null,
                  2
                )}
              </pre>
            </details>
          )}
        </motion.div>

        {/* Support Link */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Precisa de ajuda?{' '}
            <a href="mailto:suporte@simplifiqueai.com.br" className="text-blue-400 hover:text-blue-300">
              Entre em contato com o suporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
