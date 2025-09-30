'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Button } from './Button';
import { Badge } from './Badge';
import { Card } from './Card';
import { ChevronDown, ChevronRight, Info, HelpCircle, Lightbulb, Star, X } from 'lucide-react';

interface DisclosureState {
  expandedSections: Set<string>;
  dismissedTips: Set<string>;
  userPreferences: {
    showAdvancedOptions: boolean;
    showTooltips: boolean;
    showContextualHelp: boolean;
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  };
}

interface DisclosureContextValue {
  state: DisclosureState;
  toggleSection: (sectionId: string) => void;
  dismissTip: (tipId: string) => void;
  updatePreferences: (preferences: Partial<DisclosureState['userPreferences']>) => void;
  shouldShowContent: (level: 'basic' | 'intermediate' | 'advanced') => boolean;
}

const DisclosureContext = createContext<DisclosureContextValue | null>(null);

export const useProgressiveDisclosure = () => {
  const context = useContext(DisclosureContext);
  if (!context) {
    throw new Error('useProgressiveDisclosure must be used within ProgressiveDisclosureProvider');
  }
  return context;
};

export interface ProgressiveDisclosureProviderProps {
  children: React.ReactNode;
  storageKey?: string;
}

export const ProgressiveDisclosureProvider: React.FC<ProgressiveDisclosureProviderProps> = ({ 
  children, 
  storageKey = 'progressive-disclosure-state' 
}) => {
  const [state, setState] = useState<DisclosureState>(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          expandedSections: new Set(parsed.expandedSections || []),
          dismissedTips: new Set(parsed.dismissedTips || []),
          userPreferences: {
            showAdvancedOptions: false,
            showTooltips: true,
            showContextualHelp: true,
            experienceLevel: 'beginner',
            ...parsed.userPreferences
          }
        };
      } catch {
        // Fall through to default state
      }
    }
    
    return {
      expandedSections: new Set(),
      dismissedTips: new Set(),
      userPreferences: {
        showAdvancedOptions: false,
        showTooltips: true,
        showContextualHelp: true,
        experienceLevel: 'beginner'
      }
    };
  });

  // Persist state changes
  useEffect(() => {
    const stateToStore = {
      expandedSections: Array.from(state.expandedSections),
      dismissedTips: Array.from(state.dismissedTips),
      userPreferences: state.userPreferences
    };
    localStorage.setItem(storageKey, JSON.stringify(stateToStore));
  }, [state, storageKey]);

  const toggleSection = (sectionId: string) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedSections);
      if (newExpanded.has(sectionId)) {
        newExpanded.delete(sectionId);
      } else {
        newExpanded.add(sectionId);
      }
      return { ...prev, expandedSections: newExpanded };
    });
  };

  const dismissTip = (tipId: string) => {
    setState(prev => ({
      ...prev,
      dismissedTips: new Set([...prev.dismissedTips, tipId])
    }));
  };

  const updatePreferences = (preferences: Partial<DisclosureState['userPreferences']>) => {
    setState(prev => ({
      ...prev,
      userPreferences: { ...prev.userPreferences, ...preferences }
    }));
  };

  const shouldShowContent = (level: 'basic' | 'intermediate' | 'advanced') => {
    const { experienceLevel, showAdvancedOptions } = state.userPreferences;
    
    if (level === 'basic') return true;
    if (level === 'intermediate') return experienceLevel !== 'beginner' || showAdvancedOptions;
    if (level === 'advanced') return experienceLevel === 'advanced' || showAdvancedOptions;
    
    return false;
  };

  return (
    <DisclosureContext.Provider value={{
      state,
      toggleSection,
      dismissTip,
      updatePreferences,
      shouldShowContent
    }}>
      {children}
    </DisclosureContext.Provider>
  );
};

// Collapsible Section Component
export interface CollapsibleSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  level?: 'basic' | 'intermediate' | 'advanced';
  badge?: string;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  id,
  title,
  children,
  defaultExpanded = false,
  level = 'basic',
  badge,
  className = ''
}) => {
  const { state, toggleSection, shouldShowContent } = useProgressiveDisclosure();
  
  // Initialize expansion state if not set
  useEffect(() => {
    if (defaultExpanded && !state.expandedSections.has(id)) {
      toggleSection(id);
    }
  }, [defaultExpanded, id, state.expandedSections, toggleSection]);

  if (!shouldShowContent(level)) {
    return null;
  }

  const isExpanded = state.expandedSections.has(id);

  return (
    <div className={`border rounded-lg ${className}`}>
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-md text-left hover:bg-muted/50 transition-colors"
        aria-expanded={isExpanded}
        aria-controls={`section-${id}`}
      >
        <div className="flex items-center gap-sm">
          <span className="font-medium">{title}</span>
          {badge && (
            <Badge variant="outline" size="sm">
              {badge}
            </Badge>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
      
      {isExpanded && (
        <div id={`section-${id}`} className="p-md pt-0 border-t">
          {children}
        </div>
      )}
    </div>
  );
};

// Contextual Tip Component
export interface ContextualTipProps {
  id: string;
  title: string;
  content: string;
  type?: 'info' | 'tip' | 'warning' | 'feature';
  level?: 'basic' | 'intermediate' | 'advanced';
  dismissible?: boolean;
  className?: string;
}

export const ContextualTip: React.FC<ContextualTipProps> = ({
  id,
  title,
  content,
  type = 'info',
  level = 'basic',
  dismissible = true,
  className = ''
}) => {
  const { state, dismissTip, shouldShowContent } = useProgressiveDisclosure();

  if (!shouldShowContent(level) || state.dismissedTips.has(id)) {
    return null;
  }

  const icons = {
    info: Info,
    tip: Lightbulb,
    warning: HelpCircle,
    feature: Star
  };

  const variants = {
    info: 'info',
    tip: 'success',
    warning: 'warning',
    feature: 'primary'
  } as const;

  const Icon = icons[type];

  return (
    <Card className={`p-md ${className}`}>
      <div className="flex items-start gap-sm">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium mb-xs">{title}</h4>
          <p className="text-sm text-muted-foreground">{content}</p>
        </div>
        {dismissible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dismissTip(id)}
            className="p-xs h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
};

// Smart Form Field Component
export interface SmartFormFieldProps {
  children: React.ReactNode;
  level?: 'basic' | 'intermediate' | 'advanced';
  helpText?: string;
  tipId?: string;
  tipContent?: string;
  className?: string;
}

export const SmartFormField: React.FC<SmartFormFieldProps> = ({
  children,
  level = 'basic',
  helpText,
  tipId,
  tipContent,
  className = ''
}) => {
  const { shouldShowContent } = useProgressiveDisclosure();

  if (!shouldShowContent(level)) {
    return null;
  }

  return (
    <div className={`space-y-sm ${className}`}>
      {children}
      {helpText && (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      )}
      {tipId && tipContent && (
        <ContextualTip
          id={tipId}
          title="Tip"
          content={tipContent}
          type="tip"
          level={level}
        />
      )}
    </div>
  );
};

// Experience Level Selector
export interface ExperienceLevelSelectorProps {
  className?: string;
}

export const ExperienceLevelSelector: React.FC<ExperienceLevelSelectorProps> = ({
  className = ''
}) => {
  const { state, updatePreferences } = useProgressiveDisclosure();

  const levels = [
    { value: 'beginner', label: 'Beginner', description: 'Show all guidance and tips' },
    { value: 'intermediate', label: 'Intermediate', description: 'Show moderate guidance' },
    { value: 'advanced', label: 'Advanced', description: 'Show minimal guidance' }
  ] as const;

  return (
    <div className={`space-y-sm ${className}`}>
      <h4 className="font-medium">Experience Level</h4>
      <div className="space-y-xs">
        {levels.map(level => (
          <label key={level.value} className="flex items-start gap-sm cursor-pointer">
            <input
              type="radio"
              name="experience-level"
              value={level.value}
              checked={state.userPreferences.experienceLevel === level.value}
              onChange={() => updatePreferences({ experienceLevel: level.value })}
              className="mt-xs"
            />
            <div>
              <div className="font-medium">{level.label}</div>
              <div className="text-sm text-muted-foreground">{level.description}</div>
            </div>
          </label>
        ))}
      </div>
      
      <div className="pt-sm border-t">
        <label className="flex items-center gap-sm cursor-pointer">
          <input
            type="checkbox"
            checked={state.userPreferences.showAdvancedOptions}
            onChange={(e: any) => updatePreferences({ showAdvancedOptions: e.target.checked })}
          />
          <span className="text-sm">Always show advanced options</span>
        </label>
      </div>
    </div>
  );
};

// Adaptive Dashboard Component
export interface AdaptiveDashboardProps {
  children: React.ReactNode;
  className?: string;
}

export const AdaptiveDashboard: React.FC<AdaptiveDashboardProps> = ({
  children,
  className = ''
}) => {
  const { state } = useProgressiveDisclosure();
  const { experienceLevel } = state.userPreferences;

  // Adjust layout based on experience level
  const gridCols = experienceLevel === 'beginner' ? 'grid-cols-1' :
                   experienceLevel === 'intermediate' ? 'grid-cols-1 md:grid-cols-2' :
                   'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid gap-md ${gridCols} ${className}`}>
      {children}
    </div>
  );
};

// Guided Tour Hook
export const useGuidedTour = (steps: Array<{
  id: string;
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}>) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const { state } = useProgressiveDisclosure();

  const startTour = () => {
    if (state.userPreferences.experienceLevel === 'beginner') {
      setIsActive(true);
      setCurrentStep(0);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      endTour();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const endTour = () => {
    setIsActive(false);
    setCurrentStep(0);
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  return {
    currentStep: steps[currentStep],
    stepIndex: currentStep,
    totalSteps: steps.length,
    isActive,
    startTour,
    nextStep,
    previousStep,
    endTour,
    goToStep
  };
};

// Smart Defaults Hook
export const useSmartDefaults = <T extends Record<string, any>>(
  baseDefaults: T,
  userHistory?: Partial<T>[]
) => {
  const { state } = useProgressiveDisclosure();
  
  const getSmartDefaults = (): T => {
    let smartDefaults = { ...baseDefaults };

    // Apply user history patterns
    if (userHistory && userHistory.length > 0) {
      const recentHistory = userHistory.slice(-5); // Last 5 entries
      
      // Find most common values for each field
      Object.keys(baseDefaults).forEach(key => {
        const values = recentHistory
          .map(entry => entry[key])
          .filter(value => value !== undefined);
        
        if (values.length > 0) {
          // Use most recent non-null value as smart default
          const mostRecent = values[values.length - 1];
          if (mostRecent !== null && mostRecent !== undefined) {
            (smartDefaults as any)[key] = mostRecent;
          }
        }
      });
    }

    // Adjust based on experience level
    if (state.userPreferences.experienceLevel === 'beginner') {
      // Provide more conservative/safe defaults for beginners
      // This would be customized based on your specific use case
    }

    return smartDefaults;
  };

  return { getSmartDefaults };
};
