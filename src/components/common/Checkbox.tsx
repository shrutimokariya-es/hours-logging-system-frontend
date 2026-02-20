import React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'card';
  inputSize?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  helperText,
  variant = 'default',
  inputSize = 'md',
  indeterminate = false,
  className = '',
  id,
  ...props
}) => {
  const checkboxRef = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);
  
  const baseClasses = 'text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2';
  
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };
  
  const variantClasses = {
    default: '',
    card: 'border-2'
  };
  
  const checkboxClasses = `${baseClasses} ${sizeClasses[inputSize]} ${variantClasses[variant]} ${className}`;
  
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={checkboxRef}
            id={checkboxId}
            type="checkbox"
            className={checkboxClasses}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-3 text-sm">
            <label htmlFor={checkboxId} className="font-medium text-gray-700">
              {label}
            </label>
            {helperText && (
              <p className="text-gray-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Checkbox;
