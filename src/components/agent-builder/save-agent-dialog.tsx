'use client'

import { useState } from 'react'
import { Save, Star, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'

interface SaveAgentDialogProps {
  templateId: string
  templateName: string
  configuration: any
}

export function SaveAgentDialog({ 
  templateId, 
  templateName, 
  configuration 
}: SaveAgentDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(`Meu ${templateName}`)
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, dê um nome ao seu agente",
        variant: "destructive",
      })
      return
    }

    if (!description.trim()) {
      toast({
        title: "Descrição obrigatória",
        description: "Por favor, descreva o que seu agente faz",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/agents/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          templateId,
          configuration,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "✅ Agente salvo!",
          description: `${name} foi salvo com sucesso`,
        })
        setOpen(false)
        
        // Recarregar lista de agentes salvos (se houver)
        window.dispatchEvent(new CustomEvent('agent-saved', { detail: data.agent }))
        
        // Redirecionar após salvar
        window.location.href = '/agents';
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error saving agent:', error)
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o agente. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Save className="w-4 h-4" />
          Salvar Agente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>💾 Salvar Agente Customizado</DialogTitle>
          <DialogDescription>
            Salve esta configuração do agente para usar novamente no futuro
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">
              Nome do Agente *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Analisador de Contratos Tech"
              className="col-span-3"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">
              Descrição *
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que este agente faz e para que serve..."
              className="col-span-3 h-20"
              required
            />
            <p className="text-xs text-muted-foreground">
              A descrição ajuda você e outros usuários a entenderem o propósito do agente
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500" />
              Este agente incluirá:
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Template base: {templateName}</li>
              <li>• Configurações atuais do canvas</li>
              <li>• Prompts personalizados</li>
              <li>• Conexões entre nós</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 transition-opacity"
          >
            {isSaving ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Salvar Agente
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
