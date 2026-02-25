import React from 'react';
import Label from './Label';
import Input from './Input';
import { InputProps } from './Input';
import Select from './Select';
import { SelectProps } from './Select';
import TextArea from './TextArea';
import { TextAreaProps } from './TextArea';
import Checkbox from './Checkbox';
import { CheckboxProps } from './Checkbox';

export interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  required = false,
  fullWidth = false,
  children
}) => {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <Label required={required} variant={error ? 'error' : 'default'}>
          {label}
        </Label>
      )}
      {children}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

// Higher-order components for specific field types
export const FormInput: React.FC<InputProps> = (props) => {
  const { label, error, helperText, required, fullWidth, ...inputProps } = props;
  
  return (
    <FormField
      label={label}
      error={error ? String(error) : undefined}
      helperText={helperText}
      required={required}
      fullWidth={fullWidth}
    >
      <Input
        {...inputProps}
        // error={error ? String(error) : undefined}
        fullWidth={fullWidth}
      />
    </FormField>
  );
};

export const FormSelect: React.FC<SelectProps> = (props) => {
  const { label, error, helperText, required, fullWidth, ...selectProps } = props;
  
  return (
    <FormField
      label={label}
      error={error ? String(error) : undefined}
      helperText={helperText}
      required={required}
      fullWidth={fullWidth}
    >
      <Select
        {...selectProps}
        error={error ? String(error) : undefined}
        fullWidth={fullWidth}
      />
    </FormField>
  );
};

export const FormTextArea: React.FC<TextAreaProps> = (props) => {
  const { label, error, helperText, required, fullWidth, ...textareaProps } = props;
  
  return (
    <FormField
      label={label}
      error={error ? String(error) : undefined}
      helperText={helperText}
      required={required}
      fullWidth={fullWidth}
    >
      <TextArea
        {...textareaProps}
        error={error ? String(error) : undefined}
        fullWidth={fullWidth}
      />
    </FormField>
  );
};

export const FormCheckbox: React.FC<CheckboxProps> = (props) => {
  const { label, error, helperText, required, ...checkboxProps } = props;
  
  return (
    <FormField
      label={undefined} // Checkbox includes its own label
      error={error}
      helperText={helperText}
      required={required}
      fullWidth={false}
    >
      <Checkbox
        {...checkboxProps}
        label={label}
      />
    </FormField>
  );
};

export default FormField;
