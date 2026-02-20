import React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  variant = 'default',
  inputSize = 'md',
  fullWidth = false,
  className = '',
  id,
  ...props
}) => {
  const baseClasses = 'block transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';
  
  const variantClasses = {
    default: 'border rounded-lg bg-white',
    filled: 'border-0 rounded-lg bg-gray-100',
    outlined: 'border-2 rounded-lg bg-white'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };
  
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const borderClasses = error ? 'border-red-300' : 'border-gray-300';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[inputSize]} ${widthClasses} ${borderClasses} ${className}`;
  
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={classes}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
