'use client';

import React, { useState, useCallback } from 'react';
import {
  X,
  Download,
  FileText,
  Image,
  FileSpreadsheet,
  Code,
  Settings,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Calendar,
  Filter
} from 'lucide-react';
import { Button } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Separator } from '@ghxstship/ui';
import { Label } from '@ghxstship/ui';
import { Input } from '@ghxstship/ui';
import { Checkbox } from '@ghxstship/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ghxstship/ui';
import { Textarea } from '@ghxstship/ui';
import { RadioGroup, RadioGroupItem } from '@ghxstship/ui';
import { DatePicker } from '@ghxstship/ui';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@ghxstship/ui';
import { cn } from '@ghxstship/ui/lib/utils';

// Export Format Types
export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json' | 'xml' | 'png' | 'jpeg' | 'svg';

// Export Configuration
export interface ExportConfig {
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, unknown>;
  fields?: string[];
  sortBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  limit?: number;

  // Format-specific options
  csvOptions?: {
    delimiter: ',' | ';' | '\t';
    quoteChar: '"' | "'";
    escapeChar: '"' | '\\';
  };
  excelOptions?: {
    sheetName?: string;
    includeStyles?: boolean;
  };
  pdfOptions?: {
    orientation: 'portrait' | 'landscape';
    pageSize: 'a4' | 'letter' | 'legal';
    includeCharts?: boolean;
    includeImages?: boolean;
  };
  jsonOptions?: {
    pretty: boolean;
    rootElement?: string;
  };
  imageOptions?: {
    width?: number;
    height?: number;
    quality: number;
    backgroundColor?: string;
  };
}

// Export Preset
export interface ExportPreset {
  id: string;
  name: string;
  description: string;
  config: Partial<ExportConfig>;
  isDefault?: boolean;
  category?: string;
}

// Export Drawer Props
export interface ExportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  availableFields: Array<{
    key: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    exportable: boolean;
  }>;
  totalRecords?: number;
  loading?: boolean;
  title?: string;
  width?: 'sm' | 'md' | 'lg' | 'xl';

  // Export Actions
  onExport: (config: ExportConfig) => Promise<{
    success: boolean;
    downloadUrl?: string;
    fileSize?: number;
    recordCount?: number;
    error?: string;
  }>;
  onPreview?: (config: ExportConfig) => Promise<{
    preview: unknown[];
    estimatedSize: number;
    estimatedRecords: number;
  }>;

  // Customization
  supportedFormats?: ExportFormat[];
  maxRecords?: number;
  allowScheduling?: boolean;
  presets?: ExportPreset[];
  showAdvancedOptions?: boolean;

  // Scheduling
  onScheduleExport?: (config: ExportConfig, schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients?: string[];
  }) => Promise<void>;
}

// Export Drawer Component
export const ExportDrawer: React.FC<ExportDrawerProps> = ({
  isOpen,
  onClose,
  availableFields,
  totalRecords = 0,
  loading = false,
  title,
  width = 'lg',

  // Export Actions
  onExport,
  onPreview,

  // Customization
  supportedFormats = ['csv', 'excel', 'pdf', 'json'],
  maxRecords = 10000,
  allowScheduling = false,
  presets = [],
  showAdvancedOptions = true
}) => {
  const [currentStep, setCurrentStep] = useState<'configure' | 'preview' | 'export' | 'schedule'>('configure');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'csv',
    filename: `export-${new Date().toISOString().split('T')[0]}`,
    includeHeaders: true,
    fields: availableFields.filter(f => f.exportable).map(f => f.key)
  });
  const [previewData, setPreviewData] = useState<{
    preview: unknown[];
    estimatedSize: number;
    estimatedRecords: number;
  } | null>(null);
  const [exportProgress, setExportProgress] = useState<{
    status: 'idle' | 'exporting' | 'completed' | 'failed';
    progress: number;
    result?: {
      success: boolean;
      downloadUrl?: string;
      fileSize?: number;
      recordCount?: number;
      error?: string;
    };
  }>({ status: 'idle', progress: 0 });
  const [showScheduling, setShowScheduling] = useState(false);

  // Reset state when drawer opens
  React.useEffect(() => {
    if (!isOpen) {
      setCurrentStep('configure');
      setSelectedPreset('');
      setExportConfig({
        format: 'csv',
        filename: `export-${new Date().toISOString().split('T')[0]}`,
        includeHeaders: true,
        fields: availableFields.filter(f => f.exportable).map(f => f.key)
      });
      setPreviewData(null);
      setExportProgress({ status: 'idle', progress: 0 });
      setShowScheduling(false);
    }
  }, [isOpen, availableFields]);

  // Handle preset selection
  const handlePresetSelect = useCallback((presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setExportConfig(prev => ({
        ...prev,
        ...preset.config
      }));
    }
    setSelectedPreset(presetId);
  }, [presets]);

  // Handle config change
  const handleConfigChange = useCallback((key: keyof ExportConfig, value: unknown) => {
    setExportConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  // Handle field selection
  const handleFieldToggle = useCallback((fieldKey: string) => {
    setExportConfig(prev => ({
      ...prev,
      fields: prev.fields?.includes(fieldKey)
        ? prev.fields.filter(f => f !== fieldKey)
        : [...(prev.fields || []), fieldKey]
    }));
  }, []);

  // Handle select all fields
  const handleSelectAllFields = useCallback(() => {
    setExportConfig(prev => ({
      ...prev,
      fields: availableFields.filter(f => f.exportable).map(f => f.key)
    }));
  }, [availableFields]);

  // Handle select no fields
  const handleSelectNoFields = useCallback(() => {
    setExportConfig(prev => ({
      ...prev,
      fields: []
    }));
  }, []);

  // Generate preview
  const handleGeneratePreview = useCallback(async () => {
    if (!onPreview) return;

    try {
      const preview = await onPreview(exportConfig);
      setPreviewData(preview);
      setCurrentStep('preview');
    } catch (error) {
      console.error('Preview generation failed:', error);
    }
  }, [exportConfig, onPreview]);

  // Start export
  const handleStartExport = useCallback(async () => {
    setExportProgress({ status: 'exporting', progress: 0 });
    setCurrentStep('export');

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 15, 90)
        }));
      }, 500);

      const result = await onExport(exportConfig);

      clearInterval(progressInterval);
      setExportProgress({
        status: result.success ? 'completed' : 'failed',
        progress: 100,
        result
      });
    } catch (error) {
      setExportProgress({
        status: 'failed',
        progress: 0,
        result: {
          success: false,
          error: error instanceof Error ? error.message : 'Export failed'
        }
      });
    }
  }, [exportConfig, onExport]);

  // Get format icon
  const getFormatIcon = useCallback((format: ExportFormat) => {
    switch (format) {
      case 'csv':
      case 'excel':
        return FileSpreadsheet;
      case 'pdf':
        return FileText;
      case 'png':
      case 'jpeg':
      case 'svg':
        return Image;
      case 'json':
      case 'xml':
        return Code;
      default:
        return FileText;
    }
  }, []);

  // Drawer width classes
  const widthClasses = {
    sm: 'w-96',
    md: 'w-[32rem]',
    lg: 'w-[40rem]',
    xl: 'w-[48rem]'
  };

  // Render configuration step
  const renderConfigureStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Export Configuration</h3>
        <p className="text-muted-foreground">
          Configure your export settings ({totalRecords} records available)
        </p>
      </div>

      {/* Presets */}
      {presets.length > 0 && (
        <div className="space-y-3">
          <Label>Export Presets</Label>
          <div className="grid gap-2">
            {presets.map(preset => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={cn(
                  'flex items-center gap-3 p-3 border rounded-lg text-left transition-colors',
                  selectedPreset === preset.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-accent'
                )}
              >
                <div className="flex-1">
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-sm text-muted-foreground">{preset.description}</div>
                </div>
                {selectedPreset === preset.id && (
                  <CheckCircle className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Basic Settings */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Export Format</Label>
            <Select
              value={exportConfig.format}
              onValueChange={(value: ExportFormat) => handleConfigChange('format', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedFormats.map(format => {
                  const Icon = getFormatIcon(format);
                  return (
                    <SelectItem key={format} value={format}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {format.toUpperCase()}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Filename</Label>
            <Input
              value={exportConfig.filename}
              onChange={(e) => handleConfigChange('filename', e.target.value)}
              placeholder="export-file"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label>Date Range (Optional)</Label>
          <div className="grid grid-cols-2 gap-2">
            <DatePicker
              date={exportConfig.dateRange?.start}
              onDateChange={(date) => handleConfigChange('dateRange', {
                ...exportConfig.dateRange,
                start: date || undefined
              })}
              placeholder="Start date"
            />
            <DatePicker
              date={exportConfig.dateRange?.end}
              onDateChange={(date) => handleConfigChange('dateRange', {
                ...exportConfig.dateRange,
                end: date || undefined
              })}
              placeholder="End date"
            />
          </div>
        </div>

        {/* Record Limit */}
        <div>
          <Label>Record Limit</Label>
          <Select
            value={exportConfig.limit?.toString() || 'all'}
            onValueChange={(value) => handleConfigChange('limit', value === 'all' ? undefined : Number(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Records ({totalRecords})</SelectItem>
              <SelectItem value="100">First 100</SelectItem>
              <SelectItem value="500">First 500</SelectItem>
              <SelectItem value="1000">First 1,000</SelectItem>
              <SelectItem value="5000">First 5,000</SelectItem>
              <SelectItem value={maxRecords.toString()}>First {maxRecords}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Field Selection */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="fields">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Field Selection
              <Badge variant="secondary" className="ml-2">
                {exportConfig.fields?.length || 0} selected
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAllFields}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={handleSelectNoFields}>
                  Select None
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {availableFields.map(field => (
                  <div key={field.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.key}
                      checked={exportConfig.fields?.includes(field.key) || false}
                      onCheckedChange={() => handleFieldToggle(field.key)}
                      disabled={!field.exportable}
                    />
                    <Label
                      htmlFor={field.key}
                      className={cn(
                        'text-sm flex-1',
                        !field.exportable && 'text-muted-foreground'
                      )}
                    >
                      {field.label}
                      {!field.exportable && ' (Not exportable)'}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Format-Specific Options */}
      {showAdvancedOptions && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="advanced">
            <AccordionTrigger>Advanced Options</AccordionTrigger>
            <AccordionContent>
              {/* CSV Options */}
              {exportConfig.format === 'csv' && (
                <div className="space-y-3">
                  <div>
                    <Label>Delimiter</Label>
                    <Select
                      value={exportConfig.csvOptions?.delimiter || ','}
                      onValueChange={(value: ',' | ';' | '\t') =>
                        handleConfigChange('csvOptions', {
                          ...exportConfig.csvOptions,
                          delimiter: value
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=",">Comma (,)</SelectItem>
                        <SelectItem value=";">Semicolon (;)</SelectItem>
                        <SelectItem value="\t">Tab</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Excel Options */}
              {exportConfig.format === 'excel' && (
                <div className="space-y-3">
                  <div>
                    <Label>Sheet Name</Label>
                    <Input
                      value={exportConfig.excelOptions?.sheetName || 'Sheet1'}
                      onChange={(e) => handleConfigChange('excelOptions', {
                        ...exportConfig.excelOptions,
                        sheetName: e.target.value
                      })}
                    />
                  </div>
                </div>
              )}

              {/* PDF Options */}
              {exportConfig.format === 'pdf' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Orientation</Label>
                      <Select
                        value={exportConfig.pdfOptions?.orientation || 'portrait'}
                        onValueChange={(value: 'portrait' | 'landscape') =>
                          handleConfigChange('pdfOptions', {
                            ...exportConfig.pdfOptions,
                            orientation: value
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="portrait">Portrait</SelectItem>
                          <SelectItem value="landscape">Landscape</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Page Size</Label>
                      <Select
                        value={exportConfig.pdfOptions?.pageSize || 'a4'}
                        onValueChange={(value: 'a4' | 'letter' | 'legal') =>
                          handleConfigChange('pdfOptions', {
                            ...exportConfig.pdfOptions,
                            pageSize: value
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="a4">A4</SelectItem>
                          <SelectItem value="letter">Letter</SelectItem>
                          <SelectItem value="legal">Legal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        {onPreview && (
          <Button variant="outline" onClick={handleGeneratePreview}>
            Preview
          </Button>
        )}
        <Button onClick={handleStartExport} disabled={loading} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>
    </div>
  );

  // Render preview step
  const renderPreviewStep = () => {
    if (!previewData) return null;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Export Preview</h3>
          <p className="text-muted-foreground">
            Preview of your export ({previewData.preview.length} of {previewData.estimatedRecords} records)
          </p>
        </div>

        {/* Preview Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 border rounded text-center">
            <div className="text-2xl font-bold">{previewData.estimatedRecords.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Records</div>
          </div>
          <div className="p-3 border rounded text-center">
            <div className="text-2xl font-bold">{(previewData.estimatedSize / 1024).toFixed(1)}KB</div>
            <div className="text-sm text-muted-foreground">Estimated Size</div>
          </div>
          <div className="p-3 border rounded text-center">
            <div className="text-2xl font-bold">{exportConfig.fields?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Fields</div>
          </div>
        </div>

        {/* Data Preview */}
        <div className="border rounded max-h-96 overflow-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                {exportConfig.fields?.map(fieldKey => {
                  const field = availableFields.find(f => f.key === fieldKey);
                  return (
                    <th key={fieldKey} className="p-2 text-left text-sm font-medium">
                      {field?.label || fieldKey}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {previewData.preview.map((row, idx) => (
                <tr key={idx} className="border-t">
                  {exportConfig.fields?.map(fieldKey => (
                    <td key={fieldKey} className="p-2 text-sm">
                      {String((row as Record<string, unknown>)[fieldKey] || '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentStep('configure')}>
            Back to Configure
          </Button>
          <Button onClick={handleStartExport} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Start Export
          </Button>
        </div>
      </div>
    );
  };

  // Render export step
  const renderExportStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        {exportProgress.status === 'exporting' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Exporting Data</h3>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${exportProgress.progress}%` }}
              />
            </div>
            <p className="text-muted-foreground">{exportProgress.progress}% complete</p>
          </>
        )}

        {exportProgress.status === 'completed' && exportProgress.result?.success && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Export Completed</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Records exported:</span>
                <span className="font-medium">{exportProgress.result.recordCount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>File size:</span>
                <span className="font-medium">
                  {exportProgress.result.fileSize
                    ? `${(exportProgress.result.fileSize / 1024).toFixed(1)}KB`
                    : 'Unknown'
                  }
                </span>
              </div>
            </div>
            {exportProgress.result.downloadUrl && (
              <Button
                onClick={() => window.open(exportProgress.result!.downloadUrl!, '_blank')}
                className="mt-4"
              >
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            )}
          </>
        )}

        {exportProgress.status === 'failed' && (
          <>
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Export Failed</h3>
            <div className="text-sm text-muted-foreground">
              {exportProgress.result?.error}
            </div>
          </>
        )}
      </div>

      {(exportProgress.status === 'completed' || exportProgress.status === 'failed') && (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentStep('configure')} className="flex-1">
            Export Another
          </Button>
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
      <div className={cn(
        'bg-background shadow-xl transform transition-transform duration-300 ease-in-out',
        'flex flex-col h-full',
        widthClasses[width]
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold truncate">
              {title || 'Export Data'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">
                {exportConfig.format.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {totalRecords.toLocaleString()} records available
              </span>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {currentStep === 'configure' && renderConfigureStep()}
            {currentStep === 'preview' && renderPreviewStep()}
            {currentStep === 'export' && renderExportStep()}
          </div>
        </div>
      </div>
    </div>
  );
};

export type { ExportDrawerProps, ExportConfig, ExportFormat, ExportPreset };
