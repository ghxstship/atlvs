'use client';

import React, { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

// 2026 Unified Grid & Spacing System
// Global layout consistency with mathematical precision and responsive adaptability

// =============================================================================
// MATHEMATICAL SPACING FOUNDATION
// =============================================================================

// Base unit: 4px (0.25rem) - Perfect for 8px grid system
export const SPACING_UNITS = {
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
  36: '9rem',      // 144px
  40: '10rem',     // 160px
  44: '11rem',     // 176px
  48: '12rem',     // 192px
  52: '13rem',     // 208px
  56: '14rem',     // 224px
  60: '15rem',     // 240px
  64: '16rem',     // 256px
  72: '18rem',     // 288px
  80: '20rem',     // 320px
  96: '24rem',     // 384px
} as const;

// Semantic spacing scale for consistent component spacing
export const SEMANTIC_SPACING = {
  xs: SPACING_UNITS[1],    // 4px
  sm: SPACING_UNITS[2],    // 8px
  md: SPACING_UNITS[4],    // 16px
  lg: SPACING_UNITS[6],    // 24px
  xl: SPACING_UNITS[8],    // 32px
  '2xl': SPACING_UNITS[12], // 48px
  '3xl': SPACING_UNITS[16], // 64px
  '4xl': SPACING_UNITS[24], // 96px
  '5xl': SPACING_UNITS[32], // 128px
} as const;

// =============================================================================
// GRID FOUNDATION SYSTEM
// =============================================================================

// Enhanced Grid Container
const gridContainerVariants = cva(
  'grid',
  {
    variants: {
      // Column definitions
      cols: {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
        7: 'grid-cols-7',
        8: 'grid-cols-8',
        9: 'grid-cols-9',
        10: 'grid-cols-10',
        11: 'grid-cols-11',
        12: 'grid-cols-12',
        none: 'grid-cols-none',
        subgrid: 'grid-cols-subgrid',
      },
      
      // Responsive column definitions
      responsive: {
        auto: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        cards: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
        list: 'grid-cols-1 lg:grid-cols-2',
        dashboard: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
        sidebar: 'grid-cols-1 lg:grid-cols-[240px_1fr]',
        split: 'grid-cols-1 lg:grid-cols-2',
        thirds: 'grid-cols-1 md:grid-cols-3',
        quarters: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      },
      
      // Row definitions
      rows: {
        1: 'grid-rows-1',
        2: 'grid-rows-2',
        3: 'grid-rows-3',
        4: 'grid-rows-4',
        5: 'grid-rows-5',
        6: 'grid-rows-6',
        none: 'grid-rows-none',
        subgrid: 'grid-rows-subgrid',
      },
      
      // Gap spacing
      gap: {
        0: 'gap-0',
        1: 'gap-xs',
        2: 'gap-sm',
        3: 'gap-sm',
        4: 'gap-md',
        5: 'gap-lg',
        6: 'gap-lg',
        7: 'gap-xl',
        8: 'gap-xl',
        10: 'gap-2xl',
        12: 'gap-2xl',
        16: 'gap-3xl',
        20: 'gap-4xl',
        24: 'gap-5xl',
      },
      
      // Responsive gap
      responsiveGap: {
        sm: 'gap-sm sm:gap-md',
        md: 'gap-md sm:gap-lg',
        lg: 'gap-lg sm:gap-xl',
        xl: 'gap-xl sm:gap-2xl',
      },
      
      // Auto-fit and auto-fill
      autoFit: {
        xs: 'grid-cols-[repeat(auto-fit,minmax(200px,1fr))]',
        sm: 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]',
        md: 'grid-cols-[repeat(auto-fit,minmax(300px,1fr))]',
        lg: 'grid-cols-[repeat(auto-fit,minmax(350px,1fr))]',
        xl: 'grid-cols-[repeat(auto-fit,minmax(400px,1fr))]',
      },
      
      // Dense packing
      dense: {
        true: 'grid-flow-dense',
        false: '',
      },
      
      // Flow direction
      flow: {
        row: 'grid-flow-row',
        col: 'grid-flow-col',
        'row-dense': 'grid-flow-row-dense',
        'col-dense': 'grid-flow-col-dense',
      },
    },
    defaultVariants: {
      cols: 1,
      gap: 4,
      dense: false,
      flow: 'row',
    },
  }
);

// Enhanced Grid Item
const gridItemVariants = cva(
  '',
  {
    variants: {
      // Column span
      colSpan: {
        1: 'col-span-1',
        2: 'col-span-2',
        3: 'col-span-3',
        4: 'col-span-4',
        5: 'col-span-5',
        6: 'col-span-6',
        7: 'col-span-7',
        8: 'col-span-8',
        9: 'col-span-9',
        10: 'col-span-10',
        11: 'col-span-11',
        12: 'col-span-12',
        full: 'col-span-full',
        auto: 'col-auto',
      },
      
      // Row span
      rowSpan: {
        1: 'row-span-1',
        2: 'row-span-2',
        3: 'row-span-3',
        4: 'row-span-4',
        5: 'row-span-5',
        6: 'row-span-6',
        full: 'row-span-full',
        auto: 'row-auto',
      },
      
      // Column start
      colStart: {
        1: 'col-start-1',
        2: 'col-start-2',
        3: 'col-start-3',
        4: 'col-start-4',
        5: 'col-start-5',
        6: 'col-start-6',
        7: 'col-start-7',
        8: 'col-start-8',
        9: 'col-start-9',
        10: 'col-start-10',
        11: 'col-start-11',
        12: 'col-start-12',
        13: 'col-start-13',
        auto: 'col-start-auto',
      },
      
      // Column end
      colEnd: {
        1: 'col-end-1',
        2: 'col-end-2',
        3: 'col-end-3',
        4: 'col-end-4',
        5: 'col-end-5',
        6: 'col-end-6',
        7: 'col-end-7',
        8: 'col-end-8',
        9: 'col-end-9',
        10: 'col-end-10',
        11: 'col-end-11',
        12: 'col-end-12',
        13: 'col-end-13',
        auto: 'col-end-auto',
      },
      
      // Responsive column span
      responsiveColSpan: {
        'sm-2': 'col-span-1 sm:col-span-2',
        'md-3': 'col-span-1 md:col-span-3',
        'lg-4': 'col-span-1 lg:col-span-4',
        'xl-6': 'col-span-1 xl:col-span-6',
        'full-half': 'col-span-full lg:col-span-6',
        'half-third': 'col-span-6 lg:col-span-4',
      },
    },
    defaultVariants: {
      colSpan: 'auto',
      rowSpan: 'auto',
    },
  }
);

// =============================================================================
// FLEXBOX SYSTEM
// =============================================================================

// Enhanced Flex Container
const flexContainerVariants = cva(
  'flex',
  {
    variants: {
      direction: {
        row: 'flex-row',
        'row-reverse': 'flex-row-reverse',
        col: 'flex-col',
        'col-reverse': 'flex-col-reverse',
      },
      
      wrap: {
        nowrap: 'flex-nowrap',
        wrap: 'flex-wrap',
        'wrap-reverse': 'flex-wrap-reverse',
      },
      
      justify: {
        start: 'justify-start',
        end: 'justify-end',
        center: 'justify-center',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
        stretch: 'justify-stretch',
      },
      
      align: {
        start: 'items-start',
        end: 'items-end',
        center: 'items-center',
        baseline: 'items-baseline',
        stretch: 'items-stretch',
      },
      
      alignContent: {
        start: 'content-start',
        end: 'content-end',
        center: 'content-center',
        between: 'content-between',
        around: 'content-around',
        evenly: 'content-evenly',
        stretch: 'content-stretch',
      },
      
      gap: {
        0: 'gap-0',
        1: 'gap-xs',
        2: 'gap-sm',
        3: 'gap-sm',
        4: 'gap-md',
        5: 'gap-lg',
        6: 'gap-lg',
        8: 'gap-xl',
        10: 'gap-2xl',
        12: 'gap-2xl',
        16: 'gap-3xl',
      },
      
      responsiveDirection: {
        'col-row': 'flex-col sm:flex-row',
        'row-col': 'flex-row sm:flex-col',
        'col-row-lg': 'flex-col lg:flex-row',
      },
      
      responsiveGap: {
        sm: 'gap-sm sm:gap-md',
        md: 'gap-md sm:gap-lg',
        lg: 'gap-lg sm:gap-xl',
      },
    },
    defaultVariants: {
      direction: 'row',
      wrap: 'nowrap',
      justify: 'start',
      align: 'stretch',
      gap: 0,
    },
  }
);

// Enhanced Flex Item
const flexItemVariants = cva(
  '',
  {
    variants: {
      flex: {
        1: 'flex-1',
        auto: 'flex-auto',
        initial: 'flex-initial',
        none: 'flex-none',
      },
      
      grow: {
        0: 'flex-grow-0',
        1: 'flex-grow',
      },
      
      shrink: {
        0: 'flex-shrink-0',
        1: 'flex-shrink',
      },
      
      basis: {
        0: 'basis-0',
        1: 'basis-1',
        2: 'basis-2',
        3: 'basis-3',
        4: 'basis-4',
        5: 'basis-5',
        6: 'basis-6',
        8: 'basis-8',
        10: 'basis-10',
        12: 'basis-12',
        16: 'basis-16',
        20: 'basis-20',
        24: 'basis-24',
        32: 'basis-32',
        40: 'basis-40',
        48: 'basis-48',
        56: 'basis-56',
        64: 'basis-64',
        auto: 'basis-auto',
        '1/2': 'basis-1/2',
        '1/3': 'basis-1/3',
        '2/3': 'basis-2/3',
        '1/4': 'basis-1/4',
        '3/4': 'basis-3/4',
        full: 'basis-full',
      },
      
      alignSelf: {
        auto: 'self-auto',
        start: 'self-start',
        end: 'self-end',
        center: 'self-center',
        stretch: 'self-stretch',
        baseline: 'self-baseline',
      },
      
      order: {
        1: 'order-1',
        2: 'order-2',
        3: 'order-3',
        4: 'order-4',
        5: 'order-5',
        6: 'order-6',
        7: 'order-7',
        8: 'order-8',
        9: 'order-9',
        10: 'order-10',
        11: 'order-11',
        12: 'order-12',
        first: 'order-first',
        last: 'order-last',
        none: 'order-none',
      },
    },
    defaultVariants: {
      flex: 'initial',
      alignSelf: 'auto',
    },
  }
);

// =============================================================================
// SPACING SYSTEM
// =============================================================================

// Enhanced Spacing Utilities
const spacingVariants = cva('', {
  variants: {
    // Margin
    m: {
      0: 'm-0', 1: 'm-xs', 2: 'm-sm', 3: 'm-sm', 4: 'm-md', 5: 'm-lg', 6: 'm-lg', 8: 'm-xl', 10: 'm-2xl', 12: 'm-2xl', 16: 'm-3xl', 20: 'm-4xl', 24: 'm-5xl', 32: 'm-5xl',
      auto: 'm-auto',
    },
    mx: {
      0: 'mx-0', 1: 'mx-xs', 2: 'mx-sm', 3: 'mx-sm', 4: 'mx-md', 5: 'mx-lg', 6: 'mx-lg', 8: 'mx-xl', 10: 'mx-2xl', 12: 'mx-2xl', 16: 'mx-3xl', 20: 'mx-4xl', 24: 'mx-5xl', 32: 'mx-5xl',
      auto: 'mx-auto',
    },
    my: {
      0: 'my-0', 1: 'my-xs', 2: 'my-sm', 3: 'my-sm', 4: 'my-md', 5: 'my-lg', 6: 'my-lg', 8: 'my-xl', 10: 'my-2xl', 12: 'my-2xl', 16: 'my-3xl', 20: 'my-4xl', 24: 'my-5xl', 32: 'my-5xl',
    },
    mt: {
      0: 'mt-0', 1: 'mt-xs', 2: 'mt-sm', 3: 'mt-sm', 4: 'mt-md', 5: 'mt-lg', 6: 'mt-lg', 8: 'mt-xl', 10: 'mt-2xl', 12: 'mt-2xl', 16: 'mt-3xl', 20: 'mt-4xl', 24: 'mt-24', 32: 'mt-32',
      auto: 'mt-auto',
    },
    mr: {
      0: 'mr-0', 1: 'mr-xs', 2: 'mr-sm', 3: 'mr-sm', 4: 'mr-md', 5: 'mr-lg', 6: 'mr-lg', 8: 'mr-xl', 10: 'mr-2xl', 12: 'mr-2xl', 16: 'mr-3xl', 20: 'mr-20', 24: 'mr-24', 32: 'mr-32',
      auto: 'mr-auto',
    },
    mb: {
      0: 'mb-0', 1: 'mb-xs', 2: 'mb-sm', 3: 'mb-sm', 4: 'mb-md', 5: 'mb-lg', 6: 'mb-lg', 8: 'mb-xl', 10: 'mb-2xl', 12: 'mb-2xl', 16: 'mb-3xl', 20: 'mb-4xl', 24: 'mb-24', 32: 'mb-32',
      auto: 'mb-auto',
    },
    ml: {
      0: 'ml-0', 1: 'ml-xs', 2: 'ml-sm', 3: 'ml-sm', 4: 'ml-md', 5: 'ml-lg', 6: 'ml-lg', 8: 'ml-xl', 10: 'ml-2xl', 12: 'ml-2xl', 16: 'ml-3xl', 20: 'ml-20', 24: 'ml-24', 32: 'ml-32',
      auto: 'ml-auto',
    },
    
    // Padding
    p: {
      0: 'p-0', 1: 'p-xs', 2: 'p-sm', 3: 'p-sm', 4: 'p-md', 5: 'p-lg', 6: 'p-lg', 8: 'p-xl', 10: 'p-2xl', 12: 'p-2xl', 16: 'p-3xl', 20: 'p-4xl', 24: 'p-5xl', 32: 'p-5xl',
    },
    px: {
      0: 'px-0', 1: 'px-xs', 2: 'px-sm', 3: 'px-sm', 4: 'px-md', 5: 'px-lg', 6: 'px-lg', 8: 'px-xl', 10: 'px-2xl', 12: 'px-2xl', 16: 'px-3xl', 20: 'px-4xl', 24: 'px-5xl', 32: 'px-5xl',
    },
    py: {
      0: 'py-0', 1: 'py-xs', 2: 'py-sm', 3: 'py-sm', 4: 'py-md', 5: 'py-lg', 6: 'py-lg', 8: 'py-xl', 10: 'py-2xl', 12: 'py-2xl', 16: 'py-3xl', 20: 'py-4xl', 24: 'py-5xl', 32: 'py-5xl',
    },
    pt: {
      0: 'pt-0', 1: 'pt-xs', 2: 'pt-sm', 3: 'pt-sm', 4: 'pt-md', 5: 'pt-lg', 6: 'pt-lg', 8: 'pt-xl', 10: 'pt-2xl', 12: 'pt-2xl', 16: 'pt-3xl', 20: 'pt-4xl', 24: 'pt-24', 32: 'pt-32',
    },
    pr: {
      0: 'pr-0', 1: 'pr-xs', 2: 'pr-sm', 3: 'pr-sm', 4: 'pr-md', 5: 'pr-lg', 6: 'pr-lg', 8: 'pr-xl', 10: 'pr-2xl', 12: 'pr-2xl', 16: 'pr-3xl', 20: 'pr-20', 24: 'pr-24', 32: 'pr-32',
    },
    pb: {
      0: 'pb-0', 1: 'pb-xs', 2: 'pb-sm', 3: 'pb-sm', 4: 'pb-md', 5: 'pb-lg', 6: 'pb-lg', 8: 'pb-xl', 10: 'pb-2xl', 12: 'pb-2xl', 16: 'pb-3xl', 20: 'pb-4xl', 24: 'pb-24', 32: 'pb-32',
    },
    pl: {
      0: 'pl-0', 1: 'pl-xs', 2: 'pl-sm', 3: 'pl-sm', 4: 'pl-md', 5: 'pl-lg', 6: 'pl-lg', 8: 'pl-xl', 10: 'pl-2xl', 12: 'pl-2xl', 16: 'pl-3xl', 20: 'pl-20', 24: 'pl-24', 32: 'pl-32',
    },
    
    // Space between children
    spaceX: {
      0: 'space-x-0', 1: 'gap-xs', 2: 'gap-sm', 3: 'gap-sm', 4: 'gap-md', 5: 'space-x-lg', 6: 'gap-lg', 8: 'gap-xl', 10: 'space-x-2xl', 12: 'space-x-2xl', 16: 'space-x-3xl',
    },
    spaceY: {
      0: 'space-y-0', 1: 'gap-xs', 2: 'gap-sm', 3: 'gap-sm', 4: 'gap-md', 5: 'space-y-lg', 6: 'gap-lg', 8: 'gap-xl', 10: 'gap-2xl', 12: 'gap-2xl', 16: 'gap-3xl',
    },
  },
});

// =============================================================================
// RESPONSIVE BREAKPOINT SYSTEM
// =============================================================================

export const BREAKPOINTS = {
  sm: '640px',   // Small devices (landscape phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (desktops)
  xl: '1280px',  // Extra large devices (large desktops)
  '2xl': '1536px', // 2X large devices (larger desktops)
} as const;

export const CONTAINER_SIZES = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// =============================================================================
// LAYOUT COMPOSITION UTILITIES
// =============================================================================

export const createResponsiveGrid = (
  breakpoints: Record<string, number>
) => {
  const classes = Object.entries(breakpoints)
    .map(([bp, cols]) => {
      if (bp === 'default') return `grid-cols-${cols}`;
      return `${bp}:grid-cols-${cols}`;
    })
    .join(' ');
  
  return `grid ${classes}`;
};

export const createFlexLayout = (
  direction: 'row' | 'col' = 'row',
  justify: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' = 'start',
  align: 'start' | 'center' | 'end' | 'stretch' | 'baseline' = 'stretch',
  gap: number = 4
) => {
  return `flex flex-${direction} justify-${justify} items-${align} gap-${gap}`;
};

export const createSpacing = (
  type: 'margin' | 'padding',
  sides: 'all' | 'x' | 'y' | 'top' | 'right' | 'bottom' | 'left',
  size: number
) => {
  const prefix = type === 'margin' ? 'm' : 'p';
  const sideMap = {
    all: '',
    x: 'x',
    y: 'y',
    top: 't',
    right: 'r',
    bottom: 'b',
    left: 'l',
  };
  
  return `${prefix}${sideMap[sides]}-${size}`;
};

// =============================================================================
// COMPONENT EXPORTS
// =============================================================================

export const GridSystem = {
  // Grid components
  grid: gridContainerVariants,
  gridItem: gridItemVariants,
  
  // Flex components
  flex: flexContainerVariants,
  flexItem: flexItemVariants,
  
  // Spacing utilities
  spacing: spacingVariants,
  
  // Constants
  spacingUnits: SPACING_UNITS,
  semanticSpacing: SEMANTIC_SPACING,
  breakpoints: BREAKPOINTS,
  containerSizes: CONTAINER_SIZES,
  
  // Utilities
  createResponsiveGrid,
  createFlexLayout,
  createSpacing,
};

// =============================================================================
// GRID COMPOSITION COMPONENTS
// =============================================================================

export interface GridProps extends VariantProps<typeof gridContainerVariants> {
  children: ReactNode;
  className?: string;
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(gridContainerVariants(props), className)}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

export interface FlexProps extends VariantProps<typeof flexContainerVariants> {
  children: ReactNode;
  className?: string;
}

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(flexContainerVariants(props), className)}
      >
        {children}
      </div>
    );
  }
);

Flex.displayName = 'Flex';

export default GridSystem;
