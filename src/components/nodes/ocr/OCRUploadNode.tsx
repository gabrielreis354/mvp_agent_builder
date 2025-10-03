import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Upload, FileText, Settings, CheckCircle, AlertCircle } from 'lucide-react';

interface OCRUploadNodeData {
  label: string;
  acceptedFormats: string[];
  maxFileSize: number;
  autoClassify: boolean;
  documentType?: string;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  uploadedFile?: {
    name: string;
    size: number;
    type: string;
  };
  isEditing?: boolean;
}

const OCRUploadNode: React.FC<NodeProps<OCRUploadNodeData>> = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(data.isEditing || false);
  const [localData, setLocalData] = useState(data);

  const handleSave = () => {
    setIsEditing(false);
    // Update node data in React Flow
    // This would be handled by the parent component
  };

  const getStatusIcon = () => {
    switch (localData.uploadStatus) {
      case 'uploading':
        return <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Upload className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isEditing) {
    return (
      <div className="bg-white border-2 border-blue-500 rounded-lg p-4 min-w-[300px] shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Upload className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-800">OCR Upload Configuration</span>
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
              placeholder="Upload Document"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Accepted Formats
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['.jpg', '.png', '.pdf', '.tiff'].map((format) => (
                <label key={format} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={localData.acceptedFormats.includes(format)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setLocalData({
                          ...localData,
                          acceptedFormats: [...localData.acceptedFormats, format]
                        });
                      } else {
                        setLocalData({
                          ...localData,
                          acceptedFormats: localData.acceptedFormats.filter(f => f !== format)
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{format}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max File Size (MB)
            </label>
            <input
              type="number"
              value={localData.maxFileSize}
              onChange={(e) => setLocalData({ ...localData, maxFileSize: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              min="1"
              max="50"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoClassify"
              checked={localData.autoClassify}
              onChange={(e) => setLocalData({ ...localData, autoClassify: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="autoClassify" className="text-sm font-medium text-gray-700">
              Auto-classify document type
            </label>
          </div>

          {!localData.autoClassify && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Type
              </label>
              <select
                value={localData.documentType || ''}
                onChange={(e) => setLocalData({ ...localData, documentType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Select document type</option>
                <option value="rg">RG (Registro Geral)</option>
                <option value="cpf">CPF</option>
                <option value="cnh">CNH</option>
                <option value="ctps">CTPS</option>
                <option value="contract">Contrato de Trabalho</option>
                <option value="diploma">Diploma/Certificado</option>
                <option value="medical_exam">Exame Médico</option>
                <option value="proof_address">Comprovante de Residência</option>
              </select>
            </div>
          )}
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
        <div className="flex items-center gap-2">
          <FileText className="w-3 h-3" />
          <span>Formats: {localData.acceptedFormats.join(', ')}</span>
        </div>
        
        <div>Max size: {formatFileSize(localData.maxFileSize * 1024 * 1024)}</div>
        
        {localData.autoClassify ? (
          <div className="text-blue-600">Auto-classify enabled</div>
        ) : (
          <div>Type: {localData.documentType || 'Not specified'}</div>
        )}

        {localData.uploadedFile && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
            <div className="font-medium text-green-800">{localData.uploadedFile.name}</div>
            <div className="text-green-600 text-xs">
              {formatFileSize(localData.uploadedFile.size)} • {localData.uploadedFile.type}
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
};

export default OCRUploadNode;
