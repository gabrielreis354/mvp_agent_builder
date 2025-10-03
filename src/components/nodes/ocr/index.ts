/**
 * OCR Node Components Export
 * Centralized export for all OCR-related React Flow nodes
 */

import OCRUploadNode from './OCRUploadNode';
import OCRProcessNode from './OCRProcessNode';
import OCRValidationNode from './OCRValidationNode';
import OCROutputNode from './OCROutputNode';

// Export all OCR node components
export {
  OCRUploadNode,
  OCRProcessNode,
  OCRValidationNode,
  OCROutputNode
};

// OCR Node Type Constants
export const OCR_NODE_TYPES = {
  OCR_UPLOAD: 'ocrUpload',
  OCR_PROCESS: 'ocrProcess',
  OCR_VALIDATION: 'ocrValidation',
  OCR_OUTPUT: 'ocrOutput'
} as const;

// OCR Node Type Definitions for React Flow
export const ocrNodeTypes = {
  [OCR_NODE_TYPES.OCR_UPLOAD]: OCRUploadNode,
  [OCR_NODE_TYPES.OCR_PROCESS]: OCRProcessNode,
  [OCR_NODE_TYPES.OCR_VALIDATION]: OCRValidationNode,
  [OCR_NODE_TYPES.OCR_OUTPUT]: OCROutputNode
};

// Default OCR Node Data Templates
export const defaultOCRNodeData = {
  [OCR_NODE_TYPES.OCR_UPLOAD]: {
    label: 'Upload Document',
    acceptedFormats: ['.jpg', '.png', '.pdf'],
    maxFileSize: 10, // MB
    autoClassify: true,
    uploadStatus: 'idle' as const
  },
  [OCR_NODE_TYPES.OCR_PROCESS]: {
    label: 'Process OCR',
    provider: 'auto' as const,
    extractStructuredData: true,
    confidenceThreshold: 0.7,
    useFallback: true,
    processingStatus: 'idle' as const
  },
  [OCR_NODE_TYPES.OCR_VALIDATION]: {
    label: 'Validate OCR Data',
    validationRules: [],
    stopOnError: false,
    validationStatus: 'idle' as const
  },
  [OCR_NODE_TYPES.OCR_OUTPUT]: {
    label: 'OCR Output',
    outputFormat: 'json' as const,
    includeMetadata: true,
    includeConfidence: true,
    downloadEnabled: true,
    previewEnabled: true
  }
};

// OCR Node Categories for UI
export const OCR_NODE_CATEGORIES = {
  INPUT: 'OCR Input',
  PROCESSING: 'OCR Processing',
  VALIDATION: 'OCR Validation',
  OUTPUT: 'OCR Output'
};

// OCR Node Descriptions
export const OCR_NODE_DESCRIPTIONS = {
  [OCR_NODE_TYPES.OCR_UPLOAD]: 'Upload and prepare documents for OCR processing',
  [OCR_NODE_TYPES.OCR_PROCESS]: 'Extract text and data from documents using OCR',
  [OCR_NODE_TYPES.OCR_VALIDATION]: 'Validate extracted data with Brazilian document rules',
  [OCR_NODE_TYPES.OCR_OUTPUT]: 'Format and export OCR results in various formats'
};

// Supported Document Types for OCR
export const SUPPORTED_DOCUMENT_TYPES = [
  { value: 'rg', label: 'RG (Registro Geral)', category: 'identity' },
  { value: 'cpf', label: 'CPF', category: 'identity' },
  { value: 'cnh', label: 'CNH (Carteira de Habilitação)', category: 'identity' },
  { value: 'ctps', label: 'CTPS (Carteira de Trabalho)', category: 'work' },
  { value: 'contract', label: 'Contrato de Trabalho', category: 'work' },
  { value: 'diploma', label: 'Diploma/Certificado', category: 'education' },
  { value: 'medical_exam', label: 'Exame Médico', category: 'health' },
  { value: 'proof_address', label: 'Comprovante de Residência', category: 'address' }
];

// OCR Provider Options
export const OCR_PROVIDERS = [
  { value: 'auto', label: 'Auto (Best Available)', description: 'Google Vision with Tesseract fallback' },
  { value: 'google_vision', label: 'Google Vision API', description: 'High accuracy cloud OCR' },
  { value: 'tesseract', label: 'Tesseract OCR', description: 'Open source OCR engine' }
];

// Validation Rule Types
export const VALIDATION_RULE_TYPES = [
  { value: 'cpf', label: 'CPF', description: 'Brazilian CPF validation' },
  { value: 'cnpj', label: 'CNPJ', description: 'Brazilian CNPJ validation' },
  { value: 'rg', label: 'RG', description: 'Brazilian RG validation' },
  { value: 'cnh', label: 'CNH', description: 'Brazilian CNH validation' },
  { value: 'email', label: 'Email', description: 'Email format validation' },
  { value: 'phone', label: 'Phone', description: 'Brazilian phone validation' },
  { value: 'custom', label: 'Custom', description: 'Custom regex pattern' }
];

// Output Format Options
export const OUTPUT_FORMATS = [
  { value: 'json', label: 'JSON', description: 'Structured JSON format' },
  { value: 'text', label: 'Plain Text', description: 'Raw extracted text' },
  { value: 'csv', label: 'CSV', description: 'Comma-separated values' },
  { value: 'form_data', label: 'Form Data', description: 'HTML form data format' }
];

// Helper function to create OCR workflow template
export const createOCRWorkflowTemplate = () => {
  return {
    nodes: [
      {
        id: 'ocr-upload-1',
        type: OCR_NODE_TYPES.OCR_UPLOAD,
        position: { x: 100, y: 100 },
        data: defaultOCRNodeData[OCR_NODE_TYPES.OCR_UPLOAD]
      },
      {
        id: 'ocr-process-1',
        type: OCR_NODE_TYPES.OCR_PROCESS,
        position: { x: 400, y: 100 },
        data: defaultOCRNodeData[OCR_NODE_TYPES.OCR_PROCESS]
      },
      {
        id: 'ocr-validation-1',
        type: OCR_NODE_TYPES.OCR_VALIDATION,
        position: { x: 700, y: 100 },
        data: defaultOCRNodeData[OCR_NODE_TYPES.OCR_VALIDATION]
      },
      {
        id: 'ocr-output-1',
        type: OCR_NODE_TYPES.OCR_OUTPUT,
        position: { x: 1000, y: 100 },
        data: defaultOCRNodeData[OCR_NODE_TYPES.OCR_OUTPUT]
      }
    ],
    edges: [
      {
        id: 'e1-2',
        source: 'ocr-upload-1',
        target: 'ocr-process-1'
      },
      {
        id: 'e2-3',
        source: 'ocr-process-1',
        target: 'ocr-validation-1'
      },
      {
        id: 'e3-4',
        source: 'ocr-validation-1',
        target: 'ocr-output-1'
      }
    ]
  };
};
