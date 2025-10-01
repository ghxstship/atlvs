'use client'

import React from 'react'
import { Button } from '../../atoms/Button'

export interface ExportButtonProps {
  data: any[]
  filename?: string
}

export const ExportButton = ({ data, filename = 'export' }: ExportButtonProps) => {
  const handleExport = () => {
    const csv = convertToCSV(data)
    downloadCSV(csv, filename)
  }

  const convertToCSV = (data: any[]) => {
    if (!data.length) return ''
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row => Object.values(row).join(','))
    return [headers, ...rows].join('\n')
  }

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      Export CSV
    </Button>
  )
}
