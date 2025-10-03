'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Linkedin, Mail, Brain, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/builder';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou senha inválidos');
      } else {
        // Refresh session and redirect to callback URL
        await getSession();
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'linkedin') => {
    setIsLoading(true);
    setError('');

    try {
      await signIn(provider, { callbackUrl });
    } catch (err) {
      setError(`Erro ao fazer login com ${provider}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Professional background with project colors */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent -z-10" />
      <div className="fixed inset-0 bg-grid-white/[0.02] -z-10" />
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <Brain className="h-10 w-10 text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AutomateAI
            </h1>
          </Link>
          <h2 className="text-2xl font-bold mb-2 text-white">Bem-vindo de volta</h2>
          <p className="text-gray-300">Acesse sua conta para continuar criando agentes inteligentes</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={isLoading}
                className="bg-white/10 border-white/30 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50 backdrop-blur-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-medium">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="bg-white/10 border-white/30 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50 backdrop-blur-sm"
              />
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
                  Entrando...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Entrar
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/10 px-3 text-gray-300 backdrop-blur-sm rounded-full">
                Ou continue com
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <motion.button
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-3 border border-white/30 rounded-lg font-medium text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 backdrop-blur-sm"
            >
              <Mail className="h-4 w-4" />
              Google
            </motion.button>
            <motion.button
              onClick={() => handleOAuthSignIn('linkedin')}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-3 border border-white/30 rounded-lg font-medium text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 backdrop-blur-sm"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </motion.button>
          </div>

          <div className="text-center text-sm text-gray-300 mt-6">
            Não tem uma conta?{' '}
            <Link 
              href="/auth/signup" 
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Criar conta
            </Link>
          </div>
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
