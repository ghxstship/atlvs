'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  SheetFooter 
} from '../../components/Sheet';
import { Button } from '../../unified/Button';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '../../components/Form';
import { Input } from '../../unified/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/Select';
import { Textarea } from '../../unified/Textarea';
import { Switch } from '../../components/Switch';
import { DatePicker } from '../../components/DatePicker';
import { FileUpload } from '../../components/FileUpload';
import { TagInput } from '../../components/TagInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/Tabs';
import { useToast } from '../../hooks/useToast';
import { Loader2, Save, X } from 'lucide-react';

export interface FieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'currency' | 'select' | 'multiselect' | 
         'date' | 'datetime' | 'textarea' | 'switch' | 'file' | 'tags' | 'json' | 'color';
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  group?: string;
  options?: string[] | { label: string; value: string }[] | (() => Promise<any[]>);
  validation?: z.ZodSchema;
  dependencies?: { field: string; value: any }[];
  transform?: (value: any) => any;
  format?: (value: any) => string;
  defaultValue?: any;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
}

export interface DrawerAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  onClick: (data: any) => void | Promise<void>;
  condition?: (data: any) => boolean;
}

export interface UnifiedDrawerConfig {
  entity: string;
  mode: 'create' | 'edit' | 'view' | 'bulk';
  schema: z.ZodSchema;
  service: {
    create?: (data: any) => Promise<any>;
    update?: (id: string, data: any) => Promise<any>;
    delete?: (id: string) => Promise<void>;
    fetch?: (id: string) => Promise<any>;
  };
  fields?: FieldConfig[];
  customActions?: DrawerAction[];
  layout?: 'single' | 'tabs' | 'steps';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  submitLabel?: string;
  cancelLabel?: string;
  deleteConfirmation?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

interface UnifiedDrawerProps {
  open: boolean;
  onClose: () => void;
  config: UnifiedDrawerConfig;
  data?: any;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

// Helper function to infer field type from Zod schema
function inferFieldType(schema: any): FieldConfig['type'] {
  if (!schema) return 'text';
  
  const schemaType = schema._def?.typeName;
  
  switch (schemaType) {
    case 'ZodString':
      if (schema._def.checks?.some((c: any) => c.kind === 'email')) return 'email';
      if (schema._def.checks?.some((c: any) => c.kind === 'url')) return 'text';
      if (schema._def.checks?.some((c: any) => c.kind === 'uuid')) return 'text';
      return 'text';
    case 'ZodNumber':
      return 'number';
    case 'ZodBoolean':
      return 'switch';
    case 'ZodDate':
      return 'date';
    case 'ZodEnum':
      return 'select';
    case 'ZodArray':
      return 'tags';
    case 'ZodObject':
      return 'json';
    default:
      return 'text';
  }
}

// Helper function to generate fields from schema
function generateFieldsFromSchema(schema: z.ZodSchema): FieldConfig[] {
  const shape = (schema as any)._def?.shape;
  if (!shape) return [];
  
  return Object.entries(shape)
    .filter(([key]) => !['id', 'created_at', 'updated_at'].includes(key))
    .map(([key, fieldSchema]: [string, any]) => {
      const field: FieldConfig = {
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
        type: inferFieldType(fieldSchema),
        required: !fieldSchema.isOptional(),
      };
      
      // Handle enum options
      if (fieldSchema._def?.typeName === 'ZodEnum') {
        field.options = fieldSchema._def.values;
      }
      
      return field;
    });
}

// Helper function to get unique groups from fields
function getUniqueGroups(fields: FieldConfig[]): string[] {
  const groups = fields
    .map(f => f.group || 'general')
    .filter((v, i, a) => a.indexOf(v) === i);
  return groups;
}

// Helper function to format group name
function formatGroupName(group: string): string {
  return group.charAt(0).toUpperCase() + group.slice(1).replace(/_/g, ' ');
}

export const UnifiedDrawer: React.FC<UnifiedDrawerProps> = ({ 
  open, 
  onClose, 
  config, 
  data, 
  onSuccess,
  onError 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(config.schema),
    defaultValues: data || {},
  });

  // Auto-save functionality
  useEffect(() => {
    if (!config.autoSave || config.mode === 'view') return;
    
    const subscription = form.watch((value) => {
      const timeoutId = setTimeout(async () => {
        if (config.mode === 'edit' && config.service.update) {
          try {
            await config.service.update(data.id, value);
            toast({ 
              title: 'Auto-saved',
              description: 'Your changes have been saved automatically',
            });
          } catch (error) {
            console.error('Auto-save failed:', error);
          }
        }
      }, config.autoSaveDelay || 2000);
      
      return () => clearTimeout(timeoutId);
    });
    
    return () => subscription.unsubscribe();
  }, [form, config, data, toast]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      let result;
      if (config.mode === 'create' && config.service.create) {
        result = await config.service.create(values);
        toast({ 
          title: 'Success',
          description: `${config.entity} created successfully` 
        });
      } else if (config.mode === 'edit' && config.service.update) {
        result = await config.service.update(data.id, values);
        toast({ 
          title: 'Success',
          description: `${config.entity} updated successfully` 
        });
      }
      
      onSuccess?.(result);
      onClose();
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'An error occurred',
        variant: 'destructive' 
      });
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!config.service.delete || !data?.id) return;
    
    if (config.deleteConfirmation) {
      const confirmed = window.confirm(`Are you sure you want to delete this ${config.entity}?`);
      if (!confirmed) return;
    }
    
    setDeleting(true);
    try {
      await config.service.delete(data.id);
      toast({ 
        title: 'Success',
        description: `${config.entity} deleted successfully` 
      });
      onSuccess?.(null);
      onClose();
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to delete',
        variant: 'destructive' 
      });
      onError?.(error);
    } finally {
      setDeleting(false);
    }
  };

  const renderField = (field: FieldConfig) => {
    if (field.hidden) return null;
    
    // Check dependencies
    if (field.dependencies?.length) {
      const dependenciesMet = field.dependencies.every(dep => {
        const depValue = form.watch(dep.field);
        return depValue === dep.value;
      });
      if (!dependenciesMet) return null;
    }
    
    return (
      <FormField
        key={field.key}
        control={form.control}
        name={field.key}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            {renderFieldControl(field, formField)}
            {field.description && (
              <FormDescription>{field.description}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  const renderFieldControl = (field: FieldConfig, formField: any) => {
    const isDisabled = field.disabled || config.mode === 'view';
    
    switch (field.type) {
      case 'select':
        return (
          <Select
            disabled={isDisabled}
            value={formField.value}
            onValueChange={formField.onChange}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Array.isArray(field.options) && field.options.map((option) => {
                const isObject = typeof option === 'object';
                const value = isObject ? option.value : option;
                const label = isObject ? option.label : option;
                return (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );
      
      case 'textarea':
        return (
          <FormControl>
            <Textarea
              {...formField}
              disabled={isDisabled}
              placeholder={field.placeholder}
              rows={field.rows || 4}
            />
          </FormControl>
        );
      
      case 'switch':
        return (
          <FormControl>
            <Switch
              checked={formField.value}
              onCheckedChange={formField.onChange}
              disabled={isDisabled}
            />
          </FormControl>
        );
      
      case 'number':
      case 'currency':
        return (
          <FormControl>
            <Input
              {...formField}
              type="number"
              disabled={isDisabled}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              step={field.step || (field.type === 'currency' ? 0.01 : 1)}
              onChange={(e) => formField.onChange(parseFloat(e.target.value))}
            />
          </FormControl>
        );
      
      case 'date':
        return (
          <FormControl>
            <DatePicker
              value={formField.value}
              onChange={formField.onChange}
              disabled={isDisabled}
            />
          </FormControl>
        );
      
      case 'tags':
        return (
          <FormControl>
            <TagInput
              value={formField.value || []}
              onChange={formField.onChange}
              disabled={isDisabled}
              placeholder={field.placeholder}
            />
          </FormControl>
        );
      
      case 'file':
        return (
          <FormControl>
            <FileUpload
              value={formField.value}
              onChange={formField.onChange}
              disabled={isDisabled}
              accept={field.accept}
              multiple={field.multiple}
              maxFiles={field.maxFiles}
              maxSize={field.maxSize}
            />
          </FormControl>
        );
      
      default:
        return (
          <FormControl>
            <Input
              {...formField}
              type={field.type || 'text'}
              disabled={isDisabled}
              placeholder={field.placeholder}
            />
          </FormControl>
        );
    }
  };

  const fields = config.fields || generateFieldsFromSchema(config.schema);
  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    full: 'sm:max-w-full',
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className={`w-full ${sizeClasses[config.size || 'lg']}`}>
        <SheetHeader>
          <SheetTitle>
            {config.mode === 'create' ? 'Create' : config.mode === 'edit' ? 'Edit' : 'View'} {config.entity}
          </SheetTitle>
          {config.mode === 'view' && (
            <SheetDescription>
              Viewing {config.entity.toLowerCase()} details
            </SheetDescription>
          )}
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-md mt-md">
            {config.layout === 'tabs' ? (
              <Tabs defaultValue={getUniqueGroups(fields)[0]} className="w-full">
                <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${getUniqueGroups(fields).length}, 1fr)` }}>
                  {getUniqueGroups(fields).map(group => (
                    <TabsTrigger key={group} value={group}>
                      {formatGroupName(group)}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {getUniqueGroups(fields).map(group => (
                  <TabsContent key={group} value={group} className="space-y-sm mt-sm">
                    {fields.filter(f => (f.group || 'general') === group).map(renderField)}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="space-y-sm">
                {fields.map(renderField)}
              </div>
            )}
            
            <SheetFooter className="flex justify-between">
              <div className="flex gap-sm">
                {config.mode === 'edit' && config.service.delete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting && <Loader2 className="mr-xs h-4 w-4 animate-spin" />}
                    Delete
                  </Button>
                )}
                {config.customActions?.map(action => {
                  if (action.condition && !action.condition(data)) return null;
                  return (
                    <Button
                      key={action.id}
                      type="button"
                      variant={action.variant}
                      onClick={() => action.onClick(data)}
                    >
                      {action.icon && <action.icon className="mr-xs h-4 w-4" />}
                      {action.label}
                    </Button>
                  );
                })}
              </div>
              
              <div className="flex gap-sm">
                <Button type="button" variant="outline" onClick={onClose}>
                  <X className="mr-xs h-4 w-4" />
                  {config.cancelLabel || 'Cancel'}
                </Button>
                {config.mode !== 'view' && (
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-xs h-4 w-4 animate-spin" />}
                    <Save className="mr-xs h-4 w-4" />
                    {config.submitLabel || (config.mode === 'create' ? 'Create' : 'Save')}
                  </Button>
                )}
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default UnifiedDrawer;
