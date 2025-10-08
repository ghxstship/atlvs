'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

export interface Experiment {
  id: string;
  name: string;
  description: string;
  variants: string[];
  activeVariant: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate?: string;
  endDate?: string;
}

interface ExperimentContextValue {
  experiments: Record<string, Experiment>;
  getVariant: (experimentId: string) => string;
  trackExperiment: (experimentId: string, variant: string) => void;
  trackConversion: (experimentId: string, variant: string, conversionType: string, value?: number) => void;
  isLoading: boolean;
}

const ExperimentContext = createContext<ExperimentContextValue>({
  experiments: {},
  getVariant: () => 'control',
  trackExperiment: () => {},
  trackConversion: () => {},
  isLoading: true
});

export function ExperimentProvider({ children }: { children: ReactNode }) {
  const [experiments, setExperiments] = useState<Record<string, Experiment>({});
  const [isLoading, setIsLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Fetch active experiments from API
    fetch('/api/experiments')
      .then(res => res.json())
      .then(data => {
        setExperiments(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load experiments:', err);
        setIsLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getVariant = (experimentId: string): string => {
    const experiment = experiments[experimentId];
    
    // Return control if experiment doesn't exist or isn't active
    if (!experiment || experiment.status !== 'active') {
      return 'control';
    }
    
    // Check if user already has a variant assigned
    if (typeof window !== 'undefined') {
      const storedVariant = localStorage.getItem(`experiment_${experimentId}`);
      if (storedVariant && experiment.variants.includes(storedVariant)) {
        return storedVariant;
      }
      
      // Assign random variant using weighted distribution
      const variant = experiment.variants[
        Math.floor(Math.random() * experiment.variants.length)
      ];
      
      // Store variant assignment
      localStorage.setItem(`experiment_${experimentId}`, variant);
      
      // Track assignment
      trackExperiment(experimentId, variant);
      
      return variant;
    }
    
    return 'control';
  };

  const trackExperiment = (experimentId: string, variant: string) => {
    // Track to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'experiment_view', {
        experiment_id: experimentId,
        variant: variant,
        timestamp: new Date().toISOString()
      });
    }

    // Track to Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('trackCustom', 'ExperimentView', {
        experiment_id: experimentId,
        variant: variant
      });
    }

    // Send to backend for analytics
    fetch('/api/experiments/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experimentId,
        variant,
        event: 'view',
        timestamp: new Date().toISOString()
      })
    }).catch(err => console.error('Failed to track experiment:', err));
  };

  const trackConversion = (
    experimentId: string,
    variant: string,
    conversionType: string,
    value?: number
  ) => {
    // Track to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'experiment_conversion', {
        experiment_id: experimentId,
        variant: variant,
        conversion_type: conversionType,
        value: value,
        timestamp: new Date().toISOString()
      });
    }

    // Track to Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('trackCustom', 'ExperimentConversion', {
        experiment_id: experimentId,
        variant: variant,
        conversion_type: conversionType,
        value: value
      });
    }

    // Send to backend for analytics
    fetch('/api/experiments/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experimentId,
        variant,
        event: 'conversion',
        conversionType,
        value,
        timestamp: new Date().toISOString()
      })
    }).catch(err => console.error('Failed to track conversion:', err));
  };

  return (
    <ExperimentContext.Provider 
      value={{ 
        experiments, 
        getVariant, 
        trackExperiment, 
        trackConversion,
        isLoading 
      }}
    >
      {children}
    </ExperimentContext.Provider>
  );
}

// Hook for using experiments in components
export const useExperiment = (experimentId: string) => {
  const { getVariant, trackConversion, isLoading } = useContext(ExperimentContext);
  const [variant, setVariant] = useState<string>('control');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isLoading) {
      setVariant(getVariant(experimentId));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentId, getVariant, isLoading]);

  return {
    variant,
    isLoading,
    trackConversion: (conversionType: string, value?: number) => 
      trackConversion(experimentId, variant, conversionType, value)
  };
};

// Hook for accessing experiment context
export const useExperiments = () => useContext(ExperimentContext);
