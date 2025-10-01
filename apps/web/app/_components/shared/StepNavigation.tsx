import React from "react";
"use client";

import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description?: string;
  isCompleted?: boolean;
  isActive?: boolean;
  isAccessible?: boolean;
}

interface StepNavigationProps {
  steps: Step[];
  currentStep: string;
  onStepClick?: (stepId: string) => void;
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  className?: string;
}

export function StepNavigation({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  showLabels = true,
  className = ""
}: StepNavigationProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  if (orientation === 'vertical') {
    return (
      <div className={`space-y-md ${className}`}>
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.isCompleted || index < currentIndex;
          const isAccessible = step.isAccessible !== false && (index <= currentIndex || isCompleted);

          return (
            <div key={step.id} className="flex items-start space-x-md">
              {/* Step indicator */}
              <button aria-label="button"
                role="button" tabIndex={0} onClick={() => isAccessible && onStepClick?.(step.id)}
                disabled={!isAccessible}
                className={`
                  flex-shrink-0 w-icon-lg h-icon-lg rounded-full flex items-center justify-center text-body-sm form-label transition-all duration-200
                  ${isCompleted 
                    ? 'bg-success color-success-foreground' 
                    : isActive 
                      ? 'bg-accent color-accent-foreground' 
                      : isAccessible
                        ? 'bg-secondary color-muted hover:bg-secondary/80'
                        : 'bg-secondary/50 color-muted/50 cursor-not-allowed'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="h-icon-xs w-icon-xs" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </button>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <button aria-label="button"
                  role="button" tabIndex={0} onClick={() => isAccessible && onStepClick?.(step.id)}
                  disabled={!isAccessible}
                  className={`
                    text-left w-full transition-colors duration-200
                    ${isAccessible ? 'hover:color-accent' : 'cursor-not-allowed'}
                  `}
                >
                  <h1 className={`
                    form-label text-body-sm
                    ${isActive ? 'color-accent' : 
                      isCompleted ? 'color-success' : 
                      isAccessible ? 'color-foreground' : 'color-muted/50'}
                  `}>
                    {step.title}
                  </h1>
                  
                  {showLabels && step.description && (
                    <p className={`
                      text-body-sm mt-xs
                      ${isActive ? 'color-accent/70' : 
                        isCompleted ? 'color-success/70' : 
                        isAccessible ? 'color-muted' : 'color-muted/50'}
                    `}>
                      {step.description}
                    </p>
                  )}
                </button>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-md mt-smxl w-px h-icon-md bg-border" />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal orientation
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.isCompleted || index < currentIndex;
        const isAccessible = step.isAccessible !== false && (index <= currentIndex || isCompleted);

        return (
          <div key={step.id} className="flex items-center">
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <button aria-label="button"
                role="button" tabIndex={0} onClick={() => isAccessible && onStepClick?.(step.id)}
                disabled={!isAccessible}
                className={`
                  w-xs h-xs rounded-full flex items-center justify-center text-body-sm form-label transition-all duration-200
                  ${isCompleted 
                    ? 'bg-success color-success-foreground' 
                    : isActive 
                      ? 'bg-accent color-accent-foreground' 
                      : isAccessible
                        ? 'bg-secondary color-muted hover:bg-secondary/80'
                        : 'bg-secondary/50 color-muted/50 cursor-not-allowed'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="h-icon-sm w-icon-sm" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </button>

              {/* Step label */}
              {showLabels && (
                <div className="mt-sm text-center max-w-component-lg">
                  <p className={`
                    text-body-sm form-label
                    ${isActive ? 'color-accent' : 
                      isCompleted ? 'color-success' : 
                      isAccessible ? 'color-foreground' : 'color-muted/50'}
                  `}>
                    {step.title}
                  </p>
                  
                  {step.description && (
                    <p className={`
                      text-body-sm mt-xs
                      ${isActive ? 'color-accent/70' : 
                        isCompleted ? 'color-success/70' : 
                        isAccessible ? 'color-muted' : 'color-muted/50'}
                    `}>
                      {step.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className={`
                flex-1 h-px mx-md transition-colors duration-200
                ${isCompleted ? 'bg-success' : 'bg-border'}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface StepNavigationControlsProps {
  currentStep: string;
  steps: Step[];
  onPrevious?: () => void;
  onNext?: () => void;
  onStepClick?: (stepId: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function StepNavigationControls({
  currentStep,
  steps,
  onPrevious,
  onNext,
  onStepClick,
  isLoading = false,
  className = ""
}: StepNavigationControlsProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === steps.length - 1;

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <button aria-label="button"
        role="button" tabIndex={0} onClick={onPrevious}
        disabled={isFirstStep || isLoading}
        className={`
          flex items-center space-x-sm px-md py-sm text-body-sm form-label rounded-lg transition-colors
          ${isFirstStep || isLoading
            ? 'color-muted/50 cursor-not-allowed'
            : 'color-muted hover:color-foreground hover:bg-secondary/50'
          }
        `}
      >
        <ChevronLeft className="h-icon-xs w-icon-xs" />
        <span>Previous</span>
      </button>

      {/* Step dots for mobile */}
      <div className="flex items-center space-x-sm sm:hidden">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.isCompleted || index < currentIndex;

          return (
            <button aria-label="button"
              key={step.id}
              role="button" tabIndex={0} onClick={() => onStepClick?.(step.id)}
              className={`
                w-2 h-2 rounded-full transition-colors
                ${isCompleted 
                  ? 'bg-success' 
                  : isActive 
                    ? 'bg-accent' 
                    : 'bg-secondary'
                }
              `}
            />
          );
        })}
      </div>

      <button aria-label="button"
        role="button" tabIndex={0} onClick={onNext}
        disabled={isLastStep || isLoading}
        className={`
          flex items-center space-x-sm px-md py-sm text-body-sm form-label rounded-lg transition-colors
          ${isLastStep || isLoading
            ? 'color-muted/50 cursor-not-allowed'
            : 'bg-accent color-accent-foreground hover:bg-accent/90'
          }
        `}
      >
        <span>{isLastStep ? 'Complete' : 'Next'}</span>
        <ChevronRight className="h-icon-xs w-icon-xs" />
      </button>
    </div>
  );
}
