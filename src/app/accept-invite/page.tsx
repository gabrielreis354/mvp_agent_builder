'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, CheckCircle, XCircle } from 'lucide-react';
import { CredentialsLoginForm } from '@/components/auth/credentials-login-form';

interface Invitation {
  email: string;
  organization: {
    name: string;
  };
}

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError('Token de convite não encontrado na URL.');
      setLoading(false);
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`/api/invitations/validate/${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setInvitation(data.invitation);
        } else {
          setError(data.error || 'Falha ao validar o convite.');
        }
      } catch (err) {
        setError('Erro de rede ao tentar validar o convite.');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSignIn = (provider: 'google') => {
    // Após o login, o usuário será redirecionado para a página de junção com o token.
    const callbackUrl = `/join-organization?token=${token}`;
    signIn(provider, { callbackUrl });
  };

  const renderContent = () => {
    if (loading) {
      return <Loader2 className="w-12 h-12 text-white animate-spin" />;
    }

    if (error) {
      return (
        <>
          <XCircle className="w-16 h-16 text-red-400 mb-4" />
          <h1 className="text-2xl font-bold text-white">Convite Inválido</h1>
          <p className="text-gray-300 mt-2">{error}</p>
        </>
      );
    }

    if (invitation) {
      return (
        <>
          <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
          <h1 className="text-2xl font-bold text-white">Você foi convidado!</h1>
          <p className="text-gray-300 mt-2">
            Para se juntar à organização <span className="font-bold text-blue-300">{invitation.organization.name}</span> como <span className="font-bold text-amber-300">{invitation.email}</span>.
          </p>
          <div className="mt-6 space-y-4 w-full max-w-xs">
            {/* Botão Google estilizado */}
            <button
              onClick={() => handleSignIn('google')}
              className="w-full px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 font-medium rounded-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Entrar com Google
            </button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-800 px-2 text-gray-400">
                  Ou entre com seu email
                </span>
              </div>
            </div>

            <CredentialsLoginForm callbackUrl={`/join-organization?token=${token}`} email={invitation.email} />
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center flex flex-col items-center w-full max-w-md">
        {renderContent()}
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center"><div className="text-white">Carregando...</div></div>}>
      <AcceptInviteContent />
    </Suspense>
  );
}
