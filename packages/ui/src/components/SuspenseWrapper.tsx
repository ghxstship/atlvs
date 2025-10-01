'use client'

import React, { Suspense } from 'react'
import { Skeleton } from '../UnifiedDesignSystem'

interface SuspenseWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({ 
  children, 
  fallback 
}) => {
  return (
    <Suspense fallback={fallback || <DefaultFallback />}>
      {children}
    </Suspense>
  )
}

const DefaultFallback = () => (
  <div className="space-y-md p-md">
    <Skeleton className="h-icon-lg w-3/4" />
    <Skeleton className="h-icon-xs w-full" />
    <Skeleton className="h-icon-xs w-icon-sm/6" />
    <Skeleton className="h-icon-xs w-icon-xs/6" />
  </div>
)

export default SuspenseWrapper
