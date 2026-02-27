import * as yup from 'yup';

// Common validation patterns
export const emailValidation = yup
  .string()
  .email('Email is invalid')
  .required('Email is required');

export const passwordValidation = yup
  .string()
  .required('Password is required')
  .min(6, 'Password must be at least 6 characters')
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

export const nameValidation = yup
  .string()
  .required('Name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

export const phoneValidation = yup
  .string()
  .matches(/^[+]?[\d\s\-()]+$/, 'Phone number is invalid')
  .min(10, 'Phone number must be at least 10 digits');

export const requiredStringValidation = (fieldName: string, minLength = 1) =>
  yup
    .string()
    .required(`${fieldName} is required`)
    .min(minLength, `${fieldName} must be at least ${minLength} characters`);

export const numberValidation = (fieldName: string, min = 0) =>
  yup
    .number()
    .typeError(`${fieldName} must be a number`)
    .required(`${fieldName} is required`)
    .min(min, `${fieldName} must be at least ${min}`)
    .integer(`${fieldName} must be an integer`);

export const positiveNumberValidation = (fieldName: string) =>
  yup
    .number()
    .typeError(`${fieldName} must be a number`)
    .required(`${fieldName} is required`)
    .positive(`${fieldName} must be positive`);

// Client validation schema
export const clientSchema = yup.object().shape({
  name: nameValidation,
  companyEmail: emailValidation,
  billingType: yup.string().oneOf(['Hourly', 'Fixed'], 'Invalid billing type').required('Billing type is required'),
  status: yup.string().oneOf(['Active', 'Inactive'], 'Invalid status').required('Status is required'),
  password: yup.string().when('$isEdit', {
    is: false,
    then: (schema) => passwordValidation,
    otherwise: (schema) => schema.optional()
  })
});

// Developer validation schema
export const developerSchema = yup.object().shape({
  name: nameValidation,
  email: emailValidation,
  hourlyRate: yup.number().min(0, 'Hourly rate must be positive').required('Hourly rate is required'),
  status: yup.string().oneOf(['Active', 'Inactive'], 'Invalid status').required('Status is required'),
  password: yup.string().when('$isEdit', {
    is: false,
    then: (schema) => passwordValidation,
    otherwise: (schema) => schema.optional()
  })
});

// Project validation schema
export const projectSchema = yup.object().shape({
  name: requiredStringValidation('Project name', 2).max(100, 'Project name cannot exceed 100 characters'),
  description: yup.string().max(500, 'Description cannot exceed 500 characters'),
  client: yup.string().required('Client is required'),
  developers: yup.array().of(yup.string()),
  status: yup.string().oneOf(['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'], 'Invalid status').required('Status is required'),
  startDate: yup.string(),
  endDate: yup.string().test('is-after-start', 'End date must be after start date', function(value) {
    const { startDate } = this.parent;
    if (!value || !startDate) return true;
    return new Date(value) >= new Date(startDate);
  }),
  estimatedHours: yup.number().min(0, 'Estimated hours must be positive'),
  hourlyRate: yup.number().min(0, 'Hourly rate must be positive'),
  billingType: yup.string().oneOf(['Hourly', 'Fixed'], 'Invalid billing type').required('Billing type is required')
});

// Task validation schema
export const taskSchema = yup.object().shape({
  title: requiredStringValidation('Task title', 2).max(200, 'Task title cannot exceed 200 characters'),
  description: yup.string().max(1000, 'Description cannot exceed 1000 characters'),
  project: yup.string().required('Project is required'),
  assignedTo: yup.array().of(yup.string()).min(1, 'At least one developer must be assigned'),
  status: yup.string().oneOf(['Todo', 'In Progress', 'Review', 'Completed', 'Blocked'], 'Invalid status').required('Status is required'),
  priority: yup.string().oneOf(['Low', 'Medium', 'High', 'Urgent'], 'Invalid priority').required('Priority is required'),
  estimatedHours: yup.number().min(0, 'Estimated hours must be positive'),
  startDate: yup.string(),
  dueDate: yup.string().test('is-after-start', 'Due date must be after start date', function(value) {
    const { startDate } = this.parent;
    if (!value || !startDate) return true;
    return new Date(value) >= new Date(startDate);
  })
});

// Hours logging validation schema
export const hoursLogSchema = yup.object().shape({
  project: yup.string().required('Project is required'),
  task: yup.string().when('$isDeveloper', {
    is: true,
    then: (schema) => schema.required('Task is required for developers'),
    otherwise: (schema) => schema.optional()
  }),
  client: yup.string().required('Client is required'),
  developer: yup.string().required('Developer is required'),
  date: yup.string().required('Date is required'),
  hours: yup.number()
    .required('Hours is required')
    .min(0.5, 'Minimum 0.5 hours required')
    .max(24, 'Maximum 24 hours allowed')
    .test('is-half-increment', 'Hours must be in 0.5 hour increments', (value) => {
      if (!value) return false;
      return value % 0.5 === 0;
    }),
  description: requiredStringValidation('Description', 5).max(500, 'Description cannot exceed 500 characters')
});

// Report generation validation schema
export const reportSchema = yup.object().shape({
  type: yup
    .string()
    .oneOf(['hours', 'project', 'developer', 'client'], 'Invalid report type')
    .required('Report type is required'),
  dateRange: yup
    .string()
    .oneOf(['this-week', 'this-month', 'last-month', 'this-quarter', 'this-year', 'custom'], 'Invalid date range')
    .required('Date range is required'),
  customStartDate: yup.date().when('dateRange', {
    is: 'custom',
    then: (schema) => schema.required('Start date is required for custom range'),
    otherwise: (schema) => schema.optional(),
  }),
  customEndDate: yup.date().when('dateRange', {
    is: 'custom',
    then: (schema) => schema
      .required('End date is required for custom range')
      .min(yup.ref('customStartDate'), 'End date must be after start date'),
    otherwise: (schema) => schema.optional(),
  }),
});

// Type definitions
export interface ClientFormData {
  name: string;
  companyEmail: string;
  billingType: 'Hourly' | 'Fixed';
  status: 'Active' | 'Inactive';
  password?: string;
}

export interface DeveloperFormData {
  name: string;
  email: string;
  hourlyRate: number;
  status: 'Active' | 'Inactive';
  password?: string;
}

export interface ProjectFormData {
  name: string;
  description: string;
  client: string;
  developers: string[];
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  startDate: string;
  endDate: string;
  estimatedHours: number;
  hourlyRate: number;
  billingType: 'Hourly' | 'Fixed';
}

export interface TaskFormData {
  title: string;
  description: string;
  project: string;
  assignedTo: string[];
  status: 'Todo' | 'In Progress' | 'Review' | 'Completed' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  estimatedHours: number;
  startDate: string;
  dueDate: string;
}

export interface HoursLogFormData {
  project: string;
  task?: string;
  client: string;
  developer: string;
  date: string;
  hours: number;
  description: string;
}

export interface ReportFormData {
  type: 'hours' | 'project' | 'developer' | 'client';
  dateRange: 'this-week' | 'this-month' | 'last-month' | 'this-quarter' | 'this-year' | 'custom';
  customStartDate?: Date;
  customEndDate?: Date;
}

// Validation error type
export interface ValidationError {
  [key: string]: string | number | undefined;
}

// Helper function to extract error messages
export const extractValidationErrors = (error: yup.ValidationError): ValidationError => {
  const errors: ValidationError = {};
  
  error.inner.forEach((err) => {
    if (err.path) {
      errors[err.path] = err.message;
    }
  });
  
  return errors;
};

