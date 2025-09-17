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
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-4/6" />
  </div>
)

export default SuspenseWrapper
