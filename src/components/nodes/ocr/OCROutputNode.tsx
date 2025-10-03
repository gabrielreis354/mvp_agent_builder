import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileOutput, Settings, Download, Eye, Copy, CheckCircle } from 'lucide-react';

interface OCROutputNodeData {
  label: string;
  outputFormat: 'json' | 'text' | 'csv' | 'form_data';
  includeMetadata: boolean;
  includeConfidence: boolean;
  downloadEnabled: boolean;
  previewEnabled: boolean;
  outputData?: {
    text: string;
    extractedData: Record<string, any>;
    metadata: Record<string, any>;
    confidence: number;
  };
  isEditing?: boolean;
}

const OCROutputNode: React.FC<NodeProps<OCROutputNodeData>> = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(data.isEditing || false);
  const [localData, setLocalData] = useState(data);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    // Update node data in React Flow
  };

  const handleCopy = async () => {
    if (localData.outputData) {
      const output = formatOutput(localData.outputData);
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatOutput = (data: any) => {
    switch (localData.outputFormat) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'text':
        return data.text || '';
      case 'csv':
        return formatAsCSV(data);
      case 'form_data':
        return formatAsFormData(data);
      default:
        return JSON.stringify(data, null, 2);
    }
  };

  const formatAsCSV = (data: any) => {
    const rows = [];
    rows.push(['Field', 'Value', 'Confidence']);
    
    if (data.extractedData) {
      Object.entries(data.extractedData).forEach(([key, value]) => {
        rows.push([key, String(value), data.confidence?.toString() || 'N/A']);
      });
    }
    
    return rows.map(row => row.join(',')).join('\n');
  };

  const formatAsFormData = (data: any) => {
    const formData = new FormData();
    
    if (data.text) formData.append('text', data.text);
    if (data.extractedData) {
      Object.entries(data.extractedData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }
    if (localData.includeMetadata && data.metadata) {
      formData.append('metadata', JSON.stringify(data.metadata));
    }
    
    return 'FormData object created with extracted fields';
  };

  if (isEditing) {
    return (
      <div className="bg-white border-2 border-blue-500 rounded-lg p-4 min-w-[300px] shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <FileOutput className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-800">OCR Output Configuration</span>
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
              placeholder="OCR Output"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Output Format
            </label>
            <select
              value={localData.outputFormat}
              onChange={(e) => setLocalData({ ...localData, outputFormat: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="json">JSON</option>
              <option value="text">Plain Text</option>
              <option value="csv">CSV</option>
              <option value="form_data">Form Data</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localData.includeMetadata}
                onChange={(e) => setLocalData({ 
                  ...localData, 
                  includeMetadata: e.target.checked 
                })}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Include metadata
              </span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localData.includeConfidence}
                onChange={(e) => setLocalData({ 
                  ...localData, 
                  includeConfidence: e.target.checked 
                })}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Include confidence scores
              </span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localData.downloadEnabled}
                onChange={(e) => setLocalData({ 
                  ...localData, 
                  downloadEnabled: e.target.checked 
                })}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Enable download
              </span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localData.previewEnabled}
                onChange={(e) => setLocalData({ 
                  ...localData, 
                  previewEnabled: e.target.checked 
                })}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Enable preview
              </span>
            </label>
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
      </div>
    );
  }

  return (
    <div className={`bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-300'} rounded-lg p-3 min-w-[200px] shadow-sm hover:shadow-md transition-shadow`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FileOutput className="w-4 h-4 text-gray-500" />
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
          <span>Format:</span>
          <span className="font-medium text-blue-600">
            {localData.outputFormat.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {localData.includeMetadata && (
            <span className="text-purple-600">📊 Meta</span>
          )}
          {localData.includeConfidence && (
            <span className="text-green-600">🎯 Conf</span>
          )}
          {localData.downloadEnabled && (
            <span className="text-blue-600">💾 DL</span>
          )}
          {localData.previewEnabled && (
            <span className="text-orange-600">👁️ Preview</span>
          )}
        </div>

        {localData.outputData && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-blue-800 text-xs">Output Ready</span>
              <div className="flex gap-1">
                {localData.previewEnabled && (
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="p-1 hover:bg-blue-100 rounded"
                  >
                    <Eye className="w-3 h-3 text-blue-600" />
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className="p-1 hover:bg-blue-100 rounded"
                >
                  {copied ? (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-blue-600" />
                  )}
                </button>
                {localData.downloadEnabled && (
                  <button className="p-1 hover:bg-blue-100 rounded">
                    <Download className="w-3 h-3 text-blue-600" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="text-xs text-blue-600">
              Confidence: {Math.round((localData.outputData.confidence || 0) * 100)}%
            </div>
            
            {localData.outputData.extractedData && (
              <div className="text-xs text-blue-600">
                Fields: {Object.keys(localData.outputData.extractedData).length}
              </div>
            )}

            {showPreview && (
              <div className="mt-2 p-2 bg-white border rounded max-h-32 overflow-y-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {formatOutput(localData.outputData).substring(0, 200)}
                  {formatOutput(localData.outputData).length > 200 && '...'}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OCROutputNode;
