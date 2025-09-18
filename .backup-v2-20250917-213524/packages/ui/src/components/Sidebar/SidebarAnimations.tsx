'use client';

import React from 'react';
import { cva } from 'class-variance-authority';

// 2026 Sidebar Animation System
// GPU-accelerated micro-animations with reduced motion support

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

export const sidebarAnimations = {
  // Expand/Collapse animations
  expandCollapse: cva(
    'transition-all duration-300 ease-out',
    {
      variants: {
        state: {
          expanding: 'animate-in slide-in-from-left-2 fade-in-0',
          collapsing: 'animate-out slide-out-to-left-2 fade-out-0',
          expanded: 'animate-in slide-in-from-left-1 fade-in-0 duration-200',
          collapsed: 'animate-out slide-out-to-left-1 fade-out-0 duration-200',
        },
      },
    }
  ),

  // Navigation item animations
  navItem: cva(
    'transition-all duration-200 ease-out transform-gpu',
    {
      variants: {
        state: {
          idle: 'scale-100 translate-x-0',
          hover: 'scale-[1.02] translate-x-1',
          active: 'scale-[0.98] translate-x-2',
          focus: 'scale-[1.01] translate-x-1 ring-2 ring-primary ring-offset-2',
        },
        level: {
          0: '',
          1: 'animate-in slide-in-from-left-4 fade-in-0 duration-300',
          2: 'animate-in slide-in-from-left-6 fade-in-0 duration-400',
        },
      },
    }
  ),

  // Children expand animations
  childrenExpand: cva(
    'overflow-hidden transition-all duration-300 ease-out',
    {
      variants: {
        state: {
          expanding: 'animate-in slide-down-from-top-2 fade-in-0',
          collapsing: 'animate-out slide-up-to-top-2 fade-out-0',
          expanded: 'max-h-screen opacity-100',
          collapsed: 'max-h-0 opacity-0',
        },
      },
    }
  ),

  // Search animations
  search: cva(
    'transition-all duration-200 ease-out',
    {
      variants: {
        state: {
          idle: 'scale-100 opacity-100',
          focus: 'scale-[1.02] opacity-100 ring-2 ring-primary',
          typing: 'scale-[1.01] opacity-100',
        },
      },
    }
  ),

  // Badge animations
  badge: cva(
    'transition-all duration-200 ease-out transform-gpu',
    {
      variants: {
        state: {
          idle: 'scale-100 opacity-100',
          pulse: 'animate-pulse scale-110',
          bounce: 'animate-bounce scale-105',
          updated: 'animate-in zoom-in-50 duration-300',
        },
      },
    }
  ),

  // Pin animations
  pin: cva(
    'transition-all duration-200 ease-out transform-gpu',
    {
      variants: {
        state: {
          idle: 'scale-100 rotate-0 opacity-60',
          hover: 'scale-110 rotate-12 opacity-100',
          pinned: 'scale-100 rotate-0 opacity-100 text-primary',
          pinning: 'animate-in zoom-in-50 spin-in-180 duration-300',
          unpinning: 'animate-out zoom-out-50 spin-out-180 duration-300',
        },
      },
    }
  ),

  // Tooltip animations
  tooltip: cva(
    'transition-all duration-200 ease-out transform-gpu',
    {
      variants: {
        state: {
          hidden: 'opacity-0 scale-95 translate-x-2',
          visible: 'opacity-100 scale-100 translate-x-0',
          delayed: 'opacity-0 scale-95 translate-x-2 delay-500',
        },
      },
    }
  ),

  // Mobile overlay animations
  mobileOverlay: cva(
    'transition-all duration-300 ease-out',
    {
      variants: {
        state: {
          entering: 'animate-in slide-in-from-left-full fade-in-0',
          exiting: 'animate-out slide-out-to-left-full fade-out-0',
          visible: 'translate-x-0 opacity-100',
          hidden: '-translate-x-full opacity-0',
        },
      },
    }
  ),

  // Backdrop animations
  backdrop: cva(
    'transition-all duration-300 ease-out',
    {
      variants: {
        state: {
          entering: 'animate-in fade-in-0',
          exiting: 'animate-out fade-out-0',
          visible: 'opacity-100 backdrop-blur-sm',
          hidden: 'opacity-0',
        },
      },
    }
  ),
};

// =============================================================================
// ANIMATION COMPONENTS
// =============================================================================

interface AnimatedSidebarProps {
  children: React.ReactNode;
  isCollapsed: boolean;
  className?: string;
}

export const AnimatedSidebar: React.FC<AnimatedSidebarProps> = ({
  children,
  isCollapsed,
  className,
}) => {
  return (
    <div
      className={sidebarAnimations.expandCollapse({
        state: isCollapsed ? 'collapsed' : 'expanded',
        className,
      })}
      style={{
        '--sidebar-width': isCollapsed ? '4rem' : '16rem',
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

interface AnimatedNavItemProps {
  children: React.ReactNode;
  isActive?: boolean;
  isHovered?: boolean;
  isFocused?: boolean;
  level?: 0 | 1 | 2;
  className?: string;
}

export const AnimatedNavItem: React.FC<AnimatedNavItemProps> = ({
  children,
  isActive = false,
  isHovered = false,
  isFocused = false,
  level = 0,
  className,
}) => {
  const getState = () => {
    if (isFocused) return 'focus';
    if (isActive) return 'active';
    if (isHovered) return 'hover';
    return 'idle';
  };

  return (
    <div
      className={sidebarAnimations.navItem({
        state: getState(),
        level,
        className,
      })}
    >
      {children}
    </div>
  );
};

interface AnimatedChildrenProps {
  children: React.ReactNode;
  isExpanded: boolean;
  className?: string;
}

export const AnimatedChildren: React.FC<AnimatedChildrenProps> = ({
  children,
  isExpanded,
  className,
}) => {
  return (
    <div
      className={sidebarAnimations.childrenExpand({
        state: isExpanded ? 'expanded' : 'collapsed',
        className,
      })}
      style={{
        maxHeight: isExpanded ? '1000px' : '0px',
      }}
    >
      {children}
    </div>
  );
};

interface AnimatedBadgeProps {
  children: React.ReactNode;
  variant?: 'idle' | 'pulse' | 'bounce' | 'updated';
  className?: string;
}

export const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({
  children,
  variant = 'idle',
  className,
}) => {
  return (
    <span
      className={sidebarAnimations.badge({
        state: variant,
        className,
      })}
    >
      {children}
    </span>
  );
};

interface AnimatedPinProps {
  children: React.ReactNode;
  isPinned?: boolean;
  isHovered?: boolean;
  isAnimating?: boolean;
  className?: string;
}

export const AnimatedPin: React.FC<AnimatedPinProps> = ({
  children,
  isPinned = false,
  isHovered = false,
  isAnimating = false,
  className,
}) => {
  const getState = () => {
    if (isAnimating) return isPinned ? 'pinning' : 'unpinning';
    if (isPinned) return 'pinned';
    if (isHovered) return 'hover';
    return 'idle';
  };

  return (
    <span
      className={sidebarAnimations.pin({
        state: getState(),
        className,
      })}
    >
      {children}
    </span>
  );
};

interface AnimatedTooltipProps {
  children: React.ReactNode;
  isVisible?: boolean;
  delay?: boolean;
  className?: string;
}

export const AnimatedTooltip: React.FC<AnimatedTooltipProps> = ({
  children,
  isVisible = false,
  delay = false,
  className,
}) => {
  const getState = () => {
    if (!isVisible) return delay ? 'delayed' : 'hidden';
    return 'visible';
  };

  return (
    <div
      className={sidebarAnimations.tooltip({
        state: getState(),
        className,
      })}
    >
      {children}
    </div>
  );
};

// =============================================================================
// ANIMATION HOOKS
// =============================================================================

export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

export const useAnimationState = (initialState = 'idle') => {
  const [state, setState] = React.useState(initialState);
  const prefersReducedMotion = useReducedMotion();

  const animate = React.useCallback((newState: string, duration = 300) => {
    if (prefersReducedMotion) return;
    
    setState(newState);
    
    if (duration > 0) {
      setTimeout(() => setState('idle'), duration);
    }
  }, [prefersReducedMotion]);

  return { state, animate, prefersReducedMotion };
};

// =============================================================================
// PERFORMANCE OPTIMIZATIONS
// =============================================================================

export const AnimationOptimizer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  React.useEffect(() => {
    // Enable GPU acceleration for animations
    const style = document.createElement('style');
    style.textContent = `
      .transform-gpu {
        transform: translateZ(0);
        will-change: transform, opacity;
      }
      
      @media (prefers-reduced-motion: reduce) {
        .animate-in,
        .animate-out,
        .transition-all,
        .transition-transform,
        .transition-opacity {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return <>{children}</>;
};

export default sidebarAnimations;
