import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Shield, Settings, CheckCircle, AlertCircle, X, Check } from 'lucide-react';

interface ValidationRule {
  id: string;
  type: 'cpf' | 'cnpj' | 'rg' | 'cnh' | 'email' | 'phone' | 'custom';
  field: string;
  required: boolean;
  customPattern?: string;
  errorMessage?: string;
}

interface OCRValidationNodeData {
  label: string;
  validationRules: ValidationRule[];
  stopOnError: boolean;
  validationStatus: 'idle' | 'validating' | 'success' | 'error';
  validationResults?: {
    passed: number;
    failed: number;
    errors: string[];
  };
  isEditing?: boolean;
}

const OCRValidationNode: React.FC<NodeProps<OCRValidationNodeData>> = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(data.isEditing || false);
  const [localData, setLocalData] = useState(data);
  const [newRule, setNewRule] = useState<Partial<ValidationRule>>({
    type: 'cpf',
    field: '',
    required: true
  });

  const handleSave = () => {
    setIsEditing(false);
    // Update node data in React Flow
  };

  const addValidationRule = () => {
    if (newRule.field) {
      const rule: ValidationRule = {
        id: Date.now().toString(),
        type: newRule.type as ValidationRule['type'],
        field: newRule.field,
        required: newRule.required || false,
        customPattern: newRule.customPattern,
        errorMessage: newRule.errorMessage
      };
      
      setLocalData({
        ...localData,
        validationRules: [...localData.validationRules, rule]
      });
      
      setNewRule({
        type: 'cpf',
        field: '',
        required: true
      });
    }
  };

  const removeValidationRule = (ruleId: string) => {
    setLocalData({
      ...localData,
      validationRules: localData.validationRules.filter(rule => rule.id !== ruleId)
    });
  };

  const getStatusIcon = () => {
    switch (localData.validationStatus) {
      case 'validating':
        return <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  const getValidationTypeLabel = (type: string) => {
    const labels = {
      cpf: 'CPF',
      cnpj: 'CNPJ',
      rg: 'RG',
      cnh: 'CNH',
      email: 'Email',
      phone: 'Telefone',
      custom: 'Personalizado'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (isEditing) {
    return (
      <div className="bg-white border-2 border-blue-500 rounded-lg p-4 min-w-[350px] shadow-lg max-h-[500px] overflow-y-auto">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-800">OCR Validation Configuration</span>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Node Label
            </label>
            <input
              type="text"
              value={localData.label}
              onChange={(e) => setLocalData({ ...localData, label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Validate OCR Data"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="stopOnError"
              checked={localData.stopOnError}
              onChange={(e) => setLocalData({ ...localData, stopOnError: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="stopOnError" className="text-sm font-medium text-gray-700">
              Stop workflow on validation error
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Validation Rules
            </label>
            
            {/* Existing Rules */}
            <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
              {localData.validationRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{rule.field}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {getValidationTypeLabel(rule.type)}
                      </span>
                      {rule.required && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    {rule.errorMessage && (
                      <div className="text-xs text-gray-500 mt-1">{rule.errorMessage}</div>
                    )}
                  </div>
                  <button
                    onClick={() => removeValidationRule(rule.id)}
                    className="p-1 hover:bg-red-100 rounded text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Rule */}
            <div className="border border-gray-200 rounded p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Field Name
                  </label>
                  <input
                    type="text"
                    value={newRule.field || ''}
                    onChange={(e) => setNewRule({ ...newRule, field: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="cpf_number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Validation Type
                  </label>
                  <select
                    value={newRule.type || 'cpf'}
                    onChange={(e) => setNewRule({ ...newRule, type: e.target.value as ValidationRule['type'] })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="cpf">CPF</option>
                    <option value="cnpj">CNPJ</option>
                    <option value="rg">RG</option>
                    <option value="cnh">CNH</option>
                    <option value="email">Email</option>
                    <option value="phone">Telefone</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>
              </div>

              {newRule.type === 'custom' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Custom Pattern (Regex)
                  </label>
                  <input
                    type="text"
                    value={newRule.customPattern || ''}
                    onChange={(e) => setNewRule({ ...newRule, customPattern: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="^[0-9]{11}$"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Error Message (Optional)
                </label>
                <input
                  type="text"
                  value={newRule.errorMessage || ''}
                  onChange={(e) => setNewRule({ ...newRule, errorMessage: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Invalid CPF format"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newRule.required || false}
                    onChange={(e) => setNewRule({ ...newRule, required: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-xs font-medium text-gray-700">Required field</span>
                </label>
                <button
                  onClick={addValidationRule}
                  disabled={!newRule.field}
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:bg-gray-300"
                >
                  Add Rule
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>

        <Handle type="target" position={Position.Left} className="w-3 h-3" />
        <Handle type="source" position={Position.Right} className="w-3 h-3" />
      </div>
    );
  }

  return (
    <div className={`bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-300'} rounded-lg p-3 min-w-[200px] shadow-sm hover:shadow-md transition-shadow`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-medium text-gray-800">{localData.label}</span>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <Settings className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>Rules:</span>
          <span className="font-medium">{localData.validationRules.length}</span>
        </div>
        
        {localData.stopOnError && (
          <div className="text-red-600 text-xs">⚠️ Stop on error</div>
        )}

        {localData.validationRules.length > 0 && (
          <div className="space-y-1">
            {localData.validationRules.slice(0, 3).map((rule) => (
              <div key={rule.id} className="flex items-center justify-between text-xs">
                <span className="truncate">{rule.field}</span>
                <span className="text-blue-600">{getValidationTypeLabel(rule.type)}</span>
              </div>
            ))}
            {localData.validationRules.length > 3 && (
              <div className="text-xs text-gray-400">
                +{localData.validationRules.length - 3} more...
              </div>
            )}
          </div>
        )}

        {localData.validationResults && (
          <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-800 text-xs">Validation Results</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-green-600">
                <Check className="w-3 h-3" />
                <span>{localData.validationResults.passed}</span>
              </div>
              <div className="flex items-center gap-1 text-red-600">
                <X className="w-3 h-3" />
                <span>{localData.validationResults.failed}</span>
              </div>
            </div>
            {localData.validationResults.errors.length > 0 && (
              <div className="mt-1 text-xs text-red-600">
                {localData.validationResults.errors[0]}
                {localData.validationResults.errors.length > 1 && (
                  <span> (+{localData.validationResults.errors.length - 1} more)</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
};

export default OCRValidationNode;
