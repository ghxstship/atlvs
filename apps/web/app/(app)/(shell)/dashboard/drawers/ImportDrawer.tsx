'use client';

import React, { useState, useCallback } from 'react';
import {
  X,
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Eye,
  Settings,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@ghxstship/ui';
import { Progress } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Separator } from '@ghxstship/ui';
import { ScrollArea } from '@ghxstship/ui';
import { Label } from '@ghxstship/ui';
import { Input } from '@ghxstship/ui';
import { Checkbox } from '@ghxstship/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ghxstship/ui';
import { Textarea } from '@ghxstship/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ghxstship/ui';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ghxstship/ui';
import { cn } from '@ghxstship/ui/lib/utils';

// Import Format Types
export type ImportFormat = 'csv' | 'excel' | 'json' | 'xml';

// Import Configuration
export interface ImportConfig {
  format: ImportFormat;
  delimiter?: ',' | ';' | '\t' | '|';
  hasHeaders?: boolean;
  skipRows?: number;
  encoding?: 'utf-8' | 'iso-8859-1' | 'windows-1252';
  dateFormat?: string;
  decimalSeparator?: '.' | ',';
  quoteChar?: '"' | "'";
}

// Field Mapping
export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: 'none' | 'uppercase' | 'lowercase' | 'trim' | 'date' | 'number';
  defaultValue?: unknown;
  required?: boolean;
}

// Import Preview Data
export interface ImportPreview {
  headers: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  warnings: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
}

// Import Drawer Props
export interface ImportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  availableFields: Array<{
    key: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    required?: boolean;
  }>;
  loading?: boolean;
  title?: string;
  width?: 'sm' | 'md' | 'lg' | 'xl';

  // Import Actions
  onValidateFile: (file: File, config: ImportConfig) => Promise<ImportPreview>;
  onImportData: (data: Record<string, unknown>[], mappings: FieldMapping[]) => Promise<{
    success: boolean;
    imported: number;
    skipped: number;
    errors: string[];
  }>;
  onDownloadTemplate?: (format: ImportFormat) => void;

  // Customization
  supportedFormats?: ImportFormat[];
  maxFileSize?: number; // in MB
  allowFieldMapping?: boolean;
  showPreview?: boolean;
  requireValidation?: boolean;
}

// Import Drawer Component
export const ImportDrawer: React.FC<ImportDrawerProps> = ({
  isOpen,
  onClose,
  availableFields,
  loading = false,
  title,
  width = 'lg',

  // Import Actions
  onValidateFile,
  onImportData,
  onDownloadTemplate,

  // Customization
  supportedFormats = ['csv', 'excel', 'json'],
  maxFileSize = 10,
  allowFieldMapping = true,
  showPreview = true,
  requireValidation = true
}) => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'configure' | 'map' | 'preview' | 'import'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importConfig, setImportConfig] = useState<ImportConfig>({
    format: 'csv',
    hasHeaders: true,
    delimiter: ',',
    encoding: 'utf-8'
  });
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [previewData, setPreviewData] = useState<ImportPreview | null>(null);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);
  const [importProgress, setImportProgress] = useState<{
    status: 'idle' | 'importing' | 'completed' | 'failed';
    progress: number;
    result?: {
      success: boolean;
      imported: number;
      skipped: number;
      errors: string[];
    };
  }>({ status: 'idle', progress: 0 });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Reset state when drawer opens
  React.useEffect(() => {
    if (!isOpen) {
      setCurrentStep('upload');
      setSelectedFile(null);
      setImportConfig({
        format: 'csv',
        hasHeaders: true,
        delimiter: ',',
        encoding: 'utf-8'
      });
      setFieldMappings([]);
      setPreviewData(null);
      setValidationResult(null);
      setImportProgress({ status: 'idle', progress: 0 });
      setShowConfirmDialog(false);
    }
  }, [isOpen]);

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      alert(`File size exceeds ${maxFileSize}MB limit`);
      return;
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = {
      csv: ['csv'],
      excel: ['xlsx', 'xls'],
      json: ['json'],
      xml: ['xml']
    };

    if (!allowedExtensions[importConfig.format]?.includes(fileExtension || '')) {
      alert(`Invalid file type for ${importConfig.format.toUpperCase()} format`);
      return;
    }

    setSelectedFile(file);
    setCurrentStep('configure');
  }, [importConfig.format, maxFileSize]);

  // Handle configuration change
  const handleConfigChange = useCallback((key: keyof ImportConfig, value: unknown) => {
    setImportConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  // Handle field mapping
  const handleFieldMapping = useCallback((sourceField: string, targetField: string) => {
    setFieldMappings(prev => {
      const existing = prev.find(m => m.sourceField === sourceField);
      if (existing) {
        return prev.map(m =>
          m.sourceField === sourceField
            ? { ...m, targetField }
            : m
        );
      } else {
        return [...prev, {
          sourceField,
          targetField,
          transform: 'none'
        }];
      }
    });
  }, []);

  // Validate file
  const handleValidateFile = useCallback(async () => {
    if (!selectedFile) return;

    try {
      const preview = await onValidateFile(selectedFile, importConfig);
      setPreviewData(preview);

      const errors = preview.errors.filter(e => e.severity === 'error').map(e => e.message);
      const warnings = preview.warnings.map(w => w.message);

      setValidationResult({
        valid: errors.length === 0,
        errors,
        warnings
      });

      if (allowFieldMapping) {
        setCurrentStep('map');
      } else {
        setCurrentStep('preview');
      }
    } catch (error) {
      setValidationResult({
        valid: false,
        errors: [error instanceof Error ? error.message : 'Validation failed'],
        warnings: []
      });
    }
  }, [selectedFile, importConfig, onValidateFile, allowFieldMapping]);

  // Start import
  const handleStartImport = useCallback(async () => {
    if (!previewData || !validationResult?.valid) return;

    if (requireValidation && !validationResult.valid) {
      setShowConfirmDialog(true);
      return;
    }

    await executeImport();
  }, [previewData, validationResult, requireValidation]);

  const executeImport = useCallback(async () => {
    if (!previewData) return;

    setImportProgress({ status: 'importing', progress: 0 });
    setCurrentStep('import');

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 300);

      const result = await onImportData(previewData.rows, fieldMappings);

      clearInterval(progressInterval);
      setImportProgress({
        status: 'completed',
        progress: 100,
        result
      });
    } catch (error) {
      setImportProgress({
        status: 'failed',
        progress: 0,
        result: {
          success: false,
          imported: 0,
          skipped: 0,
          errors: [error instanceof Error ? error.message : 'Import failed']
        }
      });
    }
  }, [previewData, fieldMappings, onImportData]);

  // Drawer width classes
  const widthClasses = {
    sm: 'w-96',
    md: 'w-[32rem]',
    lg: 'w-[40rem]',
    xl: 'w-[48rem]'
  };

  // Render upload step
  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Import Data</h3>
        <p className="text-muted-foreground">
          Select a file to import data into your dashboard
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="format">Import Format</Label>
          <Select
            value={importConfig.format}
            onValueChange={(value: ImportFormat) => handleConfigChange('format', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {supportedFormats.map(format => (
                <SelectItem key={format} value={format}>
                  {format.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="file">Select File</Label>
          <Input
            id="file"
            type="file"
            accept={importConfig.format === 'csv' ? '.csv' :
                   importConfig.format === 'excel' ? '.xlsx,.xls' :
                   importConfig.format === 'json' ? '.json' : '.xml'}
            onChange={handleFileSelect}
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Maximum file size: {maxFileSize}MB
          </p>
        </div>

        {onDownloadTemplate && (
          <div className="pt-4">
            <p className="text-sm text-muted-foreground mb-2">
              Need a template? Download a sample file:
            </p>
            <div className="flex gap-2">
              {supportedFormats.map(format => (
                <Button
                  key={format}
                  variant="outline"
                  size="sm"
                  onClick={() => onDownloadTemplate(format)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  {format.toUpperCase()} Template
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render configuration step
  const renderConfigureStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Configure Import</h3>
        <p className="text-muted-foreground">Set up import options for your file</p>
      </div>

      <div className="space-y-4">
        {importConfig.format === 'csv' && (
          <>
            <div>
              <Label>Delimiter</Label>
              <Select
                value={importConfig.delimiter}
                onValueChange={(value: ImportConfig['delimiter']) => handleConfigChange('delimiter', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=",">Comma (,)</SelectItem>
                  <SelectItem value=";">Semicolon (;)</SelectItem>
                  <SelectItem value="\t">Tab</SelectItem>
                  <SelectItem value="|">Pipe (|)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasHeaders"
                checked={importConfig.hasHeaders}
                onCheckedChange={(checked) => handleConfigChange('hasHeaders', checked)}
              />
              <Label htmlFor="hasHeaders">First row contains headers</Label>
            </div>
          </>
        )}

        <div>
          <Label>Encoding</Label>
          <Select
            value={importConfig.encoding}
            onValueChange={(value: ImportConfig['encoding']) => handleConfigChange('encoding', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="utf-8">UTF-8</SelectItem>
              <SelectItem value="iso-8859-1">ISO-8859-1</SelectItem>
              <SelectItem value="windows-1252">Windows-1252</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Skip Rows</Label>
          <Input
            type="number"
            min="0"
            max="10"
            value={importConfig.skipRows || 0}
            onChange={(e) => handleConfigChange('skipRows', Number(e.target.value))}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setCurrentStep('upload')}>
          Back
        </Button>
        <Button onClick={handleValidateFile} disabled={loading} className="flex-1">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
          Validate & Preview
        </Button>
      </div>
    </div>
  );

  // Render field mapping step
  const renderMappingStep = () => {
    if (!previewData) return null;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Map Fields</h3>
          <p className="text-muted-foreground">Map your file columns to dashboard fields</p>
        </div>

        <div className="space-y-4">
          {previewData.headers.map((header, index) => {
            const mapping = fieldMappings.find(m => m.sourceField === header);

            return (
              <div key={header} className="flex items-center gap-4 p-3 border rounded">
                <div className="flex-1">
                  <Label className="text-sm font-medium">Column {index + 1}:</Label>
                  <p className="text-sm text-muted-foreground">{header}</p>
                </div>

                <div className="flex-1">
                  <Label className="text-sm">Map to Field:</Label>
                  <Select
                    value={mapping?.targetField || ''}
                    onValueChange={(value) => handleFieldMapping(header, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFields.map(field => (
                        <SelectItem key={field.key} value={field.key}>
                          {field.label}
                          {field.required && ' *'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentStep('configure')}>
            Back
          </Button>
          <Button onClick={() => setCurrentStep('preview')} className="flex-1">
            Continue to Preview
          </Button>
        </div>
      </div>
    );
  };

  // Render preview step
  const renderPreviewStep = () => {
    if (!previewData) return null;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Import Preview</h3>
          <p className="text-muted-foreground">
            Review your data before importing ({previewData.rows.length} of {previewData.totalRows} rows shown)
          </p>
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className="space-y-2">
            {validationResult.errors.length > 0 && (
              <div className="p-3 border border-destructive/20 bg-destructive/10 rounded">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Errors Found</span>
                </div>
                <ul className="text-sm mt-1 list-disc list-inside">
                  {validationResult.errors.slice(0, 5).map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                  {validationResult.errors.length > 5 && (
                    <li>... and {validationResult.errors.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}

            {validationResult.warnings.length > 0 && (
              <div className="p-3 border border-yellow-200 bg-yellow-50 rounded">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Warnings</span>
                </div>
                <ul className="text-sm mt-1 list-disc list-inside">
                  {validationResult.warnings.slice(0, 5).map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                  {validationResult.warnings.length > 5 && (
                    <li>... and {validationResult.warnings.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Data Preview */}
        {showPreview && (
          <div className="border rounded">
            <Table>
              <TableHeader>
                <TableRow>
                  {previewData.headers.map((header, idx) => (
                    <TableHead key={idx}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.rows.slice(0, 5).map((row, idx) => (
                  <TableRow key={idx}>
                    {previewData.headers.map((header, headerIdx) => (
                      <TableCell key={headerIdx}>
                        {String(row[header] || '')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentStep(allowFieldMapping ? 'map' : 'configure')}>
            Back
          </Button>
          <Button
            onClick={handleStartImport}
            disabled={!validationResult?.valid && requireValidation}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Start Import
          </Button>
        </div>
      </div>
    );
  };

  // Render import step
  const renderImportStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        {importProgress.status === 'importing' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Importing Data</h3>
            <Progress value={importProgress.progress} className="w-full mb-2" />
            <p className="text-muted-foreground">{importProgress.progress}% complete</p>
          </>
        )}

        {importProgress.status === 'completed' && importProgress.result && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Import Completed</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Imported:</span>
                <span className="font-medium">{importProgress.result.imported}</span>
              </div>
              <div className="flex justify-between">
                <span>Skipped:</span>
                <span className="font-medium">{importProgress.result.skipped}</span>
              </div>
              {importProgress.result.errors.length > 0 && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded">
                  <div className="font-medium text-destructive mb-1">Errors:</div>
                  <ul className="text-sm list-disc list-inside">
                    {importProgress.result.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}

        {importProgress.status === 'failed' && (
          <>
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Import Failed</h3>
            <div className="text-sm text-muted-foreground">
              {importProgress.result?.errors.join(', ')}
            </div>
          </>
        )}
      </div>

      {(importProgress.status === 'completed' || importProgress.status === 'failed') && (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentStep('upload')} className="flex-1">
            Import Another File
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
    <>
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
                {title || 'Import Data'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">
                  Step {['upload', 'configure', 'map', 'preview', 'import'].indexOf(currentStep) + 1} of 5
                </Badge>
                <span className="text-sm text-muted-foreground capitalize">
                  {currentStep.replace('_', ' ')}
                </span>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              {currentStep === 'upload' && renderUploadStep()}
              {currentStep === 'configure' && renderConfigureStep()}
              {currentStep === 'map' && renderMappingStep()}
              {currentStep === 'preview' && renderPreviewStep()}
              {currentStep === 'import' && renderImportStep()}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import with Errors</AlertDialogTitle>
            <AlertDialogDescription>
              Your data has validation errors. Are you sure you want to proceed with the import?
              Some records may be skipped or imported incorrectly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeImport}>
              Proceed Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export type { ImportDrawerProps, ImportConfig, ImportFormat, FieldMapping, ImportPreview };
