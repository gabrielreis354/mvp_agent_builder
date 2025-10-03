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

  const handleSignIn = (provider: 'google' | 'github') => {
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
            <Button onClick={() => handleSignIn('google')} className="w-full bg-red-600 hover:bg-red-700">Entrar com Google</Button>
            <Button onClick={() => handleSignIn('github')} className="w-full bg-gray-700 hover:bg-gray-800">Entrar com GitHub</Button>
            
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
