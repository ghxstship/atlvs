'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Motion layout types
interface MotionConfig {
  duration: number;
  easing: string;
  stagger: number;
  direction: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
  intensity: 'subtle' | 'normal' | 'dramatic';
}

interface PageTransition {
  from: string;
  to: string;
  type: 'slide' | 'fade' | 'scale' | 'flip' | 'morph';
  duration: number;
  easing: string;
}

interface ScrollAnimation {
  trigger: number; // Percentage of viewport
  animation: string;
  duration: number;
  once: boolean;
}

interface MotionLayoutContextType {
  isReducedMotion: boolean;
  globalMotionConfig: MotionConfig;
  pageTransitions: PageTransition[];
  updateMotionConfig: (config: Partial<MotionConfig>) => void;
  addPageTransition: (transition: PageTransition) => void;
  triggerPageTransition: (from: string, to: string) => void;
}

const MotionLayoutContext = createContext<MotionLayoutContextType | undefined>(undefined);

// Motion variants
const motionVariants = cva('transition-all', {
  variants: {
    animation: {
      'slide-up': 'translate-y-full opacity-0',
      'slide-down': 'translate-y-full opacity-0',
      'slide-left': 'translate-x-full opacity-0',
      'slide-right': '-translate-x-full opacity-0',
      'fade-in': 'opacity-0',
      'scale-in': 'scale-95 opacity-0',
      'rotate-in': 'rotate-12 scale-95 opacity-0',
      'flip-in': 'rotateY-90 opacity-0',
    },
    intensity: {
      subtle: 'duration-200 ease-out',
      normal: 'duration-300 ease-in-out',
      dramatic: 'duration-500 ease-in-out',
    },
  },
  defaultVariants: {
    intensity: 'normal',
  },
});

// Choreographed animation sequences
class MotionChoreographer {
  private sequences: Map<string, any[]> = new Map();
  private activeSequence: string | null = null;

  // Define animation sequences for different contexts
  defineSequence(name: string, animations: any[]) {
    this.sequences.set(name, animations);
  }

  // Execute choreographed sequence
  executeSequence(name: string, elements: HTMLElement[]) {
    const sequence = this.sequences.get(name);
    if (!sequence || elements.length === 0) return;

    this.activeSequence = name;
    
    sequence.forEach((step, index) => {
      setTimeout(() => {
        elements.forEach((element, elementIndex) => {
          if (elementIndex < step.elements || step.elements === 'all') {
            this.applyAnimation(element, step.animation, step.duration, elementIndex * step.stagger);
          }
        });
      }, step.delay || 0);
    });
  }

  // Apply individual animation
  private applyAnimation(element: HTMLElement, animation: string, duration: number, delay: number = 0) {
    setTimeout(() => {
      element.style.transition = `all ${duration}ms ease-in-out`;
      element.classList.add(animation);
      
      setTimeout(() => {
        element.classList.remove(animation);
      }, duration);
    }, delay);
  }

  // Predefined sequences
  initializeDefaultSequences() {
    // Page entrance sequence
    this.defineSequence('page-entrance', [
      {
        elements: 'all',
        animation: 'animate-fade-in-up',
        duration: 400,
        stagger: 100,
        delay: 0,
      },
    ]);

    // Dashboard reveal sequence
    this.defineSequence('dashboard-reveal', [
      {
        elements: 1, // Header first
        animation: 'animate-slide-in-top',
        duration: 300,
        stagger: 0,
        delay: 0,
      },
      {
        elements: 3, // Navigation items
        animation: 'animate-slide-in-left',
        duration: 250,
        stagger: 50,
        delay: 150,
      },
      {
        elements: 'all', // Content cards
        animation: 'animate-scale-in',
        duration: 300,
        stagger: 75,
        delay: 300,
      },
    ]);

    // Form progression sequence
    this.defineSequence('form-progression', [
      {
        elements: 1, // Current step highlight
        animation: 'animate-glow',
        duration: 500,
        stagger: 0,
        delay: 0,
      },
      {
        elements: 1, // Next step reveal
        animation: 'animate-slide-in-right',
        duration: 350,
        stagger: 0,
        delay: 200,
      },
    ]);

    // Data visualization sequence
    this.defineSequence('data-reveal', [
      {
        elements: 'all', // Charts and graphs
        animation: 'animate-elastic-in',
        duration: 600,
        stagger: 150,
        delay: 0,
      },
    ]);

    // Modal entrance sequence
    this.defineSequence('modal-entrance', [
      {
        elements: 1, // Backdrop
        animation: 'animate-fade-in',
        duration: 200,
        stagger: 0,
        delay: 0,
      },
      {
        elements: 1, // Modal content
        animation: 'animate-scale-in',
        duration: 300,
        stagger: 0,
        delay: 100,
      },
    ]);
  }
}

const choreographer = new MotionChoreographer();

export function MotionLayoutProvider({ children }: { children: React.ReactNode }) {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [globalMotionConfig, setGlobalMotionConfig] = useState<MotionConfig>({
    duration: 300,
    easing: 'ease-in-out',
    stagger: 100,
    direction: 'up',
    intensity: 'normal',
  });
  const [pageTransitions, setPageTransitions] = useState<PageTransition[]>([]);

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Initialize choreographer
  useEffect(() => {
    choreographer.initializeDefaultSequences();
  }, []);

  // Update motion config
  const updateMotionConfig = useCallback((config: Partial<MotionConfig>) => {
    setGlobalMotionConfig(prev => ({ ...prev, ...config }));
  }, []);

  // Add page transition
  const addPageTransition = useCallback((transition: PageTransition) => {
    setPageTransitions(prev => [...prev, transition]);
  }, []);

  // Trigger page transition
  const triggerPageTransition = useCallback((from: string, to: string) => {
    const transition = pageTransitions.find(t => t.from === from && t.to === to);
    if (transition && !isReducedMotion) {
      // Execute transition animation
      document.body.classList.add(`transition-${transition.type}`);
      setTimeout(() => {
        document.body.classList.remove(`transition-${transition.type}`);
      }, transition.duration);
    }
  }, [pageTransitions, isReducedMotion]);

  const contextValue: MotionLayoutContextType = {
    isReducedMotion,
    globalMotionConfig,
    pageTransitions,
    updateMotionConfig,
    addPageTransition,
    triggerPageTransition,
  };

  return (
    <MotionLayoutContext.Provider value={contextValue}>
      {children}
    </MotionLayoutContext.Provider>
  );
}

export function useMotionLayout() {
  const context = useContext(MotionLayoutContext);
  if (context === undefined) {
    throw new Error('useMotionLayout must be used within a MotionLayoutProvider');
  }
  return context;
}

// Animated container component
interface AnimatedContainerProps extends VariantProps<typeof motionVariants> {
  children: React.ReactNode;
  className?: string;
  sequence?: string;
  delay?: number;
  stagger?: number;
  trigger?: 'immediate' | 'scroll' | 'hover' | 'click';
  threshold?: number;
}

export function AnimatedContainer({
  children,
  className,
  animation,
  intensity,
  sequence,
  delay = 0,
  stagger = 100,
  trigger = 'immediate',
  threshold = 0.1,
}: AnimatedContainerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isReducedMotion, globalMotionConfig } = useMotionLayout();

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    if (trigger !== 'scroll' || isReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
        }
      },
      { threshold }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [trigger, threshold, hasAnimated, isReducedMotion]);

  // Immediate trigger
  useEffect(() => {
    if (trigger === 'immediate' && !isReducedMotion) {
      setTimeout(() => {
        setIsVisible(true);
        setHasAnimated(true);
      }, delay);
    }
  }, [trigger, delay, isReducedMotion]);

  // Execute choreographed sequence
  useEffect(() => {
    if (isVisible && sequence && containerRef.current) {
      const elements = Array.from(containerRef.current.children) as HTMLElement[];
      choreographer.executeSequence(sequence, elements);
    }
  }, [isVisible, sequence]);

  const handleInteraction = useCallback(() => {
    if ((trigger === 'hover' || trigger === 'click') && !hasAnimated && !isReducedMotion) {
      setIsVisible(true);
      setHasAnimated(true);
    }
  }, [trigger, hasAnimated, isReducedMotion]);

  return (
    <div
      ref={containerRef}
      className={cn(
        motionVariants({ animation: isVisible ? undefined : animation, intensity }),
        isReducedMotion && 'transition-none',
        className
      )}
      onMouseEnter={trigger === 'hover' ? handleInteraction : undefined}
      onClick={trigger === 'click' ? handleInteraction : undefined}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Staggered list animation
interface StaggeredListProps {
  children: React.ReactNode[];
  stagger?: number;
  animation?: string;
  className?: string;
}

export function StaggeredList({ children, stagger = 100, animation = 'animate-fade-in-up', className }: StaggeredListProps) {
  const { isReducedMotion } = useMotionLayout();

  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn(
            !isReducedMotion && animation,
            'transition-all'
          )}
          style={{
            animationDelay: !isReducedMotion ? `${index * stagger}ms` : '0ms',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// Parallax scroll component
interface ParallaxScrollProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'up' | 'down';
  className?: string;
}

export function ParallaxScroll({ children, speed = 0.5, direction = 'up', className }: ParallaxScrollProps) {
  const [offset, setOffset] = useState(0);
  const { isReducedMotion } = useMotionLayout();

  useEffect(() => {
    if (isReducedMotion) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallax = scrolled * speed;
      setOffset(direction === 'up' ? -parallax : parallax);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, direction, isReducedMotion]);

  return (
    <div
      className={className}
      style={{
        transform: !isReducedMotion ? `translateY(${offset}px)` : 'none',
      }}
    >
      {children}
    </div>
  );
}

// Morphing background component
interface MorphingBackgroundProps {
  colors: string[];
  duration?: number;
  className?: string;
}

export function MorphingBackground({ colors, duration = 4000, className }: MorphingBackgroundProps) {
  const { isReducedMotion } = useMotionLayout();

  if (isReducedMotion) {
    return <div className={cn('bg-gradient-to-br', className)} style={{ background: colors[0] }} />;
  }

  return (
    <div
      className={cn('animate-morph-bg', className)}
      style={{
        background: `linear-gradient(-45deg, ${colors.join(', ')})`,
        backgroundSize: '400% 400%',
        animationDuration: `${duration}ms`,
      }}
    />
  );
}

// Page transition wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  transitionKey: string;
  type?: 'slide' | 'fade' | 'scale';
}

export function PageTransition({ children, transitionKey, type = 'fade' }: PageTransitionProps) {
  const [isEntering, setIsEntering] = useState(true);
  const { isReducedMotion } = useMotionLayout();

  useEffect(() => {
    setIsEntering(true);
    const timer = setTimeout(() => setIsEntering(false), 50);
    return () => clearTimeout(timer);
  }, [transitionKey]);

  const transitionClasses = {
    slide: isEntering ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100',
    fade: isEntering ? 'opacity-0' : 'opacity-100',
    scale: isEntering ? 'scale-95 opacity-0' : 'scale-100 opacity-100',
  };

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-in-out',
        !isReducedMotion && transitionClasses[type],
        isReducedMotion && 'opacity-100 scale-100 translate-x-0'
      )}
    >
      {children}
    </div>
  );
}

// Gesture-responsive motion
interface GestureMotionProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
}

export function GestureMotion({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className,
}: GestureMotionProps) {
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const { isReducedMotion } = useMotionLayout();

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setStartPos({ x: touch.clientX, y: touch.clientY });
    setCurrentPos({ x: touch.clientX, y: touch.clientY });
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setCurrentPos({ x: touch.clientX, y: touch.clientY });
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    
    const deltaX = currentPos.x - startPos.x;
    const deltaY = currentPos.y - startPos.y;
    const threshold = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > threshold && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < -threshold && onSwipeLeft) {
        onSwipeLeft();
      }
    } else {
      // Vertical swipe
      if (deltaY > threshold && onSwipeDown) {
        onSwipeDown();
      } else if (deltaY < -threshold && onSwipeUp) {
        onSwipeUp();
      }
    }

    setIsDragging(false);
    setCurrentPos({ x: 0, y: 0 });
  }, [isDragging, currentPos, startPos, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  const transform = isDragging && !isReducedMotion
    ? `translate(${currentPos.x - startPos.x}px, ${currentPos.y - startPos.y}px)`
    : 'none';

  return (
    <div
      className={cn('transition-transform duration-200 ease-out', className)}
      style={{ transform }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

// Physics-based animation hook
export function usePhysicsAnimation(config: { mass?: number; tension?: number; friction?: number } = {}) {
  const { mass = 1, tension = 170, friction = 26 } = config;
  const { isReducedMotion } = useMotionLayout();
  
  const animate = useCallback((element: HTMLElement, to: { x?: number; y?: number; scale?: number }) => {
    if (isReducedMotion) {
      // Apply final state immediately
      if (to.x !== undefined) element.style.transform = `translateX(${to.x}px)`;
      if (to.y !== undefined) element.style.transform += ` translateY(${to.y}px)`;
      if (to.scale !== undefined) element.style.transform += ` scale(${to.scale})`;
      return;
    }

    // Physics-based spring animation
    const duration = Math.sqrt(mass / tension) * 1000;
    const damping = friction / (2 * Math.sqrt(mass * tension));
    
    element.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    
    let transform = '';
    if (to.x !== undefined) transform += `translateX(${to.x}px) `;
    if (to.y !== undefined) transform += `translateY(${to.y}px) `;
    if (to.scale !== undefined) transform += `scale(${to.scale})`;
    
    element.style.transform = transform;
  }, [mass, tension, friction, isReducedMotion]);

  return { animate };
}
