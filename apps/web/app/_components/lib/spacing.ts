// Centralized spacing system for consistent layout patterns
// This ensures uniform spacing across all marketing pages

export const spacing = {
  // Section spacing
  sectionPadding: 'py-20',
  sectionPaddingLarge: 'py-24',
  sectionPaddingSmall: 'py-16',
  
  // Container spacing
  containerPadding: 'px-md',
  containerMargin: 'mx-auto',
  
  // Content spacing
  contentGap: 'gap-xl',
  contentGapLarge: 'gap-2xl',
  contentGapSmall: 'gap-lg',
  
  // Grid spacing
  gridGap: 'gap-lg',
  gridGapLarge: 'gap-xl',
  gridGapSmall: 'gap-md',
  
  // Text spacing
  textSpacing: 'stack-lg',
  textSpacingLarge: 'stack-xl',
  textSpacingSmall: 'stack-md',
  
  // Margin utilities
  marginBottom: {
    small: 'mb-4',
    medium: 'mb-6',
    large: 'mb-8',
    xlarge: 'mb-12',
    xxlarge: 'mb-16',
  },
  
  marginTop: {
    small: 'mt-4',
    medium: 'mt-6',
    large: 'mt-8',
    xlarge: 'mt-12',
    xxlarge: 'mt-16',
  },
} as const;

// Layout composition helpers
export const layouts = {
  // Standard section layout
  section: `${spacing.sectionPadding}`,
  sectionHero: `${spacing.sectionPaddingLarge}`,
  
  // Container layouts
  container: `container ${spacing.containerMargin} ${spacing.containerPadding}`,
  
  // Grid layouts
  gridTwoCol: `grid md:grid-cols-2 ${spacing.gridGap}`,
  gridThreeCol: `grid md:grid-cols-2 lg:grid-cols-3 ${spacing.gridGap}`,
  gridFourCol: `grid md:grid-cols-2 lg:grid-cols-4 ${spacing.gridGap}`,
  
  // Flex layouts
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexCol: 'flex flex-col',
  
  // Content layouts
  textCenter: 'text-center',
  maxWidthContent: 'max-w-3xl mx-auto',
  maxWidthWide: 'max-w-7xl mx-auto',
} as const;
