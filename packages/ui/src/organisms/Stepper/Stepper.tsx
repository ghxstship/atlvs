/**
 * Stepper Component — Multi-Step Process
 * Guide users through multi-step workflows
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { Check } from 'lucide-react';

export interface Step {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
}

export interface StepperProps {
  /** Steps */
  steps: Step[];
  
  /** Current step index */
  currentStep: number;
  
  /** Completed steps */
  completedSteps?: number[];
  
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  
  /** Step click handler */
  onStepClick?: (index: number) => void;
}

/**
 * Stepper Component
 */
export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  completedSteps = [],
  orientation = 'horizontal',
  onStepClick,
}) => {
  const isStepCompleted = (index: number) => completedSteps.includes(index);
  const isStepCurrent = (index: number) => index === currentStep;
  
  if (orientation === 'vertical') {
    return (
      <div className="space-y-2">
        {steps.map((step, index) => {
          const completed = isStepCompleted(index);
          const current = isStepCurrent(index);
          
          return (
            <div key={step.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => onStepClick?.(index)}
                  disabled={!onStepClick}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    font-semibold transition-all
                    ${completed
                      ? 'bg-success text-white'
                      : current
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }
                    ${onStepClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
                  `}
                >
                  {completed ? <Check className="w-5 h-5" /> : index + 1}
                </button>
                {index < steps.length - 1 && (
                  <div className="w-px h-12 bg-border my-2" />
                )}
              </div>
              
              <div className="flex-1 pb-8">
                <div className={`font-medium ${current ? 'text-primary' : ''}`}>
                  {step.label}
                  {step.optional && (
                    <span className="text-xs text-muted-foreground ml-2">
                      (Optional)
                    </span>
                  )}
                </div>
                {step.description && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  
  return (
    <div className="flex items-center">
      {steps.map((step, index) => {
        const completed = isStepCompleted(index);
        const current = isStepCurrent(index);
        
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <button
                onClick={() => onStepClick?.(index)}
                disabled={!onStepClick}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  font-semibold transition-all
                  ${completed
                    ? 'bg-success text-white'
                    : current
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }
                  ${onStepClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
                `}
              >
                {completed ? <Check className="w-5 h-5" /> : index + 1}
              </button>
              <div className={`mt-2 text-sm text-center ${current ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                {step.label}
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`flex-1 h-px mx-4 ${completed ? 'bg-success' : 'bg-border'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

Stepper.displayName = 'Stepper';
