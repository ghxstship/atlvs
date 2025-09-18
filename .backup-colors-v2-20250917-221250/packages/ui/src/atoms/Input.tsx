'use client'
import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  required?: boolean;
  id?: string;
}

export const Input: React.FC<InputProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  type = 'text', 
  disabled, 
  className,
  required,
  id,
  ...props
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      id={id}
      className={`input ${className || ''}`}
      {...props}
    />
  );
};
