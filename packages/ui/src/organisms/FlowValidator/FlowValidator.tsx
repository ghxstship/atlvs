'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Button } from '../../atoms/Button';
import { Badge } from '../../atoms/Badge';
import { useToast } from '../../components/Toast';
import { CheckCircle, AlertTriangle, XCircle, ArrowRight, RefreshCw } from 'lucide-react';

interface FlowStep {
  id: string;
  name: string;
  path: string;
  description?: string;
  requiredData?: string[];
  validationRules?: ValidationRule[];
  dependencies?: string[];
  isOptional?: boolean;
}

interface ValidationRule {
  id: string;
  name: string;
  check: () => Promise<boolean>;
  errorMessage: string;
  severity: 'error' | 'warning' | 'info';
}

interface FlowValidationResult {
  stepId: string;
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  completionTime?: number;
}

interface ValidationError {
  ruleId: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

interface FlowValidatorContextValue {
  flows: Record<string, FlowStep[]>;
  validationResults: Record<string, FlowValidationResult>;
  isValidating: boolean;
  registerFlow: (flowId: string, steps: FlowStep[]) => void;
  validateFlow: (flowId: string) => Promise<boolean>;
  validateStep: (flowId: string, stepId: string) => Promise<boolean>;
  getFlowHealth: (flowId: string) => 'healthy' | 'warning' | 'error';
}

const FlowValidatorContext = createContext<FlowValidatorContextValue | null>(null);

export const useFlowValidator = () => {
  const context = useContext(FlowValidatorContext);
  if (!context) {
    throw new Error('useFlowValidator must be used within FlowValidatorProvider');
  }
  return context;
};

export interface FlowValidatorProviderProps {
  children: React.ReactNode;
}

export const FlowValidatorProvider: React.FC<FlowValidatorProviderProps> = ({ children }) => {
  const [flows, setFlows] = useState<Record<string, FlowStep[]>>({});
  const [validationResults, setValidationResults] = useState<Record<string, FlowValidationResult>>({});
  const [isValidating, setIsValidating] = useState(false);
  const { addToast } = useToast();

  const registerFlow = (flowId: string, steps: FlowStep[]) => {
    setFlows(prev => ({ ...prev, [flowId]: steps }));
  };

  const validateStep = async (flowId: string, stepId: string): Promise<boolean> => {
    const flow = flows[flowId];
    if (!flow) return false;

    const step = flow.find(s => s.id === stepId);
    if (!step) return false;

    const startTime = Date.now();
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Run validation rules
    if (step.validationRules) {
      for (const rule of step.validationRules) {
        try {
          const isValid = await rule.check();
          if (!isValid) {
            const error: ValidationError = {
              ruleId: rule.id,
              message: rule.errorMessage,
              severity: rule.severity
            };
            
            if (rule.severity === 'error') {
              errors.push(error);
            } else {
              warnings.push(error);
            }
          }
        } catch (error) {
          errors.push({
            ruleId: rule.id,
            message: `Validation failed: ${error}`,
            severity: 'error'
          });
        }
      }
    }

    // Check dependencies
    if (step.dependencies) {
      for (const depId of step.dependencies) {
        const depResult = validationResults[`${flowId}-${depId}`];
        if (!depResult || !depResult.isValid) {
          errors.push({
            ruleId: 'dependency',
            message: `Dependency "${depId}" is not satisfied`,
            severity: 'error'
          });
        }
      }
    }

    const result: FlowValidationResult = {
      stepId,
      isValid: errors.length === 0,
      errors,
      warnings,
      completionTime: Date.now() - startTime
    };

    setValidationResults(prev => ({
      ...prev,
      [`${flowId}-${stepId}`]: result
    }));

    return result.isValid;
  };

  const validateFlow = async (flowId: string): Promise<boolean> => {
    const flow = flows[flowId];
    if (!flow) return false;

    setIsValidating(true);
    let allValid = true;

    try {
      // Validate steps in dependency order
      const sortedSteps = topologicalSort(flow);
      
      for (const step of sortedSteps) {
        const isValid = await validateStep(flowId, step.id);
        if (!isValid && !step.isOptional) {
          allValid = false;
        }
      }

      addToast({
        type: allValid ? 'success' : 'error',
        title: `Flow Validation ${allValid ? 'Passed' : 'Failed'}`,
        description: `${flowId} flow validation completed`
      });

      return allValid;
    } finally {
      setIsValidating(false);
    }
  };

  const getFlowHealth = (flowId: string): 'healthy' | 'warning' | 'error' => {
    const flow = flows[flowId];
    if (!flow) return 'error';

    let hasErrors = false;
    let hasWarnings = false;

    for (const step of flow) {
      const result = validationResults[`${flowId}-${step.id}`];
      if (result) {
        if (result.errors.length > 0) hasErrors = true;
        if (result.warnings.length > 0) hasWarnings = true;
      }
    }

    if (hasErrors) return 'error';
    if (hasWarnings) return 'warning';
    return 'healthy';
  };

  return (
    <FlowValidatorContext.Provider value={{
      flows,
      validationResults,
      isValidating,
      registerFlow,
      validateFlow,
      validateStep,
      getFlowHealth
    }}>
      {children}
    </FlowValidatorContext.Provider>
  );
};

// Utility function for topological sorting of steps based on dependencies
function topologicalSort(steps: FlowStep[]): FlowStep[] {
  const visited = new Set<string>();
  const result: FlowStep[] = [];
  const stepMap = new Map(steps.map(s => [s.id, s]));

  function visit(stepId: string) {
    if (visited.has(stepId)) return;
    visited.add(stepId);

    const step = stepMap.get(stepId);
    if (!step) return;

    // Visit dependencies first
    if (step.dependencies) {
      for (const depId of step.dependencies) {
        visit(depId);
      }
    }

    result.push(step);
  }

  for (const step of steps) {
    visit(step.id);
  }

  return result;
}

// Flow Health Dashboard Component
export interface FlowHealthDashboardProps {
  flowIds: string[];
  className?: string;
}

export const FlowHealthDashboard: React.FC<FlowHealthDashboardProps> = ({
  flowIds,
  className = ''
}) => {
  const { flows, validationResults, isValidating, validateFlow, getFlowHealth } = useFlowValidator();

  const handleValidateAll = async () => {
    for (const flowId of flowIds) {
      await validateFlow(flowId);
    }
  };

  return (
    <div className={`space-y-md ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Flow Health Dashboard</h3>
        <Button
          onClick={handleValidateAll}
          loading={isValidating}
          disabled={isValidating}
          size="sm"
        >
          <RefreshCw className="w-icon-xs h-icon-xs mr-sm" />
          Validate All
        </Button>
      </div>

      <div className="grid gap-md md:grid-cols-2 lg:grid-cols-3">
        {flowIds.map(flowId => {
          const flow = flows[flowId];
          const health = getFlowHealth(flowId);
          
          if (!flow) return null;

          const totalSteps = flow.length;
          const validatedSteps = flow.filter(step => 
            validationResults[`${flowId}-${step.id}`]
          ).length;

          return (
            <div
              key={flowId}
              className="p-md border rounded-lg bg-card"
            >
              <div className="flex items-center justify-between mb-sm">
                <h4 className="font-medium">{flowId}</h4>
                <Badge
                  variant={
                    health === 'healthy' ? 'success' :
                    health === 'warning' ? 'warning' : 'destructive'
                  }
                >
                  {health === 'healthy' && <CheckCircle className="w-3 h-3 mr-xs" />}
                  {health === 'warning' && <AlertTriangle className="w-3 h-3 mr-xs" />}
                  {health === 'error' && <XCircle className="w-3 h-3 mr-xs" />}
                  {health}
                </Badge>
              </div>

              <div className="text-sm text-muted-foreground mb-sm">
                {validatedSteps}/{totalSteps} steps validated
              </div>

              <div className="space-y-xs">
                {flow.map((step, index) => {
                  const result = validationResults[`${flowId}-${step.id}`];
                  const isLast = index === flow.length - 1;

                  return (
                    <div key={step.id} className="flex items-center gap-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        result?.isValid ? 'bg-success' :
                        result?.errors.length ? 'bg-destructive' :
                        result?.warnings.length ? 'bg-warning' :
                        'bg-muted'
                      }`} />
                      <span className="text-sm flex-1">{step.name}</span>
                      {!isLast && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                    </div>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-sm"
                onClick={() => validateFlow(flowId)}
                disabled={isValidating}
              >
                Validate Flow
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Predefined validation rules for common scenarios
export const commonValidationRules = {
  // Authentication flow rules
  userAuthenticated: (): ValidationRule => ({
    id: 'user-authenticated',
    name: 'User Authentication',
    check: async () => {
      // Check if user is authenticated
      const token = localStorage.getItem('auth-token');
      return !!token;
    },
    errorMessage: 'User must be authenticated to proceed',
    severity: 'error'
  }),

  // Data validation rules
  requiredFieldsPresent: (fields: string[]): ValidationRule => ({
    id: 'required-fields',
    name: 'Required Fields',
    check: async () => {
      // Check if required fields are present in form data
      const formData = JSON.parse(localStorage.getItem('form-data') || '{}');
      return fields.every(field => formData[field]);
    },
    errorMessage: `Required fields missing: ${fields.join(', ')}`,
    severity: 'error'
  }),

  // Network connectivity rules
  apiEndpointReachable: (endpoint: string): ValidationRule => ({
    id: 'api-reachable',
    name: 'API Connectivity',
    check: async () => {
      try {
        const response = await fetch(endpoint, { method: 'HEAD' });
        return response.ok;
      } catch {
        return false;
      }
    },
    errorMessage: `API endpoint ${endpoint} is not reachable`,
    severity: 'warning'
  }),

  // Permission rules
  hasPermission: (permission: string): ValidationRule => ({
    id: 'permission-check',
    name: 'Permission Check',
    check: async () => {
      const permissions = JSON.parse(localStorage.getItem('user-permissions') || '[]');
      return permissions.includes(permission);
    },
    errorMessage: `Missing required permission: ${permission}`,
    severity: 'error'
  })
};

// Predefined common flows
export const commonFlows = {
  userOnboarding: [
    {
      id: 'signup',
      name: 'Sign Up',
      path: '/signup',
      description: 'User creates account',
      validationRules: [
        commonValidationRules.requiredFieldsPresent(['email', 'password', 'name'])
      ]
    },
    {
      id: 'email-verification',
      name: 'Email Verification',
      path: '/verify-email',
      description: 'User verifies email address',
      dependencies: ['signup']
    },
    {
      id: 'profile-setup',
      name: 'Profile Setup',
      path: '/profile/setup',
      description: 'User completes profile',
      dependencies: ['email-verification'],
      validationRules: [
        commonValidationRules.userAuthenticated()
      ]
    },
    {
      id: 'onboarding-complete',
      name: 'Onboarding Complete',
      path: '/dashboard',
      description: 'User reaches dashboard',
      dependencies: ['profile-setup']
    }
  ],

  projectCreation: [
    {
      id: 'project-form',
      name: 'Project Form',
      path: '/projects/new',
      description: 'User fills project details',
      validationRules: [
        commonValidationRules.userAuthenticated(),
        commonValidationRules.requiredFieldsPresent(['name', 'description'])
      ]
    },
    {
      id: 'team-setup',
      name: 'Team Setup',
      path: '/projects/team',
      description: 'User adds team members',
      dependencies: ['project-form'],
      isOptional: true
    },
    {
      id: 'project-created',
      name: 'Project Created',
      path: '/projects/:id',
      description: 'Project is created and accessible',
      dependencies: ['project-form']
    }
  ],

  checkoutFlow: [
    {
      id: 'cart-review',
      name: 'Cart Review',
      path: '/cart',
      description: 'User reviews cart items',
      validationRules: [
        commonValidationRules.requiredFieldsPresent(['items'])
      ]
    },
    {
      id: 'shipping-info',
      name: 'Shipping Information',
      path: '/checkout/shipping',
      description: 'User enters shipping details',
      dependencies: ['cart-review'],
      validationRules: [
        commonValidationRules.requiredFieldsPresent(['address', 'city', 'zipCode'])
      ]
    },
    {
      id: 'payment-info',
      name: 'Payment Information',
      path: '/checkout/payment',
      description: 'User enters payment details',
      dependencies: ['shipping-info'],
      validationRules: [
        commonValidationRules.requiredFieldsPresent(['cardNumber', 'expiryDate', 'cvv'])
      ]
    },
    {
      id: 'order-confirmation',
      name: 'Order Confirmation',
      path: '/checkout/confirmation',
      description: 'Order is confirmed',
      dependencies: ['payment-info']
    }
  ]
};
