import { useState, useCallback } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: any;
  onSubmit: (values: T) => Promise<void> | void;
}

interface UseFormReturn<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: any) => void;
  setErrors: (errors: Record<string, string>) => void;
  resetForm: () => void;
  validateForm: () => Promise<boolean>;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit
}: UseFormOptions<T>): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validateForm = useCallback(async (): Promise<boolean> => {

    if (!validationSchema) return true;

    try {
      await validationSchema.validate(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error: any) {
      const validationErrors: Record<string, string> = {};
      if (error.inner) {
        error.inner.forEach((err: any) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
      } else {
        validationErrors.general = error.message || 'Validation failed';
      }
      setErrors(validationErrors);
      return false;
    }
  }, [values, validationSchema]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let fieldValue: any;
    if (type === 'checkbox') {
      fieldValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      // Convert to number if it's a valid number, otherwise keep as string for validation
      fieldValue = value === '' ? '' : Number(value);
    } else {
      fieldValue = value;
    }
    
    setValues(prev => ({ ...prev, [name]: fieldValue }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
  }, [errors]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    if (validationSchema && touched[name]) {
      validateForm();
    }
  }, [touched, validationSchema, validateForm]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit]);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setErrors,
    resetForm,
    validateForm,
  
  };
};
