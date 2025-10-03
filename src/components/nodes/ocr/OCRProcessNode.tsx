import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Cpu, Settings, CheckCircle, AlertCircle, Clock, Eye } from 'lucide-react';

interface OCRProcessNodeData {
  label: string;
  provider: 'auto' | 'google_vision' | 'tesseract';
  extractStructuredData: boolean;
  confidenceThreshold: number;
  useFallback: boolean;
  processingStatus: 'idle' | 'processing' | 'success' | 'error';
  result?: {
    text: string;
    confidence: number;
    provider: string;
    documentType: string;
    processingTime: number;
  };
  isEditing?: boolean;
}

const OCRProcessNode: React.FC<NodeProps<OCRProcessNodeData>> = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(data.isEditing || false);
  const [localData, setLocalData] = useState(data);

  const handleSave = () => {
    setIsEditing(false);
    // Update node data in React Flow
  };

  const getStatusIcon = () => {
    switch (localData.processingStatus) {
      case 'processing':
        return <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Cpu className="w-4 h-4 text-gray-500" />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'google_vision':
        return 'text-blue-600';
      case 'tesseract':
        return 'text-green-600';
      case 'auto':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white border-2 border-blue-500 rounded-lg p-4 min-w-[320px] shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-800">OCR Processing Configuration</span>
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
              placeholder="Process Document"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OCR Provider
            </label>
            <select
              value={localData.provider}
              onChange={(e) => setLocalData({ ...localData, provider: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="auto">Auto (Best Available)</option>
              <option value="google_vision">Google Vision API</option>
              <option value="tesseract">Tesseract OCR</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Auto uses Google Vision with Tesseract fallback
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confidence Threshold ({localData.confidenceThreshold}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={localData.confidenceThreshold * 100}
              onChange={(e) => setLocalData({ 
                ...localData, 
                confidenceThreshold: Number(e.target.value) / 100 
              })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localData.extractStructuredData}
                onChange={(e) => setLocalData({ 
                  ...localData, 
                  extractStructuredData: e.target.checked 
                })}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Extract structured data
              </span>
            </label>
            <p className="text-xs text-gray-500 ml-6">
              Extract specific fields (CPF, RG, names, etc.)
            </p>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localData.useFallback}
                onChange={(e) => setLocalData({ 
                  ...localData, 
                  useFallback: e.target.checked 
                })}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Use fallback provider
              </span>
            </label>
            <p className="text-xs text-gray-500 ml-6">
              Try Tesseract if Google Vision fails
            </p>
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
    <div className={`bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-300'} rounded-lg p-3 min-w-[220px] shadow-sm hover:shadow-md transition-shadow`}>
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
          <span>Provider:</span>
          <span className={`font-medium ${getProviderColor(localData.provider)}`}>
            {localData.provider === 'auto' ? 'Auto' : 
             localData.provider === 'google_vision' ? 'Google Vision' : 'Tesseract'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Confidence:</span>
          <span>{Math.round(localData.confidenceThreshold * 100)}%+</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          {localData.extractStructuredData && (
            <span className="text-blue-600">📊 Structured</span>
          )}
          {localData.useFallback && (
            <span className="text-green-600">🔄 Fallback</span>
          )}
        </div>

        {localData.result && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-green-800">Processing Complete</span>
              <button className="p-1 hover:bg-green-100 rounded">
                <Eye className="w-3 h-3 text-green-600" />
              </button>
            </div>
            <div className="text-xs text-green-600 space-y-1">
              <div>Confidence: {Math.round(localData.result.confidence * 100)}%</div>
              <div>Provider: {localData.result.provider}</div>
              <div>Type: {localData.result.documentType}</div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{localData.result.processingTime.toFixed(2)}s</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
};

export default OCRProcessNode;
