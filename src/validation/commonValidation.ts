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
  email: emailValidation,
  company: requiredStringValidation('Company name', 2),
  phone: phoneValidation.optional(),
  address: requiredStringValidation('Address', 5),
  hourlyRate: positiveNumberValidation('Hourly rate'),
});

// Developer validation schema
export const developerSchema = yup.object().shape({
  name: nameValidation,
  email: emailValidation,
  phone: phoneValidation.optional(),
  skills: yup
    .array()
    .of(yup.string().required('Skill is required'))
    .min(1, 'At least one skill is required')
    .required('Skills are required'),
  hourlyRate: positiveNumberValidation('Hourly rate'),
  experience: numberValidation('Years of experience', 0)
    .max(50, 'Experience cannot exceed 50 years'),
});

// Project validation schema
export const projectSchema = yup.object().shape({
  name: requiredStringValidation('Project name', 2),
  description: requiredStringValidation('Project description', 10),
  clientId: yup.string().required('Client is required'),
  developerIds: yup
    .array()
    .of(yup.string())
    .min(1, 'At least one developer is required'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup
    .date()
    .required('End date is required')
    .min(yup.ref('startDate'), 'End date must be after start date'),
  budget: positiveNumberValidation('Budget'),
});

// Hours logging validation schema
export const hoursLogSchema = yup.object().shape({
  projectId: yup.string().required('Project is required'),
  developerId: yup.string().required('Developer is required'),
  date: yup.date().required('Date is required'),
  hours: numberValidation('Hours', 0.5)
    .max(24, 'Hours cannot exceed 24')
    .test(
      'max-decimal-places',
      'Hours can have maximum 2 decimal places',
      (value) => {
        if (!value) return false;
        const decimalPlaces = value.toString().split('.')[1];
        return !decimalPlaces || decimalPlaces.length <= 2;
      }
    ),
  description: requiredStringValidation('Description', 5),
  tasks: yup
    .array()
    .of(yup.string().required('Task is required'))
    .min(1, 'At least one task is required'),
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
  email: string;
  company: string;
  phone?: string;
  address: string;
  hourlyRate: number;
}

export interface DeveloperFormData {
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  hourlyRate: number;
  experience: number;
}

export interface ProjectFormData {
  name: string;
  description: string;
  clientId: string;
  developerIds: string[];
  startDate: Date;
  endDate: Date;
  budget: number;
}

export interface HoursLogFormData {
  projectId: string;
  developerId: string;
  date: Date;
  hours: number;
  description: string;
  tasks: string[];
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
