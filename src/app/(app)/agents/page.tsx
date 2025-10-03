'use client'

import { useSession } from 'next-auth/react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentsSection } from '@/components/profile/agents-section';
import { OrganizationAgentsSection } from '@/components/profile/organization-agents-section';
import { OrganizationManagement } from '@/components/profile/organization-management';
import { Brain, Users, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AgentsPage() {
  const { data: session } = useSession();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Gerenciador de Agentes</h1>
            <Link href="/builder">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Criar Novo Agente
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="my-agents" className="space-y-6">
            <TabsList className="bg-white/10 backdrop-blur-lg p-1 rounded-lg">
              <TabsTrigger value="my-agents" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
                <Brain className="w-4 h-4 mr-2" />
                Meus Agentes
              </TabsTrigger>
              <TabsTrigger value="org-agents" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
                <Users className="w-4 h-4 mr-2" />
                Agentes da Organização
              </TabsTrigger>
              {session?.user?.role === 'ADMIN' && (
                <TabsTrigger value="manage-org" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  Gerenciar Organização
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="my-agents">
              {session?.user?.id && <AgentsSection userId={session.user.id} />}
            </TabsContent>
            
            <TabsContent value="org-agents">
              <OrganizationAgentsSection />
            </TabsContent>
            
            {session?.user?.role === 'ADMIN' && (
              <TabsContent value="manage-org">
                <OrganizationManagement />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
}
