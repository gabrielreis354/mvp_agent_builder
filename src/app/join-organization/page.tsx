'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

function JoinOrganizationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processando seu convite...');

  // Carregar token da URL
  useEffect(() => {
    if (searchParams) {
      const tokenParam = searchParams.get('token');
      setToken(tokenParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!token) {
      setMessage('Token de convite inválido.');
      setStatus('error');
      return;
    }

    const joinOrganization = async () => {
      try {
        const response = await fetch('/api/organization/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (response.ok) {
          setMessage(result.message);
          setStatus('success');
        } else {
          setMessage(result.error || 'Ocorreu um erro.');
          setStatus('error');
        }
      } catch (err) {
        setMessage('Erro de rede. Tente novamente mais tarde.');
        setStatus('error');
      }
    };

    joinOrganization();
  }, [token]);

  const renderIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-16 h-16 text-white animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-400" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-400" />;
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center flex flex-col items-center w-full max-w-md space-y-4">
          {renderIcon()}
          <h1 className="text-2xl font-bold text-white">{message}</h1>
          {status !== 'loading' && (
            <Button onClick={() => router.push('/profile')} className="mt-4">
              Ir para o Perfil
            </Button>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

export default function JoinOrganizationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center"><div className="text-white">Carregando...</div></div>}>
      <JoinOrganizationContent />
    </Suspense>
  );
}
