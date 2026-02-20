import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

const Label: React.FC<LabelProps> = ({
  children,
  required = false,
  variant = 'default',
  size = 'sm',
  className = '',
  ...props
}) => {
  const baseClasses = 'block font-medium';
  
  const variantClasses = {
    default: 'text-gray-700',
    error: 'text-red-700',
    success: 'text-green-700'
  };
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <label className={classes} {...props}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

export default Label;
