import * as yup from 'yup';
import { ValidationError } from './commonValidation';

// Login validation schema
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Email is invalid')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

// Register validation schema
export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: yup
    .string()
    .email('Email is invalid')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

// Type definitions for form data
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Helper function to extract error messages
export const extractAuthValidationErrors = (error: yup.ValidationError): ValidationError => {
  const errors: ValidationError = {};
  
  error.inner.forEach((err) => {
    if (err.path) {
      errors[err.path] = err.message;
    }
  });
  
  return errors;
};

// Hour log validation schema
export const hourLogSchema = yup.object().shape({
  client: yup.string().when('project', {
    is: (project: string) => !project || project === '',
    then: (schema) => schema.required('Client is required when no project is selected'),
    otherwise: (schema) => schema.notRequired()
  }),
  project: yup.string().when('client', {
    is: (client: string) => !client || client === '',
    then: (schema) => schema.required('Project is required when no client is selected'),
    otherwise: (schema) => schema.notRequired()
  }),
  developer: yup.string().required('Developer is required'),
  date: yup.string().required('Date is required'),
  hours: yup
    .number()
    .typeError('Hours must be a number')
    .required('Hours is required')
    .positive('Hours must be greater than 0')
    .min(0.1, 'Hours must be at least 0.1')
    .max(24, 'Hours cannot exceed 24'),
  description: yup
    .string()
    .required('Description is required')
    .min(3, 'Description must be at least 3 characters')
    .max(500, 'Description must be less than 500 characters')
    .test('not-empty', 'Description cannot be just whitespace', (value) => {
      return value ? value.trim().length > 0 : false;
    })
}, [['client', 'project']]);

// Helper function to extract hour log validation errors
export const extractHourLogValidationErrors = (error: yup.ValidationError): ValidationError => {
  const errors: ValidationError = {};
  
  error.inner.forEach((err) => {
    if (err.path) {
      errors[err.path] = err.message;
    }
  });
  
  return errors;
};
