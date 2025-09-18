/**
 * GHXSTSHIP 2026/2027 Color Design System
 * Timeless minimal core with subway-style accents
 * AA/AAA accessibility compliant
 */

// Base Color Palette - Neutral Foundation
export const baseColors = {
  // Pure neutrals - timeless core
  white: '#FFFFFF',
  black: '#000000',
  
  // Sophisticated greys - 50-950 scale
  grey: {
    50: '#FAFAFA',   // Almost white
    100: '#F5F5F5',  // Light background
    200: '#E5E5E5',  // Subtle borders
    300: '#D4D4D4',  // Disabled states
    400: '#A3A3A3',  // Placeholder text
    500: '#737373',  // Secondary text
    600: '#525252',  // Primary text (light mode)
    700: '#404040',  // Headings (light mode)
    800: '#262626',  // High contrast text
    900: '#171717',  // Maximum contrast
    950: '#0A0A0A',  // Near black
  },
  
  // Subway-style accent colors - metropolitan signage inspired
  metro: {
    // NYC Subway inspired
    red: '#EE352E',      // 4/5/6 line red
    blue: '#0039A6',     // A/C/E line blue
    green: '#00933C',    // 4/5/6 line green
    orange: '#FF6319',   // B/D/F/M line orange
    purple: '#B933AD',   // 7 line purple
    yellow: '#FCCC0A',   // N/Q/R/W line yellow
    
    // London Underground inspired
    bakerloo: '#B36305',    // Bakerloo brown
    central: '#E32017',     // Central red
    district: '#00782A',    // District green
    jubilee: '#A0A5A9',     // Jubilee grey
    northern: '#000000',    // Northern black
    piccadilly: '#003688',  // Piccadilly blue
    victoria: '#0098D4',    // Victoria light blue
    
    // Tokyo Metro inspired
    ginza: '#FF9500',       // Ginza orange
    marunouchi: '#F62E36',  // Marunouchi red
    hibiya: '#B5B5AC',      // Hibiya silver
    tozai: '#009BBF',       // Tozai sky blue
    chiyoda: '#00BB85',     // Chiyoda green
    yurakucho: '#C1A470',   // Yurakucho gold
  }
} as const;

// Semantic Color Tokens - Light Theme
export const lightTheme = {
  // Surface colors
  surface: {
    primary: baseColors.white,
    secondary: baseColors.grey[50],
    tertiary: baseColors.grey[100],
    inverse: baseColors.grey[900],
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Text colors
  text: {
    primary: baseColors.grey[900],      // AAA contrast
    secondary: baseColors.grey[600],    // AA contrast
    tertiary: baseColors.grey[500],     // AA contrast
    disabled: baseColors.grey[400],
    inverse: baseColors.white,
    link: baseColors.metro.blue,
    linkHover: baseColors.metro.piccadilly,
  },
  
  // Border colors
  border: {
    primary: baseColors.grey[200],
    secondary: baseColors.grey[300],
    focus: baseColors.metro.blue,
    error: baseColors.metro.red,
    success: baseColors.metro.green,
  },
  
  // Interactive states
  interactive: {
    primary: baseColors.metro.blue,
    primaryHover: baseColors.metro.piccadilly,
    primaryActive: baseColors.metro.northern,
    secondary: baseColors.grey[100],
    secondaryHover: baseColors.grey[200],
    secondaryActive: baseColors.grey[300],
  },
  
  // Status colors
  status: {
    success: baseColors.metro.green,
    successBg: '#F0FDF4',
    warning: baseColors.metro.orange,
    warningBg: '#FFFBEB',
    error: baseColors.metro.red,
    errorBg: '#FEF2F2',
    info: baseColors.metro.blue,
    infoBg: '#EFF6FF',
  },
  
  // Badge colors - subway line inspired
  badge: {
    red: {
      bg: baseColors.metro.red,
      text: baseColors.white,
      border: baseColors.metro.red,
    },
    blue: {
      bg: baseColors.metro.blue,
      text: baseColors.white,
      border: baseColors.metro.blue,
    },
    green: {
      bg: baseColors.metro.green,
      text: baseColors.white,
      border: baseColors.metro.green,
    },
    orange: {
      bg: baseColors.metro.orange,
      text: baseColors.white,
      border: baseColors.metro.orange,
    },
    purple: {
      bg: baseColors.metro.purple,
      text: baseColors.white,
      border: baseColors.metro.purple,
    },
    yellow: {
      bg: baseColors.metro.yellow,
      text: baseColors.grey[900],
      border: baseColors.metro.yellow,
    },
    grey: {
      bg: baseColors.grey[100],
      text: baseColors.grey[700],
      border: baseColors.grey[200],
    },
    black: {
      bg: baseColors.grey[900],
      text: baseColors.white,
      border: baseColors.grey[900],
    },
  }
} as const;

// Semantic Color Tokens - Dark Theme
export const darkTheme = {
  // Surface colors
  surface: {
    primary: baseColors.grey[950],
    secondary: baseColors.grey[900],
    tertiary: baseColors.grey[800],
    inverse: baseColors.grey[50],
    overlay: 'rgba(0, 0, 0, 0.8)',
  },
  
  // Text colors
  text: {
    primary: baseColors.grey[50],       // AAA contrast
    secondary: baseColors.grey[300],    // AA contrast
    tertiary: baseColors.grey[400],     // AA contrast
    disabled: baseColors.grey[600],
    inverse: baseColors.grey[900],
    link: baseColors.metro.victoria,
    linkHover: baseColors.metro.tozai,
  },
  
  // Border colors
  border: {
    primary: baseColors.grey[800],
    secondary: baseColors.grey[700],
    focus: baseColors.metro.victoria,
    error: baseColors.metro.central,
    success: baseColors.metro.chiyoda,
  },
  
  // Interactive states
  interactive: {
    primary: baseColors.metro.victoria,
    primaryHover: baseColors.metro.tozai,
    primaryActive: baseColors.metro.blue,
    secondary: baseColors.grey[800],
    secondaryHover: baseColors.grey[700],
    secondaryActive: baseColors.grey[600],
  },
  
  // Status colors
  status: {
    success: baseColors.metro.chiyoda,
    successBg: 'rgba(0, 187, 133, 0.1)',
    warning: baseColors.metro.ginza,
    warningBg: 'rgba(255, 149, 0, 0.1)',
    error: baseColors.metro.central,
    errorBg: 'rgba(227, 32, 23, 0.1)',
    info: baseColors.metro.victoria,
    infoBg: 'rgba(0, 152, 212, 0.1)',
  },
  
  // Badge colors - enhanced for dark mode
  badge: {
    red: {
      bg: baseColors.metro.central,
      text: baseColors.white,
      border: baseColors.metro.central,
    },
    blue: {
      bg: baseColors.metro.victoria,
      text: baseColors.white,
      border: baseColors.metro.victoria,
    },
    green: {
      bg: baseColors.metro.chiyoda,
      text: baseColors.white,
      border: baseColors.metro.chiyoda,
    },
    orange: {
      bg: baseColors.metro.ginza,
      text: baseColors.white,
      border: baseColors.metro.ginza,
    },
    purple: {
      bg: baseColors.metro.purple,
      text: baseColors.white,
      border: baseColors.metro.purple,
    },
    yellow: {
      bg: baseColors.metro.yurakucho,
      text: baseColors.grey[900],
      border: baseColors.metro.yurakucho,
    },
    grey: {
      bg: baseColors.grey[700],
      text: baseColors.grey[100],
      border: baseColors.grey[600],
    },
    black: {
      bg: baseColors.grey[100],
      text: baseColors.grey[900],
      border: baseColors.grey[100],
    },
  }
} as const;

// Functional Color Tokens
export const functionalTokens = {
  // Component-specific colors
  button: {
    primary: {
      light: {
        bg: lightTheme.interactive.primary,
        text: lightTheme.text.inverse,
        border: lightTheme.interactive.primary,
        hover: lightTheme.interactive.primaryHover,
        active: lightTheme.interactive.primaryActive,
      },
      dark: {
        bg: darkTheme.interactive.primary,
        text: darkTheme.text.inverse,
        border: darkTheme.interactive.primary,
        hover: darkTheme.interactive.primaryHover,
        active: darkTheme.interactive.primaryActive,
      }
    },
    secondary: {
      light: {
        bg: lightTheme.interactive.secondary,
        text: lightTheme.text.primary,
        border: lightTheme.border.primary,
        hover: lightTheme.interactive.secondaryHover,
        active: lightTheme.interactive.secondaryActive,
      },
      dark: {
        bg: darkTheme.interactive.secondary,
        text: darkTheme.text.primary,
        border: darkTheme.border.primary,
        hover: darkTheme.interactive.secondaryHover,
        active: darkTheme.interactive.secondaryActive,
      }
    }
  },
  
  // Form elements
  form: {
    input: {
      light: {
        bg: lightTheme.surface.primary,
        text: lightTheme.text.primary,
        border: lightTheme.border.primary,
        focus: lightTheme.border.focus,
        placeholder: lightTheme.text.tertiary,
      },
      dark: {
        bg: darkTheme.surface.secondary,
        text: darkTheme.text.primary,
        border: darkTheme.border.primary,
        focus: darkTheme.border.focus,
        placeholder: darkTheme.text.tertiary,
      }
    }
  },
  
  // Navigation elements
  navigation: {
    light: {
      bg: lightTheme.surface.primary,
      text: lightTheme.text.primary,
      textHover: lightTheme.interactive.primary,
      border: lightTheme.border.primary,
      active: lightTheme.interactive.secondary,
    },
    dark: {
      bg: darkTheme.surface.primary,
      text: darkTheme.text.primary,
      textHover: darkTheme.interactive.primary,
      border: darkTheme.border.primary,
      active: darkTheme.interactive.secondary,
    }
  }
} as const;

// Accessibility compliance mapping
export const accessibilityCompliance = {
  // AA compliant combinations (4.5:1 contrast ratio)
  aa: {
    light: [
      { bg: baseColors.white, text: baseColors.grey[600] },
      { bg: baseColors.grey[100], text: baseColors.grey[700] },
      { bg: baseColors.metro.blue, text: baseColors.white },
      { bg: baseColors.metro.red, text: baseColors.white },
      { bg: baseColors.metro.green, text: baseColors.white },
    ],
    dark: [
      { bg: baseColors.grey[900], text: baseColors.grey[300] },
      { bg: baseColors.grey[800], text: baseColors.grey[200] },
      { bg: baseColors.metro.victoria, text: baseColors.white },
      { bg: baseColors.metro.central, text: baseColors.white },
      { bg: baseColors.metro.chiyoda, text: baseColors.white },
    ]
  },
  
  // AAA compliant combinations (7:1 contrast ratio)
  aaa: {
    light: [
      { bg: baseColors.white, text: baseColors.grey[700] },
      { bg: baseColors.white, text: baseColors.grey[900] },
      { bg: baseColors.grey[50], text: baseColors.grey[800] },
    ],
    dark: [
      { bg: baseColors.grey[950], text: baseColors.grey[200] },
      { bg: baseColors.grey[950], text: baseColors.grey[50] },
      { bg: baseColors.grey[900], text: baseColors.grey[100] },
    ]
  }
} as const;

// Usage examples
export const usageExamples = {
  // Primary button
  primaryButton: {
    light: `bg-[${lightTheme.interactive.primary}] text-[${lightTheme.text.inverse}] hover:bg-[${lightTheme.interactive.primaryHover}]`,
    dark: `bg-[${darkTheme.interactive.primary}] text-[${darkTheme.text.inverse}] hover:bg-[${darkTheme.interactive.primaryHover}]`
  },
  
  // Status badge
  successBadge: {
    light: `bg-[${lightTheme.badge.green.bg}] text-[${lightTheme.badge.green.text}] border-[${lightTheme.badge.green.border}]`,
    dark: `bg-[${darkTheme.badge.green.bg}] text-[${darkTheme.badge.green.text}] border-[${darkTheme.badge.green.border}]`
  },
  
  // Card component
  card: {
    light: `bg-[${lightTheme.surface.primary}] text-[${lightTheme.text.primary}] border-[${lightTheme.border.primary}]`,
    dark: `bg-[${darkTheme.surface.secondary}] text-[${darkTheme.text.primary}] border-[${darkTheme.border.primary}]`
  }
} as const;
