import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className 
}) => {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className || ''}`}>
      {children}
    </span>
  );
};
