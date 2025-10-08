'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { AlertCircle, CheckCircle, ChevronDown, ChevronRight, Clock, Edit, Eye, FileText, Form, Form as FormComponent, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Plus, Save, Trash2, X } from 'lucide-react';
import { Badge, Button, Card, CardBody, CardContent, CardHeader, CardTitle, Checkbox, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Input, Label, RadioGroup, RadioGroupItem, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from '@ghxstship/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@ghxstship/ui/lib/utils';

// Form Field Types
export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'password'
  | 'select'
  | 'multi_select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'datetime'
  | 'file'
  | 'image'
  | 'boolean'
  | 'custom';

// Form Field Configuration
export interface FormFieldConfig {
  name: string;
  label: string;
  type: FormFieldType;
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
}

// Form Section Configuration
export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormFieldConfig[];
  collapsed?: boolean;
  required?: boolean;
}

// Form Configuration
export interface FormConfig {
  title: string;
  description?: string;
  sections: FormSection[];
  submitLabel?: string;
  cancelLabel?: string;
  layout?: 'single' | 'tabs' | 'accordion';
  autoSave?: boolean;
  autoSaveInterval?: number;
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit';
}

// Form View Props
export interface FormViewProps {
  config: FormConfig;
  data?: Record<string, unknown>;
  loading?: boolean;
  error?: string;
  className?: string;

  // Form Actions
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel?: () => void;
  onSave?: (data: Record<string, unknown>) => Promise<void>;
  onValidate?: (data: Record<string, unknown>) => Promise<Record<string, string>>;

  // Advanced Features
  readOnly?: boolean;
  disabled?: boolean;
  showProgress?: boolean;
  autoFocus?: boolean;
  customValidators?: Record<string, (value: unknown) => string | null>;
}

// Form View Component
export const FormView: React.FC<FormViewProps> = ({
  config,
  data = {},
  loading = false,
  error,
  className,

  // Form Actions
  onSubmit,
  onCancel,
  onSave,
  onValidate,

  // Advanced Features
  readOnly = false,
  disabled = false,
  showProgress = false,
  autoFocus = false,
  customValidators = {}
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>(new Set());
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Generate Zod schema from form config
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const formSchema = useMemo(() => {
    const schema: Record<string, z.ZodTypeAny> = {};

    config.sections.forEach(section => {
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

        if (!field.required) {
          fieldSchema = fieldSchema.optional();
        }

        if (field.validation) {
          fieldSchema = field.validation;
        }

        schema[field.name] = fieldSchema;
      });
    });

    return z.object(schema);
  }, [config.sections]);

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: data,
    mode: config.validationMode || 'onChange'
  });

  // Auto-save functionality
  React.useEffect(() => {
    if (!config.autoSave) return;

    const interval = setInterval(async () => {
      const isDirty = form.formState.isDirty;
      if (isDirty && !isSubmitting) {
        try {
          setAutoSaveStatus('saving');
          const formData = form.getValues();
          await onSave?.(formData);
          setAutoSaveStatus('saved');
          setLastSaved(new Date());
        } catch (error) {
          setAutoSaveStatus('error');
          console.error('Auto-save failed:', error);
        }
      }
    }, config.autoSaveInterval || 30000); // 30 seconds default

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.autoSave, config.autoSaveInterval, form, isSubmitting, onSave]);

  // Handle form submission
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSubmit = useCallback(async (formData: Record<string, unknown>) => {
    try {
      setIsSubmitting(true);

      // Custom validation
      if (onValidate) {
        const validationErrors = await onValidate(formData);
        if (Object.keys(validationErrors).length > 0) {
          Object.entries(validationErrors).forEach(([field, message]) => {
            form.setError(field as any, { message });
          });
          return;
        }
      }

      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission failed:', error);
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Submission failed'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, onSubmit, onValidate]);

  // Render form field
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderField = useCallback((field: FormFieldConfig, sectionId: string) => {
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
                        disabled={disabled || readOnly}
                        autoFocus={autoFocus && field.name === config.sections[0]?.fields[0]?.name}
                      />
                    );

                  case 'textarea':
                    return (
                      <Textarea
                        {...formField}
                        placeholder={field.placeholder}
                        rows={field.rows || 3}
                        disabled={disabled || readOnly}
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
                        disabled={disabled || readOnly}
                        onChange={(e) => formField.onChange(Number(e.target.value))}
                      />
                    );

                  case 'date':
                    return (
                      <Input
                        {...formField}
                        type="date"
                        disabled={disabled || readOnly}
                      />
                    );

                  case 'datetime':
                    return (
                      <Input
                        {...formField}
                        type="datetime-local"
                        disabled={disabled || readOnly}
                      />
                    );

                  case 'boolean':
                    return (
                      <div className="flex items-center space-x-xs">
                        <Checkbox
                          checked={formField.value || false}
                          onCheckedChange={formField.onChange}
                          disabled={disabled || readOnly}
                        />
                        <Label>{field.label}</Label>
                      </div>
                    );

                  case 'select':
                    return (
                      <Select
                        value={formField.value}
                        onValueChange={formField.onChange}
                        disabled={disabled || readOnly}
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
                              disabled={disabled || readOnly}
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
                        disabled={disabled || readOnly}
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
                        disabled={disabled || readOnly}
                        onChange={(e) => formField.onChange(e.target.files)}
                      />
                    );

                  default:
                    return (
                      <Input
                        {...formField}
                        placeholder={field.placeholder}
                        disabled={disabled || readOnly}
                      />
                    );
                }
              })()}
            </FormControl>

            {field.description && (
              <FormDescription>{field.description}</FormDescription>
            )}

            <FormMessage />
          </FormItem>
        )}
      />
    );
  }, [form, disabled, readOnly, autoFocus, config.sections]);

  // Render form section
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderSection = useCallback((section: FormSection) => {
    const isCollapsed = collapsedSections.has(section.id);

    if (config.layout === 'tabs') {
      return (
        <TabsContent key={section.id} value={section.id} className="space-y-lg">
          {section.fields.map((field) => renderField(field, section.id))}
        </TabsContent>
      );
    }

    if (config.layout === 'accordion') {
      return (
        <Card key={section.id} className="mb-4">
          <CardHeader
            className="cursor-pointer"
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
            <CardTitle className="flex items-center justify-between">
              <span>{section.title}</span>
              {section.required && <Badge variant="secondary">Required</Badge>}
              {isCollapsed ? <ChevronRight className="h-icon-xs w-icon-xs" /> : <ChevronDown className="h-icon-xs w-icon-xs" />}
            </CardTitle>
            {section.description && (
              <p className="text-sm text-muted-foreground">{section.description}</p>
            )}
          </CardHeader>

          {!isCollapsed && (
            <CardContent className="space-y-lg">
              {section.fields.map((field) => renderField(field, section.id))}
            </CardContent>
          )}
        </Card>
      );
    }

    // Single layout
    return (
      <div key={section.id} className="space-y-lg">
        {(section.title || section.description) && (
          <div>
            {section.title && (
              <h3 className="text-lg font-medium flex items-center gap-xs">
                {section.title}
                {section.required && <Badge variant="secondary">Required</Badge>}
              </h3>
            )}
            {section.description && (
              <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
            )}
          </div>
        )}

        <div className="grid gap-lg">
          {section.fields.map((field) => renderField(field, section.id))}
        </div>
      </div>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.layout, collapsedSections, renderField]);

  // Calculate form progress
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const formProgress = useMemo(() => {
    const totalFields = config.sections.reduce((sum, section) => sum + section.fields.length, 0);
    const watchedValues = form.watch();
    const filledFields = Object.values(watchedValues).filter(value =>
      value !== undefined && value !== null && value !== ''
    ).length;

    return Math.round((filledFields / totalFields) * 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.sections, form]);

  return (
    <div className={cn('space-y-lg', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-xs">
            <Form className="h-icon-md w-icon-md" />
            {config.title}
          </h2>
          {config.description && (
            <p className="text-muted-foreground mt-1">{config.description}</p>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-md">
          {config.autoSave && (
            <div className="flex items-center gap-xs text-sm">
              {autoSaveStatus === 'saving' && (
                <>
                  <Clock className="h-icon-xs w-icon-xs animate-spin" />
                  <span>Saving...</span>
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
                  <AlertCircle className="h-icon-xs w-icon-xs text-red-500" />
                  <span>Save failed</span>
                </>
              )}
            </div>
          )}

          {showProgress && (
            <div className="text-sm text-muted-foreground">
              {formProgress}% complete
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-xs p-md border border-destructive/20 bg-destructive/10 rounded-lg">
          <AlertCircle className="h-icon-sm w-icon-sm text-destructive" />
          <span className="text-destructive">{error}</span>
        </div>
      )}

      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-xs">
          <div className="flex justify-between text-sm">
            <span>Form Progress</span>
            <span>{formProgress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${formProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Form */}
      <FormComponent {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-xl">
          {/* Form Layout */}
          {config.layout === 'tabs' ? (
            <Tabs defaultValue={config.sections[0]?.id} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {config.sections.map((section) => (
                  <TabsTrigger key={section.id} value={section.id}>
                    {section.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {config.sections.map((section) => renderSection(section))}
            </Tabs>
          ) : (
            config.sections.map((section) => renderSection(section))
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-md pt-6 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {config.cancelLabel || 'Cancel'}
              </Button>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || disabled}
              className="min-w-component-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-icon-xs h-icon-xs border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="h-icon-xs w-icon-xs mr-2" />
                  {config.submitLabel || 'Submit'}
                </>
              )}
            </Button>
          </div>
        </form>
      </FormComponent>
    </div>
  );
};

export type { FormViewProps, FormConfig, FormSection, FormFieldConfig, FormFieldType };
