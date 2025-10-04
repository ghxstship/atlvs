// Centralized spacing system for consistent layout patterns
// This ensures uniform spacing across all marketing pages

export const spacing = {
  // Section spacing
  sectionPadding: 'py-4xl',
  sectionPaddingLarge: 'py-5xl',
  sectionPaddingSmall: 'py-3xl',
  
  // Container spacing
  containerPadding: 'px-md',
  containerMargin: 'mx-auto',
  
  // Content spacing
  contentGap: 'gap-xl',
  contentGapLarge: 'gap-3xl',
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
    small: 'mb-md',
    medium: 'mb-lg',
    large: 'mb-xl',
    xlarge: 'mb-2xl',
    xxlarge: 'mb-3xl',
  },
  
  marginTop: {
    small: 'mt-md',
    medium: 'mt-lg',
    large: 'mt-xl',
    xlarge: 'mt-2xl',
    xxlarge: 'mt-3xl',
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
