'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Loader } from '../Loader';
import { Alert } from '../Alert';
import { Button } from '../atomic/Button';
import { 
  Database, 
  RefreshCw, 
  AlertCircle, 
  Search, 
  Plus,
  Filter,
  Settings
} from 'lucide-react';

// State types
export type ViewState = 'idle' | 'loading' | 'error' | 'empty' | 'success';
export type InteractionState = 'default' | 'hover' | 'active' | 'disabled' | 'selected';

export interface StateConfig {
  view: ViewState;
  interaction: InteractionState;
  error?: string;
  loading?: boolean;
  empty?: boolean;
  data?: any[];
  selectedCount?: number;
  totalCount?: number;
}

export interface EmptyStateConfig {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
  };
}

export interface ErrorStateConfig {
  title?: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
  };
  dismissible?: boolean;
}

export interface LoadingStateConfig {
  text?: string;
  variant?: 'spinner' | 'skeleton' | 'dots' | 'pulse';
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

// State management context
interface StateManagerContextType {
  state: StateConfig;
  updateState: (updates: Partial<StateConfig>) => void;
  setLoading: (loading: boolean, text?: string) => void;
  setError: (error: string | null) => void;
  setEmpty: (empty: boolean) => void;
  setInteraction: (interaction: InteractionState) => void;
  clearState: () => void;
}

const StateManagerContext = createContext<StateManagerContextType | null>(null);

// State reducer
type StateAction = 
  | { type: 'UPDATE_STATE'; payload: Partial<StateConfig> }
  | { type: 'SET_LOADING'; payload: { loading: boolean; text?: string } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EMPTY'; payload: boolean }
  | { type: 'SET_INTERACTION'; payload: InteractionState }
  | { type: 'CLEAR_STATE' };

function stateReducer(state: StateConfig, action: StateAction): StateConfig {
  switch (action.type) {
    case 'UPDATE_STATE':
      return { ...state, ...action.payload };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload.loading,
        view: action.payload.loading ? 'loading' : 'idle',
        error: action.payload.loading ? undefined : state.error
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload || undefined,
        view: action.payload ? 'error' : 'idle',
        loading: false
      };
    
    case 'SET_EMPTY':
      return {
        ...state,
        empty: action.payload,
        view: action.payload ? 'empty' : 'idle'
      };
    
    case 'SET_INTERACTION':
      return {
        ...state,
        interaction: action.payload
      };
    
    case 'CLEAR_STATE':
      return {
        view: 'idle',
        interaction: 'default',
        loading: false,
        empty: false,
        error: undefined
      };
    
    default:
      return state;
  }
}

// Provider component
interface StateManagerProviderProps {
  children: React.ReactNode;
  initialState?: Partial<StateConfig>;
}

export function StateManagerProvider({ children, initialState = {} }: StateManagerProviderProps) {
  const [state, dispatch] = useReducer(stateReducer, {
    view: 'idle',
    interaction: 'default',
    loading: false,
    empty: false,
    ...initialState
  });

  const updateState = useCallback((updates: Partial<StateConfig>) => {
    dispatch({ type: 'UPDATE_STATE', payload: updates });
  }, []);

  const setLoading = useCallback((loading: boolean, text?: string) => {
    dispatch({ type: 'SET_LOADING', payload: { loading, text } });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setEmpty = useCallback((empty: boolean) => {
    dispatch({ type: 'SET_EMPTY', payload: empty });
  }, []);

  const setInteraction = useCallback((interaction: InteractionState) => {
    dispatch({ type: 'SET_INTERACTION', payload: interaction });
  }, []);

  const clearState = useCallback(() => {
    dispatch({ type: 'CLEAR_STATE' });
  }, []);

  const contextValue: StateManagerContextType = {
    state,
    updateState,
    setLoading,
    setError,
    setEmpty,
    setInteraction,
    clearState
  };

  return (
    <StateManagerContext.Provider value={contextValue}>
      {children}
    </StateManagerContext.Provider>
  );
}

// Hook to use state manager
export function useStateManager() {
  const context = useContext(StateManagerContext);
  if (!context) {
    throw new Error('useStateManager must be used within a StateManagerProvider');
  }
  return context;
}

// Empty state component
interface EmptyStateProps {
  config: EmptyStateConfig;
  className?: string;
}

export function EmptyState({ config, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center py-2xl ${className}`}>
      <div className="flex justify-center mb-md">
        {config.icon || <Database className="h-12 w-12 text-muted-foreground/50" />}
      </div>
      
      <h3 className="text-lg font-medium text-foreground dark:text-muted-foreground/20 mb-sm">
        {config.title}
      </h3>
      
      <p className="text-muted-foreground/70 dark:text-muted-foreground/50 mb-lg max-w-md mx-auto">
        {config.description}
      </p>
      
      <div className="flex items-center justify-center gap-sm">
        {config.action && (
          <Button
            variant={config.action.variant === 'secondary' ? 'outline' : (config.action.variant || 'primary')}
            onClick={config.action.onClick}
          >
            {config.action.label}
          </Button>
        )}
        
        {config.secondaryAction && (
          <Button
            variant={config.secondaryAction.variant === 'secondary' ? 'outline' : (config.secondaryAction.variant || 'ghost')}
            onClick={config.secondaryAction.onClick}
          >
            {config.secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}

// Error state component
interface ErrorStateProps {
  config: ErrorStateConfig;
  className?: string;
  onDismiss?: () => void;
}

export function ErrorState({ config, className = '', onDismiss }: ErrorStateProps) {
  return (
    <div className={`py-xl ${className}`}>
      <Alert
        variant="destructive"
      >
        <AlertCircle className="h-4 w-4" />
        <div>
          {config.title && (
            <div className="font-medium mb-xs">{config.title}</div>
          )}
          <div className="text-sm">{config.description}</div>
          
          {config.action && (
            <div className="mt-sm">
              <Button
                variant={config.action.variant === 'secondary' ? 'outline' : (config.action.variant || 'ghost')}
                
                onClick={config.action.onClick}
              >
                {config.action.label}
              </Button>
            </div>
          )}
        </div>
      </Alert>
    </div>
  );
}

// Loading state component
interface LoadingStateProps {
  config: LoadingStateConfig;
  className?: string;
}

export function LoadingState({ config, className = '' }: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center py-2xl ${className}`}>
      <Loader
        variant={config.variant}
        size={config.size}
        text={config.text}
      />
    </div>
  );
}

// Comprehensive state renderer
interface StateRendererProps {
  children: React.ReactNode;
  emptyState?: EmptyStateConfig;
  errorState?: ErrorStateConfig;
  loadingState?: LoadingStateConfig;
  className?: string;
}

export function StateRenderer({
  children,
  emptyState,
  errorState,
  loadingState,
  className = ''
}: StateRendererProps) {
  const { state, setError } = useStateManager();

  // Auto-detect empty state if not explicitly set
  useEffect(() => {
    if (state.data !== undefined) {
      const isEmpty = Array.isArray(state.data) ? state.data.length === 0 : !state.data;
      if (isEmpty !== state.empty) {
        // Update empty state based on data
      }
    }
  }, [state.data, state.empty]);

  if (state.view === 'loading' && loadingState) {
    return <LoadingState config={loadingState} className={className} />;
  }

  if (state.view === 'error' && state.error && errorState) {
    return (
      <ErrorState
        config={{ ...errorState, description: state.error }}
        className={className}
        onDismiss={errorState.dismissible ? () => setError(null) : undefined}
      />
    );
  }

  if (state.view === 'empty' && emptyState) {
    return <EmptyState config={emptyState} className={className} />;
  }

  return <div className={className}>{children}</div>;
}

// Predefined empty state configurations
export const EMPTY_STATES = {
  noData: {
    icon: <Database className="h-12 w-12 text-muted-foreground/50" />,
    title: 'No data found',
    description: 'There are no records to display at this time.',
    action: {
      label: 'Refresh',
      onClick: () => window.location.reload(),
      variant: 'ghost' as const
    }
  },
  
  noResults: {
    icon: <Search className="h-12 w-12 text-muted-foreground/50" />,
    title: 'No results found',
    description: 'Try adjusting your search criteria or filters to find what you\'re looking for.',
    action: {
      label: 'Clear Filters',
      onClick: () => {},
      variant: 'ghost' as const
    }
  },
  
  noRecords: {
    icon: <Plus className="h-12 w-12 text-muted-foreground/50" />,
    title: 'No records yet',
    description: 'Get started by creating your first record.',
    action: {
      label: 'Create Record',
      onClick: () => {},
      variant: 'primary' as const
    }
  },
  
  noProjects: {
    icon: <Plus className="h-12 w-12 text-muted-foreground/50" />,
    title: 'No projects yet',
    description: 'Create your first project to get started with your workspace.',
    action: {
      label: 'Create Project',
      onClick: () => {},
      variant: 'primary' as const
    },
    secondaryAction: {
      label: 'Import Projects',
      onClick: () => {},
      variant: 'ghost' as const
    }
  },
  
  accessDenied: {
    icon: <AlertCircle className="h-12 w-12 text-destructive" />,
    title: 'Access denied',
    description: 'You don\'t have permission to view this content.',
    action: {
      label: 'Request Access',
      onClick: () => {},
      variant: 'primary' as const
    }
  }
};

// Predefined error state configurations
export const ERROR_STATES = {
  loadError: {
    title: 'Failed to load data',
    description: 'There was an error loading the requested data. Please try again.',
    action: {
      label: 'Retry',
      onClick: () => window.location.reload(),
      variant: 'primary' as const
    },
    dismissible: true
  },
  
  saveError: {
    title: 'Failed to save',
    description: 'Your changes could not be saved. Please check your connection and try again.',
    action: {
      label: 'Retry',
      onClick: () => {},
      variant: 'primary' as const
    },
    dismissible: true
  },
  
  networkError: {
    title: 'Connection error',
    description: 'Unable to connect to the server. Please check your internet connection.',
    action: {
      label: 'Retry',
      onClick: () => window.location.reload(),
      variant: 'primary' as const
    },
    dismissible: false
  },
  
  validationError: {
    title: 'Validation failed',
    description: 'Please check the form for errors and try again.',
    dismissible: true
  }
};

// Predefined loading state configurations
export const LOADING_STATES = {
  default: {
    text: 'Loading...',
    variant: 'spinner' as const,
    size: 'md' as const
  },
  
  saving: {
    text: 'Saving...',
    variant: 'dots' as const,
    size: 'sm' as const
  },
  
  processing: {
    text: 'Processing...',
    variant: 'pulse' as const,
    size: 'md' as const
  },
  
  skeleton: {
    variant: 'skeleton' as const,
    size: 'lg' as const
  }
};
