import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({ children, className = '', padding = 'lg' }) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-6'
  };

  return (
    <div className={`bg-white rounded-lg shadow ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
