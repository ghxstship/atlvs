'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  CheckSquare,
  Square,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  Edit,
  Copy,
  Archive,
  Download,
  Upload,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@ghxstship/ui';
import { Checkbox } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Progress } from '@ghxstship/ui';
import { Separator } from '@ghxstship/ui';
import { ScrollArea } from '@ghxstship/ui';
import { Label } from '@ghxstship/ui';
import { Input } from '@ghxstship/ui';
import { Textarea } from '@ghxstship/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ghxstship/ui';
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

// Bulk Operation Types
export type BulkOperationType =
  | 'delete'
  | 'update'
  | 'duplicate'
  | 'archive'
  | 'export'
  | 'import'
  | 'status_change'
  | 'assign'
  | 'tag'
  | 'custom';

// Bulk Field Configuration
export interface BulkField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'date' | 'tags';
  options?: Array<{ label: string; value: unknown }>;
  required?: boolean;
  placeholder?: string;
}

// Bulk Operation Configuration
export interface BulkOperation {
  type: BulkOperationType;
  label: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: 'default' | 'destructive' | 'warning' | 'success';
  fields?: BulkField[];
  confirmRequired?: boolean;
  confirmMessage?: string;
  maxItems?: number;
  supportedItemTypes?: string[];
}

// Bulk Drawer Props
export interface BulkDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: Record<string, unknown>[];
  availableOperations: BulkOperation[];
  loading?: boolean;
  title?: string;
  width?: 'sm' | 'md' | 'lg' | 'xl';

  // Actions
  onExecuteOperation: (operation: BulkOperation, data: Record<string, unknown>) => Promise<{
    success: boolean;
    processed: number;
    failed: number;
    errors?: string[];
  }>;
  onClearSelection?: () => void;

  // UI Customization
  showProgress?: boolean;
  showPreview?: boolean;
  confirmAllOperations?: boolean;
}

// Bulk Drawer Component
export const BulkDrawer: React.FC<BulkDrawerProps> = ({
  isOpen,
  onClose,
  selectedItems,
  availableOperations,
  loading = false,
  title,
  width = 'md',

  // Actions
  onExecuteOperation,
  onClearSelection,

  // UI Customization
  showProgress = true,
  showPreview = true,
  confirmAllOperations = true
}) => {
  const [selectedOperation, setSelectedOperation] = useState<BulkOperation | null>(null);
  const [operationData, setOperationData] = useState<Record<string, unknown>({});
  const [executionState, setExecutionState] = useState<'idle' | 'confirming' | 'executing' | 'completed' | 'failed'>('idle');
  const [executionResult, setExecutionResult] = useState<{
    success: boolean;
    processed: number;
    failed: number;
    errors?: string[];
  } | null>(null);
  const [progress, setProgress] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Reset state when drawer opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedOperation(null);
      setOperationData({});
      setExecutionState('idle');
      setExecutionResult(null);
      setProgress(0);
      setShowConfirmDialog(false);
    }
  }, [isOpen]);

  // Handle operation selection
  const handleOperationSelect = (operation: BulkOperation) => {
    setSelectedOperation(operation);
    setOperationData({});
    setExecutionState('idle');
    setExecutionResult(null);
  };

  // Handle field change
  const handleFieldChange = (fieldName: string, value: unknown) => {
    setOperationData(prev => ({ ...prev, [fieldName]: value }));
  };

  // Handle operation execution
  const handleExecuteOperation = async () => {
    if (!selectedOperation) return;

    if (confirmAllOperations && selectedOperation.confirmRequired !== false) {
      setShowConfirmDialog(true);
      return;
    }

    await executeOperation();
  };

  const executeOperation = async () => {
    if (!selectedOperation) return;

    setExecutionState('executing');
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await onExecuteOperation(selectedOperation, operationData);

      clearInterval(progressInterval);
      setProgress(100);
      setExecutionResult(result);
      setExecutionState(result.success ? 'completed' : 'failed');

    } catch (error) {
      setExecutionState('failed');
      setExecutionResult({
        success: false,
        processed: 0,
        failed: selectedItems.length,
        errors: [error instanceof Error ? error.message : 'Operation failed']
      });
    }
  };

  // Handle confirm dialog
  const handleConfirmExecute = async () => {
    setShowConfirmDialog(false);
    await executeOperation();
  };

  // Get operation color class
  const getOperationColorClass = (color?: string) => {
    switch (color) {
      case 'destructive': return 'text-destructive border-destructive/20 bg-destructive/10';
      case 'warning': return 'text-orange-600 border-orange-200 bg-orange-50';
      case 'success': return 'text-green-600 border-green-200 bg-green-50';
      default: return 'text-primary border-primary/20 bg-primary/10';
    }
  };

  // Drawer width classes
  const widthClasses = {
    sm: 'w-96',
    md: 'w-[32rem]',
    lg: 'w-[40rem]',
    xl: 'w-[48rem]'
  };

  // Render operation form
  const renderOperationForm = () => {
    if (!selectedOperation?.fields) return null;

    return (
      <div className="space-y-4">
        <div className="p-4 border rounded-lg bg-muted/30">
          <h4 className="font-medium mb-2">Configure Operation</h4>
          <p className="text-sm text-muted-foreground">{selectedOperation.description}</p>
        </div>

        <div className="space-y-4">
          {selectedOperation.fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>

              {field.type === 'text' && (
                <Input
                  placeholder={field.placeholder}
                  value={operationData[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                />
              )}

              {field.type === 'number' && (
                <Input
                  type="number"
                  placeholder={field.placeholder}
                  value={operationData[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, Number(e.target.value))}
                />
              )}

              {field.type === 'select' && (
                <Select
                  value={operationData[field.name] as string}
                  onValueChange={(value) => handleFieldChange(field.name, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={String(option.value)} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {field.type === 'boolean' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={operationData[field.name] as boolean || false}
                    onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
                  />
                  <Label>{field.label}</Label>
                </div>
              )}

              {field.type === 'date' && (
                <Input
                  type="date"
                  value={operationData[field.name] as string || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                />
              )}

              {field.type === 'tags' && (
                <Input
                  placeholder={field.placeholder || 'Enter tags separated by commas'}
                  value={operationData[field.name] as string || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render execution result
  const renderExecutionResult = () => {
    if (!executionResult) return null;

    return (
      <div className="space-y-4">
        <div className={cn(
          'p-4 border rounded-lg',
          executionResult.success
            ? 'border-green-200 bg-green-50 text-green-800'
            : 'border-red-200 bg-red-50 text-red-800'
        )}>
          <div className="flex items-center gap-2 mb-2">
            {executionResult.success ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            <h4 className="font-medium">
              {executionResult.success ? 'Operation Completed' : 'Operation Failed'}
            </h4>
          </div>

          <div className="text-sm space-y-1">
            <div>Processed: {executionResult.processed}</div>
            <div>Failed: {executionResult.failed}</div>
            {executionResult.errors && executionResult.errors.length > 0 && (
              <div className="mt-2">
                <div className="font-medium">Errors:</div>
                <ul className="list-disc list-inside ml-2">
                  {executionResult.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={onClose} className="flex-1">
            Close
          </Button>
          {executionResult.success && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedOperation(null);
                setExecutionState('idle');
                setExecutionResult(null);
              }}
            >
              Run Another Operation
            </Button>
          )}
        </div>
      </div>
    );
  };

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
                {title || 'Bulk Operations'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedItems.length} items selected
              </p>
            </div>

            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Progress Bar */}
              {showProgress && executionState === 'executing' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Execution Result */}
              {executionState === 'completed' || executionState === 'failed' ? (
                renderExecutionResult()
              ) : (
                <>
                  {/* Selected Items Preview */}
                  {showPreview && (
                    <div className="space-y-3">
                      <h3 className="font-medium">Selected Items</h3>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {selectedItems.slice(0, 10).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded">
                            <CheckSquare className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="truncate">
                              {String(item.name || item.title || `Item ${idx + 1}`)}
                            </span>
                          </div>
                        ))}
                        {selectedItems.length > 10 && (
                          <div className="text-sm text-muted-foreground text-center py-1">
                            ... and {selectedItems.length - 10} more items
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Operation Selection */}
                  {!selectedOperation ? (
                    <div className="space-y-4">
                      <h3 className="font-medium">Choose Operation</h3>
                      <div className="grid gap-3">
                        {availableOperations.map((operation) => {
                          const Icon = operation.icon;
                          const isDisabled = operation.maxItems && selectedItems.length > operation.maxItems;

                          return (
                            <button
                              key={operation.type}
                              onClick={() => handleOperationSelect(operation)}
                              disabled={isDisabled}
                              className={cn(
                                'flex items-center gap-3 p-4 border rounded-lg text-left transition-colors',
                                'hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed',
                                getOperationColorClass(operation.color)
                              )}
                            >
                              {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">{operation.label}</div>
                                <div className="text-sm opacity-75">{operation.description}</div>
                                {isDisabled && (
                                  <div className="text-xs text-destructive mt-1">
                                    Maximum {operation.maxItems} items allowed
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Operation Configuration */
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {selectedOperation.icon && (
                            <selectedOperation.icon className="h-5 w-5" />
                          )}
                          <div>
                            <h3 className="font-medium">{selectedOperation.label}</h3>
                            <p className="text-sm text-muted-foreground">
                              {selectedOperation.description}
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOperation(null)}
                        >
                          Change Operation
                        </Button>
                      </div>

                      {/* Operation Form */}
                      {renderOperationForm()}

                      {/* Execute Button */}
                      <Button
                        onClick={handleExecuteOperation}
                        disabled={loading || executionState === 'executing'}
                        className="w-full"
                        size="lg"
                      >
                        {executionState === 'executing' ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Executing...
                          </>
                        ) : (
                          `Execute ${selectedOperation.label}`
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t p-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={onClearSelection}
                disabled={loading}
              >
                Clear Selection
              </Button>

              <div className="text-sm text-muted-foreground">
                {selectedItems.length} items selected
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Operation</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedOperation?.confirmMessage ||
                `Are you sure you want to ${selectedOperation?.label.toLowerCase()} ${selectedItems.length} items? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExecute}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export type { BulkDrawerProps, BulkOperation, BulkField, BulkOperationType };
