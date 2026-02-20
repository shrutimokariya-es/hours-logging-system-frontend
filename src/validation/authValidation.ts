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
