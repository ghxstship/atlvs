import React from 'react';
import { Label, cn } from "@ghxstship/ui";
import { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  children: ReactNode
  error?: string
  required?: boolean
}

export default function FormField({ label, children, error, required }: FormFieldProps) {
  return (
    <div className="space-y-sm">
      <Label>
        {label}
        {required && <span className="color-destructive ml-xs">*</span>}
      </Label>
      {children}
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}
