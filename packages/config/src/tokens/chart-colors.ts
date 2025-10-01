/**
 * Chart Color Tokens
 * Semantic color mappings for charts and data visualizations
 * Maps NYC subway colors to design system tokens
 */

// Design token references
export const CHART_COLORS = {
  // Primary data series
  primary: 'hsl(var(--color-primary))',        // Blue - #0039A6 → Primary
  secondary: 'hsl(var(--color-accent))',       // Orange - #FF6319 → Accent
  
  // Status colors
  success: 'hsl(var(--color-success))',        // Green - #00933C → Success
  warning: 'hsl(var(--color-warning))',        // Yellow - #FCCC0A → Warning
  error: 'hsl(var(--color-destructive))',      // Red - #EE352E → Destructive
  info: 'hsl(var(--color-info))',             // Blue - #0039A6 → Info
  
  // Neutral colors
  muted: 'hsl(var(--color-muted))',           // Gray - #A7A9AC → Muted
  border: 'hsl(var(--color-border))',         // Border color
  
  // Extended palette for multi-series charts
  purple: 'hsl(var(--color-purple))',         // Purple - #996633 → Purple
  pink: 'hsl(var(--color-pink))',             // Pink
  indigo: 'hsl(var(--color-indigo))',         // Indigo
  teal: 'hsl(var(--color-teal))',             // Teal
} as const;

// Status-specific mappings
export const STATUS_COLORS = {
  available: CHART_COLORS.success,      // Green
  occupied: CHART_COLORS.error,         // Red
  reserved: CHART_COLORS.warning,       // Orange/Yellow
  maintenance: CHART_COLORS.muted,      // Gray
  cleaning: CHART_COLORS.info,          // Blue
  setup: CHART_COLORS.warning,          // Orange/Yellow
  breakdown: CHART_COLORS.warning,      // Orange/Yellow
  out_of_service: CHART_COLORS.error,   // Red
  active: CHART_COLORS.success,         // Green
  inactive: CHART_COLORS.muted,         // Gray
  pending: CHART_COLORS.warning,        // Orange/Yellow
  completed: CHART_COLORS.success,      // Green
  cancelled: CHART_COLORS.error,        // Red
  draft: CHART_COLORS.muted,            // Gray
} as const;

// Access level colors
export const ACCESS_LEVEL_COLORS = {
  public: CHART_COLORS.success,         // Green
  restricted: CHART_COLORS.warning,     // Orange/Yellow
  staff_only: CHART_COLORS.muted,       // Gray
  talent_only: CHART_COLORS.info,       // Blue
  vip: CHART_COLORS.error,              // Red
  crew_only: CHART_COLORS.purple,       // Purple
  private: CHART_COLORS.error,          // Red
} as const;

// Space/Room kind colors
export const KIND_COLORS = {
  room: CHART_COLORS.info,              // Blue
  green_room: CHART_COLORS.success,     // Green
  dressing_room: CHART_COLORS.pink,     // Pink
  meeting_room: CHART_COLORS.purple,    // Purple
  classroom: CHART_COLORS.indigo,       // Indigo
  studio: CHART_COLORS.error,           // Red
  rehearsal_room: CHART_COLORS.warning, // Orange/Yellow
  storage: CHART_COLORS.muted,          // Gray
  stage: CHART_COLORS.primary,          // Blue
  backstage: CHART_COLORS.secondary,    // Orange
  office: CHART_COLORS.muted,           // Gray
  lounge: CHART_COLORS.teal,            // Teal
} as const;

// Priority colors
export const PRIORITY_COLORS = {
  low: CHART_COLORS.muted,              // Gray
  medium: CHART_COLORS.info,            // Blue
  high: CHART_COLORS.warning,           // Orange/Yellow
  urgent: CHART_COLORS.error,           // Red
  critical: CHART_COLORS.error,         // Red
} as const;

// Trend colors
export const TREND_COLORS = {
  positive: CHART_COLORS.success,       // Green
  negative: CHART_COLORS.error,         // Red
  neutral: CHART_COLORS.muted,          // Gray
  increasing: CHART_COLORS.success,     // Green
  decreasing: CHART_COLORS.error,       // Red
  stable: CHART_COLORS.info,            // Blue
} as const;

// Chart series colors (for multi-line/bar charts)
export const SERIES_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.error,
  CHART_COLORS.purple,
  CHART_COLORS.info,
  CHART_COLORS.pink,
  CHART_COLORS.indigo,
  CHART_COLORS.teal,
  CHART_COLORS.secondary,
] as const;

// Helper function to get color by index (for dynamic series)
export const getSeriesColor = (index: number): string => {
  return SERIES_COLORS[index % SERIES_COLORS.length];
};

// Helper function to get status color
export const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || CHART_COLORS.muted;
};

// Helper function to get access level color
export const getAccessLevelColor = (level: string): string => {
  return ACCESS_LEVEL_COLORS[level as keyof typeof ACCESS_LEVEL_COLORS] || CHART_COLORS.muted;
};

// Helper function to get kind color
export const getKindColor = (kind: string): string => {
  return KIND_COLORS[kind as keyof typeof KIND_COLORS] || CHART_COLORS.muted;
};

// Helper function to get priority color
export const getPriorityColor = (priority: string): string => {
  return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || CHART_COLORS.muted;
};

// Helper function to get trend color
export const getTrendColor = (trend: string): string => {
  return TREND_COLORS[trend as keyof typeof TREND_COLORS] || CHART_COLORS.muted;
};

// Export all for convenience
export const ChartColorTokens = {
  CHART_COLORS,
  STATUS_COLORS,
  ACCESS_LEVEL_COLORS,
  KIND_COLORS,
  PRIORITY_COLORS,
  TREND_COLORS,
  SERIES_COLORS,
  getSeriesColor,
  getStatusColor,
  getAccessLevelColor,
  getKindColor,
  getPriorityColor,
  getTrendColor,
} as const;

export default ChartColorTokens;
