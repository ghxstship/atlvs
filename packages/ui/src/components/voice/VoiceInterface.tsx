'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings, Zap } from 'lucide-react';
import { Button } from '../atoms/button/Button';
import { cn } from '../../lib/utils';
import { useMicroInteraction } from '../micro-interactions/MicroInteractions';
import { useAdaptiveTheme } from '../providers/AdaptiveThemeProvider';

// Voice interface types
interface VoiceCommand {
  phrase: string;
  action: string;
  parameters?: Record<string, any>;
  context?: string[];
  confidence: number;
}

interface VoiceResponse {
  text: string;
  action?: string;
  data?: any;
  emotion?: 'neutral' | 'happy' | 'concerned' | 'excited';
}

interface VoiceContextType {
  isListening: boolean;
  isEnabled: boolean;
  currentCommand: string;
  lastResponse: VoiceResponse | null;
  confidence: number;
  language: string;
  voiceSettings: VoiceSettings;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string, emotion?: VoiceResponse['emotion']) => void;
  executeCommand: (command: string) => void;
  updateSettings: (settings: Partial<VoiceSettings>) => void;
}

interface VoiceSettings {
  wakeWord: string;
  continuousListening: boolean;
  voiceSpeed: number;
  voicePitch: number;
  voiceVolume: number;
  preferredVoice: string;
  contextAwareness: boolean;
  smartSuggestions: boolean;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

// Advanced voice command processor
class VoiceCommandProcessor {
  private commands: Map<string, VoiceCommand> = new Map();
  private contextHistory: string[] = [];
  private nlpModel: any = null; // Would integrate with actual NLP model

  constructor() {
    this.initializeCommands();
  }

  // Initialize comprehensive command set
  private initializeCommands() {
    const commands: VoiceCommand[] = [
      // Navigation commands
      { phrase: 'go to dashboard', action: 'navigate', parameters: { route: '/dashboard' }, confidence: 0.95 },
      { phrase: 'open projects', action: 'navigate', parameters: { route: '/projects' }, confidence: 0.95 },
      { phrase: 'show me people', action: 'navigate', parameters: { route: '/people' }, confidence: 0.90 },
      { phrase: 'view finance', action: 'navigate', parameters: { route: '/finance' }, confidence: 0.90 },
      { phrase: 'check analytics', action: 'navigate', parameters: { route: '/analytics' }, confidence: 0.85 },
      
      // Creation commands
      { phrase: 'create new project', action: 'create', parameters: { type: 'project' }, confidence: 0.90 },
      { phrase: 'add team member', action: 'create', parameters: { type: 'person' }, confidence: 0.85 },
      { phrase: 'new expense', action: 'create', parameters: { type: 'expense' }, confidence: 0.90 },
      { phrase: 'create invoice', action: 'create', parameters: { type: 'invoice' }, confidence: 0.85 },
      { phrase: 'schedule meeting', action: 'create', parameters: { type: 'meeting' }, confidence: 0.80 },
      
      // Search commands
      { phrase: 'search for *', action: 'search', parameters: {}, confidence: 0.85 },
      { phrase: 'find *', action: 'search', parameters: {}, confidence: 0.80 },
      { phrase: 'look up *', action: 'search', parameters: {}, confidence: 0.75 },
      
      // Data commands
      { phrase: 'show me recent projects', action: 'filter', parameters: { type: 'projects', filter: 'recent' }, confidence: 0.85 },
      { phrase: 'display active tasks', action: 'filter', parameters: { type: 'tasks', filter: 'active' }, confidence: 0.80 },
      { phrase: 'list pending expenses', action: 'filter', parameters: { type: 'expenses', filter: 'pending' }, confidence: 0.80 },
      
      // Interface commands
      { phrase: 'switch to dark mode', action: 'theme', parameters: { mode: 'dark' }, confidence: 0.90 },
      { phrase: 'enable light mode', action: 'theme', parameters: { mode: 'light' }, confidence: 0.90 },
      { phrase: 'increase text size', action: 'accessibility', parameters: { action: 'increase-font' }, confidence: 0.85 },
      { phrase: 'reduce animations', action: 'accessibility', parameters: { action: 'reduce-motion' }, confidence: 0.80 },
      
      // Workflow commands
      { phrase: 'save current work', action: 'save', parameters: {}, confidence: 0.95 },
      { phrase: 'undo last action', action: 'undo', parameters: {}, confidence: 0.90 },
      { phrase: 'export data', action: 'export', parameters: {}, confidence: 0.85 },
      { phrase: 'backup project', action: 'backup', parameters: {}, confidence: 0.80 },
      
      // Help commands
      { phrase: 'what can I say', action: 'help', parameters: { type: 'commands' }, confidence: 0.95 },
      { phrase: 'help me with *', action: 'help', parameters: {}, confidence: 0.80 },
      { phrase: 'show keyboard shortcuts', action: 'help', parameters: { type: 'shortcuts' }, confidence: 0.85 },
      
      // Status commands
      { phrase: 'what\'s my schedule', action: 'status', parameters: { type: 'schedule' }, confidence: 0.85 },
      { phrase: 'show notifications', action: 'status', parameters: { type: 'notifications' }, confidence: 0.90 },
      { phrase: 'check system status', action: 'status', parameters: { type: 'system' }, confidence: 0.80 },
    ];

    commands.forEach(cmd => {
      this.commands.set(cmd.phrase, cmd);
    });
  }

  // Process natural language input
  processCommand(input: string, context: string[]): VoiceCommand | null {
    const normalizedInput = input.toLowerCase().trim();
    
    // Direct phrase matching
    const directMatch = this.commands.get(normalizedInput);
    if (directMatch) {
      return directMatch;
    }

    // Wildcard matching
    for (const [phrase, command] of this.commands.entries()) {
      if (phrase.includes('*')) {
        const pattern = phrase.replace('*', '(.+)');
        const regex = new RegExp(`^${pattern}$`, 'i');
        const match = normalizedInput.match(regex);
        
        if (match) {
          const extractedParam = match[1]?.trim();
          return {
            ...command,
            parameters: { ...command.parameters, query: extractedParam },
          };
        }
      }
    }

    // Fuzzy matching for similar phrases
    const fuzzyMatch = this.findFuzzyMatch(normalizedInput);
    if (fuzzyMatch && fuzzyMatch.confidence > 0.6) {
      return fuzzyMatch;
    }

    // Context-aware interpretation
    const contextMatch = this.interpretWithContext(normalizedInput, context);
    if (contextMatch) {
      return contextMatch;
    }

    return null;
  }

  // Fuzzy string matching
  private findFuzzyMatch(input: string): VoiceCommand | null {
    let bestMatch: VoiceCommand | null = null;
    let bestScore = 0;

    for (const [phrase, command] of this.commands.entries()) {
      const score = this.calculateSimilarity(input, phrase);
      if (score > bestScore && score > 0.6) {
        bestScore = score;
        bestMatch = { ...command, confidence: score };
      }
    }

    return bestMatch;
  }

  // Calculate string similarity
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  // Levenshtein distance calculation
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Context-aware interpretation
  private interpretWithContext(input: string, context: string[]): VoiceCommand | null {
    const currentPage = context[context.length - 1] || '';
    
    // Page-specific interpretations
    if (currentPage.includes('/projects')) {
      if (input.includes('create') || input.includes('new')) {
        return {
          phrase: input,
          action: 'create',
          parameters: { type: 'project' },
          confidence: 0.75,
        };
      }
    }
    
    if (currentPage.includes('/people')) {
      if (input.includes('add') || input.includes('invite')) {
        return {
          phrase: input,
          action: 'create',
          parameters: { type: 'person' },
          confidence: 0.75,
        };
      }
    }
    
    return null;
  }

  // Update context history
  updateContext(context: string) {
    this.contextHistory.push(context);
    if (this.contextHistory.length > 10) {
      this.contextHistory.shift();
    }
  }
}

// Advanced text-to-speech with emotions
class EmotionalTTS {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();
    
    if (this.voices.length === 0) {
      // Voices might not be loaded yet
      this.synth.addEventListener('voiceschanged', () => {
        this.voices = this.synth.getVoices();
      });
    }
  }

  speak(text: string, settings: VoiceSettings, emotion: VoiceResponse['emotion'] = 'neutral') {
    if (this.currentUtterance) {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply emotional modulation
    const emotionSettings = this.getEmotionSettings(emotion);
    
    utterance.rate = settings.voiceSpeed * emotionSettings.rateMultiplier;
    utterance.pitch = settings.voicePitch * emotionSettings.pitchMultiplier;
    utterance.volume = settings.voiceVolume;
    
    // Select appropriate voice
    const preferredVoice = this.voices.find(voice => 
      voice.name.includes(settings.preferredVoice) || 
      voice.lang.startsWith(navigator.language)
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  private getEmotionSettings(emotion: VoiceResponse['emotion']) {
    const settings = {
      neutral: { rateMultiplier: 1.0, pitchMultiplier: 1.0 },
      happy: { rateMultiplier: 1.1, pitchMultiplier: 1.2 },
      concerned: { rateMultiplier: 0.9, pitchMultiplier: 0.8 },
      excited: { rateMultiplier: 1.2, pitchMultiplier: 1.3 },
    };
    
    return settings[emotion] || settings.neutral;
  }

  stop() {
    this.synth.cancel();
    this.currentUtterance = null;
  }
}

const commandProcessor = new VoiceCommandProcessor();
const emotionalTTS = new EmotionalTTS();

export function VoiceInterfaceProvider({ children }: { children: React.ReactNode }) {
  const [isListening, setIsListening] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [currentCommand, setCurrentCommand] = useState('');
  const [lastResponse, setLastResponse] = useState<VoiceResponse | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [language, setLanguage] = useState('en-US');
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    wakeWord: 'hey ghxstship',
    continuousListening: false,
    voiceSpeed: 1.0,
    voicePitch: 1.0,
    voiceVolume: 0.8,
    preferredVoice: 'default',
    contextAwareness: true,
    smartSuggestions: true,
  });

  const recognitionRef = useRef<any>(null);
  const { updateActivity } = useAdaptiveTheme();
  const { trigger } = useMicroInteraction();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;
        
        recognition.continuous = voiceSettings.continuousListening;
        recognition.interimResults = true;
        recognition.lang = language;
        recognition.maxAlternatives = 3;

        recognition.addEventListener('start', () => {
          setIsListening(true);
          updateActivity('communication');
          trigger({
            haptic: 'light',
            sound: 'notification',
            animation: 'pulse',
            intensity: 'subtle',
          });
        });

        recognition.addEventListener('end', () => {
          setIsListening(false);
          setCurrentCommand('');
        });

        recognition.addEventListener('result', (event: any) => {
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript;
            const confidenceScore = result[0].confidence;
            
            if (result.isFinal) {
              finalTranscript = transcript;
              setConfidence(confidenceScore);
              processVoiceCommand(transcript);
            } else {
              setCurrentCommand(transcript);
            }
          }
        });

        recognition.addEventListener('error', (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          const errorResponse: VoiceResponse = {
            text: `Sorry, I didn't catch that. ${event.error === 'no-speech' ? 'Please try speaking again.' : 'There was an issue with voice recognition.'}`,
            emotion: 'concerned',
          };
          
          setLastResponse(errorResponse);
          speak(errorResponse.text, errorResponse.emotion);
        });
      }
    }
  }, [language, voiceSettings.continuousListening]);

  // Process voice commands
  const processVoiceCommand = useCallback((transcript: string) => {
    const context = [window.location.pathname];
    commandProcessor.updateContext(context[0]);
    
    const command = commandProcessor.processCommand(transcript, context);
    
    if (command) {
      executeVoiceCommand(command);
    } else {
      const response: VoiceResponse = {
        text: "I'm not sure how to help with that. Try saying 'what can I say' to see available commands.",
        emotion: 'concerned',
      };
      
      setLastResponse(response);
      speak(response.text, response.emotion);
    }
  }, []);

  // Execute voice commands
  const executeVoiceCommand = useCallback((command: VoiceCommand) => {
    let response: VoiceResponse;
    
    switch (command.action) {
      case 'navigate':
        window.location.href = command.parameters?.route;
        response = {
          text: `Navigating to ${command.parameters?.route.replace('/', '')}`,
          action: 'navigate',
          emotion: 'neutral',
        };
        break;
        
      case 'create':
        const createEvent = new CustomEvent('voice-create', {
          detail: { type: command.parameters?.type }
        });
        window.dispatchEvent(createEvent);
        response = {
          text: `Creating new ${command.parameters?.type}`,
          action: 'create',
          emotion: 'happy',
        };
        break;
        
      case 'search':
        const searchEvent = new CustomEvent('voice-search', {
          detail: { query: command.parameters?.query }
        });
        window.dispatchEvent(searchEvent);
        response = {
          text: `Searching for ${command.parameters?.query}`,
          action: 'search',
          emotion: 'neutral',
        };
        break;
        
      case 'theme':
        const themeEvent = new CustomEvent('voice-theme', {
          detail: { mode: command.parameters?.mode }
        });
        window.dispatchEvent(themeEvent);
        response = {
          text: `Switching to ${command.parameters?.mode} mode`,
          action: 'theme',
          emotion: 'happy',
        };
        break;
        
      case 'help':
        response = {
          text: generateHelpResponse(command.parameters?.type),
          action: 'help',
          emotion: 'happy',
        };
        break;
        
      default:
        response = {
          text: `Executing ${command.action}`,
          emotion: 'neutral',
        };
    }
    
    setLastResponse(response);
    speak(response.text, response.emotion);
    
    trigger({
      haptic: 'success',
      sound: 'success',
      animation: 'celebrate',
      intensity: 'normal',
    });
  }, []);

  // Generate help responses
  const generateHelpResponse = (type?: string): string => {
    switch (type) {
      case 'commands':
        return 'You can say things like: go to dashboard, create new project, search for tasks, switch to dark mode, or show me recent projects.';
      case 'shortcuts':
        return 'Press Command+K for quick search, Command+N for new items, or Command+/ for help.';
      default:
        return 'I can help you navigate, create items, search, change settings, and more. Say "what can I say" for a list of commands.';
    }
  };

  // Start listening
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening && isEnabled) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
      }
    }
  }, [isListening, isEnabled]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Speak text
  const speak = useCallback((text: string, emotion: VoiceResponse['emotion'] = 'neutral') => {
    if (isEnabled) {
      emotionalTTS.speak(text, voiceSettings, emotion);
    }
  }, [isEnabled, voiceSettings]);

  // Execute command directly
  const executeCommand = useCallback((command: string) => {
    processVoiceCommand(command);
  }, [processVoiceCommand]);

  // Update settings
  const updateSettings = useCallback((settings: Partial<VoiceSettings>) => {
    setVoiceSettings(prev => ({ ...prev, ...settings }));
  }, []);

  const contextValue: VoiceContextType = {
    isListening,
    isEnabled,
    currentCommand,
    lastResponse,
    confidence,
    language,
    voiceSettings,
    startListening,
    stopListening,
    speak,
    executeCommand,
    updateSettings,
  };

  return (
    <VoiceContext.Provider value={contextValue}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoiceInterface() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoiceInterface must be used within a VoiceInterfaceProvider');
  }
  return context;
}

// Voice interface controls
export function VoiceControls({ className }: { className?: string }) {
  const {
    isListening,
    isEnabled,
    currentCommand,
    confidence,
    startListening,
    stopListening,
    speak,
  } = useVoiceInterface();

  const [showSettings, setShowSettings] = useState(false);

  const handleToggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const handleTestVoice = useCallback(() => {
    speak('Voice interface is working correctly!', 'happy');
  }, [speak]);

  if (!isEnabled) return null;

  return (
    <div className={cn('flex items-center space-x-sm', className)}>
      {/* Main voice button */}
      <Button
        variant={isListening ? 'destructive' : 'outline'}
        size="sm"
        onClick={handleToggleListening}
        className={cn(
          'relative',
          isListening && 'animate-pulse',
          !isListening && 'hover-glow'
        )}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
        
        {/* Listening indicator */}
        {isListening && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
        )}
      </Button>

      {/* Voice test button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleTestVoice}
        title="Test voice output"
      >
        <Volume2 className="h-4 w-4" />
      </Button>

      {/* Settings button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowSettings(!showSettings)}
        title="Voice settings"
      >
        <Settings className="h-4 w-4" />
      </Button>

      {/* Current command display */}
      {currentCommand && (
        <div className="flex items-center space-x-sm px-sm py-xs bg-accent/10 dark:bg-accent/20 rounded-lg">
          <Zap className="h-3 w-3 text-accent dark:text-accent" />
          <span className="text-sm text-accent dark:text-accent">
            {currentCommand}
          </span>
          {confidence > 0 && (
            <span className="text-xs text-accent dark:text-accent">
              {Math.round(confidence * 100)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Voice command suggestions
export function VoiceCommandSuggestions() {
  const { isListening, executeCommand } = useVoiceInterface();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // Generate contextual suggestions based on current page
    const currentPage = window.location.pathname;
    const contextSuggestions = getContextualSuggestions(currentPage);
    setSuggestions(contextSuggestions);
  }, []);

  const getContextualSuggestions = (page: string): string[] => {
    const baseSuggestions = ['go to dashboard', 'what can I say', 'show notifications'];
    
    if (page.includes('/projects')) {
      return [...baseSuggestions, 'create new project', 'show recent projects', 'find active tasks'];
    }
    
    if (page.includes('/people')) {
      return [...baseSuggestions, 'add team member', 'show directory', 'find person'];
    }
    
    if (page.includes('/finance')) {
      return [...baseSuggestions, 'create expense', 'show budget', 'list invoices'];
    }
    
    return baseSuggestions;
  };

  if (!isListening) return null;

  return (
    <div className="fixed bottom-20 left-4 bg-background dark:bg-muted/90 border border-border dark:border-border rounded-lg shadow-floating p-md max-w-sm z-50">
      <h4 className="text-sm font-medium text-foreground dark:text-background mb-sm">
        Try saying:
      </h4>
      
      <div className="space-y-xs">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => executeCommand(suggestion)}
            className="w-full text-left p-sm text-sm text-muted-foreground/80 dark:text-muted-foreground/40 hover:bg-muted/20 dark:hover:bg-muted/80 rounded transition-colors"
          >
            "{suggestion}"
          </button>
        ))}
      </div>
    </div>
  );
}
