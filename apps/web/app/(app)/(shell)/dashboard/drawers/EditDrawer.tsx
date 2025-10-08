'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Eye, EyeOff, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Loader2, Redo, Save, Undo, X } from 'lucide-react';
import { Badge, Button, Checkbox, Input, Label, RadioGroup, RadioGroupItem, ScrollArea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Separator, Textarea } from '@ghxstship/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@ghxstship/ui/lib/utils';

// Edit Field Configuration
export interface EditField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'password' | 'select' | 'multi_select' | 'radio' | 'checkbox' | 'date' | 'datetime' | 'file' | 'image' | 'boolean' | 'custom';
  required?: boolean;
  placeholder?: string;
  description?: string;
  defaultValue?: unknown;
  validation?: z.ZodTypeAny;
  options?: Array<{ label: string; value: unknown }>;
  multiple?: boolean;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  accept?: string;
  disabled?: boolean;
  hidden?: boolean;
  dependsOn?: {
    field: string;
    value: unknown;
    condition: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains';
  };
  customRender?: (field: unknown, form: unknown) => React.ReactNode;
  customValidation?: (value: unknown) => string | null;
}

// Edit Section Configuration
export interface EditSection {
  id: string;
  title: string;
  description?: string;
  fields: EditField[];
  collapsed?: boolean;
  required?: boolean;
}

// Edit Drawer Props
export interface EditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  record: Record<string, unknown> | null;
  loading?: boolean;
  saving?: boolean;
  title?: string;
  subtitle?: string;
  sections?: EditSection[];
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

  // Actions
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onCancel?: () => void;
  onPreview?: (data: Record<string, unknown>) => void;
  onValidate?: (data: Record<string, unknown>) => Promise<Record<string, string>>;

  // Advanced Features
  autoSave?: boolean;
  autoSaveInterval?: number;
  showPreview?: boolean;
  showValidation?: boolean;
  confirmOnClose?: boolean;
  undoRedo?: boolean;
  draftStorage?: boolean;

  // UI Customization
  showHeader?: boolean;
  showFooter?: boolean;
  compact?: boolean;
}

// Edit Drawer Component
export const EditDrawer: React.FC<EditDrawerProps> = ({
  isOpen,
  onClose,
  record,
  loading = false,
  saving = false,
  title,
  subtitle,
  sections = [],
  width = 'lg',

  // Actions
  onSave,
  onCancel,
  onPreview,
  onValidate,

  // Advanced Features
  autoSave = false,
  autoSaveInterval = 30000,
  showPreview = false,
  showValidation = true,
  confirmOnClose = true,
  undoRedo = false,
  draftStorage = false,

  // UI Customization
  showHeader = true,
  showFooter = true,
  compact = false
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>(new Set());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPreviewMode, setShowPreviewMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>({});

  // Generate Zod schema from sections
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const formSchema = React.useMemo(() => {
    const schema: Record<string, z.ZodTypeAny> = {};

    sections.forEach(section => {
      section.fields.forEach(field => {
        let fieldSchema: z.ZodTypeAny;

        switch (field.type) {
          case 'text':
          case 'textarea':
          case 'email':
          case 'password':
            fieldSchema = z.string();
            if (field.type === 'email') fieldSchema = z.string().email();
            break;
          case 'number':
            fieldSchema = z.number();
            if (field.min !== undefined) fieldSchema = (fieldSchema as z.ZodNumber).min(field.min);
            if (field.max !== undefined) fieldSchema = (fieldSchema as z.ZodNumber).max(field.max);
            break;
          case 'date':
          case 'datetime':
            fieldSchema = z.string();
            break;
          case 'boolean':
            fieldSchema = z.boolean();
            break;
          case 'select':
          case 'radio':
            fieldSchema = z.string();
            break;
          case 'multi_select':
            fieldSchema = z.array(z.string());
            break;
          case 'checkbox':
            fieldSchema = z.boolean();
            break;
          case 'file':
          case 'image':
            fieldSchema = z.instanceof(FileList).optional();
            break;
          default:
            fieldSchema = z.any();
        }

        if (field.validation) {
          fieldSchema = field.validation;
        }

        if (!field.required) {
          fieldSchema = fieldSchema.optional();
        }

        schema[field.name] = fieldSchema;
      });
    });

    return z.object(schema);
  }, [sections]);

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: record || {},
    mode: 'onChange'
  });

  // Track unsaved changes
  React.useEffect(() => {
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  // Auto-save functionality
  React.useEffect(() => {
    if (!autoSave || !hasUnsavedChanges) return;

    const interval = setInterval(async () => {
      const isValid = await form.trigger();
      if (isValid) {
        try {
          setAutoSaveStatus('saving');
          const formData = form.getValues();
          await onSave(formData);
          setAutoSaveStatus('saved');
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
        } catch (error) {
          setAutoSaveStatus('error');
          console.error('Auto-save failed:', error);
        }
      }
    }, autoSaveInterval);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSave, autoSaveInterval, hasUnsavedChanges, form, onSave]);

  // Handle save
  const handleSave = async (data: Record<string, unknown>) => {
    try {
      // Custom validation
      if (onValidate) {
        const errors = await onValidate(data);
        setValidationErrors(errors);
        if (Object.keys(errors).length > 0) {
          // Set form errors
          Object.entries(errors).forEach(([field, message]) => {
            form.setError(field as any, { message });
          });
          return;
        }
      }

      await onSave(data);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save failed:', error);
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Save failed'
      });
    }
  };

  // Handle close with confirmation
  const handleClose = () => {
    if (confirmOnClose && hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmed) return;
    }
    onClose();
  };

  // Handle cancel
  const handleCancel = () => {
    if (confirmOnClose && hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmed) return;
    }
    form.reset(record || {});
    setHasUnsavedChanges(false);
    onCancel?.();
  };

  // Drawer width classes
  const widthClasses = {
    sm: 'w-container-lg',
    md: 'w-[32rem]',
    lg: 'w-[40rem]',
    xl: 'w-[48rem]',
    full: 'w-full max-w-6xl'
  };

  // Render form field
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderField = useCallback((field: EditField, sectionId: string) => {
    const watchedValues = form.watch();

    // Check dependencies
    if (field.dependsOn) {
      const { field: depField, value: depValue, condition } = field.dependsOn;
      const currentValue = watchedValues[depField];

      let show = false;
      switch (condition) {
        case 'eq':
          show = currentValue === depValue;
          break;
        case 'ne':
          show = currentValue !== depValue;
          break;
        case 'gt':
          show = Number(currentValue) > Number(depValue);
          break;
        case 'lt':
          show = Number(currentValue) < Number(depValue);
          break;
        case 'gte':
          show = Number(currentValue) >= Number(depValue);
          break;
        case 'lte':
          show = Number(currentValue) <= Number(depValue);
          break;
        case 'contains':
          show = Array.isArray(currentValue) ? currentValue.includes(depValue) : false;
          break;
      }

      if (!show) return null;
    }

    if (field.customRender) {
      return (
        <FormField
          key={field.name}
          control={form.control}
          name={field.name}
          render={({ field: formField }) => field.customRender!(formField, form)}
        />
      );
    }

    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>

            <FormControl>
              {(() => {
                switch (field.type) {
                  case 'text':
                  case 'email':
                  case 'password':
                    return (
                      <Input
                        {...formField}
                        type={field.type}
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                      />
                    );

                  case 'textarea':
                    return (
                      <Textarea
                        {...formField}
                        placeholder={field.placeholder}
                        rows={field.rows || 3}
                        disabled={field.disabled}
                      />
                    );

                  case 'number':
                    return (
                      <Input
                        {...formField}
                        type="number"
                        placeholder={field.placeholder}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        disabled={field.disabled}
                        onChange={(e) => formField.onChange(Number(e.target.value))}
                      />
                    );

                  case 'date':
                    return (
                      <Input
                        {...formField}
                        type="date"
                        disabled={field.disabled}
                      />
                    );

                  case 'datetime':
                    return (
                      <Input
                        {...formField}
                        type="datetime-local"
                        disabled={field.disabled}
                      />
                    );

                  case 'boolean':
                    return (
                      <div className="flex items-center space-x-xs">
                        <Checkbox
                          checked={formField.value || false}
                          onCheckedChange={formField.onChange}
                          disabled={field.disabled}
                        />
                        <Label>{field.label}</Label>
                      </div>
                    );

                  case 'select':
                    return (
                      <Select
                        value={formField.value}
                        onValueChange={formField.onChange}
                        disabled={field.disabled}
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
                    );

                  case 'multi_select':
                    return (
                      <div className="space-y-xs">
                        {field.options?.map((option) => (
                          <div key={String(option.value)} className="flex items-center space-x-xs">
                            <Checkbox
                              checked={(formField.value || []).includes(option.value)}
                              onCheckedChange={(checked) => {
                                const current = formField.value || [];
                                const newValue = checked
                                  ? [...current, option.value]
                                  : current.filter((v: unknown) => v !== option.value);
                                formField.onChange(newValue);
                              }}
                              disabled={field.disabled}
                            />
                            <Label>{option.label}</Label>
                          </div>
                        ))}
                      </div>
                    );

                  case 'radio':
                    return (
                      <RadioGroup
                        value={formField.value}
                        onValueChange={formField.onChange}
                        disabled={field.disabled}
                      >
                        {field.options?.map((option) => (
                          <div key={String(option.value)} className="flex items-center space-x-xs">
                            <RadioGroupItem value={String(option.value)} />
                            <Label>{option.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    );

                  case 'file':
                  case 'image':
                    return (
                      <Input
                        type="file"
                        accept={field.accept}
                        multiple={field.multiple}
                        disabled={field.disabled}
                        onChange={(e) => formField.onChange(e.target.files)}
                      />
                    );

                  default:
                    return (
                      <Input
                        {...formField}
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                      />
                    );
                }
              })()}
            </FormControl>

            {field.description && (
              <FormDescription>{field.description}</FormDescription>
            )}

            <FormMessage />
            {validationErrors[field.name] && (
              <p className="text-sm text-destructive">{validationErrors[field.name]}</p>
            )}
          </FormItem>
        )}
      />
    );
  }, [form, validationErrors]);

  // Render section
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderSection = useCallback((section: EditSection) => {
    const isCollapsed = collapsedSections.has(section.id);

    return (
      <div key={section.id} className="space-y-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium flex items-center gap-xs">
              {section.title}
              {section.required && <Badge variant="secondary">Required</Badge>}
            </h3>
            {section.description && (
              <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
            )}
          </div>

          {sections.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCollapsedSections(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(section.id)) {
                    newSet.delete(section.id);
                  } else {
                    newSet.add(section.id);
                  }
                  return newSet;
                });
              }}
            >
              {isCollapsed ? 'Expand' : 'Collapse'}
            </Button>
          )}
          {/* eslint-disable-next-line react-hooks/exhaustive-deps */}
        </div>

        {!isCollapsed && (
          <div className="grid gap-lg">
            {section.fields.map((field) => renderField(field, section.id))}
          </div>
        )}
      </div>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.length, collapsedSections, renderField]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
      <div className={cn(
        'bg-background shadow-xl transform transition-transform duration-300 ease-in-out',
        'flex flex-col h-full',
        widthClasses[width]
      )}>
        {/* Header */}
        {showHeader && (
          <div className="flex items-center justify-between p-lg border-b">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold truncate">
                {title || 'Edit Record'}
              </h2>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate mt-1">{subtitle}</p>
              )}

              {/* Status Indicators */}
              <div className="flex items-center gap-md mt-3">
                {hasUnsavedChanges && (
                  <Badge variant="secondary" className="text-orange-600">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Unsaved Changes
                  </Badge>
                )}

                {autoSave && (
                  <div className="flex items-center gap-xs text-sm">
                    {autoSaveStatus === 'saving' && (
                      <>
                        <Clock className="h-icon-xs w-icon-xs animate-spin" />
                        <span>Auto-saving...</span>
                      </>
                    )}
                    {autoSaveStatus === 'saved' && (
                      <>
                        <CheckCircle className="h-icon-xs w-icon-xs text-green-500" />
                        <span>Saved {lastSaved && `at ${lastSaved.toLocaleTimeString()}`}</span>
                      </>
                    )}
                    {autoSaveStatus === 'error' && (
                      <>
                        <AlertTriangle className="h-icon-xs w-icon-xs text-red-500" />
                        <span>Save failed</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-xs ml-4">
              {showPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreviewMode(!showPreviewMode)}
                >
                  {showPreviewMode ? (
                    <EyeOff className="h-icon-xs w-icon-xs" />
                  ) : (
                    <Eye className="h-icon-xs w-icon-xs" />
                  )}
                </Button>
              )}

              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-icon-xs w-icon-xs" />
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-lg">
            {loading ? (
              <div className="flex items-center justify-center h-component-xl">
                <div className="flex items-center gap-xs">
                  <Loader2 className="h-icon-sm w-icon-sm animate-spin" />
                  <span>Loading...</span>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form className="space-y-xl">
                  {sections.map((section) => renderSection(section))}
                </form>
              </Form>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {showFooter && (
          <div className="border-t p-lg">
            <div className="flex items-center justify-between">
              {/* Footer Status */}
              <div className="text-sm text-muted-foreground">
                {hasUnsavedChanges ? 'You have unsaved changes' : 'All changes saved'}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center gap-sm">
                {onPreview && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onPreview(form.getValues())}
                  >
                    <Eye className="h-icon-xs w-icon-xs mr-2" />
                    Preview
                  </Button>
                )}

                {onCancel && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                )}

                <Button
                  onClick={form.handleSubmit(handleSave)}
                  disabled={saving || loading}
                  className="min-w-component-lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-icon-xs w-icon-xs mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-icon-xs w-icon-xs mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export type { EditDrawerProps, EditSection, EditField };
