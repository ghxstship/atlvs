'use client'

import React from 'react'
import { Input } from '../UnifiedDesignSystem'

export interface SearchFilterProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const SearchFilter = ({ value, onChange, placeholder = "Search..." }: SearchFilterProps) => {
  return (
    <Input
      type="search"
      value={value}
      onChange={(e: any) => onChange(e.target.value)}
      placeholder={placeholder}
      className="max-w-sm"
    />
  )
}
