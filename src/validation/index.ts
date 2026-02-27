// Export all validation schemas and types
export * from './authValidation';
export * from './commonValidation';

// Re-export commonly used items for convenience
export {
  // Common validation
  clientSchema,
  developerSchema,
  projectSchema,
  taskSchema,
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
  TaskFormData,
  HoursLogFormData,
  ReportFormData,
  ValidationError,
} from './commonValidation';
