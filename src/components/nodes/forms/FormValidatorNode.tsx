import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, Shield, CheckCircle, XCircle } from 'lucide-react';

export interface FormValidatorNodeData {
  label: string;
  validationType: 'cpf' | 'cnpj' | 'cep' | 'email' | 'phone' | 'custom';
  errorMessage: string;
  customRegex?: string;
  targetFieldId?: string;
  autoFormat: boolean;
}

const FormValidatorNode = memo(({ data, selected }: NodeProps<FormValidatorNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nodeData, setNodeData] = useState<FormValidatorNodeData>(data);

  const getValidatorIcon = (type: string) => {
    switch (type) {
      case 'cpf':
      case 'cnpj':
        return '🆔';
      case 'cep':
        return '📍';
      case 'email':
        return '📧';
      case 'phone':
        return '📞';
      case 'custom':
        return '⚙️';
      default:
        return '✅';
    }
  };

  const getValidatorDescription = (type: string) => {
    switch (type) {
      case 'cpf':
        return 'Valida CPF brasileiro com dígitos verificadores';
      case 'cnpj':
        return 'Valida CNPJ brasileiro com dígitos verificadores';
      case 'cep':
        return 'Valida formato de CEP brasileiro';
      case 'email':
        return 'Valida formato de email';
      case 'phone':
        return 'Valida telefone brasileiro (10-11 dígitos)';
      case 'custom':
        return 'Validação personalizada com regex';
      default:
        return 'Validador genérico';
    }
  };

  const getValidatorExample = (type: string) => {
    switch (type) {
      case 'cpf':
        return '000.000.000-00';
      case 'cnpj':
        return '00.000.000/0000-00';
      case 'cep':
        return '00000-000';
      case 'email':
        return 'usuario@exemplo.com';
      case 'phone':
        return '(11) 99999-9999';
      default:
        return 'Exemplo de entrada válida';
    }
  };

  const handleDataChange = (field: keyof FormValidatorNodeData, value: any) => {
    setNodeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-w-[300px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-green-500"
      />
      
      <Card className={`shadow-lg transition-all duration-200 ${
        selected ? 'ring-2 ring-green-500 ring-opacity-50' : ''
      } border-green-200`}>
        <CardHeader className="pb-2 bg-green-50">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-green-700">Validador: {nodeData.label}</span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="ml-auto p-1 hover:bg-green-100 rounded"
            >
              <Settings className="w-4 h-4" />
            </button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Validator Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getValidatorIcon(nodeData.validationType)}</span>
              <Badge variant="outline" className="text-xs">
                {nodeData.validationType.toUpperCase()}
              </Badge>
              {nodeData.autoFormat && (
                <Badge variant="secondary" className="text-xs">
                  Auto-format
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-gray-600">
              {getValidatorDescription(nodeData.validationType)}
            </p>
            
            <div className="p-2 bg-gray-50 rounded border">
              <div className="text-xs text-gray-500 mb-1">Exemplo:</div>
              <code className="text-xs font-mono text-green-600">
                {getValidatorExample(nodeData.validationType)}
              </code>
            </div>
            
            {/* Validation Flow */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-green-600">Válido: Continua fluxo</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <XCircle className="w-3 h-3 text-red-500" />
                <span className="text-red-600">Inválido: Mostra erro</span>
              </div>
            </div>
            
            {nodeData.errorMessage && (
              <div className="p-2 bg-red-50 border border-red-200 rounded">
                <div className="text-xs text-red-600 font-medium">Mensagem de erro:</div>
                <div className="text-xs text-red-700">{nodeData.errorMessage}</div>
              </div>
            )}
          </div>
          
          {/* Editing Panel */}
          {isEditing && (
            <div className="space-y-3 border-t pt-3">
              <div>
                <Label className="text-xs">Nome do Validador</Label>
                <Input
                  value={nodeData.label}
                  onChange={(e) => handleDataChange('label', e.target.value)}
                  className="h-8"
                  placeholder="Ex: Validador CPF"
                />
              </div>
              
              <div>
                <Label className="text-xs">Tipo de Validação</Label>
                <Select
                  value={nodeData.validationType}
                  onValueChange={(value) => handleDataChange('validationType', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF Brasileiro</SelectItem>
                    <SelectItem value="cnpj">CNPJ Brasileiro</SelectItem>
                    <SelectItem value="cep">CEP Brasileiro</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Telefone Brasileiro</SelectItem>
                    <SelectItem value="custom">Regex Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {nodeData.validationType === 'custom' && (
                <div>
                  <Label className="text-xs">Regex Personalizado</Label>
                  <Input
                    value={nodeData.customRegex || ''}
                    onChange={(e) => handleDataChange('customRegex', e.target.value)}
                    className="h-8 font-mono text-xs"
                    placeholder="^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$"
                  />
                </div>
              )}
              
              <div>
                <Label className="text-xs">Campo Alvo (ID)</Label>
                <Input
                  value={nodeData.targetFieldId || ''}
                  onChange={(e) => handleDataChange('targetFieldId', e.target.value)}
                  className="h-8"
                  placeholder="field_id_to_validate"
                />
              </div>
              
              <div>
                <Label className="text-xs">Mensagem de Erro</Label>
                <Input
                  value={nodeData.errorMessage}
                  onChange={(e) => handleDataChange('errorMessage', e.target.value)}
                  className="h-8"
                  placeholder="Formato inválido"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={nodeData.autoFormat}
                  onChange={(e) => handleDataChange('autoFormat', e.target.checked)}
                  className="w-3 h-3"
                />
                <Label className="text-xs">Auto-formatação (ex: 00000000000 → 000.000.000-00)</Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-green-500"
      />
    </div>
  );
});

FormValidatorNode.displayName = 'FormValidatorNode';

export default FormValidatorNode;
