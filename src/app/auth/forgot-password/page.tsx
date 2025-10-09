'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Brain, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao enviar email');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Erro ao processar solicitação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Professional background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent -z-10" />
      <div className="fixed inset-0 bg-grid-white/[0.02] -z-10" />
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <Brain className="h-10 w-10 text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              SimplifiqueIA
            </h1>
          </Link>
          <h2 className="text-2xl font-bold mb-2 text-white">Esqueceu sua senha?</h2>
          <p className="text-gray-300">
            {success 
              ? 'Verifique seu email para continuar'
              : 'Sem problemas! Enviaremos instruções para redefinir.'
            }
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="flex justify-center">
                <div className="rounded-full bg-green-500/20 p-4">
                  <CheckCircle className="h-12 w-12 text-green-400" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-white">Email enviado!</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Se existe uma conta associada a <strong className="text-white">{email}</strong>, 
                  você receberá um email com instruções para redefinir sua senha.
                </p>
                <p className="text-gray-400 text-xs">
                  Não esqueça de verificar sua caixa de spam.
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  onClick={() => router.push('/auth/signin')}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Login
                </Button>
                
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="w-full text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Enviar para outro email
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      disabled={isLoading}
                      className="pl-10 bg-white/10 border-white/30 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50 backdrop-blur-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Digite o email associado à sua conta
                  </p>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold text-white flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="h-5 w-5" />
                      Enviar Link de Redefinição
                    </>
                  )}
                </motion.button>
              </form>

              <div className="text-center text-sm text-gray-300 mt-6">
                Lembrou sua senha?{' '}
                <Link 
                  href="/auth/signin" 
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Fazer login
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Back to home link */}
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="text-gray-300 hover:text-white text-sm transition-colors inline-flex items-center gap-1"
          >
            ← Voltar para página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
