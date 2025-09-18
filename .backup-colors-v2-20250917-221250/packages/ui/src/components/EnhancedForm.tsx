import React from 'react';

export interface EnhancedFormProps {
  children: React.ReactNode;
  onSubmit?: (data: any) => void;
}

export const EnhancedForm: React.FC<EnhancedFormProps> = ({ children, onSubmit }) => {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit?.({}); }}>
      {children}
    </form>
  );
};

export default EnhancedForm;
