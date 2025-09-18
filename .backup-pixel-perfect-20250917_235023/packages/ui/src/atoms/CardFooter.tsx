import React from 'react';

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`flex items-center p-lg pt-0 ${className}`}>
      {children}
    </div>
  );
};
