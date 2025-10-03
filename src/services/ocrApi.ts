/**
 * OCR API Service
 * Client-side service for interacting with OCR API endpoints
 */

import { apiClient } from './api';

// Types
export interface OCRProcessRequest {
  document_type?: string;
  extract_structured_data?: boolean;
  use_fallback?: boolean;
  confidence_threshold?: number;
}

export interface OCRProcessResponse {
  success: boolean;
  text: string;
  confidence: number;
  provider: string;
  document_type: string;
  extracted_data: Record<string, any>;
  processing_time: number;
  errors: string[];
}

export interface DocumentClassificationResponse {
  classification: string;
  confidence: number;
  all_scores: Record<string, { score: number; confidence: string }>;
  visual_features: Record<string, any>;
  text_sample: string;
}

export interface OCRStatusResponse {
  google_vision_available: boolean;
  tesseract_available: boolean;
  supported_document_types: Array<{
    type: string;
    name: string;
    description: string;
    keywords: string[];
  }>;
  configuration: Record<string, any>;
}

export interface BatchProcessResponse {
  batch_id: string;
  status: string;
  file_count: number;
  message: string;
}

export interface ProviderTestResult {
  filename: string;
  test_results: {
    google_vision?: {
      success?: boolean;
      confidence?: number;
      text_length?: number;
      processing_time?: number;
      errors?: string[];
      error?: string;
    };
    tesseract?: {
      success?: boolean;
      confidence?: number;
      text_length?: number;
      processing_time?: number;
      errors?: string[];
      error?: string;
    };
    classification?: DocumentClassificationResponse | { error: string };
  };
  timestamp: string;
}

class OCRApiService {
  private baseUrl = '/api/ocr';

  /**
   * Process a document with OCR
   */
  async processDocument(
    file: File,
    options: OCRProcessRequest = {}
  ): Promise<OCRProcessResponse> {
    const formData = new FormData();
    formData.append('file', file);

    // Add options as form data
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const response = await fetch(`${this.baseUrl}/process`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `OCR processing failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Classify document type without full OCR processing
   */
  async classifyDocument(file: File): Promise<DocumentClassificationResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/classify`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Document classification failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Process multiple documents in batch
   */
  async batchProcessDocuments(
    files: File[],
    options: OCRProcessRequest = {}
  ): Promise<BatchProcessResponse> {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });

    // Add options
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const response = await fetch(`${this.baseUrl}/batch-process`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Batch processing failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get OCR system status
   */
  async getStatus(): Promise<OCRStatusResponse> {
    const response = await fetch(`${this.baseUrl}/status`);

    if (!response.ok) {
      throw new Error(`Failed to get OCR status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Update OCR configuration
   */
  async updateConfiguration(config: Record<string, any>): Promise<{
    success: boolean;
    updated_settings: Record<string, any>;
    message: string;
  }> {
    const response = await fetch(`${this.baseUrl}/configure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Configuration update failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Test OCR providers on a document
   */
  async testProviders(file: File): Promise<ProviderTestResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/test-providers`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Provider testing failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get supported document types
   */
  async getSupportedDocuments(): Promise<{
    supported_types: Array<{
      type: string;
      name: string;
      description: string;
      keywords: string[];
      processing_tips: string[];
      example_fields: string[];
    }>;
    total_count: number;
    processing_info: {
      supported_formats: string[];
      max_file_size: string;
      recommended_resolution: string;
      languages: string[];
    };
  }> {
    const response = await fetch(`${this.baseUrl}/supported-documents`);

    if (!response.ok) {
      throw new Error(`Failed to get supported documents: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    version: string;
    providers: {
      google_vision: boolean;
      tesseract: boolean;
    };
  }> {
    const response = await fetch(`${this.baseUrl}/health`);

    if (!response.ok) {
      throw new Error(`OCR health check failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'application/pdf'
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Unsupported file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get confidence level description
   */
  getConfidenceLevel(confidence: number): {
    level: 'low' | 'medium' | 'high' | 'excellent';
    description: string;
    color: string;
  } {
    if (confidence >= 0.9) {
      return {
        level: 'excellent',
        description: 'Excellent quality extraction',
        color: 'text-green-600'
      };
    } else if (confidence >= 0.7) {
      return {
        level: 'high',
        description: 'High quality extraction',
        color: 'text-blue-600'
      };
    } else if (confidence >= 0.5) {
      return {
        level: 'medium',
        description: 'Medium quality extraction',
        color: 'text-yellow-600'
      };
    } else {
      return {
        level: 'low',
        description: 'Low quality extraction',
        color: 'text-red-600'
      };
    }
  }

  /**
   * Extract preview text from OCR result
   */
  getPreviewText(text: string, maxLength: number = 100): string {
    if (!text) return 'No text extracted';
    
    const cleaned = text.replace(/\s+/g, ' ').trim();
    
    if (cleaned.length <= maxLength) {
      return cleaned;
    }
    
    return cleaned.substring(0, maxLength) + '...';
  }

  /**
   * Get document type display name
   */
  getDocumentTypeDisplayName(type: string): string {
    const displayNames: Record<string, string> = {
      'rg': 'RG (Registro Geral)',
      'cpf': 'CPF',
      'cnh': 'CNH (Carteira de Habilitação)',
      'ctps': 'CTPS (Carteira de Trabalho)',
      'contract': 'Contrato de Trabalho',
      'diploma': 'Diploma/Certificado',
      'medical_exam': 'Exame Médico',
      'proof_address': 'Comprovante de Residência',
      'unknown': 'Tipo não identificado',
      'generic': 'Documento genérico'
    };

    return displayNames[type] || type;
  }

  /**
   * Get provider display name
   */
  getProviderDisplayName(provider: string): string {
    const displayNames: Record<string, string> = {
      'google_vision': 'Google Vision API',
      'tesseract': 'Tesseract OCR',
      'auto': 'Automático',
      'hybrid': 'Híbrido'
    };

    return displayNames[provider] || provider;
  }
}

// Export singleton instance
export const ocrApi = new OCRApiService();
export default ocrApi;
