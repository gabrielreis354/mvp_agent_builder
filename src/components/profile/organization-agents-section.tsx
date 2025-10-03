'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Copy, Edit, Users, Building, Shield, User, Crown, Brain, Loader2 } from 'lucide-react';
import { AgentCardSkeleton } from './agent-card-skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Tipos de dados aninhados
interface AgentUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  user: AgentUser;
}

interface Member {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
}

interface OrganizationDetails {
  id: string;
  name: string;
  description: string | null;
  users: Member[];
  agents: Agent[];
}

export function OrganizationAgentsSection() {
  const { data: session } = useSession();
  const [orgDetails, setOrgDetails] = useState<OrganizationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [copyingAgentId, setCopyingAgentId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (session) {
      fetchOrganizationDetails();
    }
  }, [session]);

  const fetchOrganizationDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/organization/details');
      if (response.ok) {
        const data = await response.json();
        setOrgDetails(data);
      } else {
        toast({ title: 'Erro', description: 'Falha ao buscar detalhes da organização.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Erro:', error);
      toast({ title: 'Erro de Rede', description: 'Não foi possível conectar à API.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAgent = async (agentId: string) => {
    setCopyingAgentId(agentId);
    try {
      const response = await fetch('/api/agents/duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentId }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Agente Copiado!',
          description: data.message || 'O agente foi copiado para "Meus Agentes"',
        });
        
        // Opcional: Redirecionar para "Meus Agentes" ou atualizar a lista
        setTimeout(() => {
          window.location.href = '/profile?tab=my-agents';
        }, 1500);
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro ao Copiar',
          description: errorData.error || 'Não foi possível copiar o agente',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao copiar agente:', error);
      toast({
        title: 'Erro de Rede',
        description: 'Não foi possível conectar à API',
        variant: 'destructive',
      });
    } finally {
      setCopyingAgentId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Skeleton para o Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
        {/* Skeleton para Membros e Agentes */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!orgDetails) {
    return <p className="text-center text-gray-400">Não foi possível carregar os dados da organização.</p>;
  }

  return (
    <div className="space-y-8">
      {/* Organization Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex items-center gap-4 mb-2">
            <Building className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">{orgDetails.name}</h1>
        </div>
        {orgDetails.description && <p className="text-gray-300 ml-12">{orgDetails.description}</p>}
      </div>

      {/* Members List */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="p-2 bg-slate-700/70 rounded-lg border border-slate-600">
            <Users className="w-6 h-6 text-blue-400"/>
          </div>
          Membros
        </h2>
        <div className="space-y-3">
          {orgDetails.users.map((member) => (
            <div key={member.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.image || ''} alt={member.name || 'Avatar'} />
                  <AvatarFallback>{member.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white">{member.name}</p>
                  <p className="text-sm text-gray-400">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {member.role === 'ADMIN' ? (
                  <span className="flex items-center text-xs font-semibold text-amber-400 bg-amber-900/50 px-2 py-1 rounded-full">
                    <Crown className="w-3 h-3 mr-1" />
                    Admin
                  </span>
                ) : (
                  <span className="flex items-center text-xs font-semibold text-gray-300 bg-gray-700 px-2 py-1 rounded-full">
                    <Shield className="w-3 h-3 mr-1" />
                    Membro
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Organization Agents */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="p-2 bg-slate-700/70 rounded-lg border border-slate-600">
            <Brain className="w-6 h-6 text-blue-400"/>
          </div>
          Agentes da Organização
        </h2>
        {orgDetails.agents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orgDetails.agents.map(agent => {
                    const isOwner = agent.user.id === session?.user?.id;
                    const isAdmin = session?.user?.role === 'ADMIN';
                    const canEdit = isOwner || isAdmin;

                    return (
                        <div key={agent.id} className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border ${isOwner ? 'border-blue-500' : 'border-white/20'} transition-all hover:shadow-lg hover:bg-white/15 flex flex-col justify-between`}>
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-white line-clamp-1">{agent.name}</h3>
                                    {isOwner && <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">Meu</Badge>}
                                </div>
                                <p className="text-sm text-gray-400 mb-4 line-clamp-2 h-10">{agent.description}</p>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <div className="flex items-center gap-2">
                                    <Avatar className="w-6 h-6">
                                      <AvatarImage src={agent.user.image || ''} alt={agent.user.name || 'Criador'} />
                                      <AvatarFallback className="text-xs">
                                        {agent.user.name?.charAt(0).toUpperCase() || 'U'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <p className="text-xs text-gray-400">Por: {agent.user.name}</p>
                                </div>
                                <div className="flex gap-2">
                                    {!isOwner && (
                                        <Button 
                                          size="icon" 
                                          variant="outline" 
                                          onClick={() => handleCopyAgent(agent.id)}
                                          disabled={copyingAgentId === agent.id}
                                        >
                                          {copyingAgentId === agent.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                          ) : (
                                            <Copy className="w-4 h-4" />
                                          )}
                                        </Button>
                                    )}
                                    {canEdit && (
                                        <Button size="icon" variant="outline" onClick={() => window.location.href = `/builder?load=${agent.id}`}><Edit className="w-4 h-4" /></Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        ) : (
            <p className="text-center text-gray-400 py-8">Nenhum agente público encontrado nesta organização.</p>
        )}
      </div>
    </div>
  );
}
