'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Brain, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Carregar token da URL
  useEffect(() => {
    if (searchParams) {
      const tokenParam = searchParams.get('token');
      setToken(tokenParam);
    }
  }, [searchParams]);

  // Validar token ao carregar
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token não fornecido');
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setTokenValid(true);
          setEmail(data.email);
        } else {
          setError(data.error || 'Token inválido ou expirado');
        }
      } catch (err) {
        setError('Erro ao validar token');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validações
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao redefinir senha');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/auth/signin');
        }, 3000);
      }
    } catch (err) {
      setError('Erro ao processar solicitação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular força da senha
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.length >= 10) strength++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/\d/.test(pass)) strength++;
    if (/[^a-zA-Z0-9]/.test(pass)) strength++;

    const levels = [
      { strength: 0, label: '', color: '' },
      { strength: 1, label: 'Fraca', color: 'bg-red-500' },
      { strength: 2, label: 'Média', color: 'bg-yellow-500' },
      { strength: 3, label: 'Boa', color: 'bg-blue-500' },
      { strength: 4, label: 'Forte', color: 'bg-green-500' },
      { strength: 5, label: 'Muito Forte', color: 'bg-green-600' },
    ];

    return levels[Math.min(strength, 5)];
  };

  const passwordStrength = getPasswordStrength(password);

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
          <h2 className="text-2xl font-bold mb-2 text-white">Redefinir Senha</h2>
          <p className="text-gray-300">
            {success 
              ? 'Senha redefinida com sucesso!'
              : 'Crie uma nova senha para sua conta'
            }
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          {isValidating ? (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
              <p className="text-gray-300">Validando link...</p>
            </div>
          ) : success ? (
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
                <h3 className="text-xl font-semibold text-white">Senha Redefinida!</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Sua senha foi alterada com sucesso.
                </p>
                <p className="text-gray-400 text-xs">
                  Redirecionando para o login...
                </p>
              </div>

              <Button
                onClick={() => router.push('/auth/signin')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg"
              >
                Ir para Login
              </Button>
            </motion.div>
          ) : !tokenValid ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="flex justify-center">
                <div className="rounded-full bg-red-500/20 p-4">
                  <AlertCircle className="h-12 w-12 text-red-400" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-white">Link Inválido</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {error || 'Este link de redefinição é inválido ou expirou.'}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/auth/forgot-password')}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg"
                >
                  Solicitar Novo Link
                </Button>
                
                <Link
                  href="/auth/signin"
                  className="block text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Voltar para Login
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {email && (
                <div className="mb-6 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
                  <p className="text-sm text-blue-300">
                    Redefinindo senha para: <strong className="text-white">{email}</strong>
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white font-medium">
                    Nova Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                      className="pl-10 pr-10 bg-white/10 border-white/30 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50 backdrop-blur-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              level <= passwordStrength.strength
                                ? passwordStrength.color
                                : 'bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      {passwordStrength.label && (
                        <p className="text-xs text-gray-400">
                          Força da senha: <span className="text-white">{passwordStrength.label}</span>
                        </p>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400">
                    Mínimo de 6 caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white font-medium">
                    Confirmar Nova Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                      className="pl-10 pr-10 bg-white/10 border-white/30 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50 backdrop-blur-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-400">
                      As senhas não coincidem
                    </p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading || password !== confirmPassword || password.length < 6}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold text-white flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Redefinindo...
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      Redefinir Senha
                    </>
                  )}
                </motion.button>
              </form>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
