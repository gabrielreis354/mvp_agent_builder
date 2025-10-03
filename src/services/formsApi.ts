/**
 * Forms API Service
 * Client-side service for interacting with Forms Engine API
 */

import { api } from './api';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'cpf' | 'cnpj' | 'cep' | 'phone' | 'select' | 'checkbox' | 'date';
  required: boolean;
  placeholder: string;
  options?: string[];
  validation_rules?: ValidationRule[];
  conditional_logic?: ConditionalLogic;
}

export interface ValidationRule {
  type: string;
  value?: any;
  message: string;
}

export interface ConditionalLogic {
  field_id: string;
  operator: 'equals' | 'not_equals' | 'contains';
  value: any;
  default: boolean;
}

export interface FormSchema {
  id: string;
  name: string;
  description: string;
  workflow_type: string;
  fields: FormField[];
  created_at: string;
  updated_at: string;
}

export interface ValidationResult {
  is_valid: boolean;
  errors: Record<string, string[]>;
  formatted_data: Record<string, any>;
}

export interface FormSubmissionResult {
  submission_id: string;
  status: string;
  validation_result: ValidationResult;
  workflow_started: boolean;
  workflow_id?: string;
}

export interface FormSubmissionData {
  form_id: string;
  data: Record<string, any>;
}

export class FormsApiService {
  /**
   * Create a new form
   */
  static async createForm(formData: {
    name: string;
    description: string;
    fields: FormField[];
    workflow_type: string;
  }): Promise<FormSchema> {
    const response = await api.post('/api/forms/create', formData);
    return response.data;
  }

  /**
   * Get form by ID
   */
  static async getForm(formId: string): Promise<FormSchema> {
    const response = await api.get(`/api/forms/${formId}`);
    return response.data;
  }

  /**
   * Validate form data
   */
  static async validateFormData(formId: string, data: Record<string, any>): Promise<ValidationResult> {
    const response = await api.post(`/api/forms/${formId}/validate`, data);
    return response.data;
  }

  /**
   * Submit form data
   */
  static async submitForm(submission: FormSubmissionData): Promise<FormSubmissionResult> {
    const response = await api.post('/api/forms/submit', submission);
    return response.data;
  }

  /**
   * Get form submission by ID
   */
  static async getSubmission(submissionId: string): Promise<any> {
    const response = await api.get(`/api/forms/submission/${submissionId}`);
    return response.data;
  }

  /**
   * Get HR form templates
   */
  static async getHRTemplates(): Promise<{
    success: boolean;
    templates: Record<string, any>;
  }> {
    const response = await api.get('/api/forms/templates/rh');
    return response.data;
  }

  /**
   * Create form from HR template
   */
  static async createFormFromTemplate(templateType: 'admission' | 'termination'): Promise<FormSchema> {
    const response = await api.post(`/api/forms/templates/rh/${templateType}`, {});
    return response.data;
  }

  /**
   * Test Brazilian validators
   */
  static async testValidators(): Promise<{
    success: boolean;
    test_data: Record<string, string>;
    results: Record<string, any>;
  }> {
    const response = await api.get('/api/forms/validators/br/test');
    return response.data;
  }

  /**
   * Validate CPF
   */
  static validateCPF(cpf: string): boolean {
    if (!cpf) return false;
    
    // Remove formatting
    const cleanCPF = cpf.replace(/[^0-9]/g, '');
    
    // Check length
    if (cleanCPF.length !== 11) return false;
    
    // Check for known invalid patterns
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Calculate check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF[i]) * (10 - i);
    }
    
    let digit1 = 11 - (sum % 11);
    if (digit1 >= 10) digit1 = 0;
    
    if (parseInt(cleanCPF[9]) !== digit1) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF[i]) * (11 - i);
    }
    
    let digit2 = 11 - (sum % 11);
    if (digit2 >= 10) digit2 = 0;
    
    return parseInt(cleanCPF[10]) === digit2;
  }

  /**
   * Validate CNPJ
   */
  static validateCNPJ(cnpj: string): boolean {
    if (!cnpj) return false;
    
    // Remove formatting
    const cleanCNPJ = cnpj.replace(/[^0-9]/g, '');
    
    // Check length
    if (cleanCNPJ.length !== 14) return false;
    
    // Check for known invalid patterns
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
    
    // Calculate first check digit
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum1 = 0;
    for (let i = 0; i < 12; i++) {
      sum1 += parseInt(cleanCNPJ[i]) * weights1[i];
    }
    
    let digit1 = 11 - (sum1 % 11);
    if (digit1 >= 10) digit1 = 0;
    
    if (parseInt(cleanCNPJ[12]) !== digit1) return false;
    
    // Calculate second check digit
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum2 = 0;
    for (let i = 0; i < 13; i++) {
      sum2 += parseInt(cleanCNPJ[i]) * weights2[i];
    }
    
    let digit2 = 11 - (sum2 % 11);
    if (digit2 >= 10) digit2 = 0;
    
    return parseInt(cleanCNPJ[13]) === digit2;
  }

  /**
   * Validate CEP
   */
  static validateCEP(cep: string): boolean {
    if (!cep) return false;
    
    // Remove formatting
    const cleanCEP = cep.replace(/[^0-9]/g, '');
    
    // Check length and format
    if (cleanCEP.length !== 8) return false;
    
    // Check if all digits are the same (invalid)
    if (/^(\d)\1{7}$/.test(cleanCEP)) return false;
    
    return true;
  }

  /**
   * Format CPF
   */
  static formatCPF(cpf: string): string {
    const cleanCPF = cpf.replace(/[^0-9]/g, '');
    if (cleanCPF.length !== 11) return cpf;
    
    return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3, 6)}.${cleanCPF.slice(6, 9)}-${cleanCPF.slice(9)}`;
  }

  /**
   * Format CNPJ
   */
  static formatCNPJ(cnpj: string): string {
    const cleanCNPJ = cnpj.replace(/[^0-9]/g, '');
    if (cleanCNPJ.length !== 14) return cnpj;
    
    return `${cleanCNPJ.slice(0, 2)}.${cleanCNPJ.slice(2, 5)}.${cleanCNPJ.slice(5, 8)}/${cleanCNPJ.slice(8, 12)}-${cleanCNPJ.slice(12)}`;
  }

  /**
   * Format CEP
   */
  static formatCEP(cep: string): string {
    const cleanCEP = cep.replace(/[^0-9]/g, '');
    if (cleanCEP.length !== 8) return cep;
    
    return `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5)}`;
  }

  /**
   * Real-time field validation
   */
  static validateField(field: FormField, value: any): string[] {
    const errors: string[] = [];
    
    // Required validation
    if (field.required && (!value || value === '')) {
      errors.push(`${field.label} é obrigatório`);
      return errors; // Return early if required field is empty
    }
    
    // Skip other validations if field is empty and not required
    if (!value || value === '') return errors;
    
    // Type-specific validation
    switch (field.type) {
      case 'cpf':
        if (!this.validateCPF(value)) {
          errors.push('CPF inválido');
        }
        break;
      case 'cnpj':
        if (!this.validateCNPJ(value)) {
          errors.push('CNPJ inválido');
        }
        break;
      case 'cep':
        if (!this.validateCEP(value)) {
          errors.push('CEP inválido');
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push('Email inválido');
        }
        break;
      case 'phone':
        const phoneRegex = /^\(?[1-9]{2}\)?\s?9?\d{4}-?\d{4}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          errors.push('Telefone inválido');
        }
        break;
    }
    
    // Custom validation rules
    if (field.validation_rules) {
      for (const rule of field.validation_rules) {
        switch (rule.type) {
          case 'min_length':
            if (value.length < rule.value) {
              errors.push(rule.message || `Mínimo ${rule.value} caracteres`);
            }
            break;
          case 'max_length':
            if (value.length > rule.value) {
              errors.push(rule.message || `Máximo ${rule.value} caracteres`);
            }
            break;
        }
      }
    }
    
    return errors;
  }

  /**
   * Check if field should be visible based on conditional logic
   */
  static isFieldVisible(field: FormField, formData: Record<string, any>): boolean {
    if (!field.conditional_logic) return true;
    
    const { field_id, operator, value, default: defaultValue } = field.conditional_logic;
    const fieldValue = formData[field_id];
    
    if (fieldValue === undefined || fieldValue === null) {
      return defaultValue;
    }
    
    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'not_equals':
        return fieldValue !== value;
      case 'contains':
        return String(fieldValue).includes(String(value));
      default:
        return defaultValue;
    }
  }
}

export default FormsApiService;
