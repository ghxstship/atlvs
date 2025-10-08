/**
 * DetailView Component — Record Detail View
 * Full record display with all fields
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { Edit, Trash, Copy, ArrowLeft } from 'lucide-react';
import type { FieldConfig, DataRecord } from '../types';

export interface DetailViewProps {
  /** Record to display */
  record: DataRecord;
  
  /** Field configuration */
  fields: FieldConfig[];
  
  /** Loading state */
  loading?: boolean;
  
  /** Error message */
  error?: string | null;
  
  /** Back handler */
  onBack?: () => void;
  
  /** Edit handler */
  onEdit?: (record: DataRecord) => void;
  
  /** Delete handler */
  onDelete?: (record: DataRecord) => void;
  
  /** Duplicate handler */
  onDuplicate?: (record: DataRecord) => void;
  
  /** Custom className */
  className?: string;
}

/**
 * DetailView Component
 */
export function DetailView({
  record,
  fields,
  loading = false,
  error = null,
  onBack,
  onEdit,
  onDelete,
  onDuplicate,
  className = '',
}: DetailViewProps) {
  const visibleFields = fields.filter(f => f.visible !== false);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive font-medium">Error loading record</p>
          <p className="text-muted-foreground text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-lg font-semibold">Record Details</h2>
        </div>
        
        <div className="flex items-center gap-2">
          {onDuplicate && (
            <button
              onClick={() => onDuplicate(record)}
              className="
                flex items-center gap-2 px-3 py-2
                rounded-md
                border border-border
                hover:bg-muted
                transition-colors
              "
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(record)}
              className="
                flex items-center gap-2 px-3 py-2
                rounded-md
                bg-primary
                text-primary-foreground
                hover:opacity-90
                transition-opacity
              "
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(record)}
              className="
                flex items-center gap-2 px-3 py-2
                rounded-md
                border border-destructive
                text-destructive
                hover:bg-destructive
                hover:text-destructive-foreground
                transition-colors
              "
            >
              <Trash className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleFields.map(field => {
              const value = record[field.key];
              
              return (
                <div key={field.key} className="space-y-2">
                  <label className="block text-sm font-medium text-muted-foreground">
                    {field.icon && <field.icon className="inline w-4 h-4 mr-1" />}
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </label>
                  
                  <div className="
                    px-3 py-2 rounded-md
                    border border-border
                    bg-muted/30
                  ">
                    {field.format ? (
                      <div>{field.format(value, record)}</div>
                    ) : field.type === 'boolean' ? (
                      <div>{value ? 'Yes' : 'No'}</div>
                    ) : field.type === 'date' ? (
                      <div>{value ? new Date(value).toLocaleDateString() : 'N/A'}</div>
                    ) : field.type === 'datetime' ? (
                      <div>{value ? new Date(value).toLocaleString() : 'N/A'}</div>
                    ) : field.type === 'select' && field.options ? (
                      <div>{field.options.find(o => o.value === value)?.label || value}</div>
                    ) : field.type === 'multiselect' && field.options ? (
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(value) ? value : []).map((v: string) => (
                          <span
                            key={v}
                            className="
                              px-2 py-1 rounded
                              bg-primary/10
                              text-sm
                            "
                          >
                            {field.options?.find(o => o.value === v)?.label || v}
                          </span>
                        ))}
                      </div>
                    ) : field.type === 'url' && value ? (
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {value}
                      </a>
                    ) : field.type === 'email' && value ? (
                      <a
                        href={`mailto:${value}`}
                        className="text-primary hover:underline"
                      >
                        {value}
                      </a>
                    ) : field.type === 'image' && value ? (
                      <img
                        src={value}
                        alt={field.label}
                        className="max-w-full h-auto rounded"
                      />
                    ) : field.type === 'textarea' ? (
                      <div className="whitespace-pre-wrap">{value || 'N/A'}</div>
                    ) : (
                      <div>{value != null ? String(value) : 'N/A'}</div>
                    )}
                  </div>
                  
                  {field.helpText && (
                    <p className="text-xs text-muted-foreground">
                      {field.helpText}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Metadata */}
          <div className="pt-6 border-t border-border">
            <h3 className="font-medium mb-3">Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">ID:</span>
                <span className="ml-2 font-mono">{record.id}</span>
              </div>
              {record.createdAt && (
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <span className="ml-2">{new Date(record.createdAt).toLocaleString()}</span>
                </div>
              )}
              {record.updatedAt && (
                <div>
                  <span className="text-muted-foreground">Updated:</span>
                  <span className="ml-2">{new Date(record.updatedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

DetailView.displayName = 'DetailView';
