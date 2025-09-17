import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  role?: string;
  tabIndex?: number;
  'aria-label'?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  disabled, 
  variant = 'primary',
  size,
  className,
  type = 'button',
  ...props
}) => {
  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled} 
      className={`btn btn-${variant} ${size ? `btn-${size}` : ''} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};
