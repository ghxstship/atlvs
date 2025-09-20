'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { usePersonalization } from './PersonalizationEngine';

// Predictive UI types
interface PredictiveAction {
  id: string;
  type: 'navigation' | 'form_fill' | 'search' | 'create' | 'filter';
  confidence: number;
  context: string;
  payload: any;
  timestamp: number;
  executed: boolean;
}

interface SmartDefault {
  fieldId: string;
  value: any;
  confidence: number;
  source: 'history' | 'pattern' | 'context' | 'ai';
  reasoning: string;
}

interface ContextualSuggestion {
  id: string;
  title: string;
  description: string;
  action: () => void;
  relevance: number;
  timing: 'immediate' | 'delayed' | 'contextual';
}

interface PredictiveUIContextType {
  predictions: PredictiveAction[];
  smartDefaults: SmartDefault[];
  suggestions: ContextualSuggestion[];
  isEnabled: boolean;
  confidence: number;
  enablePredictions: (enabled: boolean) => void;
  executePrediction: (predictionId: string) => void;
  dismissPrediction: (predictionId: string) => void;
  getSmartDefault: (fieldId: string) => SmartDefault | null;
  addContextualSuggestion: (suggestion: ContextualSuggestion) => void;
}

const PredictiveUIContext = createContext<PredictiveUIContextType | undefined>(undefined);

// Predictive algorithms
class PredictiveEngine {
  private behaviorHistory: any[] = [];
  private patternCache: Map<string, any> = new Map();

  // Predict next user action based on current context
  predictNextAction(currentContext: any, userBehavior: any): PredictiveAction[] {
    const predictions: PredictiveAction[] = [];
    const currentPage = window.location.pathname;
    const timeOfDay = new Date().getHours();

    // Navigation predictions
    const navPredictions = this.predictNavigation(currentPage, userBehavior, timeOfDay);
    predictions.push(...navPredictions);

    // Form filling predictions
    const formPredictions = this.predictFormActions(currentContext, userBehavior);
    predictions.push(...formPredictions);

    // Search predictions
    const searchPredictions = this.predictSearchQueries(userBehavior);
    predictions.push(...searchPredictions);

    // Creation predictions
    const createPredictions = this.predictCreationActions(currentPage, userBehavior, timeOfDay);
    predictions.push(...createPredictions);

    return predictions.sort((a, b) => b.confidence - a.confidence);
  }

  // Predict navigation patterns
  private predictNavigation(currentPage: string, userBehavior: any, timeOfDay: number): PredictiveAction[] {
    const predictions: PredictiveAction[] = [];
    
    // Common navigation patterns based on time
    const timeBasedPatterns = {
      morning: [
        { page: '/dashboard', confidence: 0.85 },
        { page: '/projects', confidence: 0.75 },
        { page: '/people', confidence: 0.65 },
      ],
      afternoon: [
        { page: '/finance', confidence: 0.80 },
        { page: '/analytics', confidence: 0.70 },
        { page: '/reports', confidence: 0.60 },
      ],
      evening: [
        { page: '/settings', confidence: 0.75 },
        { page: '/profile', confidence: 0.65 },
        { page: '/help', confidence: 0.55 },
      ],
    };

    const timeCategory = timeOfDay < 12 ? 'morning' : timeOfDay < 17 ? 'afternoon' : 'evening';
    const patterns = timeBasedPatterns[timeCategory];

    patterns.forEach((pattern, index) => {
      if (pattern.page !== currentPage) {
        predictions.push({
          id: `nav_${pattern.page}_${Date.now()}`,
          type: 'navigation',
          confidence: pattern.confidence * (userBehavior.pageViews[pattern.page] || 0.1),
          context: `Time-based navigation pattern for ${timeCategory}`,
          payload: { destination: pattern.page },
          timestamp: Date.now(),
          executed: false,
        });
      }
    });

    // Sequential navigation patterns
    const sequentialPatterns = this.getSequentialPatterns(currentPage, userBehavior);
    sequentialPatterns.forEach(pattern => {
      predictions.push({
        id: `seq_${pattern.next}_${Date.now()}`,
        type: 'navigation',
        confidence: pattern.confidence,
        context: `Sequential pattern: ${currentPage} → ${pattern.next}`,
        payload: { destination: pattern.next },
        timestamp: Date.now(),
        executed: false,
      });
    });

    return predictions;
  }

  // Predict form filling actions
  private predictFormActions(currentContext: any, userBehavior: any): PredictiveAction[] {
    const predictions: PredictiveAction[] = [];
    
    // Detect forms on current page
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, select, textarea');
      
      inputs.forEach(input => {
        const element = input as HTMLInputElement;
        const fieldName = element.name || element.id;
        
        if (fieldName && !element.value) {
          const predictedValue = this.predictFieldValue(fieldName, userBehavior);
          
          if (predictedValue) {
            predictions.push({
              id: `form_${fieldName}_${Date.now()}`,
              type: 'form_fill',
              confidence: predictedValue.confidence,
              context: `Auto-fill ${fieldName} based on ${predictedValue.source}`,
              payload: { 
                fieldName, 
                value: predictedValue.value,
                element: element 
              },
              timestamp: Date.now(),
              executed: false,
            });
          }
        }
      });
    });

    return predictions;
  }

  // Predict search queries
  private predictSearchQueries(userBehavior: any): PredictiveAction[] {
    const predictions: PredictiveAction[] = [];
    
    // Common search patterns based on current context
    const searchPatterns = [
      { query: 'recent projects', confidence: 0.70, context: 'Frequently searched' },
      { query: 'team members', confidence: 0.65, context: 'Common lookup' },
      { query: 'pending tasks', confidence: 0.60, context: 'Status check' },
    ];

    searchPatterns.forEach(pattern => {
      predictions.push({
        id: `search_${pattern.query}_${Date.now()}`,
        type: 'search',
        confidence: pattern.confidence,
        context: pattern.context,
        payload: { query: pattern.query },
        timestamp: Date.now(),
        executed: false,
      });
    });

    return predictions;
  }

  // Predict creation actions
  private predictCreationActions(currentPage: string, userBehavior: any, timeOfDay: number): PredictiveAction[] {
    const predictions: PredictiveAction[] = [];
    
    // Context-based creation suggestions
    const creationPatterns = {
      '/projects': [
        { action: 'create-project', confidence: 0.75, context: 'Common action on projects page' },
        { action: 'create-task', confidence: 0.65, context: 'Task creation pattern' },
      ],
      '/people': [
        { action: 'create-person', confidence: 0.70, context: 'Adding team members' },
        { action: 'create-role', confidence: 0.55, context: 'Role management' },
      ],
      '/finance': [
        { action: 'create-expense', confidence: 0.80, context: 'Expense tracking' },
        { action: 'create-invoice', confidence: 0.60, context: 'Billing workflow' },
      ],
    };

    const patterns = creationPatterns[currentPage] || [];
    
    patterns.forEach(pattern => {
      predictions.push({
        id: `create_${pattern.action}_${Date.now()}`,
        type: 'create',
        confidence: pattern.confidence,
        context: pattern.context,
        payload: { action: pattern.action },
        timestamp: Date.now(),
        executed: false,
      });
    });

    return predictions;
  }

  // Generate smart defaults for form fields
  generateSmartDefaults(userBehavior: any): SmartDefault[] {
    const defaults: SmartDefault[] = [];
    
    // Common field patterns
    const fieldPatterns = {
      'project_status': { value: 'active', confidence: 0.85, source: 'pattern', reasoning: 'Most projects start as active' },
      'priority': { value: 'medium', confidence: 0.75, source: 'pattern', reasoning: 'Medium priority is most common' },
      'currency': { value: 'USD', confidence: 0.90, source: 'context', reasoning: 'Default organization currency' },
      'due_date': { value: this.getDefaultDueDate(), confidence: 0.70, source: 'ai', reasoning: 'Typical project timeline' },
      'assignee': { value: this.getMostLikelyAssignee(userBehavior), confidence: 0.65, source: 'history', reasoning: 'Frequent collaborator' },
    };

    Object.entries(fieldPatterns).forEach(([fieldId, pattern]) => {
      defaults.push({
        fieldId,
        value: pattern.value,
        confidence: pattern.confidence,
        source: pattern.source as any,
        reasoning: pattern.reasoning,
      });
    });

    return defaults;
  }

  // Helper methods
  private getSequentialPatterns(currentPage: string, userBehavior: any) {
    // Mock sequential patterns - would analyze actual navigation history
    const patterns = {
      '/dashboard': [
        { next: '/projects', confidence: 0.80 },
        { next: '/people', confidence: 0.65 },
      ],
      '/projects': [
        { next: '/projects/tasks', confidence: 0.75 },
        { next: '/people', confidence: 0.60 },
      ],
      '/finance': [
        { next: '/finance/expenses', confidence: 0.85 },
        { next: '/analytics', confidence: 0.55 },
      ],
    };

    return patterns[currentPage] || [];
  }

  private predictFieldValue(fieldName: string, userBehavior: any) {
    // Mock field value prediction - would use ML model
    const commonValues = {
      'name': { value: 'New Project', confidence: 0.60, source: 'pattern' },
      'email': { value: 'user@company.com', confidence: 0.85, source: 'history' },
      'phone': { value: '+1 (555) 123-4567', confidence: 0.70, source: 'history' },
      'company': { value: 'GHXSTSHIP', confidence: 0.90, source: 'context' },
    };

    return commonValues[fieldName] || null;
  }

  private getDefaultDueDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 14); // 2 weeks from now
    return date.toISOString().split('T')[0];
  }

  private getMostLikelyAssignee(userBehavior: any): string {
    // Would analyze collaboration patterns
    return 'current-user';
  }
}

const predictiveEngine = new PredictiveEngine();

export function PredictiveUIProvider({ children }: { children: React.ReactNode }) {
  const [predictions, setPredictions] = useState<PredictiveAction[]>([]);
  const [smartDefaults, setSmartDefaults] = useState<SmartDefault[]>([]);
  const [suggestions, setSuggestions] = useState<ContextualSuggestion[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [confidence, setConfidence] = useState(0.75);

  const { userBehavior } = usePersonalization();
  const predictionIntervalRef = useRef<NodeJS.Timeout>();

  // Generate predictions periodically
  useEffect(() => {
    if (!isEnabled) return;

    const generatePredictions = () => {
      const currentContext = {
        page: window.location.pathname,
        time: new Date().getHours(),
        activeElements: document.activeElement,
      };

      const newPredictions = predictiveEngine.predictNextAction(currentContext, userBehavior);
      const filteredPredictions = newPredictions.filter(p => p.confidence >= confidence);
      
      setPredictions(filteredPredictions);
    };

    // Generate initial predictions
    generatePredictions();

    // Update predictions every 30 seconds
    predictionIntervalRef.current = setInterval(generatePredictions, 30000);

    return () => {
      if (predictionIntervalRef.current) {
        clearInterval(predictionIntervalRef.current);
      }
    };
  }, [isEnabled, confidence, userBehavior]);

  // Generate smart defaults
  useEffect(() => {
    if (!isEnabled) return;

    const defaults = predictiveEngine.generateSmartDefaults(userBehavior);
    setSmartDefaults(defaults);
  }, [isEnabled, userBehavior]);

  // Auto-execute high-confidence predictions
  useEffect(() => {
    predictions.forEach(prediction => {
      if (prediction.confidence > 0.9 && !prediction.executed && prediction.type === 'form_fill') {
        // Auto-execute very high confidence form fills
        executePrediction(prediction.id);
      }
    });
  }, [predictions]);

  const enablePredictions = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    if (!enabled) {
      setPredictions([]);
      setSuggestions([]);
    }
  }, []);

  const executePrediction = useCallback((predictionId: string) => {
    const prediction = predictions.find(p => p.id === predictionId);
    if (!prediction) return;

    switch (prediction.type) {
      case 'navigation':
        window.location.href = prediction.payload.destination;
        break;
      
      case 'form_fill':
        const element = prediction.payload.element as HTMLInputElement;
        if (element) {
          element.value = prediction.payload.value;
          element.dispatchEvent(new Event('input', { bubbles: true }));
        }
        break;
      
      case 'search':
        const searchEvent = new CustomEvent('predictive-search', {
          detail: { query: prediction.payload.query }
        });
        window.dispatchEvent(searchEvent);
        break;
      
      case 'create':
        const createEvent = new CustomEvent('predictive-create', {
          detail: { action: prediction.payload.action }
        });
        window.dispatchEvent(createEvent);
        break;
    }

    // Mark as executed
    setPredictions(prev => 
      prev.map(p => p.id === predictionId ? { ...p, executed: true } : p)
    );
  }, [predictions]);

  const dismissPrediction = useCallback((predictionId: string) => {
    setPredictions(prev => prev.filter(p => p.id !== predictionId));
  }, []);

  const getSmartDefault = useCallback((fieldId: string): SmartDefault | null => {
    return smartDefaults.find(d => d.fieldId === fieldId) || null;
  }, [smartDefaults]);

  const addContextualSuggestion = useCallback((suggestion: ContextualSuggestion) => {
    setSuggestions(prev => [...prev, suggestion]);
  }, []);

  const contextValue: PredictiveUIContextType = {
    predictions,
    smartDefaults,
    suggestions,
    isEnabled,
    confidence,
    enablePredictions,
    executePrediction,
    dismissPrediction,
    getSmartDefault,
    addContextualSuggestion,
  };

  return (
    <PredictiveUIContext.Provider value={contextValue}>
      {children}
    </PredictiveUIContext.Provider>
  );
}

export function usePredictiveUI() {
  const context = useContext(PredictiveUIContext);
  if (context === undefined) {
    throw new Error('usePredictiveUI must be used within a PredictiveUIProvider');
  }
  return context;
}

// Predictive suggestions overlay
export function PredictiveSuggestions() {
  const { predictions, executePrediction, dismissPrediction, isEnabled } = usePredictiveUI();

  if (!isEnabled || predictions.length === 0) return null;

  const topPredictions = predictions.slice(0, 3);

  return (
    <div className="fixed top-20 right-4 z-50 space-y-sm">
      {topPredictions.map(prediction => (
        <div
          key={prediction.id}
          className="bg-card border border-border rounded-lg shadow-floating p-sm max-w-sm animate-slide-in-right"
        >
          <div className="flex items-start justify-between mb-sm">
            <div className="flex items-center space-x-sm">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-sm font-medium text-foreground">
                Suggestion
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {Math.round(prediction.confidence * 100)}%
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-sm">
            {prediction.context}
          </p>
          
          <div className="flex space-x-sm">
            <button
              onClick={() => executePrediction(prediction.id)}
              className="px-sm py-xs text-xs bg-accent text-accent-foreground rounded hover:bg-accent/90"
            >
              Apply
            </button>
            <button
              onClick={() => dismissPrediction(prediction.id)}
              className="px-sm py-xs text-xs text-muted-foreground/70 dark:text-muted-foreground/50 hover:text-muted-foreground/90 dark:hover:text-muted-foreground/30"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Smart form field with predictive defaults
interface SmartFieldProps {
  fieldId: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function SmartField({ fieldId, type = 'text', placeholder, value, onChange, className }: SmartFieldProps) {
  const { getSmartDefault } = usePredictiveUI();
  const [fieldValue, setFieldValue] = useState(value || '');
  const [showSuggestion, setShowSuggestion] = useState(false);
  
  const smartDefault = getSmartDefault(fieldId);

  useEffect(() => {
    if (!fieldValue && smartDefault && smartDefault.confidence > 0.7) {
      setShowSuggestion(true);
    }
  }, [fieldValue, smartDefault]);

  const applySuggestion = () => {
    if (smartDefault) {
      setFieldValue(smartDefault.value);
      onChange?.(smartDefault.value);
      setShowSuggestion(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setFieldValue(newValue);
    onChange?.(newValue);
    setShowSuggestion(false);
  };

  return (
    <div className="relative">
      <input
        type={type}
        value={fieldValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
      />
      
      {showSuggestion && smartDefault && (
        <div className="absolute top-full left-0 right-0 mt-xs p-sm bg-accent/10 border border-primary/20 rounded text-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-accent">
                Suggested: {smartDefault.value}
              </span>
              <div className="text-xs text-accent dark:text-accent">
                {smartDefault.reasoning}
              </div>
            </div>
            <button
              onClick={applySuggestion}
              className="px-sm py-xs text-xs bg-accent text-accent-foreground rounded hover:bg-accent/90"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Contextual action suggestions
export function ContextualActions() {
  const { suggestions } = usePredictiveUI();

  if (suggestions.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div className="bg-card border border-border rounded-lg shadow-floating p-md max-w-sm">
        <h4 className="text-sm font-medium text-foreground mb-sm">
          Suggested Actions
        </h4>
        
        <div className="space-y-xs">
          {suggestions.slice(0, 3).map(suggestion => (
            <button
              key={suggestion.id}
              onClick={suggestion.action}
              className="w-full text-left p-sm text-sm text-foreground hover:bg-muted rounded"
            >
              <div className="font-medium">{suggestion.title}</div>
              <div className="text-xs text-muted-foreground">
                {suggestion.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
