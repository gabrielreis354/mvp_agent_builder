'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { createUserFriendlyError } from '@/lib/errors/runtime-error-handler'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error?: {
    title: string
    message: string
    suggestedAction: string
    canRetry: boolean
  }
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    const friendly = createUserFriendlyError(error)
    return {
      hasError: true,
      error: {
        title: friendly.title,
        message: friendly.message,
        suggestedAction: friendly.suggestedAction,
        canRetry: friendly.canRetry
      }
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log para serviço de monitoramento (Sentry, etc)
    console.error('ErrorBoundary caught error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {this.state.error.title}
                  </h2>
                  <p className="text-red-100 text-sm mt-1">
                    Algo deu errado
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-gray-800 leading-relaxed">
                  {this.state.error.message}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  💡 O que fazer:
                </p>
                <p className="text-sm text-blue-800">
                  {this.state.error.suggestedAction}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {this.state.error.canRetry && (
                  <button
                    onClick={this.handleReset}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Tentar Novamente
                  </button>
                )}
                
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  <Home className="h-4 w-4" />
                  Ir para Início
                </button>
              </div>

              {/* Support */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Se o problema persistir, entre em contato com o suporte em{' '}
                  <a href="mailto:suporte@automateai.com" className="text-blue-600 hover:underline">
                    suporte@automateai.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
