'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Zap, TrendingUp, Clock, Star } from 'lucide-react';

// 2026 AI-Powered Sidebar Personalization
// Adaptive UI with machine learning insights

interface PersonalizationInsight {
  type: 'frequent' | 'trending' | 'suggested' | 'time-based';
  itemId: string;
  confidence: number;
  reason: string;
  action: 'promote' | 'suggest' | 'reorder' | 'highlight';
}

interface UserBehaviorPattern {
  timeOfDay: number[];
  dayOfWeek: number[];
  sessionDuration: number;
  clickPatterns: string[];
  searchQueries: string[];
}

interface SidebarPersonalizationProps {
  userId: string;
  navigationData: any[];
  onInsightApplied?: (insight: PersonalizationInsight) => void;
}

export const SidebarPersonalization: React.FC<SidebarPersonalizationProps> = ({
  userId,
  navigationData,
  onInsightApplied,
}) => {
  const [insights, setInsights] = useState<PersonalizationInsight[]>([]);
  const [userPatterns, setUserPatterns] = useState<UserBehaviorPattern | null>(null);
  const [isLearning, setIsLearning] = useState(false);

  // AI-powered behavior analysis
  useEffect(() => {
    const analyzeUserBehavior = async () => {
      setIsLearning(true);
      
      // Simulate AI analysis (in production, this would call your ML service)
      const mockAnalysis = await new Promise<PersonalizationInsight[]>(resolve => {
        setTimeout(() => {
          const currentHour = new Date().getHours();
          const currentDay = new Date().getDay();
          
          const insights: PersonalizationInsight[] = [];
          
          // Time-based insights
          if (currentHour >= 9 && currentHour <= 11) {
            insights.push({
              type: 'time-based',
              itemId: 'analytics',
              confidence: 0.85,
              reason: 'Users typically check analytics in the morning',
              action: 'promote',
            });
          }
          
          if (currentDay === 5) { // Friday
            insights.push({
              type: 'time-based',
              itemId: 'finance',
              confidence: 0.78,
              reason: 'Finance tasks are common on Fridays',
              action: 'highlight',
            });
          }
          
          // Trending insights
          insights.push({
            type: 'trending',
            itemId: 'pipeline',
            confidence: 0.92,
            reason: 'High activity in pipeline management this week',
            action: 'promote',
          });
          
          // Suggested workflow
          insights.push({
            type: 'suggested',
            itemId: 'procurement',
            confidence: 0.67,
            reason: 'Often accessed after pipeline activities',
            action: 'suggest',
          });
          
          resolve(insights);
        }, 1000);
      });
      
      setInsights(mockAnalysis);
      setIsLearning(false);
    };

    analyzeUserBehavior();
  }, [userId]);

  // Apply personalization insights
  const applyInsight = (insight: PersonalizationInsight) => {
    onInsightApplied?.(insight);
    
    // Remove applied insight
    setInsights(prev => prev.filter(i => i !== insight));
  };

  // Render insight suggestions
  const renderInsights = () => {
    if (insights.length === 0) return null;

    return (
      <div className="mx-3 mt-3 mb-2 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            AI Insights
          </span>
        </div>
        
        <div className="space-y-2">
          {insights.slice(0, 2).map((insight, index) => (
            <div
              key={index}
              className="flex items-start justify-between p-2.5 bg-card/80 rounded-md border border-border/50 backdrop-blur-sm"
            >
              <div className="flex items-start gap-2 flex-1 min-w-0">
                {insight.type === 'trending' && <TrendingUp className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />}
                {insight.type === 'time-based' && <Clock className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />}
                {insight.type === 'frequent' && <Zap className="h-3 w-3 text-warning mt-0.5 flex-shrink-0" />}
                {insight.type === 'suggested' && <Star className="h-3 w-3 text-secondary mt-0.5 flex-shrink-0" />}
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {insight.reason}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="h-1.5 bg-muted rounded-full flex-1">
                      <div
                        className="h-1.5 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
                        style={{ width: `${insight.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {Math.round(insight.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => applyInsight(insight)}
                className="ml-2 px-2.5 py-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors duration-200 font-medium flex-shrink-0"
              >
                Apply
              </button>
            </div>
          ))}
        </div>
        
        {isLearning && (
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <div className="animate-spin h-3 w-3 border border-primary border-t-transparent rounded-full" />
            <span>Learning your patterns...</span>
          </div>
        )}
      </div>
    );
  };

  return renderInsights();
};

// Smart reordering hook
export const useSmartReordering = (items: any[], userId: string) => {
  const [reorderedItems, setReorderedItems] = useState(items);
  
  useEffect(() => {
    // AI-powered reordering logic
    const reorderItems = () => {
      const currentHour = new Date().getHours();
      const currentDay = new Date().getDay();
      
      const scored = items.map(item => {
        let score = 0;
        
        // Time-based scoring
        if (item.id === 'analytics' && currentHour >= 9 && currentHour <= 11) score += 10;
        if (item.id === 'finance' && currentDay === 5) score += 8;
        if (item.id === 'dashboard' && currentHour >= 8 && currentHour <= 10) score += 5;
        
        // Usage pattern scoring (mock data)
        const usageFrequency = Math.random() * 10;
        score += usageFrequency;
        
        return { ...item, aiScore: score };
      });
      
      // Sort by AI score, but keep pinned items at top
      const pinned = scored.filter(item => item.isPinned);
      const unpinned = scored.filter(item => !item.isPinned).sort((a, b) => b.aiScore - a.aiScore);
      
      setReorderedItems([...pinned, ...unpinned]);
    };
    
    reorderItems();
  }, [items, userId]);
  
  return reorderedItems;
};

// Adaptive shortcuts
export const useAdaptiveShortcuts = (userId: string) => {
  const [shortcuts, setShortcuts] = useState<string[]>([]);
  
  useEffect(() => {
    // Generate adaptive shortcuts based on user behavior
    const generateShortcuts = () => {
      const currentHour = new Date().getHours();
      const adaptiveShortcuts: string[] = [];
      
      if (currentHour >= 9 && currentHour <= 11) {
        adaptiveShortcuts.push('analytics', 'dashboard');
      }
      
      if (currentHour >= 14 && currentHour <= 16) {
        adaptiveShortcuts.push('pipeline', 'procurement');
      }
      
      setShortcuts(adaptiveShortcuts);
    };
    
    generateShortcuts();
    
    // Update shortcuts every hour
    const interval = setInterval(generateShortcuts, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId]);
  
  return shortcuts;
};

export default SidebarPersonalization;
