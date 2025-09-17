'use client';

import React from 'react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

// Design system tokens and standards
export const DesignTokens = {
  // Color system
  colors: {
    // Primary colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    
    // Semantic colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    },
    
    // Neutral colors
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    }
  },

  // Typography system
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace']
    },
    
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }]
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },

  // Spacing system
  spacing: {
    0: '0px',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem'
  },

  // Border radius
  borderRadius: {
    none: '0px',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },

  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  }
};

// Component size variants
export const ComponentSizes = {
  button: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  },
  
  input: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  },
  
  card: {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }
};

// Component variants
export const ComponentVariants = {
  button: {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary',
    outline: 'border border-border bg-background text-foreground hover:bg-muted focus:ring-primary',
    ghost: 'text-muted-foreground hover:bg-muted focus:ring-primary',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive'
  },
  
  badge: {
    default: 'bg-muted text-foreground',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-destructive/10 text-destructive'
  },
  
  alert: {
    info: 'bg-info/10 border border-info/20 text-info',
    success: 'bg-success/10 border border-success/20 text-success',
    warning: 'bg-warning/10 border border-warning/20 text-warning',
    error: 'bg-destructive/10 border border-destructive/20 text-destructive'
  }
};

// Accessibility standards
export const AccessibilityStandards = {
  // ARIA attributes
  aria: {
    required: ['aria-label', 'aria-labelledby', 'aria-describedby'],
    interactive: ['role', 'tabindex', 'aria-expanded', 'aria-selected'],
    form: ['aria-invalid', 'aria-required', 'aria-describedby']
  },
  
  // Color contrast ratios (WCAG AA)
  contrast: {
    normal: 4.5,
    large: 3.0,
    enhanced: 7.0
  },
  
  // Focus management
  focus: {
    visible: 'focus:outline-none focus:ring-2 focus:ring-offset-2',
    within: 'focus-within:ring-2 focus-within:ring-offset-2'
  },
  
  // Keyboard navigation
  keyboard: {
    interactive: 'cursor-pointer focus:outline-none',
    disabled: 'cursor-not-allowed opacity-50'
  }
};

// Component composition patterns
export interface CompositionPattern {
  name: string;
  description: string;
  example: React.ReactNode;
  code: string;
}

export const CompositionPatterns: CompositionPattern[] = [
  {
    name: 'Card with Header',
    description: 'Standard card layout with header, content, and optional footer',
    example: (
      <Card className="w-full max-w-md">
        <div className="border-b pb-4 mb-4">
          <h3 className="text-lg font-semibold">Card Title</h3>
          <p className="text-sm text-muted-foreground">Card subtitle or description</p>
        </div>
        <div className="space-y-3">
          <p>Card content goes here. This can include any type of content.</p>
        </div>
        <div className="border-t pt-4 mt-4 flex justify-end space-x-2">
          <Button variant="outline" size="sm">Cancel</Button>
          <Button size="sm">Confirm</Button>
        </div>
      </Card>
    ),
    code: `<Card>
  <div className="border-b pb-4 mb-4">
    <h3 className="text-lg font-semibold">Card Title</h3>
    <p className="text-sm text-muted-foreground">Subtitle</p>
  </div>
  <div className="space-y-3">
    {/* Content */}
  </div>
  <div className="border-t pt-4 mt-4 flex justify-end space-x-2">
    <Button variant="outline">Cancel</Button>
    <Button>Confirm</Button>
  </div>
</Card>`
  },
  
  {
    name: 'Status Badge Pattern',
    description: 'Consistent status indication using badges with semantic colors',
    example: (
      <div className="flex space-x-2">
        <Badge variant="success">Active</Badge>
        <Badge variant="warning">Pending</Badge>
        <Badge variant="error">Error</Badge>
        <Badge variant="default">Draft</Badge>
      </div>
    ),
    code: `<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="default">Draft</Badge>`
  },
  
  {
    name: 'Form Field Pattern',
    description: 'Standard form field layout with label, input, and error message',
    example: (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your email"
        />
        <p className="text-sm text-red-600">Please enter a valid email address</p>
      </div>
    ),
    code: `<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Email Address
  </label>
  <input
    type="email"
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter your email"
  />
  <p className="text-sm text-red-600">Error message</p>
</div>`
  }
];

// Design system documentation component
export const DesignSystemGuide: React.FC = () => {
  const [activeSection, setActiveSection] = React.useState('colors');

  const sections = [
    { id: 'colors', name: 'Colors', icon: '🎨' },
    { id: 'typography', name: 'Typography', icon: '📝' },
    { id: 'spacing', name: 'Spacing', icon: '📏' },
    { id: 'components', name: 'Components', icon: '🧩' },
    { id: 'patterns', name: 'Patterns', icon: '🔄' },
    { id: 'accessibility', name: 'Accessibility', icon: '♿' }
  ];

  const renderColorPalette = (name: string, colors: Record<string, string>) => (
    <div key={name} className="mb-6">
      <h4 className="text-lg font-semibold mb-3 capitalize">{name}</h4>
      <div className="grid grid-cols-5 gap-2">
        {Object.entries(colors).map(([shade, value]) => (
          <div key={shade} className="text-center">
            <div
              className="w-full h-16 rounded-md border shadow-sm mb-2"
              style={{ backgroundColor: value }}
            />
            <div className="text-xs">
              <div className="font-medium">{shade}</div>
              <div className="text-muted-foreground">{value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTypographyScale = () => (
    <div className="space-y-4">
      {Object.entries(DesignTokens.typography.fontSize).map(([size, [fontSize, config]]) => (
        <div key={size} className="flex items-center space-x-4">
          <div className="w-16 text-sm text-muted-foreground">{size}</div>
          <div style={{ fontSize: fontSize as string }} className="flex-1">
            The quick brown fox jumps over the lazy dog
          </div>
          <div className="text-xs text-muted-foreground">
            {fontSize} / {(config as any).lineHeight}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSpacingScale = () => (
    <div className="space-y-3">
      {Object.entries(DesignTokens.spacing).map(([name, value]) => (
        <div key={name} className="flex items-center space-x-4">
          <div className="w-8 text-sm text-muted-foreground">{name}</div>
          <div
            className="bg-primary/30 h-4"
            style={{ width: value }}
          />
          <div className="text-xs text-muted-foreground">{value}</div>
        </div>
      ))}
    </div>
  );

  const renderPatterns = () => (
    <div className="space-y-8">
      {CompositionPatterns.map((pattern, index) => (
        <div key={index} className="border border-border rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-2">{pattern.name}</h4>
          <p className="text-muted-foreground mb-4">{pattern.description}</p>
          
          <div className="mb-4">
            <h5 className="text-sm font-medium text-foreground mb-2">Example:</h5>
            <div className="border border-border rounded-md p-4 bg-muted">
              {pattern.example}
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-foreground mb-2">Code:</h5>
            <pre className="bg-muted text-foreground p-4 rounded-md text-sm overflow-x-auto">
              {pattern.code}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAccessibilityGuidelines = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold mb-3">ARIA Attributes</h4>
        <div className="space-y-2">
          {AccessibilityStandards.aria.required.map(attr => (
            <Badge key={attr} variant="primary" className="mr-2">{attr}</Badge>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-lg font-semibold mb-3">Color Contrast</h4>
        <div className="space-y-2">
          <div>Normal text: {AccessibilityStandards.contrast.normal}:1 minimum</div>
          <div>Large text: {AccessibilityStandards.contrast.large}:1 minimum</div>
          <div>Enhanced: {AccessibilityStandards.contrast.enhanced}:1 minimum</div>
        </div>
      </div>
      
      <div>
        <h4 className="text-lg font-semibold mb-3">Focus Management</h4>
        <div className="space-y-2">
          <code className="bg-muted px-2 py-1 rounded text-sm">
            {AccessibilityStandards.focus.visible}
          </code>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'colors':
        return (
          <div>
            {Object.entries(DesignTokens.colors).map(([name, colors]) =>
              renderColorPalette(name, colors as Record<string, string>)
            )}
          </div>
        );
      case 'typography':
        return renderTypographyScale();
      case 'spacing':
        return renderSpacingScale();
      case 'components':
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Component Variants</h4>
            {Object.entries(ComponentVariants).map(([component, variants]) => (
              <div key={component} className="border border-border rounded-lg p-4">
                <h5 className="font-medium mb-3 capitalize">{component} Variants</h5>
                <div className="space-y-2">
                  {Object.entries(variants).map(([variant, classes]) => (
                    <div key={variant} className="flex items-center space-x-3">
                      <Badge variant="default">{variant}</Badge>
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                        {classes}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case 'patterns':
        return renderPatterns();
      case 'accessibility':
        return renderAccessibilityGuidelines();
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">Design System</h2>
          <p className="text-sm text-muted-foreground">GHXSTSHIP Component Library</p>
        </div>
        
        <nav className="p-4">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors ${
                activeSection === section.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <span>{section.icon}</span>
              <span>{section.name}</span>
            </button>
          ))}
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <h3 className="text-2xl font-bold mb-6 capitalize">
            {sections.find(s => s.id === activeSection)?.name}
          </h3>
          {renderSection()}
        </div>
      </div>
    </div>
  );
};
