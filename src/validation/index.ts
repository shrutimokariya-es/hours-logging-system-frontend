// Export all validation schemas and types
export * from './authValidation';
export * from './commonValidation';

// Re-export commonly used items for convenience
export {
  // Common validation
  clientSchema,
  developerSchema,
  projectSchema,
  hoursLogSchema,
  reportSchema,
  
  // Helper functions
  extractValidationErrors,
} from './commonValidation';

// Re-export types with export type
export type {
  ClientFormData,
  DeveloperFormData,
  ProjectFormData,
  HoursLogFormData,
  ReportFormData,
  ValidationError,
} from './commonValidation';
