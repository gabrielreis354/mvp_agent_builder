'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

function VerifyEmailContent() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams?.get('email') || '';
    setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          router.push('/auth/signin?verified=true');
        }, 2000);
      } else {
        setError(data.error || 'Código inválido');
      }
    } catch (err) {
      setError('Erro ao verificar código. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');
    setResendMessage('');

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setResendMessage('✅ Novo código enviado! Verifique sua caixa de entrada.');
      } else {
        setError(data.error || 'Erro ao reenviar código');
      }
    } catch (err) {
      setError('Erro ao reenviar código. Tente novamente.');
    } finally {
      setIsResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Email Verificado! ✅
            </h1>
            <p className="text-blue-200 mb-4">
              Sua conta foi ativada com sucesso.
            </p>
            <p className="text-sm text-blue-300">
              Redirecionando para o login...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4"
            >
              <Mail className="w-8 h-8 text-blue-300" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Verifique seu Email
            </h1>
            <p className="text-blue-200">
              Enviamos um código de 6 dígitos para
            </p>
            <p className="text-white font-semibold mt-1">
              {email}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Código de Verificação
              </label>
              <Input
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="000000"
                maxLength={6}
                className="w-full text-center text-3xl tracking-[0.5em] font-mono bg-white/10 border-white/30 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50 backdrop-blur-sm"
                required
                autoFocus
              />
              <p className="text-xs text-blue-300 mt-2 text-center">
                Digite o código de 6 dígitos que você recebeu
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert 
                  variant="destructive"
                  className="bg-red-500/90 border-red-400 text-white backdrop-blur-sm shadow-lg"
                >
                  <AlertDescription className="text-white font-medium">
                    ⚠️ {error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {resendMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert className="bg-green-500/90 border-green-400 text-white backdrop-blur-sm shadow-lg">
                  <AlertDescription className="text-white font-medium">
                    {resendMessage}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar Email'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-blue-300">
              Não recebeu o código?
            </p>
            <button
              type="button"
              disabled={isResending}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium underline disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              onClick={handleResendCode}
            >
              {isResending ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Reenviando...
                </>
              ) : (
                'Reenviar código'
              )}
            </button>
            
            <div className="pt-4 border-t border-white/10">
              <Link 
                href="/auth/signin"
                className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
              >
                ← Voltar para o login
              </Link>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-blue-500/10 backdrop-blur-sm border border-blue-400/30 rounded-lg p-4"
        >
          <p className="text-sm text-blue-200 text-center">
            💡 <strong>Dica:</strong> Verifique também sua pasta de spam se não encontrar o email.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
