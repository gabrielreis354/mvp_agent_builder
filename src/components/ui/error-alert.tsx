'use client'

import React from 'react'
import { AlertCircle, AlertTriangle, XCircle, RefreshCw, X } from 'lucide-react'

export interface ErrorAlertProps {
  title?: string
  message: string
  suggestedAction?: string
  canRetry?: boolean
  onRetry?: () => void
  onDismiss?: () => void
  severity?: 'error' | 'warning' | 'info'
}

export function ErrorAlert({
  title,
  message,
  suggestedAction,
  canRetry = false,
  onRetry,
  onDismiss,
  severity = 'error'
}: ErrorAlertProps) {
  const styles = {
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-600',
      title: 'text-red-900',
      message: 'text-red-800',
      action: 'text-red-700',
      button: 'bg-red-600 hover:bg-red-700',
      IconComponent: XCircle
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-900',
      message: 'text-yellow-800',
      action: 'text-yellow-700',
      button: 'bg-yellow-600 hover:bg-yellow-700',
      IconComponent: AlertTriangle
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-900',
      message: 'text-blue-800',
      action: 'text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700',
      IconComponent: AlertCircle
    }
  }

  const style = styles[severity]
  const IconComponent = style.IconComponent

  return (
    <div className={`border rounded-lg p-4 ${style.container} relative`}>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="flex gap-3">
        <div className={`flex-shrink-0 ${style.icon}`}>
          <IconComponent className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`font-semibold mb-1 ${style.title}`}>
              {title}
            </h3>
          )}

          <p className={`text-sm leading-relaxed ${style.message}`}>
            {message}
          </p>

          {suggestedAction && (
            <div className="mt-3 pt-3 border-t border-current/10">
              <p className={`text-sm font-medium mb-1 ${style.action}`}>
                💡 O que fazer:
              </p>
              <p className={`text-sm ${style.action}`}>
                {suggestedAction}
              </p>
            </div>
          )}

          {canRetry && onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className={`flex items-center gap-2 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium ${style.button}`}
              >
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Hook para gerenciar estado de erro
export function useErrorAlert() {
  const [error, setError] = React.useState<ErrorAlertProps | null>(null)

  const showError = React.useCallback((errorProps: ErrorAlertProps) => {
    setError(errorProps)
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    showError,
    clearError
  }
}
