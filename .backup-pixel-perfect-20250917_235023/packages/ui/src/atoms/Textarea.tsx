import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => {
  return (
    <textarea
      className={`w-full p-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${className || ''}`}
      {...props}
    />
  );
};
