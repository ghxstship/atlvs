'use client';

import React, { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { DESIGN_TOKENS } from './DesignSystem';

// Unified Layout System for 2026 UI/UX Leadership
// Atomic → Composite → Section → Page → System hierarchy

// =============================================================================
// ATOMIC LAYOUT COMPONENTS
// =============================================================================

// Container Component - Foundation for all layouts
const containerVariants = cva(
  'w-full mx-auto',
  {
    variants: {
      size: {
        sm: 'max-w-screen-sm',
        md: 'max-w-screen-md', 
        lg: 'max-w-screen-lg',
        xl: 'max-w-screen-xl',
        '2xl': 'max-w-screen-2xl',
        full: 'max-w-full',
        prose: 'max-w-prose',
      },
      padding: {
        none: 'px-0',
        sm: 'px-4 sm:px-6',
        md: 'px-4 sm:px-6 lg:px-8',
        lg: 'px-6 sm:px-8 lg:px-12',
      },
    },
    defaultVariants: {
      size: 'xl',
      padding: 'md',
    },
  }
);

interface ContainerProps extends VariantProps<typeof containerVariants> {
  children: ReactNode;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({ 
  children, 
  size, 
  padding, 
  className 
}) => {
  return (
    <div className={twMerge(containerVariants({ size, padding }), className)}>
      {children}
    </div>
  );
};

// Stack Component - Vertical spacing system
const stackVariants = cva(
  'flex flex-col',
  {
    variants: {
      spacing: {
        none: 'space-y-0',
        xs: 'space-y-1',
        sm: 'space-y-2',
        md: 'space-y-4',
        lg: 'space-y-6',
        xl: 'space-y-8',
        '2xl': 'space-y-12',
      },
      align: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
      },
    },
    defaultVariants: {
      spacing: 'md',
      align: 'stretch',
    },
  }
);

interface StackProps extends VariantProps<typeof stackVariants> {
  children: ReactNode;
  className?: string;
}

export const Stack: React.FC<StackProps> = ({ 
  children, 
  spacing, 
  align, 
  className 
}) => {
  return (
    <div className={twMerge(stackVariants({ spacing, align }), className)}>
      {children}
    </div>
  );
};

// Inline Component - Horizontal spacing system
const inlineVariants = cva(
  'flex flex-row',
  {
    variants: {
      spacing: {
        none: 'space-x-0',
        xs: 'space-x-1',
        sm: 'space-x-2',
        md: 'space-x-4',
        lg: 'space-x-6',
        xl: 'space-x-8',
        '2xl': 'space-x-12',
      },
      align: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        baseline: 'items-baseline',
        stretch: 'items-stretch',
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
      },
      wrap: {
        nowrap: 'flex-nowrap',
        wrap: 'flex-wrap',
        'wrap-reverse': 'flex-wrap-reverse',
      },
    },
    defaultVariants: {
      spacing: 'md',
      align: 'center',
      justify: 'start',
      wrap: 'nowrap',
    },
  }
);

interface InlineProps extends VariantProps<typeof inlineVariants> {
  children: ReactNode;
  className?: string;
}

export const Inline: React.FC<InlineProps> = ({ 
  children, 
  spacing, 
  align, 
  justify, 
  wrap, 
  className 
}) => {
  return (
    <div className={twMerge(inlineVariants({ spacing, align, justify, wrap }), className)}>
      {children}
    </div>
  );
};

// Grid Component - CSS Grid system
const gridVariants = cva(
  'grid',
  {
    variants: {
      cols: {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
        12: 'grid-cols-12',
        auto: 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]',
        responsive: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      },
      gap: {
        none: 'gap-0',
        xs: 'gap-1',
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8',
        '2xl': 'gap-12',
      },
      rows: {
        none: '',
        1: 'grid-rows-1',
        2: 'grid-rows-2',
        3: 'grid-rows-3',
        4: 'grid-rows-4',
        auto: 'grid-rows-[repeat(auto-fit,minmax(100px,1fr))]',
      },
    },
    defaultVariants: {
      cols: 'auto',
      gap: 'md',
    },
  }
);

interface GridProps extends VariantProps<typeof gridVariants> {
  children: ReactNode;
  className?: string;
}

export const Grid: React.FC<GridProps> = ({ 
  children, 
  cols, 
  gap, 
  rows, 
  className 
}) => {
  return (
    <div className={twMerge(gridVariants({ cols, gap, rows }), className)}>
      {children}
    </div>
  );
};

// =============================================================================
// COMPOSITE LAYOUT PATTERNS
// =============================================================================

// Section Component - Page sections with consistent spacing
const sectionVariants = cva(
  'w-full',
  {
    variants: {
      padding: {
        none: 'py-0',
        sm: 'py-8',
        md: 'py-12',
        lg: 'py-16',
        xl: 'py-20',
        '2xl': 'py-24',
      },
      background: {
        none: '',
        subtle: 'bg-neutral-50 dark:bg-neutral-900',
        card: 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg',
        accent: 'bg-brand-50 dark:bg-brand-950',
      },
    },
    defaultVariants: {
      padding: 'md',
      background: 'none',
    },
  }
);

interface SectionProps extends VariantProps<typeof sectionVariants> {
  children: ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ 
  children, 
  padding, 
  background, 
  className 
}) => {
  return (
    <section className={twMerge(sectionVariants({ padding, background }), className)}>
      {children}
    </section>
  );
};

// Panel Component - Content panels with consistent styling
const panelVariants = cva(
  'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm',
  {
    variants: {
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      elevation: {
        none: 'shadow-none',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
      },
    },
    defaultVariants: {
      padding: 'md',
      elevation: 'sm',
    },
  }
);

interface PanelProps extends VariantProps<typeof panelVariants> {
  children: ReactNode;
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({ 
  children, 
  padding, 
  elevation, 
  className 
}) => {
  return (
    <div className={twMerge(panelVariants({ padding, elevation }), className)}>
      {children}
    </div>
  );
};

// Header Component - Consistent page headers
interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  actions, 
  breadcrumbs, 
  className 
}) => {
  return (
    <header className={twMerge('border-b border-neutral-200 dark:border-neutral-700 pb-6 mb-8', className)}>
      {breadcrumbs && (
        <div className="mb-4">
          {breadcrumbs}
        </div>
      )}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-display uppercase">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400 font-body">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="ml-6 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};

// =============================================================================
// FULL PAGE LAYOUTS
// =============================================================================

// Page Layout - Standard page structure
interface PageLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  header, 
  sidebar, 
  footer, 
  className 
}) => {
  return (
    <div className={twMerge('min-h-screen bg-neutral-50 dark:bg-neutral-900', className)}>
      {header && (
        <div className="sticky top-0 z-40 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
          {header}
        </div>
      )}
      
      <div className="flex flex-1">
        {sidebar && (
          <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16">
            <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700">
              {sidebar}
            </div>
          </aside>
        )}
        
        <main className={twMerge(
          'flex-1 min-w-0',
          sidebar ? 'lg:pl-64' : ''
        )}>
          <Container size="full" padding="md" className="py-8">
            {children}
          </Container>
        </main>
      </div>
      
      {footer && (
        <footer className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
          {footer}
        </footer>
      )}
    </div>
  );
};

// Dashboard Layout - Specialized for dashboard pages
interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  stats?: ReactNode;
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  actions, 
  stats, 
  className 
}) => {
  return (
    <div className={twMerge('space-y-8', className)}>
      <Header 
        title={title} 
        subtitle={subtitle} 
        actions={actions} 
      />
      
      {stats && (
        <Section padding="none">
          {stats}
        </Section>
      )}
      
      <Section padding="none">
        {children}
      </Section>
    </div>
  );
};

// Detail Layout - For detail/edit pages
interface DetailLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  tabs?: ReactNode;
  sidebar?: ReactNode;
  className?: string;
}

export const DetailLayout: React.FC<DetailLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  actions, 
  breadcrumbs, 
  tabs, 
  sidebar, 
  className 
}) => {
  return (
    <div className={twMerge('space-y-6', className)}>
      <Header 
        title={title} 
        subtitle={subtitle} 
        actions={actions} 
        breadcrumbs={breadcrumbs} 
      />
      
      {tabs && (
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          {tabs}
        </div>
      )}
      
      <div className={twMerge(
        'grid gap-8',
        sidebar ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'
      )}>
        <div className={sidebar ? 'lg:col-span-2' : ''}>
          {children}
        </div>
        
        {sidebar && (
          <div className="space-y-6">
            {sidebar}
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// RESPONSIVE UTILITIES
// =============================================================================

// Responsive Show/Hide Components
export const ShowOn: React.FC<{ 
  breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children: ReactNode;
}> = ({ breakpoint, children }) => {
  const classes = {
    sm: 'hidden sm:block',
    md: 'hidden md:block',
    lg: 'hidden lg:block',
    xl: 'hidden xl:block',
    '2xl': 'hidden 2xl:block',
  };
  
  return <div className={classes[breakpoint]}>{children}</div>;
};

export const HideOn: React.FC<{ 
  breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children: ReactNode;
}> = ({ breakpoint, children }) => {
  const classes = {
    sm: 'sm:hidden',
    md: 'md:hidden',
    lg: 'lg:hidden',
    xl: 'xl:hidden',
    '2xl': '2xl:hidden',
  };
  
  return <div className={classes[breakpoint]}>{children}</div>;
};

// =============================================================================
// LAYOUT HOOKS
// =============================================================================

export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = React.useState<string>('sm');
  
  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= 1536) setBreakpoint('2xl');
      else if (width >= 1280) setBreakpoint('xl');
      else if (width >= 1024) setBreakpoint('lg');
      else if (width >= 768) setBreakpoint('md');
      else setBreakpoint('sm');
    };
    
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);
  
  return {
    breakpoint,
    isSm: breakpoint === 'sm',
    isMd: breakpoint === 'md',
    isLg: breakpoint === 'lg',
    isXl: breakpoint === 'xl',
    is2xl: breakpoint === '2xl',
    isDesktop: ['lg', 'xl', '2xl'].includes(breakpoint),
    isMobile: ['sm', 'md'].includes(breakpoint),
  };
};

export default {
  Container,
  Stack,
  Inline,
  Grid,
  Section,
  Panel,
  Header,
  PageLayout,
  DashboardLayout,
  DetailLayout,
  ShowOn,
  HideOn,
  useResponsive,
};
