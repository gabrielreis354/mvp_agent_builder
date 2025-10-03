'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, FileText, Brain, TrendingUp, 
  Calendar, Clock, Settings, Loader2 
} from 'lucide-react'
import { ReportsSection } from '@/components/profile/reports-section'
import { StatsCard } from '@/components/profile/stats-card'
import { AgentsSection } from '@/components/profile/agents-section'
import { SettingsSection } from '@/components/profile/settings-section';

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalExecutions: 0,
    executionTimeSaved: 0,
    agentsCreated: 0,
    mostUsedAgent: 'Carregando...',
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchStats()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      setLoadingStats(true)
      const response = await fetch('/api/profile/stats')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStats(data.stats)
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                {session.user.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || 'User'} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl font-bold text-white">{session.user.name}</h1>
                <p className="text-purple-300 font-medium">{session.user.email}</p>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {session.user.jobTitle && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <User className="w-4 h-4" />
                      <span>{session.user.jobTitle}</span>
                    </div>
                  )}
                  {(session.user as any).department && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Settings className="w-4 h-4" />
                      <span>{(session.user as any).department}</span>
                    </div>
                  )}
                  {(session.user as any).companySize && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Brain className="w-4 h-4" />
                      <span>Empresa: {(session.user as any).companySize}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span>Membro desde: {new Date(session.user.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            icon={TrendingUp} 
            label="Total de Execuções" 
            value={stats.totalExecutions.toLocaleString('pt-BR')} 
            color="green"
          />
          <StatsCard 
            icon={Clock} 
            label="Horas Economizadas" 
            value={`${stats.executionTimeSaved}h`} 
            color="blue"
          />
          <StatsCard 
            icon={Brain} 
            label="Agentes Criados" 
            value={stats.agentsCreated}
            color="purple"
          />
          <StatsCard 
            icon={FileText} 
            label="Agente Mais Usado" 
            value={stats.mostUsedAgent} 
            color="amber"
          />
        </div>

        {/* Main Section with Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <Tabs defaultValue="reports">
            <TabsList className="bg-slate-800/50 p-1 rounded-lg mb-4">
              <TabsTrigger value="reports" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300">Relatórios de Uso</TabsTrigger>
              <TabsTrigger value="my-agents" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300">Meus Agentes</TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="reports">
              <ReportsSection userId={session.user.id} />
            </TabsContent>
            <TabsContent value="my-agents">
              <AgentsSection userId={session.user.id} />
            </TabsContent>
            <TabsContent value="settings">
              <SettingsSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
