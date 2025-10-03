import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Settings, FileText, AlertCircle } from 'lucide-react';

export interface FormInputNodeData {
  label: string;
  fieldId: string;
  inputType: 'text' | 'email' | 'cpf' | 'cnpj' | 'cep' | 'phone' | 'select' | 'checkbox' | 'date';
  required: boolean;
  placeholder: string;
  options?: string[];
  validation: {
    type: string;
    value?: any;
    message: string;
  }[];
  conditionalLogic?: {
    fieldId: string;
    operator: 'equals' | 'not_equals' | 'contains';
    value: any;
    default: boolean;
  };
}

const FormInputNode = memo(({ data, selected }: NodeProps<FormInputNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nodeData, setNodeData] = useState<FormInputNodeData>(data);

  const getInputTypeIcon = (type: string) => {
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
      case 'date':
        return '📅';
      case 'select':
        return '📋';
      case 'checkbox':
        return '☑️';
      default:
        return '📝';
    }
  };

  const getValidationBadges = () => {
    const badges = [];
    
    if (nodeData.required) {
      badges.push(
        <Badge key="required" variant="destructive" className="text-xs">
          Obrigatório
        </Badge>
      );
    }

    nodeData.validation?.forEach((rule, index) => {
      let badgeText = '';
      let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
      
      switch (rule.type) {
        case 'cpf':
          badgeText = 'CPF';
          variant = "outline";
          break;
        case 'cnpj':
          badgeText = 'CNPJ';
          variant = "outline";
          break;
        case 'cep':
          badgeText = 'CEP';
          variant = "outline";
          break;
        case 'email':
          badgeText = 'Email';
          variant = "outline";
          break;
        case 'min_length':
          badgeText = `Min: ${rule.value}`;
          variant = "secondary";
          break;
        case 'max_length':
          badgeText = `Max: ${rule.value}`;
          variant = "secondary";
          break;
      }
      
      if (badgeText) {
        badges.push(
          <Badge key={`validation-${index}`} variant={variant} className="text-xs">
            {badgeText}
          </Badge>
        );
      }
    });

    return badges;
  };

  const handleDataChange = (field: keyof FormInputNodeData, value: any) => {
    setNodeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-w-[280px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-purple-500"
      />
      
      <Card className={`shadow-lg transition-all duration-200 ${
        selected ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
      }`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <span className="text-lg">{getInputTypeIcon(nodeData.inputType)}</span>
            <span className="text-purple-700">Campo: {nodeData.label}</span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="ml-auto p-1 hover:bg-gray-100 rounded"
            >
              <Settings className="w-4 h-4" />
            </button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Field Preview */}
          <div className="space-y-2">
            <Label className="text-xs text-gray-600">
              ID: {nodeData.fieldId}
            </Label>
            
            {/* Input Preview */}
            <div className="p-2 bg-gray-50 rounded border">
              {nodeData.inputType === 'select' ? (
                <Select disabled>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder={nodeData.placeholder || 'Selecione...'} />
                  </SelectTrigger>
                </Select>
              ) : nodeData.inputType === 'checkbox' ? (
                <div className="flex items-center space-x-2">
                  <Checkbox disabled />
                  <Label className="text-sm">{nodeData.label}</Label>
                </div>
              ) : (
                <Input
                  placeholder={nodeData.placeholder}
                  disabled
                  className="h-8 text-sm"
                  type={nodeData.inputType === 'date' ? 'date' : 'text'}
                />
              )}
            </div>
            
            {/* Validation Badges */}
            <div className="flex flex-wrap gap-1">
              {getValidationBadges()}
            </div>
            
            {/* Conditional Logic Indicator */}
            {nodeData.conditionalLogic && (
              <div className="flex items-center gap-1 text-xs text-amber-600">
                <AlertCircle className="w-3 h-3" />
                <span>Lógica condicional ativa</span>
              </div>
            )}
          </div>
          
          {/* Editing Panel */}
          {isEditing && (
            <div className="space-y-3 border-t pt-3">
              <div>
                <Label className="text-xs">Label</Label>
                <Input
                  value={nodeData.label}
                  onChange={(e) => handleDataChange('label', e.target.value)}
                  className="h-8"
                />
              </div>
              
              <div>
                <Label className="text-xs">ID do Campo</Label>
                <Input
                  value={nodeData.fieldId}
                  onChange={(e) => handleDataChange('fieldId', e.target.value)}
                  className="h-8"
                />
              </div>
              
              <div>
                <Label className="text-xs">Tipo de Input</Label>
                <Select
                  value={nodeData.inputType}
                  onValueChange={(value) => handleDataChange('inputType', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="cnpj">CNPJ</SelectItem>
                    <SelectItem value="cep">CEP</SelectItem>
                    <SelectItem value="phone">Telefone</SelectItem>
                    <SelectItem value="date">Data</SelectItem>
                    <SelectItem value="select">Seleção</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">Placeholder</Label>
                <Input
                  value={nodeData.placeholder}
                  onChange={(e) => handleDataChange('placeholder', e.target.value)}
                  className="h-8"
                  placeholder="Texto de exemplo..."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={nodeData.required}
                  onCheckedChange={(checked) => handleDataChange('required', checked)}
                />
                <Label className="text-xs">Campo obrigatório</Label>
              </div>
              
              {nodeData.inputType === 'select' && (
                <div>
                  <Label className="text-xs">Opções (uma por linha)</Label>
                  <textarea
                    className="w-full p-2 border rounded text-xs h-16 resize-none"
                    value={nodeData.options?.join('\n') || ''}
                    onChange={(e) => handleDataChange('options', e.target.value.split('\n').filter(Boolean))}
                    placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
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
        className="w-3 h-3 !bg-purple-500"
      />
    </div>
  );
});

FormInputNode.displayName = 'FormInputNode';

export default FormInputNode;
