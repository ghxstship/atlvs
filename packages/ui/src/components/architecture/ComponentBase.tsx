'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '../Card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// Base component props interface
export interface BaseComponentProps {
  className?: string;
  testId?: string;
  ariaLabel?: string;
  children?: ReactNode;
}

// Component state interface
export interface BaseComponentState {
  hasError: boolean;
  error?: Error;
  isLoading?: boolean;
  isInitialized?: boolean;
}

// Component lifecycle hooks
export interface ComponentLifecycle {
  onMount?: () => void | Promise<void>;
  onUnmount?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onUpdate?: (prevProps: any, prevState: any) => void;
}

// Performance monitoring interface
export interface PerformanceMetrics {
  renderTime: number;
  mountTime: number;
  updateCount: number;
  errorCount: number;
}

// Component metadata for debugging and documentation
export interface ComponentMetadata {
  name: string;
  version: string;
  description: string;
  category: 'ui' | 'data' | 'layout' | 'form' | 'navigation' | 'monitoring';
  dependencies?: string[];
  author?: string;
  lastModified?: string;
}

// Abstract base component class
export abstract class BaseComponent<P extends BaseComponentProps = BaseComponentProps, S extends BaseComponentState = BaseComponentState> extends Component<P, S> {
  protected startTime: number = 0;
  protected metrics: PerformanceMetrics = {
    renderTime: 0,
    mountTime: 0,
    updateCount: 0,
    errorCount: 0
  };

  // Abstract metadata - must be implemented by subclasses
  abstract getMetadata(): ComponentMetadata;

  constructor(props: P) {
    super(props);
    this.startTime = performance.now();
    
    // Default state
    this.state = {
      hasError: false,
      isLoading: false,
      isInitialized: false
    } as S;
  }

  // Lifecycle methods with performance tracking
  componentDidMount() {
    this.metrics.mountTime = performance.now() - this.startTime;
    this.setState({ isInitialized: true } as Partial<S>);
    
    // Call custom mount handler
    this.onComponentMount();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔧 Component ${this.getMetadata().name} mounted in ${this.metrics.mountTime.toFixed(2)}ms`);
    }
  }

  componentDidUpdate(prevProps: P, prevState: S) {
    this.metrics.updateCount++;
    this.onComponentUpdate(prevProps, prevState);
  }

  componentWillUnmount() {
    this.onComponentUnmount();
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.metrics.errorCount++;
    this.setState({
      hasError: true,
      error
    } as Partial<S>);
    
    this.onComponentError(error, errorInfo);
    
    console.error(`❌ Component ${this.getMetadata().name} error:`, error, errorInfo);
  }

  // Virtual lifecycle methods for subclasses to override
  protected onComponentMount(): void | Promise<void> {}
  protected onComponentUnmount(): void {}
  protected onComponentUpdate(prevProps: P, prevState: S): void {}
  protected onComponentError(error: Error, errorInfo: ErrorInfo): void {}

  // Performance measurement wrapper for render
  render(): ReactNode {
    const renderStart = performance.now();
    
    try {
      // Handle error state
      if (this.state.hasError) {
        return this.renderError();
      }

      // Handle loading state
      if (this.state.isLoading) {
        return this.renderLoading();
      }

      // Render main content
      const content = this.renderContent();
      
      // Track render time
      this.metrics.renderTime = performance.now() - renderStart;
      
      return content;
    } catch (error) {
      console.error(`Render error in ${this.getMetadata().name}:`, error);
      return this.renderError();
    }
  }

  // Abstract render method - must be implemented by subclasses
  protected abstract renderContent(): ReactNode;

  // Default error rendering
  protected renderError(): ReactNode {
    const metadata = this.getMetadata();
    
    return (
      <Card className="p-lg border-destructive/20 bg-destructive/10">
        <div className="flex items-start space-x-sm">
          <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-destructive mb-sm">
              Component Error: {metadata.name}
            </h3>
            <p className="text-destructive/80 mb-md">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => this.handleErrorRetry()}
              className="px-md py-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
            >
              Retry
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-md">
                <summary className="cursor-pointer text-destructive font-medium">
                  Debug Information
                </summary>
                <pre className="mt-sm p-sm bg-destructive/5 rounded text-xs overflow-auto">
                  {JSON.stringify({
                    component: metadata.name,
                    error: this.state.error?.stack,
                    metrics: this.metrics,
                    props: this.props
                  }, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Default loading rendering
  protected renderLoading(): ReactNode {
    const metadata = this.getMetadata();
    
    return (
      <Card className="p-xl flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-accent mr-sm" />
        <span className="text-muted-foreground">Loading {metadata.name}...</span>
      </Card>
    );
  }

  // Error retry handler
  protected handleErrorRetry(): void {
    this.setState({
      hasError: false,
      error: undefined
    } as Partial<S>);
  }

  // Utility methods
  protected setLoading(isLoading: boolean): void {
    this.setState({ isLoading } as Partial<S>);
  }

  protected getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Accessibility helpers
  protected getAriaProps() {
    return {
      'aria-label': this.props.ariaLabel,
      'data-testid': this.props.testId
    };
  }
}

// Functional component base with hooks
export interface FunctionalComponentProps extends BaseComponentProps {
  metadata?: ComponentMetadata;
}

// Custom hook for component lifecycle
export const useComponentLifecycle = (
  lifecycle: ComponentLifecycle,
  metadata?: ComponentMetadata
) => {
  const [state, setState] = React.useState<BaseComponentState>({
    hasError: false,
    isLoading: false,
    isInitialized: false
  });

  const [metrics, setMetrics] = React.useState<PerformanceMetrics>({
    renderTime: 0,
    mountTime: 0,
    updateCount: 0,
    errorCount: 0
  });

  // Mount effect
  React.useEffect(() => {
    const startTime = performance.now();
    
    const handleMount = async () => {
      try {
        if (lifecycle.onMount) {
          await lifecycle.onMount();
        }
        
        const mountTime = performance.now() - startTime;
        setMetrics(prev => ({ ...prev, mountTime }));
        setState(prev => ({ ...prev, isInitialized: true }));
        
        if (process.env.NODE_ENV === 'development' && metadata) {
          console.log(`🔧 Component ${metadata.name} mounted in ${mountTime.toFixed(2)}ms`);
        }
      } catch (error) {
        console.error('Component mount error:', error);
        setState(prev => ({ 
          ...prev, 
          hasError: true, 
          error: error as Error 
        }));
        setMetrics(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
      }
    };

    handleMount();

    // Cleanup
    return () => {
      if (lifecycle.onUnmount) {
        lifecycle.onUnmount();
      }
    };
  }, []);

  // Update counter
  React.useEffect(() => {
    setMetrics(prev => ({ ...prev, updateCount: prev.updateCount + 1 }));
  });

  const setLoading = React.useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setState(prev => ({ ...prev, hasError: true, error }));
    setMetrics(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
    
    if (lifecycle.onError) {
      lifecycle.onError(error, {} as ErrorInfo);
    }
  }, [lifecycle]);

  const retry = React.useCallback(() => {
    setState(prev => ({ ...prev, hasError: false, error: undefined }));
  }, []);

  return {
    state,
    metrics,
    setLoading,
    handleError,
    retry
  };
};

// Higher-order component for adding base functionality
export const withBaseComponent = <P extends BaseComponentProps>(
  WrappedComponent: React.ComponentType<P>,
  metadata: ComponentMetadata
) => {
  const WithBaseComponent: React.FC<P> = (props: any) => {
    const lifecycle: ComponentLifecycle = {
      onMount: () => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`📦 HOC: ${metadata.name} initialized`);
        }
      }
    };

    const { state, handleError, retry } = useComponentLifecycle(lifecycle, metadata);

    if (state.hasError) {
      return (
        <Card className="p-lg border-destructive/20 bg-destructive/10">
          <div className="flex items-start space-x-sm">
            <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-destructive mb-sm">
                Component Error: {metadata.name}
              </h3>
              <p className="text-destructive/80 mb-md">
                {state.error?.message || 'An unexpected error occurred'}
              </p>
              <button
                onClick={retry}
                className="px-md py-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </Card>
      );
    }

    try {
      return <WrappedComponent {...props} />;
    } catch (error) {
      handleError(error as Error);
      return null;
    }
  };

  WithBaseComponent.displayName = `withBaseComponent(${metadata.name})`;
  
  return WithBaseComponent;
};

// Component registry for tracking and debugging
export class ComponentRegistry {
  private static components = new Map<string, ComponentMetadata>();
  private static instances = new Map<string, number>();

  static register(metadata: ComponentMetadata): void {
    this.components.set(metadata.name, metadata);
    this.instances.set(metadata.name, 0);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📋 Registered component: ${metadata.name} v${metadata.version}`);
    }
  }

  static getInstance(name: string): void {
    const current = this.instances.get(name) || 0;
    this.instances.set(name, current + 1);
  }

  static releaseInstance(name: string): void {
    const current = this.instances.get(name) || 0;
    this.instances.set(name, Math.max(0, current - 1));
  }

  static getComponents(): ComponentMetadata[] {
    return Array.from(this.components.values());
  }

  static getInstanceCounts(): Record<string, number> {
    return Object.fromEntries(this.instances.entries());
  }

  static getComponentInfo(name: string): ComponentMetadata | undefined {
    return this.components.get(name);
  }
}

// Development-only component inspector
export const ComponentInspector: React.FC = () => {
  const [components, setComponents] = React.useState<ComponentMetadata[]>([]);
  const [instances, setInstances] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const updateInfo = () => {
      setComponents(ComponentRegistry.getComponents());
      setInstances(ComponentRegistry.getInstanceCounts());
    };

    updateInfo();
    const interval = setInterval(updateInfo, 1000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="p-md mb-md bg-accent/10 border-primary/20">
      <h4 className="font-semibold text-foreground mb-sm">Component Inspector (Dev Only)</h4>
      <div className="space-y-sm text-sm">
        {components.map(component => (
          <div key={component.name} className="flex justify-between items-center">
            <span className="text-accent/80">
              {component.name} v{component.version}
            </span>
            <span className="text-accent bg-accent/10 px-sm py-xs rounded text-xs">
              {instances[component.name] || 0} instances
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
