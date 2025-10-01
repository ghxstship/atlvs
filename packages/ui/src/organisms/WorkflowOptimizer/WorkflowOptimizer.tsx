'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Button } from '../../atoms/Button';
import { Input } from '../../components/atomic/Input';
import { useToast } from '../../components/Toast';
import { Modal, ConfirmModal } from '../../organisms/Modal';
import { CheckCircle, AlertCircle, Info, HelpCircle, Undo2, Save, X } from 'lucide-react';

interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  optional?: boolean;
  validation?: () => boolean | Promise<boolean>;
  onComplete?: () => void | Promise<void>;
}

interface WorkflowContextValue {
  steps: WorkflowStep[];
  currentStep: number;
  isComplete: boolean;
  canProceed: boolean;
  nextStep: () => void;
  previousStep: () => void;
  completeStep: (stepId: string) => void;
  resetWorkflow: () => void;
  addStep: (step: WorkflowStep) => void;
  updateStep: (stepId: string, updates: Partial<WorkflowStep>) => void;
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null);

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider');
  }
  return context;
};

export interface WorkflowProviderProps {
  children: React.ReactNode;
  steps: WorkflowStep[];
  onComplete?: () => void;
}

export const WorkflowProvider: React.FC<WorkflowProviderProps> = ({ 
  children, 
  steps: initialSteps, 
  onComplete 
}) => {
  const [steps, setSteps] = useState<WorkflowStep[]>(initialSteps);
  const [currentStep, setCurrentStep] = useState(0);
  const { addToast } = useToast();

  const isComplete = steps.every(step => step.completed || step.optional);
  const canProceed = currentStep < steps.length - 1;

  const nextStep = async () => {
    const step = steps[currentStep];
    
    // Validate current step if validation exists
    if (step.validation) {
      const isValid = await step.validation();
      if (!isValid) {
        addToast({
          type: 'error',
          title: 'Validation Failed',
          description: `Please complete "${step.title}" before proceeding.`
        });
        return;
      }
    }

    if (canProceed) {
      setCurrentStep(prev => prev + 1);
    } else if (isComplete && onComplete) {
      onComplete();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeStep = async (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;

    const step = steps[stepIndex];
    
    try {
      if (step.onComplete) {
        await step.onComplete();
      }
      
      setSteps(prev => prev.map(s => 
        s.id === stepId ? { ...s, completed: true } : s
      ));
      
      addToast({
        type: 'success',
        title: 'Step Completed',
        description: `"${step.title}" has been completed.`
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Step Failed',
        description: `Failed to complete "${step.title}".`
      });
    }
  };

  const resetWorkflow = () => {
    setSteps(prev => prev.map(s => ({ ...s, completed: false })));
    setCurrentStep(0);
  };

  const addStep = (step: WorkflowStep) => {
    setSteps(prev => [...prev, step]);
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps(prev => prev.map(s => 
      s.id === stepId ? { ...s, ...updates } : s
    ));
  };

  return (
    <WorkflowContext.Provider value={{
      steps,
      currentStep,
      isComplete,
      canProceed,
      nextStep,
      previousStep,
      completeStep,
      resetWorkflow,
      addStep,
      updateStep
    }}>
      {children}
    </WorkflowContext.Provider>
  );
};

// Workflow Progress Component
export interface WorkflowProgressProps {
  showStepNumbers?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  showStepNumbers = true,
  orientation = 'horizontal',
  className = ''
}) => {
  const { steps, currentStep } = useWorkflow();

  return (
    <div className={`workflow-progress ${orientation} ${className}`}>
      <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row items-center'} gap-sm`}>
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center gap-sm ${
              orientation === 'vertical' ? 'w-full' : ''
            }`}
          >
            <div
              className={`flex items-center justify-center w-icon-lg h-icon-lg rounded-full border-2 transition-colors ${
                step.completed
                  ? 'bg-success border-success text-success-foreground'
                  : index === currentStep
                  ? 'bg-accent border-primary text-accent-foreground'
                  : 'bg-muted border-muted-foreground text-muted-foreground'
              }`}
            >
              {step.completed ? (
                <CheckCircle className="w-icon-xs h-icon-xs" />
              ) : showStepNumbers ? (
                <span className="text-sm font-medium">{index + 1}</span>
              ) : (
                <div className="w-2 h-2 rounded-full bg-current" />
              )}
            </div>
            
            <div className={`flex-1 ${orientation === 'vertical' ? '' : 'hidden sm:block'}`}>
              <div className={`text-sm font-medium ${
                step.completed || index === currentStep
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}>
                {step.title}
              </div>
              {step.description && (
                <div className="text-xs text-muted-foreground">
                  {step.description}
                </div>
              )}
            </div>
            
            {orientation === 'horizontal' && index < steps.length - 1 && (
              <div className={`flex-1 h-px ${
                steps[index + 1].completed ? 'bg-success' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Form Auto-save Hook
export const useAutoSave = function<T extends Record<string, any>>(
  data: T,
  saveFunction: (data: T) => Promise<void>,
  options: {
    delay?: number;
    enabled?: boolean;
    onSave?: () => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const { delay = 2000, enabled = true, onSave, onError } = options;
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (!enabled) return;

    const timeoutId = setTimeout(async () => {
      try {
        setIsSaving(true);
        await saveFunction(data);
        setLastSaved(new Date());
        onSave?.();
        
        addToast({
          type: 'info',
          title: 'Auto-saved',
          description: 'Your changes have been automatically saved.',
          duration: 2000
        });
      } catch (error) {
        onError?.(error as Error);
        addToast({
          type: 'error',
          title: 'Auto-save Failed',
          description: 'Failed to automatically save changes.'
        });
      } finally {
        setIsSaving(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [data, delay, enabled, saveFunction, onSave, onError, addToast]);

  return { isSaving, lastSaved };
};

// Undo/Redo Hook
export function useUndoRedo<T>(initialState: T, maxHistorySize = 50) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentState = history[currentIndex];
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const pushState = (newState: T) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(newState);
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        return newHistory;
      }
      
      return newHistory;
    });
    setCurrentIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
  };

  const undo = () => {
    if (canUndo) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const redo = () => {
    if (canRedo) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const reset = () => {
    setHistory([initialState]);
    setCurrentIndex(0);
  };

  return {
    currentState,
    canUndo,
    canRedo,
    pushState,
    undo,
    redo,
    reset
  };
}

// Contextual Help Component
export interface ContextualHelpProps {
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  children: React.ReactNode;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  title,
  content,
  position = 'top',
  trigger = 'hover',
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleTrigger = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  return (
    <div className="relative inline-block">
      <div
        onClick={handleTrigger}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-help"
      >
        {children}
      </div>
      
      {isVisible && (
        <div className={`absolute z-50 w-container-sm p-sm bg-popover border rounded-md shadow-floating ${
          position === 'top' ? 'bottom-full mb-sm' :
          position === 'bottom' ? 'top-full mt-sm' :
          position === 'left' ? 'right-full mr-sm' :
          'left-full ml-sm'
        }`}>
          <div className="text-sm font-medium text-popover-foreground mb-xs">
            {title}
          </div>
          <div className="text-xs text-muted-foreground">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

// Smart Form Component with validation and auto-save
export interface SmartFormProps {
  children: React.ReactNode;
  onSubmit: (data: any) => Promise<void>;
  autoSave?: boolean;
  showUndoRedo?: boolean;
  className?: string;
}

export const SmartForm: React.FC<SmartFormProps> = ({
  children,
  onSubmit,
  autoSave = true,
  showUndoRedo = true,
  className = ''
}) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  
  const { currentState, canUndo, canRedo, pushState, undo, redo } = useUndoRedo(formData);
  const { isSaving } = useAutoSave(formData, onSubmit, { enabled: autoSave });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      addToast({
        type: 'success',
        title: 'Form Submitted',
        description: 'Your form has been successfully submitted.'
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        description: 'Failed to submit the form. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-md ${className}`}>
      {showUndoRedo && (
        <div className="flex items-center gap-sm mb-md">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
          >
            <Undo2 className="w-icon-xs h-icon-xs mr-xs" />
            Undo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
          >
            <Undo2 className="w-icon-xs h-icon-xs mr-xs scale-x-[-1]" />
            Redo
          </Button>
          {isSaving && (
            <div className="flex items-center gap-xs text-sm text-muted-foreground">
              <Save className="w-3 h-3 animate-pulse" />
              Saving...
            </div>
          )}
        </div>
      )}
      
      {children}
      
      <div className="flex justify-end gap-sm pt-md">
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Submit
        </Button>
      </div>
    </form>
  );
};
