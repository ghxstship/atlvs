'use client';

import { useEffect, useState, useCallback } from 'react';

interface NavigationPattern {
  from: string;
  to: string;
  count: number;
  timestamp: number;
  timeOfDay: number; // Hour of day (0-23)
  dayOfWeek: number; // Day of week (0-6)
}

interface PredictedRoute {
  path: string;
  confidence: number;
  reason: 'frequency' | 'time' | 'sequence' | 'context';
}

export class NavigationAI {
  private patterns: Map<string, NavigationPattern[]> = new Map();
  private readonly maxPatterns = 100;
  private readonly decayFactor = 0.95;
  private sequenceMemory: string[] = [];
  private readonly maxSequenceLength = 10;

  recordNavigation(from: string, to: string) {
    const now = new Date();
    const key = from;
    const patterns = this.patterns.get(key) || [];
    
    const existingIndex = patterns.findIndex(p => p.to === to);
    if (existingIndex >= 0) {
      patterns[existingIndex].count++;
      patterns[existingIndex].timestamp = Date.now();
      patterns[existingIndex].timeOfDay = now.getHours();
      patterns[existingIndex].dayOfWeek = now.getDay();
    } else {
      patterns.push({ 
        from, 
        to, 
        count: 1, 
        timestamp: Date.now(),
        timeOfDay: now.getHours(),
        dayOfWeek: now.getDay()
      });
    }
    
    // Update sequence memory
    this.sequenceMemory.push(to);
    if (this.sequenceMemory.length > this.maxSequenceLength) {
      this.sequenceMemory.shift();
    }
    
    // Sort by weighted score
    patterns.sort((a, b) => {
      const scoreA = this.calculateScore(a);
      const scoreB = this.calculateScore(b);
      return scoreB - scoreA;
    });
    
    // Keep only top patterns
    if (patterns.length > this.maxPatterns) {
      patterns.splice(this.maxPatterns);
    }
    
    this.patterns.set(key, patterns);
    this.saveToLocalStorage();
  }

  predictNextRoutes(currentPath: string, limit = 3): PredictedRoute[] {
    const predictions: PredictedRoute[] = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    
    // Get frequency-based predictions
    const patterns = this.patterns.get(currentPath) || [];
    patterns.slice(0, limit).forEach(p => {
      const score = this.calculateScore(p);
      predictions.push({
        path: p.to,
        confidence: Math.min(score / 10, 1), // Normalize to 0-1
        reason: 'frequency'
      });
    });
    
    // Add time-based predictions
    const timePatterns = this.getTimeBasedPredictions(currentHour, currentDay);
    timePatterns.forEach(p => {
      if (!predictions.find(pred => pred.path === p.path)) {
        predictions.push(p);
      }
    });
    
    // Add sequence-based predictions
    const sequencePrediction = this.getSequencePrediction();
    if (sequencePrediction && !predictions.find(p => p.path === sequencePrediction)) {
      predictions.push({
        path: sequencePrediction,
        confidence: 0.7,
        reason: 'sequence'
      });
    }
    
    // Sort by confidence and return top predictions
    return predictions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  getContextualSuggestions(userRole: string, currentProject?: string): string[] {
    const suggestions: string[] = [];
    const now = new Date();
    const hour = now.getHours();
    
    // Morning suggestions (6-10 AM)
    if (hour >= 6 && hour <= 10) {
      suggestions.push('/dashboard', '/tasks', '/calendar');
    }
    
    // Midday suggestions (11 AM - 2 PM)
    else if (hour >= 11 && hour <= 14) {
      suggestions.push('/projects', '/people', '/finance');
    }
    
    // Afternoon suggestions (2-6 PM)
    else if (hour >= 14 && hour <= 18) {
      suggestions.push('/analytics', '/reports', '/procurement');
    }
    
    // Evening suggestions (6-10 PM)
    else if (hour >= 18 && hour <= 22) {
      suggestions.push('/settings', '/profile', '/resources');
    }
    
    // Role-based suggestions
    if (userRole === 'admin' || userRole === 'owner') {
      suggestions.push('/settings', '/analytics', '/finance');
    } else if (userRole === 'manager') {
      suggestions.push('/projects', '/people', '/jobs');
    } else {
      suggestions.push('/tasks', '/calendar', '/resources');
    }
    
    // Project-based suggestions
    if (currentProject) {
      suggestions.push('/projects/tasks', '/projects/files', '/projects/schedule');
    }
    
    // Remove duplicates and return
    return [...new Set(suggestions)].slice(0, 5);
  }

  private calculateScore(pattern: NavigationPattern): number {
    const recencyScore = this.getRecencyScore(pattern.timestamp);
    const frequencyScore = Math.log(pattern.count + 1) * 2;
    const timeRelevance = this.getTimeRelevance(pattern.timeOfDay, pattern.dayOfWeek);
    
    return (frequencyScore * recencyScore * timeRelevance);
  }

  private getRecencyScore(timestamp: number): number {
    const hoursSince = (Date.now() - timestamp) / (1000 * 60 * 60);
    return Math.pow(this.decayFactor, hoursSince / 24); // Decay per day
  }

  private getTimeRelevance(recordedHour: number, recordedDay: number): number {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    
    // Calculate hour difference (circular)
    const hourDiff = Math.min(
      Math.abs(currentHour - recordedHour),
      24 - Math.abs(currentHour - recordedHour)
    );
    
    // Calculate day difference (circular)
    const dayDiff = Math.min(
      Math.abs(currentDay - recordedDay),
      7 - Math.abs(currentDay - recordedDay)
    );
    
    // Return combined relevance score
    const hourRelevance = 1 - (hourDiff / 12); // Max 12 hour difference
    const dayRelevance = 1 - (dayDiff / 3.5); // Max 3.5 day difference
    
    return (hourRelevance * 0.7 + dayRelevance * 0.3);
  }

  private getTimeBasedPredictions(hour: number, day: number): PredictedRoute[] {
    const predictions: PredictedRoute[] = [];
    
    // Analyze all patterns for time-based matches
    this.patterns.forEach((patterns, from) => {
      patterns.forEach(pattern => {
        const timeRelevance = this.getTimeRelevance(pattern.timeOfDay, pattern.dayOfWeek);
        if (timeRelevance > 0.7) {
          predictions.push({
            path: pattern.to,
            confidence: timeRelevance * 0.8,
            reason: 'time'
          });
        }
      });
    });
    
    return predictions;
  }

  private getSequencePrediction(): string | null {
    if (this.sequenceMemory.length < 3) return null;
    
    // Look for repeating sequences
    const recentSequence = this.sequenceMemory.slice(-3).join(',');
    let bestMatch: string | null = null;
    let bestScore = 0;
    
    this.patterns.forEach((patterns) => {
      patterns.forEach(pattern => {
        const sequenceMatch = this.sequenceMemory.filter(s => s === pattern.from).length;
        if (sequenceMatch > bestScore) {
          bestScore = sequenceMatch;
          bestMatch = pattern.to;
        }
      });
    });
    
    return bestMatch;
  }

  saveToLocalStorage() {
    try {
      const data = {
        patterns: Array.from(this.patterns.entries()),
        sequenceMemory: this.sequenceMemory
      };
      localStorage.setItem('nav_ai_patterns', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save navigation AI patterns', e);
    }
  }

  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('nav_ai_patterns');
      if (data) {
        const parsed = JSON.parse(data);
        this.patterns = new Map(parsed.patterns || []);
        this.sequenceMemory = parsed.sequenceMemory || [];
      }
    } catch (e) {
      console.error('Failed to load navigation AI patterns', e);
    }
  }
}

export const useNavigationAI = (currentPath?: string) => {
  const pathname = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const [ai] = useState(() => {
    const instance = new NavigationAI();
    if (typeof window !== 'undefined') {
      instance.loadFromLocalStorage();
    }
    return instance;
  });
  const [predictions, setPredictions] = useState<PredictedRoute[]>([]);
  const [lastPath, setLastPath] = useState(pathname);

  useEffect(() => {
    if (lastPath && pathname && lastPath !== pathname) {
      ai.recordNavigation(lastPath, pathname);
    }
    setLastPath(pathname);
    
    const nextPredictions = ai.predictNextRoutes(pathname);
    setPredictions(nextPredictions);
  }, [pathname, lastPath, ai]);

  const getContextualSuggestions = useCallback((userRole: string, currentProject?: string) => {
    return ai.getContextualSuggestions(userRole, currentProject);
  }, [ai]);

  return { predictions, ai, getContextualSuggestions };
};
