'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// Mood detection based on time, user activity, and environmental factors
type MoodState = 'energetic' | 'focused' | 'calm' | 'creative' | 'analytical';
type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
type ActivityContext = 'dashboard' | 'creative' | 'analytical' | 'communication' | 'planning';

interface AdaptiveTheme {
  mood: MoodState;
  timeOfDay: TimeOfDay;
  activityContext: ActivityContext;
  ambientLight: 'bright' | 'dim' | 'auto';
  stressLevel: 'low' | 'medium' | 'high';
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
  };
}

interface AdaptiveThemeContextType {
  theme: AdaptiveTheme;
  updateMood: (mood: MoodState) => void;
  updateActivity: (activity: ActivityContext) => void;
  updateStressLevel: (level: 'low' | 'medium' | 'high') => void;
  enableAutoAdaptation: boolean;
  setEnableAutoAdaptation: (enabled: boolean) => void;
}

const AdaptiveThemeContext = createContext<AdaptiveThemeContextType | undefined>(undefined);

// Semantic token mappings for different moods and contexts
// Uses CSS custom properties that reference our design system tokens
const SEMANTIC_TOKEN_MAPPINGS = {
  energetic: {
    morning: {
      primary: 'var(--color-info-600)',
      secondary: 'var(--color-amber-500)',
      accent: 'var(--color-orange-500)',
      background: 'var(--color-background)',
      surface: 'var(--color-card)',
      text: 'var(--color-foreground)',
      muted: 'var(--color-muted-foreground)',
    },
    afternoon: {
      primary: 'var(--color-info-500)',
      secondary: 'var(--color-amber-400)',
      accent: 'var(--color-rose-500)',
      background: 'var(--color-background)',
      surface: 'var(--color-card)',
      text: 'var(--color-foreground)',
      muted: 'var(--color-muted-foreground)',
    },
    evening: {
      primary: 'var(--color-info-400)',
      secondary: 'var(--color-amber-400)',
      accent: 'var(--color-pink-400)',
      background: 'var(--color-background-dark)',
      surface: 'var(--color-card-dark)',
      text: 'var(--color-foreground-dark)',
      muted: 'var(--color-muted-foreground-dark)',
    },
    night: {
      primary: 'var(--color-info-300)',
      secondary: 'var(--color-amber-300)',
      accent: 'var(--color-pink-300)',
      background: 'var(--color-background-dark)',
      surface: 'var(--color-card-dark)',
      text: 'var(--color-foreground-dark)',
      muted: 'var(--color-muted-foreground-dark)',
    },
  },
  focused: {
    morning: {
      primary: 'var(--color-info-700)',
      secondary: 'var(--color-cyan-600)',
      accent: 'var(--color-teal-500)',
      background: 'var(--color-background)',
      surface: 'var(--color-card)',
      text: 'var(--color-foreground)',
      muted: 'var(--color-muted-foreground)',
    },
    afternoon: {
      primary: 'var(--color-info-600)',
      secondary: 'var(--color-cyan-500)',
      accent: 'var(--color-teal-400)',
      background: 'var(--color-background)',
      surface: 'var(--color-card)',
      text: 'var(--color-foreground)',
      muted: 'var(--color-muted-foreground)',
    },
    evening: {
      primary: 'var(--color-info-400)',
      secondary: 'var(--color-cyan-400)',
      accent: 'var(--color-teal-300)',
      background: 'var(--color-background-dark)',
      surface: 'var(--color-card-dark)',
      text: 'var(--color-foreground-dark)',
      muted: 'var(--color-muted-foreground-dark)',
    },
    night: {
      primary: 'var(--color-info-300)',
      secondary: 'var(--color-cyan-300)',
      accent: 'var(--color-teal-200)',
      background: 'var(--color-background-dark)',
      surface: 'var(--color-card-dark)',
      text: 'var(--color-foreground-dark)',
      muted: 'var(--color-muted-foreground-dark)',
    },
  },
  calm: {
    morning: {
      primary: 'var(--color-teal-600)',
      secondary: 'var(--color-emerald-500)',
      accent: 'var(--color-success-500)',
      background: 'var(--color-background)',
      surface: 'var(--color-card)',
      text: 'var(--color-foreground)',
      muted: 'var(--color-muted-foreground)',
    },
    afternoon: {
      primary: 'var(--color-teal-500)',
      secondary: 'var(--color-emerald-400)',
      accent: 'var(--color-success-400)',
      background: 'var(--color-background)',
      surface: 'var(--color-card)',
      text: 'var(--color-foreground)',
      muted: 'var(--color-muted-foreground)',
    },
    evening: {
      primary: 'var(--color-teal-400)',
      secondary: 'var(--color-emerald-300)',
      accent: 'var(--color-success-300)',
      background: 'var(--color-background-dark)',
      surface: 'var(--color-card-dark)',
      text: 'var(--color-foreground-dark)',
      muted: 'var(--color-muted-foreground-dark)',
    },
    night: {
      primary: 'var(--color-teal-300)',
      secondary: 'var(--color-emerald-200)',
      accent: 'var(--color-success-200)',
      background: 'var(--color-background-dark)',
      surface: 'var(--color-card-dark)',
      text: 'var(--color-foreground-dark)',
      muted: 'var(--color-muted-foreground-dark)',
    },
  },
  creative: {
    morning: {
      primary: 'var(--color-purple-600)',
      secondary: 'var(--color-pink-500)',
      accent: 'var(--color-amber-500)',
      background: 'var(--color-background)',
      surface: 'var(--color-card)',
      text: 'var(--color-foreground)',
      muted: 'var(--color-muted-foreground)',
    },
    afternoon: {
      primary: 'var(--color-purple-500)',
      secondary: 'var(--color-pink-400)',
      accent: 'var(--color-amber-400)',
      background: 'var(--color-background)',
      surface: 'var(--color-card)',
      text: 'var(--color-foreground)',
      muted: 'var(--color-muted-foreground)',
    },
    evening: {
      primary: 'var(--color-purple-400)',
      secondary: 'var(--color-pink-300)',
      accent: 'var(--color-amber-300)',
      background: 'var(--color-background-dark)',
      surface: 'var(--color-card-dark)',
      text: 'var(--color-foreground-dark)',
      muted: 'var(--color-muted-foreground-dark)',
    },
    night: {
      primary: 'var(--color-purple-300)',
      secondary: 'var(--color-pink-200)',
      accent: 'var(--color-amber-200)',
      background: 'var(--color-background-dark)',
      surface: 'var(--color-card-dark)',
      text: 'var(--color-foreground-dark)',
      muted: 'var(--color-muted-foreground-dark)',
    },
  },
  analytical: {
    morning: {
      primary: 'var(--color-indigo-600)',
      secondary: 'var(--color-violet-500)',
      accent: 'var(--color-sky-500)',
      background: 'var(--color-background)',
      surface: 'var(--color-card)',
      text: 'var(--color-foreground)',
      muted: 'var(--color-muted-foreground)',
    },
    afternoon: {
      primary: 'var(--color-indigo-500)',
      secondary: 'var(--color-violet-400)',
      accent: 'var(--color-sky-400)',
      background: 'var(--color-background)',
      surface: 'var(--color-card)',
      text: 'var(--color-foreground)',
      muted: 'var(--color-muted-foreground)',
    },
    evening: {
      primary: 'var(--color-indigo-400)',
      secondary: 'var(--color-violet-300)',
      accent: 'var(--color-sky-300)',
      background: 'var(--color-background-dark)',
      surface: 'var(--color-card-dark)',
      text: 'var(--color-foreground-dark)',
      muted: 'var(--color-muted-foreground-dark)',
    },
    night: {
      primary: 'var(--color-indigo-300)',
      secondary: 'var(--color-violet-200)',
      accent: 'var(--color-sky-200)',
      background: 'var(--color-background-dark)',
      surface: 'var(--color-card-dark)',
      text: 'var(--color-foreground-dark)',
      muted: 'var(--color-muted-foreground-dark)',
    },
  },
};

export function AdaptiveThemeProvider({ children }: { children: React.ReactNode }) {
  const [mood, setMood] = useState<MoodState>('focused');
  const [activityContext, setActivityContext] = useState<ActivityContext>('dashboard');
  const [stressLevel, setStressLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [enableAutoAdaptation, setEnableAutoAdaptation] = useState(true);
  const [ambientLight, setAmbientLight] = useState<'bright' | 'dim' | 'auto'>('auto');

  // Determine time of day
  const getTimeOfDay = useCallback((): TimeOfDay => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }, []);

  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getTimeOfDay());

  // Auto-detect mood based on activity patterns and time
  const detectMood = useCallback(() => {
    if (!enableAutoAdaptation) return;

    const currentTime = getTimeOfDay();
    const hour = new Date().getHours();

    // Morning energy boost
    if (currentTime === 'morning' && hour >= 7 && hour <= 10) {
      setMood('energetic');
    }
    // Afternoon focus period
    else if (currentTime === 'afternoon' && hour >= 13 && hour <= 16) {
      setMood('focused');
    }
    // Evening wind-down
    else if (currentTime === 'evening' && hour >= 18) {
      setMood('calm');
    }
    // Late night analytical work
    else if (currentTime === 'night' && hour >= 22) {
      setMood('analytical');
    }

    setTimeOfDay(currentTime);
  }, [enableAutoAdaptation, getTimeOfDay]);

  // Ambient light detection (mock implementation - would use actual sensors)
  const detectAmbientLight = useCallback(() => {
    if (ambientLight !== 'auto') return;

    // Mock ambient light detection based on time
    const hour = new Date().getHours();
    if (hour >= 6 && hour <= 18) {
      setAmbientLight('bright');
    } else {
      setAmbientLight('dim');
    }
  }, [ambientLight]);

  // Activity-based mood adjustment
  const adjustMoodForActivity = useCallback((activity: ActivityContext) => {
    if (!enableAutoAdaptation) return;

    switch (activity) {
      case 'creative':
        setMood('creative');
        break;
      case 'analytical':
        setMood('analytical');
        break;
      case 'communication':
        setMood('energetic');
        break;
      case 'planning':
        setMood('focused');
        break;
      default:
        // Keep current mood for dashboard
        break;
    }
  }, [enableAutoAdaptation]);

  // Generate adaptive color palette using semantic tokens
  const generateColorPalette = useCallback(() => {
    const basePalette = SEMANTIC_TOKEN_MAPPINGS[mood][timeOfDay];
    
    // For stress level adjustments, we use CSS filters and opacity
    // instead of complex color calculations
    let adjustedPalette = { ...basePalette };
    
    if (stressLevel === 'high') {
      // Use muted variants for high stress
      adjustedPalette = {
        ...adjustedPalette,
        primary: basePalette.primary.replace('var(--color-', 'var(--color-muted-'),
        accent: basePalette.accent.replace('var(--color-', 'var(--color-muted-'),
      };
    } else if (stressLevel === 'low') {
      // Use brighter variants for low stress
      adjustedPalette = {
        ...adjustedPalette,
        primary: basePalette.primary,
        accent: basePalette.accent,
      };
    }

    return adjustedPalette;
  }, [mood, timeOfDay, stressLevel]);

  // Apply theme to CSS custom properties using semantic tokens
  const applyTheme = useCallback((palette: AdaptiveTheme['colorPalette']) => {
    const root = document.documentElement;
    
    // Map adaptive theme to our semantic token system
    root.style.setProperty('--adaptive-primary', palette.primary);
    root.style.setProperty('--adaptive-secondary', palette.secondary);
    root.style.setProperty('--adaptive-accent', palette.accent);
    root.style.setProperty('--adaptive-background', palette.background);
    root.style.setProperty('--adaptive-surface', palette.surface);
    root.style.setProperty('--adaptive-text', palette.text);
    root.style.setProperty('--adaptive-muted', palette.muted);
    
    // Apply stress-level based opacity adjustments
    const stressOpacity = stressLevel === 'high' ? '0.8' : stressLevel === 'medium' ? '0.9' : '1.0';
    root.style.setProperty('--adaptive-stress-opacity', stressOpacity);
  }, [stressLevel]);

  // Initialize and update theme
  useEffect(() => {
    detectMood();
    detectAmbientLight();
    
    const interval = setInterval(() => {
      detectMood();
      detectAmbientLight();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [detectMood, detectAmbientLight]);

  // Update activity context
  useEffect(() => {
    adjustMoodForActivity(activityContext);
  }, [activityContext, adjustMoodForActivity]);

  // Apply theme when dependencies change
  useEffect(() => {
    const palette = generateColorPalette();
    applyTheme(palette);
  }, [mood, timeOfDay, stressLevel, generateColorPalette, applyTheme]);

  const theme: AdaptiveTheme = {
    mood,
    timeOfDay,
    activityContext,
    ambientLight,
    stressLevel,
    colorPalette: generateColorPalette(),
  };

  const contextValue: AdaptiveThemeContextType = {
    theme,
    updateMood: setMood,
    updateActivity: setActivityContext,
    updateStressLevel: setStressLevel,
    enableAutoAdaptation,
    setEnableAutoAdaptation,
  };

  return (
    <AdaptiveThemeContext.Provider value={contextValue}>
      {children}
    </AdaptiveThemeContext.Provider>
  );
}

export function useAdaptiveTheme() {
  const context = useContext(AdaptiveThemeContext);
  if (context === undefined) {
    throw new Error('useAdaptiveTheme must be used within an AdaptiveThemeProvider');
  }
  return context;
}

// Hook for components to register their activity context
export function useActivityContext(activity: ActivityContext) {
  const { updateActivity } = useAdaptiveTheme();
  
  useEffect(() => {
    updateActivity(activity);
    
    // Reset to dashboard when component unmounts
    return () => updateActivity('dashboard');
  }, [activity, updateActivity]);
}

// Hook for stress level detection based on user interactions
export function useStressDetection() {
  const { updateStressLevel } = useAdaptiveTheme();
  const [interactionCount, setInteractionCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  
  useEffect(() => {
    const handleClick = () => setInteractionCount(prev => prev + 1);
    const handleError = () => setErrorCount(prev => prev + 1);
    
    document.addEventListener('click', handleClick);
    window.addEventListener('error', handleError);
    
    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('error', handleError);
    };
  }, []);
  
  useEffect(() => {
    // Simple stress detection algorithm
    const recentInteractions = interactionCount;
    const recentErrors = errorCount;
    
    if (recentErrors > 3 || recentInteractions > 50) {
      updateStressLevel('high');
    } else if (recentErrors > 1 || recentInteractions > 25) {
      updateStressLevel('medium');
    } else {
      updateStressLevel('low');
    }
    
    // Reset counters every 5 minutes
    const resetInterval = setInterval(() => {
      setInteractionCount(0);
      setErrorCount(0);
    }, 300000);
    
    return () => clearInterval(resetInterval);
  }, [interactionCount, errorCount, updateStressLevel]);
}
