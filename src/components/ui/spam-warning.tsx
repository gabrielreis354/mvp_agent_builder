'use client'

import { AlertTriangle, Mail, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SpamWarningProps {
  email: string
  variant?: 'default' | 'compact'
}

export function SpamWarning({ email, variant = 'default' }: SpamWarningProps) {
  if (variant === 'compact') {
    return (
      <Alert className="bg-yellow-500/10 border-yellow-500/50">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="text-sm text-gray-300">
          <strong className="text-white">⚠️ Não recebeu?</strong> Verifique sua caixa de <strong>SPAM/Lixeira</strong>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="bg-yellow-500/10 border-yellow-500/50">
      <AlertTriangle className="h-4 w-4 text-yellow-400" />
      <AlertDescription className="text-sm">
        <div className="space-y-3">
          <p className="text-white font-semibold text-sm">
            Não recebeu o email?
          </p>
          
          <ul className="space-y-2.5 text-xs text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Verifique sua caixa de <strong className="text-white">SPAM/Lixo Eletrônico</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">•</span>
              <span>Confira outras pastas do seu email corporativo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">•</span>
              <span>Marque como <strong className="text-white">"Não é spam"</strong> e adicione <strong className="text-white">suporte@simplifiqueai.com.br</strong> aos contatos da sua empresa</span>
            </li>
          </ul>

          <div className="pt-3 border-t border-yellow-500/20 space-y-1">
            <p className="text-xs text-gray-400">
              Email enviado para: <strong className="text-white">{email}</strong>
            </p>
            <p className="text-xs text-gray-500">
              Pode levar até 5 minutos para chegar
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
