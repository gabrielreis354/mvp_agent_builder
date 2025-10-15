'use client';

import { useEffect } from 'react';
import { Brain, AlertCircle, RefreshCw, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro no console (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.error('🔴 [ERROR BOUNDARY]:', error);
    }
  }, [error]);

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
            <h2 className="text-2xl font-bold text-white">Ops! Algo deu errado</h2>
            <p className="text-gray-300">
              Ocorreu um erro inesperado. Não se preocupe, estamos trabalhando para resolver.
            </p>
            
            {/* Error Message (apenas em desenvolvimento) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left">
                <p className="text-xs text-red-300 font-mono break-all">
                  {error.message}
                </p>
              </div>
            )}
          </div>

          {/* Solutions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-300 mb-3">💡 O que você pode fazer:</h3>
            <ul className="space-y-2">
              <li className="text-sm text-gray-300 flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span>Tente recarregar a página</span>
              </li>
              <li className="text-sm text-gray-300 flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span>Verifique sua conexão com a internet</span>
              </li>
              <li className="text-sm text-gray-300 flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span>Limpe o cache do navegador</span>
              </li>
              <li className="text-sm text-gray-300 flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span>Entre em contato com o suporte se o problema persistir</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold text-white hover:shadow-lg transition-all"
            >
              <RefreshCw className="h-5 w-5" />
              Tentar Novamente
            </button>
            
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-lg font-medium text-white hover:bg-white/20 transition-all"
            >
              <Home className="h-5 w-5" />
              Voltar para Início
            </Link>
          </div>

          {/* Debug Info (apenas em desenvolvimento) */}
          {process.env.NODE_ENV === 'development' && error.digest && (
            <div className="mt-6 p-4 bg-black/20 rounded-lg">
              <p className="text-xs text-gray-400">
                <strong>Error Digest:</strong> {error.digest}
              </p>
            </div>
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
