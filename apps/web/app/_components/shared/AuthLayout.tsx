import React from 'react';
import { Card, cn } from "@ghxstship/ui";
import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-subtle">
      <div className="w-full max-w-md">
        {(title || subtitle) && (
          <div className="text-center mb-md">
            {title && <h1 className="text-heading-lg text-heading-3 mb-sm">{title}</h1>}
            {subtitle && <p className="color-foreground-subtle">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
