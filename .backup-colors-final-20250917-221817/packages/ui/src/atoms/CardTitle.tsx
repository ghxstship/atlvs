import React from 'react';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  children: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({ 
  children, 
  className,
  ...props
}) => {
  return (
    <h3
      className={`text-lg font-semibold text-foreground ${className || ''}`}
      {...props}
    >
      {children}
    </h3>
  );
};
