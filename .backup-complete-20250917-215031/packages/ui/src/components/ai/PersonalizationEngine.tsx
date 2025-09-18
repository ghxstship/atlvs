'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAdaptiveTheme } from '../providers/AdaptiveThemeProvider';

// User behavior tracking types
interface UserBehavior {
  pageViews: Record<string, number>;
  timeSpent: Record<string, number>;
  interactions: Record<string, number>;
  preferences: Record<string, any>;
  workflowPatterns: WorkflowPattern[];
  stressIndicators: StressIndicator[];
  productivityMetrics: ProductivityMetric[];
}

interface WorkflowPattern {
  id: string;
  sequence: string[];
  frequency: number;
  timeOfDay: string;
  duration: number;
  success_rate: number;
}

interface StressIndicator {
  timestamp: number;
  level: 'low' | 'medium' | 'high';
  triggers: string[];
  context: string;
}

interface ProductivityMetric {
  date: string;
  tasksCompleted: number;
  timeActive: number;
  focusScore: number;
  interruptionCount: number;
}

// AI-powered suggestions
interface PersonalizationSuggestion {
  id: string;
  type: 'layout' | 'workflow' | 'content' | 'timing' | 'automation';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  category: string;
  action: () => void;
  dismissible: boolean;
}

interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  priority: number;
  relevanceScore: number;
  lastInteraction: number;
  config: Record<string, any>;
}

interface PersonalizationContextType {
  userBehavior: UserBehavior;
  suggestions: PersonalizationSuggestion[];
  dashboardLayout: DashboardWidget[];
  isLearning: boolean;
  learningProgress: number;
  updateBehavior: (behavior: Partial<UserBehavior>) => void;
  applySuggestion: (suggestionId: string) => void;
  dismissSuggestion: (suggestionId: string) => void;
  optimizeDashboard: () => void;
  resetPersonalization: () => void;
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

// AI algorithms for personalization
class PersonalizationAI {
  private behaviorHistory: UserBehavior[] = [];
  private mlModel: any = null; // Would integrate with actual ML model

  // Analyze user behavior patterns
  analyzePatterns(behavior: UserBehavior): WorkflowPattern[] {
    const patterns: WorkflowPattern[] = [];
    
    // Detect common page sequences
    const pageSequences = this.findSequentialPatterns(behavior.pageViews);
    
    pageSequences.forEach((sequence, index) => {
      patterns.push({
        id: `pattern_${index}`,
        sequence: sequence.pages,
        frequency: sequence.count,
        timeOfDay: sequence.timeOfDay,
        duration: sequence.avgDuration,
        success_rate: sequence.successRate,
      });
    });

    return patterns;
  }

  // Find sequential patterns in page navigation
  private findSequentialPatterns(pageViews: Record<string, number>) {
    // Mock implementation - would use actual sequence mining algorithms
    const commonSequences = [
      {
        pages: ['dashboard', 'projects', 'tasks'],
        count: 15,
        timeOfDay: 'morning',
        avgDuration: 1200,
        successRate: 0.85,
      },
      {
        pages: ['finance', 'expenses', 'reports'],
        count: 8,
        timeOfDay: 'afternoon',
        avgDuration: 800,
        successRate: 0.92,
      },
    ];

    return commonSequences;
  }

  // Generate personalized suggestions
  generateSuggestions(behavior: UserBehavior): PersonalizationSuggestion[] {
    const suggestions: PersonalizationSuggestion[] = [];

    // Workflow optimization suggestions
    if (behavior.workflowPatterns.length > 0) {
      const mostCommonPattern = behavior.workflowPatterns[0];
      suggestions.push({
        id: 'workflow_shortcut',
        type: 'workflow',
        title: 'Create Workflow Shortcut',
        description: `You often navigate ${mostCommonPattern.sequence.join(' → ')}. Create a quick action?`,
        confidence: 0.85,
        impact: 'medium',
        category: 'efficiency',
        action: () => this.createWorkflowShortcut(mostCommonPattern),
        dismissible: true,
      });
    }

    // Dashboard layout suggestions
    const underutilizedWidgets = this.findUnderutilizedWidgets(behavior);
    if (underutilizedWidgets.length > 0) {
      suggestions.push({
        id: 'layout_optimize',
        type: 'layout',
        title: 'Optimize Dashboard Layout',
        description: 'Rearrange widgets based on your usage patterns for better efficiency.',
        confidence: 0.78,
        impact: 'high',
        category: 'layout',
        action: () => this.optimizeLayout(behavior),
        dismissible: true,
      });
    }

    // Stress-based suggestions
    const recentStress = behavior.stressIndicators.slice(-5);
    const highStressCount = recentStress.filter(s => s.level === 'high').length;
    
    if (highStressCount > 2) {
      suggestions.push({
        id: 'stress_reduction',
        type: 'content',
        title: 'Enable Calm Mode',
        description: 'Switch to calmer colors and reduce animations to help reduce stress.',
        confidence: 0.92,
        impact: 'high',
        category: 'wellbeing',
        action: () => this.enableCalmMode(),
        dismissible: false,
      });
    }

    // Productivity suggestions
    const avgProductivity = this.calculateAverageProductivity(behavior.productivityMetrics);
    if (avgProductivity < 0.6) {
      suggestions.push({
        id: 'focus_mode',
        type: 'automation',
        title: 'Enable Focus Mode',
        description: 'Hide distracting elements and enable focus timer based on your patterns.',
        confidence: 0.73,
        impact: 'medium',
        category: 'productivity',
        action: () => this.enableFocusMode(),
        dismissible: true,
      });
    }

    // Time-based suggestions
    const currentHour = new Date().getHours();
    if (currentHour >= 9 && currentHour <= 11) {
      const morningTasks = this.getMorningTaskSuggestions(behavior);
      if (morningTasks.length > 0) {
        suggestions.push({
          id: 'morning_tasks',
          type: 'content',
          title: 'Morning Task Suggestions',
          description: 'Based on your patterns, here are tasks you typically handle well in the morning.',
          confidence: 0.68,
          impact: 'medium',
          category: 'timing',
          action: () => this.showMorningTasks(morningTasks),
          dismissible: true,
        });
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  // Optimize dashboard layout based on usage
  optimizeDashboardLayout(behavior: UserBehavior, currentLayout: DashboardWidget[]): DashboardWidget[] {
    const optimizedLayout = [...currentLayout];

    // Sort widgets by relevance score
    optimizedLayout.forEach(widget => {
      const interactions = behavior.interactions[widget.id] || 0;
      const timeSpent = behavior.timeSpent[widget.id] || 0;
      const recency = Date.now() - widget.lastInteraction;
      
      // Calculate relevance score
      widget.relevanceScore = (
        (interactions * 0.4) +
        (timeSpent * 0.3) +
        (1 / (recency / 86400000) * 0.3) // Recency in days
      );
    });

    // Reposition widgets based on relevance
    optimizedLayout.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Apply grid positioning (top-left for highest relevance)
    optimizedLayout.forEach((widget, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      widget.position = { x: col * 300, y: row * 200 };
    });

    return optimizedLayout;
  }

  // Helper methods
  private createWorkflowShortcut(pattern: WorkflowPattern) {
    // Implementation for creating workflow shortcuts
    console.log('Creating workflow shortcut for:', pattern.sequence);
  }

  private findUnderutilizedWidgets(behavior: UserBehavior): string[] {
    return Object.entries(behavior.interactions)
      .filter(([_, count]) => count < 5)
      .map(([widgetId]) => widgetId);
  }

  private optimizeLayout(behavior: UserBehavior) {
    // Implementation for layout optimization
    console.log('Optimizing layout based on behavior');
  }

  private enableCalmMode() {
    // Implementation for calm mode
    document.dispatchEvent(new CustomEvent('enable-calm-mode'));
  }

  private enableFocusMode() {
    // Implementation for focus mode
    document.dispatchEvent(new CustomEvent('enable-focus-mode'));
  }

  private calculateAverageProductivity(metrics: ProductivityMetric[]): number {
    if (metrics.length === 0) return 0;
    const avgFocus = metrics.reduce((sum, m) => sum + m.focusScore, 0) / metrics.length;
    return avgFocus / 100; // Normalize to 0-1
  }

  private getMorningTaskSuggestions(behavior: UserBehavior): string[] {
    // Mock morning task suggestions
    return ['Review project status', 'Check team updates', 'Plan daily priorities'];
  }

  private showMorningTasks(tasks: string[]) {
    // Implementation for showing morning tasks
    console.log('Morning task suggestions:', tasks);
  }
}

const personalizationAI = new PersonalizationAI();

export function PersonalizationProvider({ children }: { children: React.ReactNode }) {
  const [userBehavior, setUserBehavior] = useState<UserBehavior>({
    pageViews: {},
    timeSpent: {},
    interactions: {},
    preferences: {},
    workflowPatterns: [],
    stressIndicators: [],
    productivityMetrics: [],
  });

  const [suggestions, setSuggestions] = useState<PersonalizationSuggestion[]>([]);
  const [dashboardLayout, setDashboardLayout] = useState<DashboardWidget[]>([]);
  const [isLearning, setIsLearning] = useState(true);
  const [learningProgress, setLearningProgress] = useState(0);

  const { theme, updateStressLevel } = useAdaptiveTheme();

  // Track page views
  useEffect(() => {
    const trackPageView = () => {
      const currentPage = window.location.pathname;
      setUserBehavior(prev => ({
        ...prev,
        pageViews: {
          ...prev.pageViews,
          [currentPage]: (prev.pageViews[currentPage] || 0) + 1,
        },
      }));
    };

    // Track initial page view
    trackPageView();

    // Track navigation changes
    const handleNavigation = () => trackPageView();
    window.addEventListener('popstate', handleNavigation);
    
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  // Track time spent on pages
  useEffect(() => {
    const startTime = Date.now();
    const currentPage = window.location.pathname;

    return () => {
      const timeSpent = Date.now() - startTime;
      setUserBehavior(prev => ({
        ...prev,
        timeSpent: {
          ...prev.timeSpent,
          [currentPage]: (prev.timeSpent[currentPage] || 0) + timeSpent,
        },
      }));
    };
  }, []);

  // Track interactions
  useEffect(() => {
    const trackInteraction = (event: Event) => {
      const target = event.target as HTMLElement;
      const elementId = target.id || target.className || 'unknown';
      
      setUserBehavior(prev => ({
        ...prev,
        interactions: {
          ...prev.interactions,
          [elementId]: (prev.interactions[elementId] || 0) + 1,
        },
      }));
    };

    document.addEventListener('click', trackInteraction);
    document.addEventListener('keydown', trackInteraction);

    return () => {
      document.removeEventListener('click', trackInteraction);
      document.removeEventListener('keydown', trackInteraction);
    };
  }, []);

  // Generate suggestions based on behavior
  useEffect(() => {
    const generateSuggestions = () => {
      const newSuggestions = personalizationAI.generateSuggestions(userBehavior);
      setSuggestions(newSuggestions);
    };

    // Generate suggestions every 5 minutes
    const interval = setInterval(generateSuggestions, 300000);
    
    // Generate initial suggestions after 30 seconds
    const timeout = setTimeout(generateSuggestions, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [userBehavior]);

  // Update learning progress
  useEffect(() => {
    const totalInteractions = Object.values(userBehavior.interactions).reduce((sum, count) => sum + count, 0);
    const progress = Math.min(totalInteractions / 100, 1); // 100 interactions = 100% learned
    setLearningProgress(progress);
    setIsLearning(progress < 1);
  }, [userBehavior.interactions]);

  // Update behavior
  const updateBehavior = useCallback((behavior: Partial<UserBehavior>) => {
    setUserBehavior(prev => ({ ...prev, ...behavior }));
  }, []);

  // Apply suggestion
  const applySuggestion = useCallback((suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (suggestion) {
      suggestion.action();
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    }
  }, [suggestions]);

  // Dismiss suggestion
  const dismissSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  }, []);

  // Optimize dashboard
  const optimizeDashboard = useCallback(() => {
    const optimizedLayout = personalizationAI.optimizeDashboardLayout(userBehavior, dashboardLayout);
    setDashboardLayout(optimizedLayout);
  }, [userBehavior, dashboardLayout]);

  // Reset personalization
  const resetPersonalization = useCallback(() => {
    setUserBehavior({
      pageViews: {},
      timeSpent: {},
      interactions: {},
      preferences: {},
      workflowPatterns: [],
      stressIndicators: [],
      productivityMetrics: [],
    });
    setSuggestions([]);
    setLearningProgress(0);
    setIsLearning(true);
  }, []);

  const contextValue: PersonalizationContextType = {
    userBehavior,
    suggestions,
    dashboardLayout,
    isLearning,
    learningProgress,
    updateBehavior,
    applySuggestion,
    dismissSuggestion,
    optimizeDashboard,
    resetPersonalization,
  };

  return (
    <PersonalizationContext.Provider value={contextValue}>
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (context === undefined) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
}

// AI Suggestion Component
interface AISuggestionProps {
  suggestion: PersonalizationSuggestion;
  onApply: () => void;
  onDismiss: () => void;
}

export function AISuggestion({ suggestion, onApply, onDismiss }: AISuggestionProps) {
  const impactColors = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    high: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {suggestion.title}
          </h4>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${impactColors[suggestion.impact]}`}>
            {suggestion.impact} impact
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {Math.round(suggestion.confidence * 100)}% confident
        </div>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        {suggestion.description}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Category: {suggestion.category}
        </div>
        <div className="flex space-x-2">
          {suggestion.dismissible && (
            <button
              onClick={onDismiss}
              className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Dismiss
            </button>
          )}
          <button
            onClick={onApply}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

// Learning Progress Indicator
export function LearningProgress() {
  const { isLearning, learningProgress } = usePersonalization();

  if (!isLearning) return null;

  return (
    <div className="fixed bottom-4 right-4 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
      <div className="flex items-center space-x-3">
        <div className="animate-pulse">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            Learning your preferences...
          </div>
          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${learningProgress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
