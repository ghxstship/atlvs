/**
 * Enhanced Navigation Accessibility System
 * Advanced WCAG 2.2 AA+ compliance with 2026/2027 standards
 */

'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { navigationTokens } from '../../tokens/navigation';

interface NavigationAnnouncerProps {
  pathname?: string;
}

export const NavigationAnnouncer: React.FC<NavigationAnnouncerProps> = ({ pathname }) => {
  const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    // Announce page changes for screen readers
    const segments = currentPath.split('/').filter(Boolean);
    const pageName = segments
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '))
      .join(' - ');
    
    setAnnouncement(`Navigated to ${pageName || 'Home'}`);
    
    // Clear announcement after delay to allow re-announcement
    const timer = setTimeout(() => setAnnouncement(''), 100);
    return () => clearTimeout(timer);
  }, [currentPath]);

  return (
    <>
      {/* Live region for navigation announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
      
      {/* Skip navigation links */}
      <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-0 focus-within:left-0 focus-within:z-50">
        <a
          href="#main-content"
          className="inline-block px-md py-sm m-sm bg-accent text-accent-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <a
          href="#navigation"
          className="inline-block px-md py-sm m-sm bg-accent text-accent-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Skip to navigation
        </a>
      </div>
    </>
  );
};

interface NavigationLandmarkProps {
  children: React.ReactNode;
  label?: string;
}

export const NavigationLandmark: React.FC<NavigationLandmarkProps> = ({ 
  children, 
  label = 'Main navigation' 
}) => {
  return (
    <nav
      id="navigation"
      role="navigation"
      aria-label={label}
    >
      {children}
    </nav>
  );
};

interface NavigationItemProps {
  href: string;
  label: string;
  isActive?: boolean;
  level?: number;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  children?: React.ReactNode;
}

export const AccessibleNavigationItem: React.FC<NavigationItemProps> = ({
  href,
  label,
  isActive = false,
  level = 0,
  hasChildren = false,
  isExpanded = false,
  onToggle,
  children
}) => {
  const ariaLevel = level + 1;
  
  return (
    <li role="none">
      <div className="flex items-center">
        {hasChildren && (
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls={`nav-group-${label.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={onToggle}
            className="p-xs hover:bg-muted/20 dark:hover:bg-muted/90 rounded"
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${label} menu`}
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
        
        <a
          href={href}
          aria-current={isActive ? 'page' : undefined}
          aria-level={ariaLevel}
          className={`
            flex-1 px-sm py-sm rounded-md text-sm font-medium
            ${isActive 
              ? 'bg-accent/10 text-accent' 
              : 'text-muted-foreground hover:bg-muted'
            }
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          `}
        >
          {label}
        </a>
      </div>
      
      {hasChildren && isExpanded && (
        <ul
          id={`nav-group-${label.toLowerCase().replace(/\s+/g, '-')}`}
          role="group"
          className="ml-md mt-xs"
        >
          {children}
        </ul>
      )}
    </li>
  );
};

// Keyboard navigation hook
export const useKeyboardNavigation = (items: any[], isOpen: boolean) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => 
            prev < items.length - 1 ? prev + 1 : 0
          );
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : items.length - 1
          );
          break;
          
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
          
        case 'End':
          e.preventDefault();
          setFocusedIndex(items.length - 1);
          break;
          
        case 'Escape':
          e.preventDefault();
          setFocusedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items.length, isOpen]);

  return { focusedIndex, setFocusedIndex };
};

// Focus trap for modals and overlays
export const useFocusTrap = (isActive: boolean, containerRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive, containerRef]);
};

// High contrast mode detection
export const useHighContrastMode = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    setIsHighContrast(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isHighContrast;
};

// Reduced motion detection
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// =============================================================================
// ENHANCED 2026/2027 ACCESSIBILITY FEATURES
// =============================================================================

// Voice navigation support
export const useVoiceNavigation = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionCtor();
    
    const recognition = recognitionRef.current;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setTranscript(transcript);
    };

    return () => {
      recognition.stop();
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return { isListening, transcript, startListening, stopListening };
};

// Enhanced color contrast utilities
export const useColorContrast = () => {
  const [contrastRatio, setContrastRatio] = useState<number>(4.5);
  
  const calculateContrast = useCallback((color1: string, color2: string): number => {
    // Simplified contrast calculation - in production, use a proper color library
    const getLuminance = (color: string): number => {
      // This is a simplified version - use proper color parsing in production
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      
      const sRGB = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }, []);

  const meetsWCAG = useCallback((ratio: number, level: 'AA' | 'AAA' = 'AA'): boolean => {
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  }, []);

  return { contrastRatio, calculateContrast, meetsWCAG };
};

// Gesture recognition for touch navigation
export const useGestureNavigation = (containerRef: React.RefObject<HTMLElement>) => {
  const [gesture, setGesture] = useState<string | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Detect swipe gestures
      const minSwipeDistance = 50;
      const maxSwipeTime = 300;

      if (deltaTime < maxSwipeTime) {
        if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY)) {
          setGesture(deltaX > 0 ? 'swipe-right' : 'swipe-left');
        } else if (Math.abs(deltaY) > minSwipeDistance && Math.abs(deltaY) > Math.abs(deltaX)) {
          setGesture(deltaY > 0 ? 'swipe-down' : 'swipe-up');
        }
      }

      // Clear gesture after handling
      setTimeout(() => setGesture(null), 100);
      touchStartRef.current = null;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [containerRef]);

  return gesture;
};

// Screen reader optimizations
export const useScreenReaderOptimizations = () => {
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);
  const announceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect screen reader usage
    const detectScreenReader = () => {
      // Check for common screen reader indicators
      const hasScreenReader = 
        window.navigator.userAgent.includes('NVDA') ||
        window.navigator.userAgent.includes('JAWS') ||
        window.speechSynthesis?.getVoices().length > 0;
      
      setIsScreenReaderActive(hasScreenReader);
    };

    detectScreenReader();
    window.speechSynthesis?.addEventListener('voiceschanged', detectScreenReader);

    return () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', detectScreenReader);
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announceRef.current) {
      announceRef.current.setAttribute('aria-live', priority);
      announceRef.current.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (announceRef.current) {
          announceRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  const AnnouncementRegion = useCallback(() => (
    <div
      ref={announceRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  ), []);

  return { isScreenReaderActive, announce, AnnouncementRegion };
};

// Enhanced keyboard shortcuts
export const useAdvancedKeyboardShortcuts = () => {
  const [shortcuts, setShortcuts] = useState<Map<string, () => void>>(new Map());

  const registerShortcut = useCallback((key: string, callback: () => void) => {
    setShortcuts(prev => new Map(prev.set(key, callback)));
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    setShortcuts(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = [
        e.ctrlKey && 'ctrl',
        e.altKey && 'alt',
        e.shiftKey && 'shift',
        e.metaKey && 'meta',
        e.key.toLowerCase()
      ].filter(Boolean).join('+');

      const callback = shortcuts.get(key);
      if (callback) {
        e.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return { registerShortcut, unregisterShortcut };
};
