'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Brain, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [callbackUrl, setCallbackUrl] = useState('/builder');
  const router = useRouter();

  // Carregar parâmetros da URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const callback = params.get('callbackUrl') || '/builder';
      setCallbackUrl(callback);
    }
  }, []);

  // Detectar retorno do OAuth
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('error');
    const oauthAttempt = typeof window !== 'undefined' 
      ? sessionStorage.getItem('oauth_attempt') 
      : null;

    if (oauthError) {
      // Log apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.error('[SIGNIN] Erro OAuth:', oauthError);
      }
      
      const errorMessages: Record<string, string> = {
        'OAuthSignin': 'Erro ao iniciar login com Google',
        'OAuthCallback': 'Erro ao processar resposta do Google',
        'OAuthCreateAccount': 'Erro ao criar conta',
        'OAuthAccountNotLinked': 'Este email já está cadastrado com outro método',
        'AccessDenied': 'Acesso negado pelo Google',
      };
      
      setError(errorMessages[oauthError] || `Erro: ${oauthError}`);
      sessionStorage.removeItem('oauth_attempt');
    } else if (oauthAttempt) {
      // Verificar se sessão foi criada
      getSession().then(session => {
        if (session) {
          sessionStorage.removeItem('oauth_attempt');
          
          // Redirecionar para callback URL
          const attempt = JSON.parse(oauthAttempt);
          router.push(attempt.callbackUrl || '/builder');
        } else {
          sessionStorage.removeItem('oauth_attempt');
        }
      });
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Verificar se email está verificado ANTES de tentar login
      const checkResponse = await fetch('/api/auth/check-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        
        if (!checkData.verified) {
          setError('Por favor, verifique seu email antes de fazer login. Verifique sua caixa de entrada.');
          // Redirecionar para página de verificação após 2 segundos
          setTimeout(() => {
            router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
          }, 2000);
          setIsLoading(false);
          return;
        }
      }

      // 2. Se verificado, tentar login
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

  const handleOAuthSignIn = async (provider: 'google') => {
    setIsLoading(true);
    setError('');

    try {
      // Salvar estado antes do redirect
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('oauth_attempt', JSON.stringify({
          provider,
          callbackUrl,
          timestamp: new Date().toISOString()
        }));
      }
      
      // Com redirect: true, esta função NÃO retorna - ela redireciona
      await signIn(provider, { 
        callbackUrl,
        redirect: true,
      });
      
      // Este código só executa se NÃO redirecionar (erro)
      setError('Não foi possível iniciar o login. Tente novamente.');
      setIsLoading(false);
      
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[SIGNIN] Exceção OAuth:', err);
      }
      setError('Erro ao fazer login com Google. Tente novamente.');
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
              SimplifiqueIA
            </h1>
          </Link>
          <h2 className="text-2xl font-bold mb-2 text-white">Bem-vindo de volta</h2>
          <p className="text-gray-300">Acesse sua conta para continuar criando agentes inteligentes</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          {error && (
            <Alert 
              variant="destructive" 
              className="mb-6 bg-red-500/90 border-red-400 text-white backdrop-blur-sm shadow-lg"
            >
              <AlertDescription className="text-white font-medium">
                ⚠️ {error}
              </AlertDescription>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white font-medium">Senha</Label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Esqueci minha senha
                </Link>
              </div>
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

          <motion.button
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-3 border border-white/30 rounded-lg font-medium text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 backdrop-blur-sm"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </motion.button>

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
