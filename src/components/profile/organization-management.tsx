'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Users, Send, Crown, Shield, MoreVertical, Loader2, Edit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Member {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'USER';
  image: string | null;
}

interface Invitation {
  id: string;
  email: string;
  expires: Date;
}

export function OrganizationManagement() {
  const { data: session, update: updateSession } = useSession();
  const [emailToInvite, setEmailToInvite] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [organizationName, setOrganizationName] = useState(session?.user?.organizationName || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchMembers();
    }
  }, [session]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/organization/members');
      const data = await response.json();
      if (response.ok) {
        setMembers(data.members);
        setInvitations(data.pendingInvitations);
      } else {
        toast({ title: 'Erro', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erro de Rede', description: 'Não foi possível buscar os membros.', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleRenameOrganization = async () => {
    if (!organizationName.trim()) {
      toast({ title: 'Erro', description: 'O nome da organização não pode ser vazio.', variant: 'destructive' });
      return;
    }
    setIsSavingName(true);
    try {
      const response = await fetch('/api/organization', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: organizationName }),
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: 'Sucesso!', description: 'Organização renomeada.' });
        // Força a atualização da sessão para refletir o novo nome imediatamente.
        updateSession({ organizationName: organizationName.trim() });
      } else {
        toast({ title: 'Erro', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erro de Rede', description: 'Não foi possível renomear a organização.', variant: 'destructive' });
    }
    setIsSavingName(false);
  };

  const handleUpdateRole = async (memberId: string, newRole: 'ADMIN' | 'USER') => {
    try {
      const response = await fetch(`/api/organization/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({ title: 'Sucesso!', description: `Papel do usuário atualizado para ${newRole}.` });
        fetchMembers();
      } else {
        toast({ title: 'Erro', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erro de Rede', description: 'Não foi possível atualizar o papel.', variant: 'destructive' });
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      const response = await fetch(`/api/organization/members/${memberToRemove.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (response.ok) {
        toast({ title: 'Sucesso!', description: `Membro ${memberToRemove.name} removido.` });
        fetchMembers();
      } else {
        toast({ title: 'Erro', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erro de Rede', description: 'Não foi possível remover o membro.', variant: 'destructive' });
    }
    setMemberToRemove(null);
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/invitations/cancel/${invitationId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (response.ok) {
        toast({ title: 'Sucesso!', description: 'Convite cancelado.' });
        fetchMembers(); // Re-busca os dados para atualizar a UI
      } else {
        toast({ title: 'Erro', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erro de Rede', description: 'Não foi possível cancelar o convite.', variant: 'destructive' });
    }
  };

  const handleInvite = async () => {
    if (!emailToInvite) {
      toast({ title: 'Campo vazio', description: 'Por favor, insira um email.', variant: 'destructive' });
      return;
    }

    setIsInviting(true);
    try {
      const response = await fetch('/api/organization/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToInvite }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({ title: 'Sucesso!', description: result.message });
        setEmailToInvite('');
        fetchMembers();
      } else {
        toast({ title: 'Erro ao Convidar', description: result.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erro de Rede', description: 'Não foi possível enviar o convite.', variant: 'destructive' });
    } finally {
      setIsInviting(false);
    }
  };

  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <>
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá <span className="font-bold">{memberToRemove?.name}</span> da sua organização. Ele será movido para uma nova organização pessoal e não perderá seus dados, mas perderá o acesso aos agentes e dados desta organização. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} className="bg-red-600 hover:bg-red-700">Sim, remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-white">Gerenciar Organização</h3>
        </div>
        <div className="space-y-6">
          <div className="bg-white/5 rounded-lg p-4">
            <Label htmlFor="org-name" className="text-white font-semibold">Nome da Organização</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="org-name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="bg-white/10 border-gray-600"
              />
              <Button onClick={handleRenameOrganization} disabled={isSavingName}>
                <Edit className="w-4 h-4 mr-2" />
                {isSavingName ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="invite-email" className="text-white">Convidar Novo Membro</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="invite-email"
                type="email"
                placeholder="email@exemplo.com"
                value={emailToInvite}
                onChange={(e) => setEmailToInvite(e.target.value)}
                className="bg-white/10 border-gray-600"
              />
              <Button onClick={handleInvite} disabled={isInviting}>
                <Send className="w-4 h-4 mr-2" />
                {isInviting ? 'Enviando...' : 'Convidar'}
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-md font-semibold text-white mb-3">Membros Atuais</h4>
            {loading ? (
              <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
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
                      {member.id !== session?.user?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {member.role === 'USER' ? (
                              <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'ADMIN')}>Promover a Admin</DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'USER')}>Rebaixar para Membro</DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-500" onClick={() => setMemberToRemove(member)}>Remover</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {invitations.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold text-white mb-3">Convites Pendentes</h4>
              <div className="space-y-2">
                {invitations.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                    <p className="text-sm text-gray-300">{invite.email}</p>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleCancelInvitation(invite.id)}>Cancelar</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
