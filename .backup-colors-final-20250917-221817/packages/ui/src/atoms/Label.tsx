import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
  children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({ 
  children, 
  className,
  ...props
}) => {
  return (
    <label
      className={`block text-sm font-medium text-muted-foreground/80 ${className || ''}`}
      {...props}
    >
      {children}
    </label>
  );
};
