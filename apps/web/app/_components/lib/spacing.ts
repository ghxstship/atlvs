// Centralized spacing system for consistent layout patterns
// This ensures uniform spacing across all marketing pages

export const spacing = {
  // Section spacing
  sectionPadding: 'py-20',
  sectionPaddingLarge: 'py-24',
  sectionPaddingSmall: 'py-16',
  
  // Container spacing
  containerPadding: 'px-4',
  containerMargin: 'mx-auto',
  
  // Content spacing
  contentGap: 'gap-8',
  contentGapLarge: 'gap-12',
  contentGapSmall: 'gap-6',
  
  // Grid spacing
  gridGap: 'gap-6',
  gridGapLarge: 'gap-8',
  gridGapSmall: 'gap-4',
  
  // Text spacing
  textSpacing: 'space-y-6',
  textSpacingLarge: 'space-y-8',
  textSpacingSmall: 'space-y-4',
  
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
