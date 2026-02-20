import { useState } from 'react';
import * as yup from 'yup';
import { ValidationError, extractValidationErrors } from '../validation';

interface UseFormValidationOptions<T extends Record<string, any>> {
  schema: yup.ObjectSchema<T>;
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
}

interface UseFormValidationReturn<T> {
  values: T;
  errors: Partial<ValidationError>;
  isLoading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: any) => void;
  resetForm: () => void;
  validateField: (field: keyof T) => Promise<void>;
}

export const useFormValidation = <T extends Record<string, any>>({
  schema,
  initialValues,
  onSubmit,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<ValidationError>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox and radio inputs
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setValues(prev => ({ ...prev, [name]: fieldValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = async (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    await validateField(name as keyof T);
  };

  const validateField = async (field: keyof T) => {
    try {
      await schema.validateAt(field as string, values);
      setErrors(prev => ({ ...prev, [field]: '' }));
    } catch (error) {
      const fieldError = extractValidationErrors(error as yup.ValidationError);
      setErrors(prev => ({ ...prev, ...fieldError }));
    }
  };

  const validateForm = async (): Promise<boolean> => {
    try {
      await schema.validate(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      const validationErrors = extractValidationErrors(error as yup.ValidationError);
      setErrors(validationErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(values);
      // Reset form on successful submission
      setValues(initialValues);
      setErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setFieldValue = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when value is changed programmatically
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setIsLoading(false);
  };

  return {
    values,
    errors,
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
    validateField,
  };
};
