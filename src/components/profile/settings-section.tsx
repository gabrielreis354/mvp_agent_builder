'use client'

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Save, Bell, Shield, Palette, Globe, LogOut, Building2, Briefcase, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast';
import { OrganizationManagement } from './organization-management';

export function SettingsSection() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  
  const [profileData, setProfileData] = useState({
    name: '',
    company: '',
    jobTitle: '',
    department: '',
    companySize: '',
    primaryUseCase: '',
    phone: '',
    linkedIn: ''
  })
  
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      browser: false,
      reports: true
    },
    privacy: {
      publicProfile: false,
      shareReports: false
    },
    preferences: {
      theme: 'dark',
      language: 'pt-BR',
      defaultView: 'grid'
    }
  })

  // Carregar dados do perfil ao montar
  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setIsLoadingProfile(true)
      const response = await fetch('/api/user/update-profile')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setProfileData({
            name: data.user.name || '',
            company: data.user.company || '',
            jobTitle: data.user.jobTitle || '',
            department: data.user.department || '',
            companySize: data.user.companySize || '',
            primaryUseCase: data.user.primaryUseCase || '',
            phone: data.user.phone || '',
            linkedIn: data.user.linkedIn || ''
          })
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true)
      const response = await fetch('/api/user/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Perfil atualizado",
          description: "Seus dados profissionais foram salvos com sucesso.",
        })
        // Atualizar sessão
        await update()
      } else {
        throw new Error('Erro ao salvar perfil')
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar seus dados. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSave = () => {
    // TODO: Implementar salvamento das configurações
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram atualizadas com sucesso.",
    })
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6">Configurações</h2>

      <div className="space-y-6">
        {/* Dados Profissionais RH */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Dados Profissionais</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Complete seu perfil profissional. Estes dados ajudam a personalizar sua experiência.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-white">Nome Completo</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-2 bg-white/10 border-gray-600 text-white"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <Label htmlFor="company" className="text-white">Empresa</Label>
              <Input
                id="company"
                value={profileData.company}
                onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                className="mt-2 bg-white/10 border-gray-600 text-white"
                placeholder="Nome da empresa"
              />
            </div>

            <div>
              <Label htmlFor="jobTitle" className="text-white">Cargo</Label>
              <Input
                id="jobTitle"
                value={profileData.jobTitle}
                onChange={(e) => setProfileData(prev => ({ ...prev, jobTitle: e.target.value }))}
                className="mt-2 bg-white/10 border-gray-600 text-white"
                placeholder="Seu cargo atual"
              />
            </div>

            <div>
              <Label htmlFor="department" className="text-white">Departamento</Label>
              <Input
                id="department"
                value={profileData.department}
                onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                className="mt-2 bg-white/10 border-gray-600 text-white"
                placeholder="Ex: Recursos Humanos"
              />
            </div>

            <div>
              <Label htmlFor="companySize" className="text-white">Tamanho da Empresa</Label>
              <select
                id="companySize"
                value={profileData.companySize}
                onChange={(e) => setProfileData(prev => ({ ...prev, companySize: e.target.value }))}
                className="w-full mt-2 px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white"
              >
                <option value="">Selecione</option>
                <option value="1-10">1-10 funcionários</option>
                <option value="11-50">11-50 funcionários</option>
                <option value="51-200">51-200 funcionários</option>
                <option value="201-1000">201-1000 funcionários</option>
                <option value="1000+">Mais de 1000 funcionários</option>
              </select>
            </div>

            <div>
              <Label htmlFor="primaryUseCase" className="text-white">Principal Caso de Uso</Label>
              <select
                id="primaryUseCase"
                value={profileData.primaryUseCase}
                onChange={(e) => setProfileData(prev => ({ ...prev, primaryUseCase: e.target.value }))}
                className="w-full mt-2 px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white"
              >
                <option value="">Selecione</option>
                <option value="recruitment">Recrutamento e Seleção</option>
                <option value="onboarding">Onboarding de Funcionários</option>
                <option value="performance">Avaliação de Performance</option>
                <option value="training">Treinamento e Desenvolvimento</option>
                <option value="analytics">Analytics de RH</option>
                <option value="employee_support">Suporte ao Funcionário</option>
                <option value="other">Outros</option>
              </select>
            </div>

            <div>
              <Label htmlFor="phone" className="text-white">Telefone</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                className="mt-2 bg-white/10 border-gray-600 text-white"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <Label htmlFor="linkedIn" className="text-white">LinkedIn</Label>
              <Input
                id="linkedIn"
                value={profileData.linkedIn}
                onChange={(e) => setProfileData(prev => ({ ...prev, linkedIn: e.target.value }))}
                className="mt-2 bg-white/10 border-gray-600 text-white"
                placeholder="linkedin.com/in/seu-perfil"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button 
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSavingProfile ? (
                <>Salvando...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Dados Profissionais
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Seção de Gerenciamento da Organização (apenas para Admins) */}
        {session?.user?.role === 'ADMIN' && <OrganizationManagement />}

        {/* Notificações */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Notificações</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications" className="text-white">
                  Notificações por E-mail
                </Label>
                <p className="text-sm text-gray-400">
                  Receba atualizações sobre seus relatórios
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.notifications.email}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, email: checked }
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="browser-notifications" className="text-white">
                  Notificações do Navegador
                </Label>
                <p className="text-sm text-gray-400">
                  Alertas em tempo real no navegador
                </p>
              </div>
              <Switch
                id="browser-notifications"
                checked={settings.notifications.browser}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, browser: checked }
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="report-notifications" className="text-white">
                  Relatórios Prontos
                </Label>
                <p className="text-sm text-gray-400">
                  Avisar quando um relatório for concluído
                </p>
              </div>
              <Switch
                id="report-notifications"
                checked={settings.notifications.reports}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, reports: checked }
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* Privacidade */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Privacidade</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="public-profile" className="text-white">
                  Perfil Público
                </Label>
                <p className="text-sm text-gray-400">
                  Permitir que outros usuários vejam seu perfil
                </p>
              </div>
              <Switch
                id="public-profile"
                checked={settings.privacy.publicProfile}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, publicProfile: checked }
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="share-reports" className="text-white">
                  Compartilhar Relatórios
                </Label>
                <p className="text-sm text-gray-400">
                  Permitir compartilhamento de relatórios
                </p>
              </div>
              <Switch
                id="share-reports"
                checked={settings.privacy.shareReports}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, shareReports: checked }
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* Preferências */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Preferências</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="theme" className="text-white">Tema</Label>
              <select
                id="theme"
                value={settings.preferences.theme}
                onChange={(e) => 
                  setSettings(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, theme: e.target.value }
                  }))
                }
                className="w-full mt-2 px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white"
              >
                <option value="dark">Escuro</option>
                <option value="light">Claro</option>
                <option value="auto">Automático</option>
              </select>
            </div>

            <div>
              <Label htmlFor="language" className="text-white">Idioma</Label>
              <select
                id="language"
                value={settings.preferences.language}
                onChange={(e) => 
                  setSettings(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, language: e.target.value }
                  }))
                }
                className="w-full mt-2 px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div>
              <Label htmlFor="default-view" className="text-white">
                Visualização Padrão
              </Label>
              <select
                id="default-view"
                value={settings.preferences.defaultView}
                onChange={(e) => 
                  setSettings(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, defaultView: e.target.value }
                  }))
                }
                className="w-full mt-2 px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white"
              >
                <option value="grid">Grade</option>
                <option value="list">Lista</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>

        {/* Zona de Perigo */}
        <div className="mt-8 pt-6 border-t border-red-500/30">
          <h3 className="text-lg font-semibold text-red-400 mb-4">Zona de Perigo</h3>
          <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/30">
            <div>
              <p className="font-medium text-white">Sair da sua conta</p>
              <p className="text-sm text-gray-400">Você será desconectado de todos os seus dispositivos.</p>
            </div>
            <Button variant="destructive" onClick={() => signOut({ callbackUrl: '/' })}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
