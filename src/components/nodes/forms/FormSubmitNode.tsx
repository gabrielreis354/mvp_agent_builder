import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Send, Workflow, Clock, CheckCircle } from 'lucide-react';

export interface FormSubmitNodeData {
  label: string;
  workflowType: 'admission' | 'termination' | 'data_change' | 'benefits' | 'custom';
  submitText: string;
  successMessage: string;
  errorMessage: string;
  redirectUrl?: string;
  emailNotification: boolean;
  notificationRecipients: string[];
  validationRequired: boolean;
  temporalWorkflow: boolean;
}

const FormSubmitNode = memo(({ data, selected }: NodeProps<FormSubmitNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nodeData, setNodeData] = useState<FormSubmitNodeData>(data);

  const getWorkflowIcon = (type: string) => {
    switch (type) {
      case 'admission': return '👋';
      case 'termination': return '👋';
      case 'data_change': return '📝';
      case 'benefits': return '🎁';
      case 'custom': return '⚙️';
      default: return '📋';
    }
  };

  const getWorkflowLabel = (type: string) => {
    switch (type) {
      case 'admission': return 'Admissão';
      case 'termination': return 'Demissão';
      case 'data_change': return 'Alteração de Dados';
      case 'benefits': return 'Benefícios';
      case 'custom': return 'Personalizado';
      default: return type;
    }
  };

  const handleDataChange = (field: keyof FormSubmitNodeData, value: any) => {
    setNodeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRecipientsChange = (value: string) => {
    const recipients = value.split(',').map(r => r.trim()).filter(Boolean);
    handleDataChange('notificationRecipients', recipients);
  };

  return (
    <div className="min-w-[320px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-orange-500"
      />
      
      <Card className={`shadow-lg transition-all duration-200 ${
        selected ? 'ring-2 ring-orange-500 ring-opacity-50' : ''
      } border-orange-200`}>
        <CardHeader className="pb-2 bg-orange-50">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Send className="w-4 h-4 text-orange-600" />
            <span className="text-orange-700">Submissão: {nodeData.label}</span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="ml-auto p-1 hover:bg-orange-100 rounded"
            >
              <Settings className="w-4 h-4" />
            </button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Submit Button Preview */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getWorkflowIcon(nodeData.workflowType)}</span>
              <Badge variant="outline" className="text-xs">
                {getWorkflowLabel(nodeData.workflowType)}
              </Badge>
              {nodeData.temporalWorkflow && (
                <Badge variant="secondary" className="text-xs">
                  <Workflow className="w-3 h-3 mr-1" />
                  Temporal
                </Badge>
              )}
            </div>
            
            <Button 
              className="w-full h-10 bg-orange-500 hover:bg-orange-600" 
              disabled
            >
              <Send className="w-4 h-4 mr-2" />
              {nodeData.submitText}
            </Button>
          </div>
          
          {/* Workflow Process */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700">Processo de Submissão:</div>
            <div className="space-y-1 text-xs">
              {nodeData.validationRequired && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>1. Validar formulário</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>2. Processar dados</span>
              </div>
              {nodeData.temporalWorkflow && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-orange-500" />
                  <span>3. Iniciar workflow Temporal</span>
                </div>
              )}
              {nodeData.emailNotification && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>4. Enviar notificações</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>5. Confirmar sucesso</span>
              </div>
            </div>
          </div>
          
          {/* Success/Error Messages */}
          <div className="space-y-2">
            {nodeData.successMessage && (
              <div className="p-2 bg-green-50 border border-green-200 rounded">
                <div className="text-xs text-green-600 font-medium">Sucesso:</div>
                <div className="text-xs text-green-700">{nodeData.successMessage}</div>
              </div>
            )}
            
            {nodeData.errorMessage && (
              <div className="p-2 bg-red-50 border border-red-200 rounded">
                <div className="text-xs text-red-600 font-medium">Erro:</div>
                <div className="text-xs text-red-700">{nodeData.errorMessage}</div>
              </div>
            )}
          </div>
          
          {/* Notifications */}
          {nodeData.emailNotification && nodeData.notificationRecipients.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-700">Notificações para:</div>
              <div className="flex flex-wrap gap-1">
                {nodeData.notificationRecipients.map((recipient, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {recipient}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Editing Panel */}
          {isEditing && (
            <div className="space-y-3 border-t pt-3">
              <div>
                <Label className="text-xs">Nome da Submissão</Label>
                <Input
                  value={nodeData.label}
                  onChange={(e) => handleDataChange('label', e.target.value)}
                  className="h-8"
                  placeholder="Ex: Enviar Admissão"
                />
              </div>
              
              <div>
                <Label className="text-xs">Tipo de Workflow</Label>
                <Select
                  value={nodeData.workflowType}
                  onValueChange={(value) => handleDataChange('workflowType', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admission">Admissão</SelectItem>
                    <SelectItem value="termination">Demissão</SelectItem>
                    <SelectItem value="data_change">Alteração de Dados</SelectItem>
                    <SelectItem value="benefits">Benefícios</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">Texto do Botão</Label>
                <Input
                  value={nodeData.submitText}
                  onChange={(e) => handleDataChange('submitText', e.target.value)}
                  className="h-8"
                  placeholder="Enviar Formulário"
                />
              </div>
              
              <div>
                <Label className="text-xs">Mensagem de Sucesso</Label>
                <Input
                  value={nodeData.successMessage}
                  onChange={(e) => handleDataChange('successMessage', e.target.value)}
                  className="h-8"
                  placeholder="Formulário enviado com sucesso!"
                />
              </div>
              
              <div>
                <Label className="text-xs">Mensagem de Erro</Label>
                <Input
                  value={nodeData.errorMessage}
                  onChange={(e) => handleDataChange('errorMessage', e.target.value)}
                  className="h-8"
                  placeholder="Erro ao enviar formulário"
                />
              </div>
              
              <div>
                <Label className="text-xs">URL de Redirecionamento (opcional)</Label>
                <Input
                  value={nodeData.redirectUrl || ''}
                  onChange={(e) => handleDataChange('redirectUrl', e.target.value)}
                  className="h-8"
                  placeholder="https://exemplo.com/sucesso"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={nodeData.validationRequired}
                    onChange={(e) => handleDataChange('validationRequired', e.target.checked)}
                    className="w-3 h-3"
                  />
                  <Label className="text-xs">Validação obrigatória</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={nodeData.temporalWorkflow}
                    onChange={(e) => handleDataChange('temporalWorkflow', e.target.checked)}
                    className="w-3 h-3"
                  />
                  <Label className="text-xs">Usar Temporal.io workflow</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={nodeData.emailNotification}
                    onChange={(e) => handleDataChange('emailNotification', e.target.checked)}
                    className="w-3 h-3"
                  />
                  <Label className="text-xs">Enviar notificações por email</Label>
                </div>
              </div>
              
              {nodeData.emailNotification && (
                <div>
                  <Label className="text-xs">Destinatários (emails separados por vírgula)</Label>
                  <Input
                    value={nodeData.notificationRecipients.join(', ')}
                    onChange={(e) => handleRecipientsChange(e.target.value)}
                    className="h-8"
                    placeholder="admin@empresa.com, rh@empresa.com"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-orange-500"
      />
    </div>
  );
});

FormSubmitNode.displayName = 'FormSubmitNode';

export default FormSubmitNode;
