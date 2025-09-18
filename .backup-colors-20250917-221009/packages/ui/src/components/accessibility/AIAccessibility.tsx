'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Eye, EyeOff, Type, Contrast, Volume2, MousePointer, Zap, Brain } from 'lucide-react';
import { Button } from '../atoms/button/Button';
import { cn } from '../../lib/utils';

// AI Accessibility types
interface AccessibilityProfile {
  visualImpairment: 'none' | 'low-vision' | 'color-blind' | 'blind';
  motorImpairment: 'none' | 'limited-mobility' | 'tremor' | 'paralysis';
  cognitiveImpairment: 'none' | 'dyslexia' | 'adhd' | 'memory-issues';
  auditoryImpairment: 'none' | 'hard-of-hearing' | 'deaf';
  temporaryImpairment: 'none' | 'fatigue' | 'stress' | 'distraction';
}

interface AccessibilitySettings {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  contrast: number;
  colorFilter: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochrome';
  reducedMotion: boolean;
  highContrast: boolean;
  focusIndicators: boolean;
  screenReader: boolean;
  voiceNavigation: boolean;
  keyboardNavigation: boolean;
  clickTargetSize: number;
  autoScroll: boolean;
  readingGuide: boolean;
  contentSimplification: boolean;
}

interface AIAccessibilityContextType {
  profile: AccessibilityProfile;
  settings: AccessibilitySettings;
  adaptations: string[];
  isAnalyzing: boolean;
  updateProfile: (profile: Partial<AccessibilityProfile>) => void;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  analyzeUsage: () => void;
  applyRecommendations: () => void;
}

const AIAccessibilityContext = createContext<AIAccessibilityContextType | undefined>(undefined);

// AI-powered accessibility analyzer
class AccessibilityAnalyzer {
  private usageData: any[] = [];
  private patterns: Map<string, number> = new Map();

  analyzeUserBehavior(interactions: any[]): AccessibilityProfile {
    // Analyze interaction patterns to detect potential impairments
    const analysis = {
      visualImpairment: this.detectVisualImpairment(interactions),
      motorImpairment: this.detectMotorImpairment(interactions),
      cognitiveImpairment: this.detectCognitiveImpairment(interactions),
      auditoryImpairment: this.detectAuditoryImpairment(interactions),
      temporaryImpairment: this.detectTemporaryImpairment(interactions),
    };

    return analysis;
  }

  private detectVisualImpairment(interactions: any[]): AccessibilityProfile['visualImpairment'] {
    const zoomEvents = interactions.filter(i => i.type === 'zoom').length;
    const contrastAdjustments = interactions.filter(i => i.type === 'contrast').length;
    const fontSizeChanges = interactions.filter(i => i.type === 'font-size').length;

    if (zoomEvents > 10 || fontSizeChanges > 5) return 'low-vision';
    if (contrastAdjustments > 3) return 'color-blind';
    return 'none';
  }

  private detectMotorImpairment(interactions: any[]): AccessibilityProfile['motorImpairment'] {
    const missedClicks = interactions.filter(i => i.type === 'missed-click').length;
    const longHovers = interactions.filter(i => i.type === 'hover' && i.duration > 3000).length;
    const keyboardUsage = interactions.filter(i => i.type === 'keyboard').length;

    if (missedClicks > 20 || longHovers > 10) return 'tremor';
    if (keyboardUsage > interactions.length * 0.8) return 'limited-mobility';
    return 'none';
  }

  private detectCognitiveImpairment(interactions: any[]): AccessibilityProfile['cognitiveImpairment'] {
    const backtrackEvents = interactions.filter(i => i.type === 'backtrack').length;
    const helpRequests = interactions.filter(i => i.type === 'help').length;
    const timeOnTask = interactions.reduce((sum, i) => sum + (i.duration || 0), 0);

    if (backtrackEvents > 15 || helpRequests > 5) return 'memory-issues';
    if (timeOnTask > 300000) return 'adhd'; // 5+ minutes on simple tasks
    return 'none';
  }

  private detectAuditoryImpairment(interactions: any[]): AccessibilityProfile['auditoryImpairment'] {
    const volumeAdjustments = interactions.filter(i => i.type === 'volume').length;
    const captionRequests = interactions.filter(i => i.type === 'captions').length;

    if (captionRequests > 0 || volumeAdjustments > 5) return 'hard-of-hearing';
    return 'none';
  }

  private detectTemporaryImpairment(interactions: any[]): AccessibilityProfile['temporaryImpairment'] {
    const errorRate = interactions.filter(i => i.type === 'error').length / interactions.length;
    const timeOfDay = new Date().getHours();

    if (errorRate > 0.2) return 'fatigue';
    if (timeOfDay > 22 || timeOfDay < 6) return 'fatigue';
    return 'none';
  }

  generateRecommendations(profile: AccessibilityProfile): AccessibilitySettings {
    const base: AccessibilitySettings = {
      fontSize: 16,
      lineHeight: 1.5,
      letterSpacing: 0,
      contrast: 1,
      colorFilter: 'none',
      reducedMotion: false,
      highContrast: false,
      focusIndicators: true,
      screenReader: false,
      voiceNavigation: false,
      keyboardNavigation: false,
      clickTargetSize: 44,
      autoScroll: false,
      readingGuide: false,
      contentSimplification: false,
    };

    // Apply profile-specific recommendations
    if (profile.visualImpairment === 'low-vision') {
      base.fontSize = 20;
      base.lineHeight = 1.8;
      base.highContrast = true;
      base.contrast = 1.5;
    }

    if (profile.visualImpairment === 'color-blind') {
      base.colorFilter = 'protanopia'; // Default, would be detected more specifically
      base.highContrast = true;
    }

    if (profile.visualImpairment === 'blind') {
      base.screenReader = true;
      base.voiceNavigation = true;
      base.keyboardNavigation = true;
    }

    if (profile.motorImpairment !== 'none') {
      base.clickTargetSize = 56;
      base.keyboardNavigation = true;
      base.reducedMotion = true;
    }

    if (profile.cognitiveImpairment !== 'none') {
      base.contentSimplification = true;
      base.readingGuide = true;
      base.autoScroll = true;
      base.reducedMotion = true;
    }

    if (profile.auditoryImpairment !== 'none') {
      // Would enable captions, visual indicators, etc.
    }

    return base;
  }
}

const analyzer = new AccessibilityAnalyzer();

export function AIAccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<AccessibilityProfile>({
    visualImpairment: 'none',
    motorImpairment: 'none',
    cognitiveImpairment: 'none',
    auditoryImpairment: 'none',
    temporaryImpairment: 'none',
  });

  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 16,
    lineHeight: 1.5,
    letterSpacing: 0,
    contrast: 1,
    colorFilter: 'none',
    reducedMotion: false,
    highContrast: false,
    focusIndicators: true,
    screenReader: false,
    voiceNavigation: false,
    keyboardNavigation: false,
    clickTargetSize: 44,
    autoScroll: false,
    readingGuide: false,
    contentSimplification: false,
  });

  const [adaptations, setAdaptations] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Apply CSS custom properties for accessibility
  useEffect(() => {
    const root = document.documentElement;
    
    root.style.setProperty('--accessibility-font-size', `${settings.fontSize}px`);
    root.style.setProperty('--accessibility-line-height', settings.lineHeight.toString());
    root.style.setProperty('--accessibility-letter-spacing', `${settings.letterSpacing}px`);
    root.style.setProperty('--accessibility-contrast', settings.contrast.toString());
    root.style.setProperty('--accessibility-click-target', `${settings.clickTargetSize}px`);
    
    // Apply color filters
    if (settings.colorFilter !== 'none') {
      root.style.setProperty('--accessibility-filter', getColorFilter(settings.colorFilter));
    }
    
    // Apply high contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Apply reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [settings]);

  const getColorFilter = (filter: string): string => {
    const filters = {
      protanopia: 'url(#protanopia-filter)',
      deuteranopia: 'url(#deuteranopia-filter)',
      tritanopia: 'url(#tritanopia-filter)',
      monochrome: 'grayscale(100%)',
    };
    return filters[filter as keyof typeof filters] || 'none';
  };

  const updateProfile = useCallback((newProfile: Partial<AccessibilityProfile>) => {
    setProfile(prev => ({ ...prev, ...newProfile }));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const analyzeUsage = useCallback(async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In real implementation, would collect actual usage data
    const mockInteractions = [
      { type: 'zoom', timestamp: Date.now() },
      { type: 'font-size', timestamp: Date.now() },
      { type: 'missed-click', timestamp: Date.now() },
    ];
    
    const analyzedProfile = analyzer.analyzeUserBehavior(mockInteractions);
    setProfile(analyzedProfile);
    
    const recommendations = analyzer.generateRecommendations(analyzedProfile);
    setSettings(recommendations);
    
    // Generate adaptation descriptions
    const newAdaptations = generateAdaptationDescriptions(analyzedProfile, recommendations);
    setAdaptations(newAdaptations);
    
    setIsAnalyzing(false);
  }, []);

  const applyRecommendations = useCallback(() => {
    const recommendations = analyzer.generateRecommendations(profile);
    setSettings(recommendations);
  }, [profile]);

  const contextValue: AIAccessibilityContextType = {
    profile,
    settings,
    adaptations,
    isAnalyzing,
    updateProfile,
    updateSettings,
    analyzeUsage,
    applyRecommendations,
  };

  return (
    <AIAccessibilityContext.Provider value={contextValue}>
      {children}
    </AIAccessibilityContext.Provider>
  );
}

function generateAdaptationDescriptions(profile: AccessibilityProfile, settings: AccessibilitySettings): string[] {
  const descriptions: string[] = [];
  
  if (settings.fontSize > 16) {
    descriptions.push(`Increased font size to ${settings.fontSize}px for better readability`);
  }
  
  if (settings.highContrast) {
    descriptions.push('Enabled high contrast mode for improved visibility');
  }
  
  if (settings.keyboardNavigation) {
    descriptions.push('Enhanced keyboard navigation support');
  }
  
  if (settings.reducedMotion) {
    descriptions.push('Reduced animations and motion effects');
  }
  
  if (settings.contentSimplification) {
    descriptions.push('Simplified content presentation for easier comprehension');
  }
  
  return descriptions;
}

export function useAIAccessibility() {
  const context = useContext(AIAccessibilityContext);
  if (context === undefined) {
    throw new Error('useAIAccessibility must be used within an AIAccessibilityProvider');
  }
  return context;
}

// Accessibility control panel
export function AccessibilityPanel({ className }: { className?: string }) {
  const {
    profile,
    settings,
    adaptations,
    isAnalyzing,
    updateSettings,
    analyzeUsage,
    applyRecommendations,
  } = useAIAccessibility();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        title="Accessibility options"
      >
        <Eye className="h-4 w-4" />
        {adaptations.length > 0 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-sm w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-md z-50">
          <div className="flex items-center justify-between mb-md">
            <h3 className="text-lg font-semibold">AI Accessibility</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={analyzeUsage}
              disabled={isAnalyzing}
              className="flex items-center space-x-xs"
            >
              <Brain className={cn('h-3 w-3', isAnalyzing && 'animate-spin')} />
              <span className="text-xs">
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </span>
            </Button>
          </div>

          {/* Current adaptations */}
          {adaptations.length > 0 && (
            <div className="mb-md">
              <h4 className="text-sm font-medium mb-sm">Active Adaptations</h4>
              <div className="space-y-xs">
                {adaptations.map((adaptation, index) => (
                  <div key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-xs">
                    <Zap className="h-3 w-3 text-green-500" />
                    <span>{adaptation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick controls */}
          <div className="space-y-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm">Font Size</span>
              <div className="flex items-center space-x-sm">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSettings({ fontSize: Math.max(12, settings.fontSize - 2) })}
                >
                  <Type className="h-3 w-3" />
                  -
                </Button>
                <span className="text-xs w-8 text-center">{settings.fontSize}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSettings({ fontSize: Math.min(24, settings.fontSize + 2) })}
                >
                  <Type className="h-3 w-3" />
                  +
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">High Contrast</span>
              <Button
                variant={settings.highContrast ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateSettings({ highContrast: !settings.highContrast })}
              >
                <Contrast className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Reduced Motion</span>
              <Button
                variant={settings.reducedMotion ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
              >
                <MousePointer className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Voice Navigation</span>
              <Button
                variant={settings.voiceNavigation ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateSettings({ voiceNavigation: !settings.voiceNavigation })}
              >
                <Volume2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Apply recommendations button */}
          <Button
            onClick={applyRecommendations}
            className="w-full mt-md"
            size="sm"
          >
            Apply AI Recommendations
          </Button>
        </div>
      )}
    </div>
  );
}
