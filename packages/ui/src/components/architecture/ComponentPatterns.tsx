'use client';

import React from 'react';
import { BaseComponent, ComponentMetadata, useComponentLifecycle, ComponentLifecycle } from './ComponentBase';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { RefreshCw, CheckCircle, AlertCircle, Info, X } from 'lucide-react';

// Standard component patterns and interfaces

// Data fetching pattern
export interface DataFetchingProps<T> {
  fetchData: () => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  refreshInterval?: number;
  retryAttempts?: number;
}

export interface DataFetchingState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  lastFetch: Date | null;
  retryCount: number;
}

// Form pattern
export interface FormProps<T> {
  initialValues?: Partial<T>;
  validationSchema?: (values: T) => Record<string, string>;
  onSubmit: (values: T) => Promise<void> | void;
  onCancel?: () => void;
  disabled?: boolean;
}

export interface FormState<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isDirty: boolean;
}

// List pattern
export interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  loading?: boolean;
  onItemClick?: (item: T) => void;
  className?: string;
}

// Modal pattern
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  children: React.ReactNode;
}

// Data fetching component pattern
export class DataFetchingComponent<T, P extends DataFetchingProps<T> = DataFetchingProps<T>> 
  extends BaseComponent<P, DataFetchingState<T>> {
  
  private refreshTimer?: NodeJS.Timeout;

  getMetadata(): ComponentMetadata {
    return {
      name: 'DataFetchingComponent',
      version: '1.0.0',
      description: 'Base component for data fetching with retry and refresh capabilities',
      category: 'data'
    };
  }

  constructor(props: P) {
    super(props);
    this.state = {
      ...this.state,
      data: null,
      isLoading: false,
      error: null,
      lastFetch: null,
      retryCount: 0
    };
  }

  protected async onComponentMount() {
    await this.fetchData();
    this.setupRefreshTimer();
  }

  protected onComponentUnmount() {
    this.clearRefreshTimer();
  }

  private setupRefreshTimer() {
    if (this.props.refreshInterval && this.props.refreshInterval > 0) {
      this.refreshTimer = setInterval(() => {
        this.fetchData();
      }, this.props.refreshInterval);
    }
  }

  private clearRefreshTimer() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }

  protected async fetchData() {
    this.setState({ isLoading: true, error: null });

    try {
      const data = await this.props.fetchData();
      this.setState({
        data,
        isLoading: false,
        lastFetch: new Date(),
        retryCount: 0
      });

      if (this.props.onSuccess) {
        this.props.onSuccess(data);
      }
    } catch (error) {
      const err = error as Error;
      this.setState({
        error: err,
        isLoading: false,
        retryCount: this.state.retryCount + 1
      });

      if (this.props.onError) {
        this.props.onError(err);
      }

      // Auto-retry if configured
      if (this.props.retryAttempts && this.state.retryCount < this.props.retryAttempts) {
        setTimeout(() => this.fetchData(), 1000 * Math.pow(2, this.state.retryCount));
      }
    }
  }

  protected handleRefresh = () => {
    this.fetchData();
  };

  protected renderContent(): React.ReactNode {
    const { data, isLoading, error, lastFetch } = this.state;

    if (error && !data) {
      return (
        <Card className="p-lg border-destructive bg-destructive/10">
          <div className="flex items-start space-x-sm">
            <AlertCircle className="h-icon-md w-icon-md text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-destructive mb-sm">Data Loading Error</h3>
              <p className="text-destructive mb-md">{error.message}</p>
              <Button onClick={this.handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-icon-xs w-icon-xs mr-sm" />
                Retry
              </Button>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <div className="space-y-md">
        {/* Data status bar */}
        <div className="flex items-center justify-between text-sm text-muted-foreground/70">
          <div className="flex items-center space-x-sm">
            {isLoading ? (
              <RefreshCw className="h-icon-xs w-icon-xs animate-spin" />
            ) : (
              <CheckCircle className="h-icon-xs w-icon-xs text-success" />
            )}
            <span>
              {isLoading ? 'Loading...' : `Last updated: ${lastFetch?.toLocaleTimeString()}`}
            </span>
          </div>
          <Button onClick={this.handleRefresh} variant="ghost" size="sm" disabled={isLoading}>
            <RefreshCw className="h-icon-xs w-icon-xs" />
          </Button>
        </div>

        {/* Main content */}
        {this.renderDataContent(data)}
      </div>
    );
  }

  // Abstract method for rendering data content
  protected abstract renderDataContent(data: T | null): React.ReactNode;
}

// Form component pattern
export class FormComponent<T, P extends FormProps<T> = FormProps<T>> 
  extends BaseComponent<P, FormState<T>> {
  
  getMetadata(): ComponentMetadata {
    return {
      name: 'FormComponent',
      version: '1.0.0',
      description: 'Base component for forms with validation and submission handling',
      category: 'form'
    };
  }

  constructor(props: P) {
    super(props);
    this.state = {
      ...this.state,
      values: (props.initialValues || {}) as T,
      errors: {},
      touched: {},
      isSubmitting: false,
      isDirty: false
    };
  }

  protected handleFieldChange = (field: keyof T, value: any) => {
    this.setState(prevState => ({
      values: { ...prevState.values, [field]: value },
      isDirty: true,
      touched: { ...prevState.touched, [field]: true }
    }), () => {
      this.validateField(field);
    });
  };

  protected validateField(field: keyof T) {
    if (!this.props.validationSchema) return;

    const errors = this.props.validationSchema(this.state.values);
    this.setState(prevState => ({
      errors: { ...prevState.errors, [field]: errors[field as string] || '' }
    }));
  }

  protected validateForm(): boolean {
    if (!this.props.validationSchema) return true;

    const errors = this.props.validationSchema(this.state.values);
    this.setState({ errors });
    
    return Object.keys(errors).length === 0;
  }

  protected handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!this.validateForm()) return;

    this.setState({ isSubmitting: true });

    try {
      await this.props.onSubmit(this.state.values);
      this.setState({ isSubmitting: false, isDirty: false });
    } catch (error) {
      this.setState({ isSubmitting: false });
      console.error('Form submission error:', error);
    }
  };

  protected handleCancel = () => {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  };

  protected renderContent(): React.ReactNode {
    const { isSubmitting, isDirty } = this.state;

    return (
      <form onSubmit={this.handleSubmit} className="space-y-lg">
        {this.renderFormFields()}
        
        <div className="flex items-center justify-between pt-md border-t">
          <div className="flex items-center space-x-sm">
            {isDirty && (
              <Badge variant="secondary">
                <Info className="h-3 w-3 mr-xs" />
                Unsaved changes
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-sm">
            {this.props.onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={this.handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || this.props.disabled}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      </form>
    );
  }

  // Abstract method for rendering form fields
  protected abstract renderFormFields(): React.ReactNode;
}

// List component pattern
export const ListComponent = <T,>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = 'No items found',
  loading = false,
  onItemClick,
  className = ''
}: ListProps<T>) => {
  if (loading) {
    return (
      <Card className={`p-xl flex items-center justify-center ${className}`}>
        <RefreshCw className="h-icon-md w-icon-md animate-spin text-accent mr-sm" />
        <span className="text-muted-foreground/70">Loading items...</span>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className={`p-xl text-center ${className}`}>
        <div className="text-muted-foreground/60">
          <Info className="h-icon-lg w-icon-lg mx-auto mb-sm opacity-50" />
          <p>{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-sm ${className}`}>
      {items.map((item, index) => (
        <div
          key={keyExtractor(item)}
          onClick={() => onItemClick?.(item)}
          className={onItemClick ? 'cursor-pointer' : ''}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
};

// Modal component pattern
export const ModalComponent: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  closable = true,
  children
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-md'
  };

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closable, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-md">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-foreground bg-opacity-50 transition-opacity"
          onClick={closable ? onClose : undefined}
        />
        
        {/* Modal */}
        <Card className={`relative w-full ${sizeClasses[size]} transform transition-all`}>
          {/* Header */}
          {(title || closable) && (
            <div className="flex items-center justify-between p-lg border-b">
              {title && (
                <h2 className="text-xl font-semibold text-foreground">{title}</h2>
              )}
              {closable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="ml-auto"
                >
                  <X className="h-icon-xs w-icon-xs" />
                </Button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="p-lg">
            {children}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Hook for data fetching pattern
export const useDataFetching = <T,>(
  fetchFn: () => Promise<T>,
  options: {
    refreshInterval?: number;
    retryAttempts?: number;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) => {
  const [state, setState] = React.useState<DataFetchingState<T>>({
    data: null,
    isLoading: false,
    error: null,
    lastFetch: null,
    retryCount: 0
  });

  const fetchData = React.useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await fetchFn();
      setState(prev => ({
        ...prev,
        data,
        isLoading: false,
        lastFetch: new Date(),
        retryCount: 0
      }));

      if (options.onSuccess) {
        options.onSuccess(data);
      }
    } catch (error) {
      const err = error as Error;
      setState(prev => ({
        ...prev,
        error: err,
        isLoading: false,
        retryCount: prev.retryCount + 1
      }));

      if (options.onError) {
        options.onError(err);
      }

      // Auto-retry if configured
      if (options.retryAttempts && state.retryCount < options.retryAttempts) {
        setTimeout(() => fetchData(), 1000 * Math.pow(2, state.retryCount));
      }
    }
  }, [fetchFn, options, state.retryCount]);

  // Initial fetch
  React.useEffect(() => {
    fetchData();
  }, []);

  // Refresh interval
  React.useEffect(() => {
    if (options.refreshInterval && options.refreshInterval > 0) {
      const timer = setInterval(fetchData, options.refreshInterval);
      return () => clearInterval(timer);
    }
  }, [fetchData, options.refreshInterval]);

  return {
    ...state,
    refetch: fetchData
  };
};

// Hook for form pattern
export const useForm = <T,>(
  initialValues: T,
  validationSchema?: (values: T) => Record<string, string>
) => {
  const [state, setState] = React.useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isDirty: false
  });

  const setFieldValue = React.useCallback((field: keyof T, value: any) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, [field]: value },
      isDirty: true,
      touched: { ...prev.touched, [field]: true }
    }));
  }, []);

  const validateForm = React.useCallback(() => {
    if (!validationSchema) return true;

    const errors = validationSchema(state.values);
    setState(prev => ({ ...prev, errors }));
    
    return Object.keys(errors).length === 0;
  }, [validationSchema, state.values]);

  const handleSubmit = React.useCallback(async (
    onSubmit: (values: T) => Promise<void> | void
  ) => {
    if (!validateForm()) return false;

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      await onSubmit(state.values);
      setState(prev => ({ ...prev, isSubmitting: false, isDirty: false }));
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, isSubmitting: false }));
      throw error;
    }
  }, [validateForm, state.values]);

  const reset = React.useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isDirty: false
    });
  }, [initialValues]);

  return {
    ...state,
    setFieldValue,
    validateForm,
    handleSubmit,
    reset
  };
};
