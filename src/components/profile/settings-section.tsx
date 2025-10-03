'use client'

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Save, Bell, Shield, Palette, Globe, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast';
import { OrganizationManagement } from './organization-management';

export function SettingsSection() {
  const { data: session } = useSession();
  const { toast } = useToast();
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
