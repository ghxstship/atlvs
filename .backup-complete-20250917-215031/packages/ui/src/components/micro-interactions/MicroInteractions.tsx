'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Haptic feedback types
type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

// Sound feedback types
type SoundType = 'click' | 'success' | 'error' | 'notification' | 'whoosh' | 'pop';

// Animation types
type AnimationType = 'bounce' | 'pulse' | 'shake' | 'glow' | 'ripple' | 'float' | 'celebrate';

interface MicroInteractionConfig {
  haptic?: HapticType;
  sound?: SoundType;
  animation?: AnimationType;
  duration?: number;
  delay?: number;
  intensity?: 'subtle' | 'normal' | 'strong';
}

// Haptic feedback utility
const triggerHaptic = (type: HapticType) => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      warning: [20, 100, 20],
      error: [50, 100, 50, 100, 50],
    };
    navigator.vibrate(patterns[type]);
  }
};

// Sound feedback utility (Web Audio API)
class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundType, AudioBuffer> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext();
      this.initializeSounds();
    }
  }

  private async initializeSounds() {
    if (!this.audioContext) return;

    const soundDefinitions: Record<SoundType, { frequency: number; duration: number; type: OscillatorType }> = {
      click: { frequency: 800, duration: 0.1, type: 'sine' },
      success: { frequency: 523.25, duration: 0.2, type: 'sine' }, // C5
      error: { frequency: 220, duration: 0.3, type: 'sawtooth' }, // A3
      notification: { frequency: 659.25, duration: 0.15, type: 'triangle' }, // E5
      whoosh: { frequency: 200, duration: 0.4, type: 'sawtooth' },
      pop: { frequency: 1000, duration: 0.05, type: 'square' },
    };

    for (const [soundType, config] of Object.entries(soundDefinitions)) {
      const buffer = await this.createSoundBuffer(config);
      if (buffer) {
        this.sounds.set(soundType as SoundType, buffer);
      }
    }
  }

  private async createSoundBuffer(config: { frequency: number; duration: number; type: OscillatorType }): Promise<AudioBuffer | null> {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * config.duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let value = 0;

      switch (config.type) {
        case 'sine':
          value = Math.sin(2 * Math.PI * config.frequency * t);
          break;
        case 'triangle':
          value = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * config.frequency * t));
          break;
        case 'sawtooth':
          value = 2 * (t * config.frequency - Math.floor(0.5 + t * config.frequency));
          break;
        case 'square':
          value = Math.sign(Math.sin(2 * Math.PI * config.frequency * t));
          break;
      }

      // Apply envelope (fade in/out)
      const envelope = Math.min(t * 10, (config.duration - t) * 10, 1);
      data[i] = value * envelope * 0.1; // Keep volume low
    }

    return buffer;
  }

  playSound(type: SoundType, volume: number = 0.3) {
    if (!this.audioContext || !this.sounds.has(type)) return;

    const buffer = this.sounds.get(type)!;
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start();
  }
}

const soundManager = new SoundManager();

// Animation variants
const animationVariants = cva('transition-all', {
  variants: {
    animation: {
      bounce: 'animate-bounce',
      pulse: 'animate-pulse',
      shake: 'animate-shake',
      glow: 'animate-glow',
      ripple: 'animate-ripple',
      float: 'animate-float',
      celebrate: 'animate-celebrate',
    },
    intensity: {
      subtle: 'duration-200 ease-out',
      normal: 'duration-300 ease-in-out',
      strong: 'duration-500 ease-in-out',
    },
  },
  defaultVariants: {
    intensity: 'normal',
  },
});

// Micro-interaction hook
export function useMicroInteraction() {
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const trigger = useCallback((config: MicroInteractionConfig) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Apply delay if specified
    const executeInteraction = () => {
      // Haptic feedback
      if (config.haptic) {
        triggerHaptic(config.haptic);
      }

      // Sound feedback
      if (config.sound) {
        const volume = config.intensity === 'subtle' ? 0.1 : config.intensity === 'strong' ? 0.5 : 0.3;
        soundManager.playSound(config.sound, volume);
      }

      // Animation
      if (config.animation) {
        setIsAnimating(true);
        const duration = config.duration || (config.intensity === 'subtle' ? 200 : config.intensity === 'strong' ? 500 : 300);
        
        timeoutRef.current = setTimeout(() => {
          setIsAnimating(false);
        }, duration);
      }
    };

    if (config.delay) {
      timeoutRef.current = setTimeout(executeInteraction, config.delay);
    } else {
      executeInteraction();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { trigger, isAnimating };
}

// Interactive wrapper component
interface InteractiveWrapperProps extends VariantProps<typeof animationVariants> {
  children: React.ReactNode;
  onInteraction?: MicroInteractionConfig;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function InteractiveWrapper({
  children,
  onInteraction,
  onClick,
  className,
  disabled = false,
  animation,
  intensity,
}: InteractiveWrapperProps) {
  const { trigger, isAnimating } = useMicroInteraction();

  const handleClick = useCallback(() => {
    if (disabled) return;

    if (onInteraction) {
      trigger(onInteraction);
    }

    onClick?.();
  }, [disabled, onInteraction, trigger, onClick]);

  return (
    <div
      className={cn(
        animationVariants({ animation: isAnimating ? animation : undefined, intensity }),
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {children}
    </div>
  );
}

// Contextual feedback components
interface SuccessFeedbackProps {
  children: React.ReactNode;
  message?: string;
  duration?: number;
}

export function SuccessFeedback({ children, message = 'Success!', duration = 2000 }: SuccessFeedbackProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const { trigger } = useMicroInteraction();

  const handleSuccess = useCallback(() => {
    trigger({
      haptic: 'success',
      sound: 'success',
      animation: 'celebrate',
      intensity: 'normal',
    });

    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), duration);
  }, [trigger, duration]);

  return (
    <div className="relative">
      <div onClick={handleSuccess}>
        {children}
      </div>
      {showFeedback && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-lg text-sm animate-bounce">
          {message}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-500"></div>
        </div>
      )}
    </div>
  );
}

interface ErrorFeedbackProps {
  children: React.ReactNode;
  message?: string;
  duration?: number;
}

export function ErrorFeedback({ children, message = 'Error occurred', duration = 3000 }: ErrorFeedbackProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const { trigger } = useMicroInteraction();

  const handleError = useCallback(() => {
    trigger({
      haptic: 'error',
      sound: 'error',
      animation: 'shake',
      intensity: 'strong',
    });

    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), duration);
  }, [trigger, duration]);

  return (
    <div className="relative">
      <div onClick={handleError}>
        {children}
      </div>
      {showFeedback && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm animate-shake">
          {message}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500"></div>
        </div>
      )}
    </div>
  );
}

// Ripple effect component
interface RippleEffectProps {
  children: React.ReactNode;
  color?: string;
  duration?: number;
}

export function RippleEffect({ children, color = 'rgba(255, 255, 255, 0.6)', duration = 600 }: RippleEffectProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const addRipple = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, duration);
  }, [duration]);

  return (
    <div
      className="relative overflow-hidden"
      onMouseDown={addRipple}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full animate-ripple pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            backgroundColor: color,
            transform: 'scale(0)',
            animation: `ripple ${duration}ms ease-out`,
          }}
        />
      ))}
    </div>
  );
}

// Floating action feedback
interface FloatingActionProps {
  children: React.ReactNode;
  action: string;
  onAction: () => void;
}

export function FloatingAction({ children, action, onAction }: FloatingActionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { trigger } = useMicroInteraction();

  const handleAction = useCallback(() => {
    trigger({
      haptic: 'medium',
      sound: 'whoosh',
      animation: 'float',
      intensity: 'normal',
    });
    onAction();
  }, [trigger, onAction]);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onClick={handleAction}
        className="cursor-pointer transition-transform hover:scale-105"
      >
        {children}
      </div>
      {isHovered && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap animate-float">
          {action}
        </div>
      )}
    </div>
  );
}

// Progress celebration
interface ProgressCelebrationProps {
  progress: number;
  milestones?: number[];
  children: React.ReactNode;
}

export function ProgressCelebration({ progress, milestones = [25, 50, 75, 100], children }: ProgressCelebrationProps) {
  const [lastMilestone, setLastMilestone] = useState(0);
  const { trigger } = useMicroInteraction();

  useEffect(() => {
    const currentMilestone = milestones.find(m => progress >= m && m > lastMilestone);
    
    if (currentMilestone) {
      setLastMilestone(currentMilestone);
      
      // Celebrate milestone
      trigger({
        haptic: currentMilestone === 100 ? 'success' : 'medium',
        sound: currentMilestone === 100 ? 'success' : 'notification',
        animation: 'celebrate',
        intensity: currentMilestone === 100 ? 'strong' : 'normal',
      });
    }
  }, [progress, milestones, lastMilestone, trigger]);

  return <>{children}</>;
}
