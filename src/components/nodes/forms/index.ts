/**
 * Forms Node Components Export
 * Centralized export for all form-related React Flow nodes
 */

export { default as FormInputNode } from './FormInputNode';
export { default as FormValidatorNode } from './FormValidatorNode';
export { default as FormConditionalNode } from './FormConditionalNode';
export { default as FormSubmitNode } from './FormSubmitNode';

export type { FormInputNodeData } from './FormInputNode';
export type { FormValidatorNodeData } from './FormValidatorNode';
export type { FormConditionalNodeData } from './FormConditionalNode';
export type { FormSubmitNodeData } from './FormSubmitNode';

// Node type definitions for React Flow
export const FORM_NODE_TYPES = {
  formInput: 'formInput',
  formValidator: 'formValidator',
  formConditional: 'formConditional',
  formSubmit: 'formSubmit',
} as const;

export type FormNodeType = typeof FORM_NODE_TYPES[keyof typeof FORM_NODE_TYPES];
