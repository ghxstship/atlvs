/**
 * Procurement Form View Component
 * Form-based view for procurement entities
 */

'use client';

import React from 'react';

export const FormView: React.FC = () => {
  return (
    <div className="p-xl text-center">
      <div className="text-muted-foreground">
        <div className="h-icon-2xl w-icon-2xl mx-auto mb-md bg-muted rounded-lg flex items-center justify-center">
          📝
        </div>
        <p className="mb-sm">Form View</p>
        <p className="text-sm">Form-based data entry and editing</p>
      </div>
    </div>
  );
};

export default FormView;
