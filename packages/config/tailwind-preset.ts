import type { Config } from 'tailwindcss';

const preset = {
  content: [],
  theme: {
    extend: {
      fontFamily: {
        title: ['var(--font-title)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        display: ['var(--font-title)', 'ANTON', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        full: 'var(--radius-full)',
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
        '20': 'var(--space-20)',
        '24': 'var(--space-24)',
      },
      colors: {
        // Core semantic colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        
        // Subway-style metro accents
        'subway-red': {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        'subway-blue': {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        'subway-green': {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        'subway-orange': {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        'subway-purple': {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        'subway-yellow': {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        'subway-grey': {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--foreground))',
        },
        
        // Department-specific colors (based on 3-letter codes)
        'dept-xla': 'hsl(var(--primary))',      // Executive Leadership
        'dept-fpl': 'hsl(var(--success))',      // Finance, Procurement & Legal
        'dept-cds': 'hsl(var(--accent))',       // Creative Design & Strategy
        'dept-epr': 'hsl(var(--warning))',      // Event Programming & Revenue
        'dept-mmm': 'hsl(var(--info))',         // Marketing & Media
        'dept-sed': 'hsl(142 76% 36%)',         // Site & Environmental (custom green)
        'dept-sol': 'hsl(38 92% 50%)',          // Site Operations (custom orange)
        'dept-itc': 'hsl(220 70% 50%)',         // IT & Communications (custom blue)
        'dept-xtp': 'hsl(271 81% 56%)',         // Experiential & Technical (custom purple)
        'dept-bgs': 'hsl(var(--destructive))',  // Branding, Graphics & Signage
        'dept-pss': 'hsl(0 0% 45%)',            // Public Safety (custom grey)
        'dept-gsx': 'hsl(142 71% 45%)',         // Guest Services (custom teal)
        'dept-hfb': 'hsl(25 95% 53%)',          // Hospitality, Food & Beverage (custom amber)
        'dept-ent': 'hsl(280 100% 70%)',        // Entertainment (custom magenta)
        'dept-tdx': 'hsl(200 100% 50%)',        // Travel, Destinations (custom cyan)
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgba(0,0,0,0.05), 0 1px 3px 1px rgba(0,0,0,0.05)',
        elevated: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)'
      },
      transitionDuration: {
        100: '100ms',
        200: '200ms',
        300: '300ms',
      },
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
      },
      opacity: {
        2: '0.02',
        3: '0.03',
        7: '0.07',
        15: '0.15',
      },
    },
  },
  plugins: [],
} satisfies Partial<Config>;

export default preset;
