import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, GitBranch, Eye, EyeOff } from 'lucide-react';

export interface FormConditionalNodeData {
  label: string;
  sourceFieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  compareValue: string;
  targetFieldIds: string[];
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'optional';
  defaultState: boolean;
}

const FormConditionalNode = memo(({ data, selected }: NodeProps<FormConditionalNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nodeData, setNodeData] = useState<FormConditionalNodeData>(data);

  const getOperatorLabel = (operator: string) => {
    switch (operator) {
      case 'equals': return 'igual a';
      case 'not_equals': return 'diferente de';
      case 'contains': return 'contém';
      case 'greater_than': return 'maior que';
      case 'less_than': return 'menor que';
      case 'is_empty': return 'está vazio';
      case 'is_not_empty': return 'não está vazio';
      default: return operator;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'show': return 'Mostrar';
      case 'hide': return 'Ocultar';
      case 'enable': return 'Habilitar';
      case 'disable': return 'Desabilitar';
      case 'require': return 'Tornar obrigatório';
      case 'optional': return 'Tornar opcional';
      default: return action;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'show': return <Eye className="w-3 h-3" />;
      case 'hide': return <EyeOff className="w-3 h-3" />;
      case 'enable': return '✅';
      case 'disable': return '❌';
      case 'require': return '❗';
      case 'optional': return '❓';
      default: return '⚙️';
    }
  };

  const handleDataChange = (field: keyof FormConditionalNodeData, value: any) => {
    setNodeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTargetFieldsChange = (value: string) => {
    const fields = value.split(',').map(f => f.trim()).filter(Boolean);
    handleDataChange('targetFieldIds', fields);
  };

  return (
    <div className="min-w-[320px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500"
      />
      
      <Card className={`shadow-lg transition-all duration-200 ${
        selected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      } border-blue-200`}>
        <CardHeader className="pb-2 bg-blue-50">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <GitBranch className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700">Lógica: {nodeData.label}</span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="ml-auto p-1 hover:bg-blue-100 rounded"
            >
              <Settings className="w-4 h-4" />
            </button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Conditional Logic Display */}
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded border">
              <div className="text-xs font-medium text-gray-700 mb-2">Condição:</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    {nodeData.sourceFieldId}
                  </Badge>
                  <span className="text-gray-500">{getOperatorLabel(nodeData.operator)}</span>
                  {!['is_empty', 'is_not_empty'].includes(nodeData.operator) && (
                    <Badge variant="secondary" className="text-xs">
                      "{nodeData.compareValue}"
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded border">
              <div className="text-xs font-medium text-gray-700 mb-2">Ação:</div>
              <div className="flex items-center gap-2 text-xs">
                {getActionIcon(nodeData.action)}
                <span>{getActionLabel(nodeData.action)}</span>
                <span className="text-gray-500">campos:</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {nodeData.targetFieldIds.map((fieldId, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {fieldId}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">Estado padrão:</span>
              <Badge variant={nodeData.defaultState ? "default" : "secondary"} className="text-xs">
                {nodeData.defaultState ? "Visível" : "Oculto"}
              </Badge>
            </div>
          </div>
          
          {/* Logic Flow Visualization */}
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-600">Condição TRUE → Executar ação</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-red-600">Condição FALSE → Estado padrão</span>
            </div>
          </div>
          
          {/* Editing Panel */}
          {isEditing && (
            <div className="space-y-3 border-t pt-3">
              <div>
                <Label className="text-xs">Nome da Lógica</Label>
                <Input
                  value={nodeData.label}
                  onChange={(e) => handleDataChange('label', e.target.value)}
                  className="h-8"
                  placeholder="Ex: Mostrar campos de endereço"
                />
              </div>
              
              <div>
                <Label className="text-xs">Campo Origem (ID)</Label>
                <Input
                  value={nodeData.sourceFieldId}
                  onChange={(e) => handleDataChange('sourceFieldId', e.target.value)}
                  className="h-8"
                  placeholder="field_id_to_watch"
                />
              </div>
              
              <div>
                <Label className="text-xs">Operador</Label>
                <Select
                  value={nodeData.operator}
                  onValueChange={(value) => handleDataChange('operator', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Igual a</SelectItem>
                    <SelectItem value="not_equals">Diferente de</SelectItem>
                    <SelectItem value="contains">Contém</SelectItem>
                    <SelectItem value="greater_than">Maior que</SelectItem>
                    <SelectItem value="less_than">Menor que</SelectItem>
                    <SelectItem value="is_empty">Está vazio</SelectItem>
                    <SelectItem value="is_not_empty">Não está vazio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {!['is_empty', 'is_not_empty'].includes(nodeData.operator) && (
                <div>
                  <Label className="text-xs">Valor de Comparação</Label>
                  <Input
                    value={nodeData.compareValue}
                    onChange={(e) => handleDataChange('compareValue', e.target.value)}
                    className="h-8"
                    placeholder="Valor para comparar"
                  />
                </div>
              )}
              
              <div>
                <Label className="text-xs">Ação</Label>
                <Select
                  value={nodeData.action}
                  onValueChange={(value) => handleDataChange('action', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="show">Mostrar</SelectItem>
                    <SelectItem value="hide">Ocultar</SelectItem>
                    <SelectItem value="enable">Habilitar</SelectItem>
                    <SelectItem value="disable">Desabilitar</SelectItem>
                    <SelectItem value="require">Tornar obrigatório</SelectItem>
                    <SelectItem value="optional">Tornar opcional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">Campos Alvo (IDs separados por vírgula)</Label>
                <Input
                  value={nodeData.targetFieldIds.join(', ')}
                  onChange={(e) => handleTargetFieldsChange(e.target.value)}
                  className="h-8"
                  placeholder="field1, field2, field3"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={nodeData.defaultState}
                  onChange={(e) => handleDataChange('defaultState', e.target.checked)}
                  className="w-3 h-3"
                />
                <Label className="text-xs">Estado padrão visível</Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500"
      />
    </div>
  );
});

FormConditionalNode.displayName = 'FormConditionalNode';

export default FormConditionalNode;
