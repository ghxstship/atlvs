'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../atoms/button/Button';
import { cn } from '../../lib/utils';
import { useMicroInteraction } from '../micro-interactions/MicroInteractions';

interface VoiceSearchProps {
  onResult: (transcript: string, confidence: number) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  className?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  grammars: SpeechGrammarList;
  start(): void;
  stop(): void;
  abort(): void;
  addEventListener(type: 'result', listener: (event: SpeechRecognitionEvent) => void): void;
  addEventListener(type: 'error', listener: (event: SpeechRecognitionErrorEvent) => void): void;
  addEventListener(type: 'start' | 'end' | 'speechstart' | 'speechend' | 'soundstart' | 'soundend' | 'audiostart' | 'audioend' | 'nomatch', listener: (event: Event) => void): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// Voice commands mapping
const VOICE_COMMANDS = {
  navigation: {
    'go to dashboard': '/dashboard',
    'open projects': '/projects',
    'show people': '/people',
    'open finance': '/finance',
    'go to settings': '/settings',
    'show analytics': '/analytics',
    'open jobs': '/jobs',
    'view companies': '/companies',
    'show procurement': '/procurement',
    'open profile': '/profile',
  },
  actions: {
    'create new project': 'create-project',
    'add person': 'create-person',
    'new expense': 'create-expense',
    'create invoice': 'create-invoice',
    'add company': 'create-company',
    'new job': 'create-job',
    'schedule meeting': 'create-meeting',
    'add task': 'create-task',
  },
  search: {
    'search for': 'search',
    'find': 'search',
    'look for': 'search',
    'show me': 'search',
  },
  filters: {
    'filter by': 'filter',
    'show only': 'filter',
    'hide': 'filter-exclude',
  },
};

export function VoiceSearch({
  onResult,
  onError,
  placeholder = 'Say something...',
  language = 'en-US',
  continuous = false,
  interimResults = true,
  className,
}: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { trigger } = useMicroInteraction();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setIsSupported(true);
        recognitionRef.current = new SpeechRecognition();
        
        const recognition = recognitionRef.current;
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = language;
        recognition.maxAlternatives = 3;

        recognition.addEventListener('start', () => {
          setIsListening(true);
          trigger({
            haptic: 'light',
            sound: 'notification',
            animation: 'pulse',
            intensity: 'subtle',
          });
        });

        recognition.addEventListener('end', () => {
          setIsListening(false);
          setInterimTranscript('');
        });

        recognition.addEventListener('result', (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          let interimText = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcriptText = result[0].transcript;
            const confidenceScore = result[0].confidence;

            if (result.isFinal) {
              finalTranscript += transcriptText;
              setTranscript(finalTranscript);
              setConfidence(confidenceScore);
              
              // Process voice commands
              processVoiceCommand(finalTranscript.toLowerCase().trim());
              
              onResult(finalTranscript, confidenceScore);
              
              trigger({
                haptic: 'success',
                sound: 'success',
                animation: 'glow',
                intensity: 'normal',
              });
            } else if (interimResults) {
              interimText += transcriptText;
              setInterimTranscript(interimText);
            }
          }
        });

        recognition.addEventListener('error', (event: SpeechRecognitionErrorEvent) => {
          const errorMessage = `Speech recognition error: ${event.error}`;
          onError?.(errorMessage);
          setIsListening(false);
          
          trigger({
            haptic: 'error',
            sound: 'error',
            animation: 'shake',
            intensity: 'strong',
          });
        });

        recognition.addEventListener('speechstart', () => {
          trigger({
            haptic: 'light',
            animation: 'breathe',
            intensity: 'subtle',
          });
        });

        recognition.addEventListener('speechend', () => {
          // Speech has ended
        });
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [continuous, interimResults, language, onResult, onError, trigger]);

  // Process voice commands
  const processVoiceCommand = useCallback((command: string) => {
    // Check navigation commands
    for (const [phrase, route] of Object.entries(VOICE_COMMANDS.navigation)) {
      if (command.includes(phrase)) {
        window.location.href = route;
        speak(`Navigating to ${phrase.replace('go to ', '').replace('open ', '').replace('show ', '').replace('view ', '')}`);
        return;
      }
    }

    // Check action commands
    for (const [phrase, action] of Object.entries(VOICE_COMMANDS.actions)) {
      if (command.includes(phrase)) {
        // Trigger action (would integrate with actual action handlers)
        const event = new CustomEvent('voice-action', { detail: { action, command } });
        window.dispatchEvent(event);
        speak(`Creating ${phrase.replace('create new ', '').replace('add ', '').replace('new ', '')}`);
        return;
      }
    }

    // Check search commands
    for (const phrase of Object.keys(VOICE_COMMANDS.search)) {
      if (command.startsWith(phrase)) {
        const searchTerm = command.replace(phrase, '').trim();
        if (searchTerm) {
          const event = new CustomEvent('voice-search', { detail: { query: searchTerm } });
          window.dispatchEvent(event);
          speak(`Searching for ${searchTerm}`);
        }
        return;
      }
    }
  }, []);

  // Text-to-speech functionality
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  }, [language]);

  // Start listening
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        onError?.(`Failed to start voice recognition: ${error}`);
      }
    }
  }, [isListening, onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <div className={cn('flex items-center space-x-sm', className)}>
      {/* Voice input display */}
      {(transcript || interimTranscript) && (
        <div className="flex-1 min-w-0">
          <div className="text-sm text-foreground dark:text-muted-foreground/20">
            {transcript}
            {interimTranscript && (
              <span className="text-muted-foreground/60 italic">{interimTranscript}</span>
            )}
          </div>
          {confidence > 0 && (
            <div className="text-xs text-muted-foreground/60">
              Confidence: {Math.round(confidence * 100)}%
            </div>
          )}
        </div>
      )}

      {/* Voice control buttons */}
      <div className="flex items-center space-x-xs">
        {/* Microphone button */}
        <Button
          variant={isListening ? 'destructive' : 'outline'}
          size="sm"
          onClick={toggleListening}
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

        {/* Speaker button */}
        {isSpeaking && (
          <Button
            variant="outline"
            size="sm"
            onClick={stopSpeaking}
            className="animate-pulse"
            title="Stop speaking"
          >
            <VolumeX className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Voice commands help */}
      {isListening && (
        <div className="absolute top-full left-0 right-0 mt-sm p-sm bg-background dark:bg-muted/90 border border-border dark:border-border rounded-lg shadow-floating z-50 animate-fade-in-up">
          <div className="text-xs text-muted-foreground/70 dark:text-muted-foreground/50 mb-sm">
            Try saying:
          </div>
          <div className="grid grid-cols-2 gap-sm text-xs">
            <div>
              <div className="font-medium text-muted-foreground/90 dark:text-muted-foreground/30">Navigation:</div>
              <div className="text-muted-foreground/70 dark:text-muted-foreground/50">
                "Go to dashboard"<br />
                "Open projects"<br />
                "Show people"
              </div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground/90 dark:text-muted-foreground/30">Actions:</div>
              <div className="text-muted-foreground/70 dark:text-muted-foreground/50">
                "Create new project"<br />
                "Add person"<br />
                "Search for..."
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced GlobalSearch with voice integration
interface VoiceEnabledSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function VoiceEnabledSearch({ onSearch, placeholder = 'Search or speak...', className }: VoiceEnabledSearchProps) {
  const [query, setQuery] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const handleVoiceResult = useCallback((transcript: string, confidence: number) => {
    if (confidence > 0.7) {
      setQuery(transcript);
      onSearch(transcript);
    }
  }, [onSearch]);

  const handleVoiceError = useCallback((error: string) => {
    console.error('Voice search error:', error);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  }, [onSearch]);

  // Listen for voice events
  useEffect(() => {
    const handleVoiceSearch = (event: CustomEvent) => {
      const { query: voiceQuery } = event.detail;
      setQuery(voiceQuery);
      onSearch(voiceQuery);
    };

    window.addEventListener('voice-search', handleVoiceSearch as EventListener);
    
    return () => {
      window.removeEventListener('voice-search', handleVoiceSearch as EventListener);
    };
  }, [onSearch]);

  return (
    <div className={cn('relative flex items-center', className)}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="flex-1 px-sm py-sm border border-border dark:border-border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-muted/90 dark:text-background"
      />
      
      <div className="border-t border-b border-r border-border dark:border-border rounded-r-lg">
        <VoiceSearch
          onResult={handleVoiceResult}
          onError={handleVoiceError}
          continuous={false}
          interimResults={true}
          className="px-sm"
        />
      </div>
    </div>
  );
}
