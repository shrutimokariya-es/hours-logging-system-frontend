import { ValidationError } from '../validation/commonValidation';

/**
 * Convert ValidationError to Record<string, string> for form error state
 */
export const convertValidationErrors = (errors: ValidationError): Record<string, string> => {
  const stringErrors: Record<string, string> = {};
  Object.keys(errors).forEach(key => {
    const value = errors[key];
    stringErrors[key] = value?.toString() || '';
  });
  return stringErrors;
};

/**
 * Handle form validation with error conversion
 */
export const handleFormValidation = async (
  schema: any,
  data: any,
  setErrors: (errors: Record<string, string>) => void
): Promise<boolean> => {
  try {
    await schema.validate(data, { abortEarly: false });
    setErrors({});
    return true;
  } catch (error: any) {
    const validationErrors = convertValidationErrors(error.inner ? error : { message: error.message });
    setErrors(validationErrors);
    return false;
  }
};
