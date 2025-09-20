'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '../atomic/Button';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Input } from '../atomic/Input';
import { 
  Palette, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Settings,
  Zap
} from 'lucide-react';

interface DesignTokenViolation {
  id: string;
  file: string;
  line: number;
  column: number;
  property: string;
  value: string;
  expectedToken: string;
  severity: 'error' | 'warning' | 'info';
  category: 'color' | 'spacing' | 'typography' | 'shadow' | 'border';
  suggestion: string;
}

interface DesignTokenUsage {
  token: string;
  category: string;
  usageCount: number;
  files: string[];
  isDeprecated: boolean;
  replacement?: string;
}

interface ValidationStats {
  totalFiles: number;
  validatedFiles: number;
  violations: number;
  tokenUsage: number;
  complianceScore: number;
  lastValidated: Date;
}

interface DesignTokenValidatorProps {
  className?: string;
  autoValidate?: boolean;
  validationRules?: {
    enforceColors: boolean;
    enforceSpacing: boolean;
    enforceTypography: boolean;
    allowHardcodedValues: boolean;
  };
  onViolationFixed?: (violation: DesignTokenViolation) => void;
  onValidationComplete?: (stats: ValidationStats) => void;
}

export function DesignTokenValidator({
  className = '',
  autoValidate = true,
  validationRules = {
    enforceColors: true,
    enforceSpacing: true,
    enforceTypography: true,
    allowHardcodedValues: false
  },
  onViolationFixed,
  onValidationComplete
}: DesignTokenValidatorProps) {
  const [violations, setViolations] = useState<DesignTokenViolation[]>([]);
  const [tokenUsage, setTokenUsage] = useState<DesignTokenUsage[]>([]);
  const [stats, setStats] = useState<ValidationStats>({
    totalFiles: 0,
    validatedFiles: 0,
    violations: 0,
    tokenUsage: 0,
    complianceScore: 0,
    lastValidated: new Date()
  });
  
  const [isValidating, setIsValidating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  // Design token definitions
  const designTokens = useMemo(() => ({
    colors: {
      'bg-background': 'hsl(var(--background))',
      'bg-foreground': 'hsl(var(--foreground))',
      'bg-accent': 'hsl(var(--primary))',
      'bg-secondary': 'hsl(var(--secondary))',
      'bg-muted': 'hsl(var(--muted))',
      'bg-accent': 'hsl(var(--accent))',
      'bg-destructive': 'hsl(var(--destructive))',
      'bg-success': 'hsl(var(--success))',
      'bg-warning': 'hsl(var(--warning))',
      'text-foreground': 'hsl(var(--foreground))',
      'text-muted-foreground': 'hsl(var(--muted-foreground))',
      'text-accent': 'hsl(var(--primary))',
      'text-destructive': 'hsl(var(--destructive))',
      'border-border': 'hsl(var(--border))',
      'border-input': 'hsl(var(--input))',
      'border-primary': 'hsl(var(--primary))'
    },
    spacing: {
      'p-0': '0px',
      'p-xs': '0.25rem',
      'p-sm': '0.5rem',
      'p-sm': '0.75rem',
      'p-md': '1rem',
      'p-lg': '1.25rem',
      'p-lg': '1.5rem',
      'p-xl': '2rem',
      'p-2xl': '2.5rem',
      'p-2xl': '3rem',
      'm-0': '0px',
      'm-xs': '0.25rem',
      'm-sm': '0.5rem',
      'm-sm': '0.75rem',
      'm-md': '1rem',
      'm-lg': '1.25rem',
      'm-lg': '1.5rem',
      'm-xl': '2rem',
      'm-2xl': '2.5rem',
      'm-2xl': '3rem',
      'gap-xs': '0.25rem',
      'gap-sm': '0.5rem',
      'gap-sm': '0.75rem',
      'gap-md': '1rem',
      'gap-lg': '1.5rem',
      'gap-xl': '2rem'
    },
    typography: {
      'text-xs': '0.75rem',
      'text-sm': '0.875rem',
      'text-base': '1rem',
      'text-lg': '1.125rem',
      'text-xl': '1.25rem',
      'text-2xl': '1.5rem',
      'text-3xl': '1.875rem',
      'font-normal': '400',
      'font-medium': '500',
      'font-semibold': '600',
      'font-bold': '700'
    }
  }), []);

  // Generate mock violations for demonstration
  const generateMockViolations = useCallback((): DesignTokenViolation[] => {
    return [
      {
        id: 'v1',
        file: 'components/DataViews/MapView.tsx',
        line: 384,
        column: 15,
        property: 'variant',
        value: 'secondary',
        expectedToken: 'default',
        severity: 'error',
        category: 'color',
        suggestion: 'Use variant="default" instead of "secondary" for Button component'
      },
      {
        id: 'v2',
        file: 'components/DataViews/PivotTableView.tsx',
        line: 385,
        column: 20,
        property: 'onChange',
        value: 'function',
        expectedToken: 'onValueChange',
        severity: 'error',
        category: 'typography',
        suggestion: 'Use onValueChange prop instead of onChange for Select component'
      },
      {
        id: 'v3',
        file: 'components/Button.tsx',
        line: 45,
        column: 12,
        property: 'padding',
        value: '8px 16px',
        expectedToken: 'px-md py-sm',
        severity: 'warning',
        category: 'spacing',
        suggestion: 'Replace hardcoded padding with Tailwind classes px-md py-sm'
      },
      {
        id: 'v4',
        file: 'components/Card.tsx',
        line: 23,
        column: 8,
        property: 'background-color',
        value: '#ffffff',
        expectedToken: 'bg-background',
        severity: 'error',
        category: 'color',
        suggestion: 'Use bg-background token instead of hardcoded white color'
      },
      {
        id: 'v5',
        file: 'components/Input.tsx',
        line: 67,
        column: 25,
        property: 'border-radius',
        value: '6px',
        expectedToken: 'rounded-md',
        severity: 'warning',
        category: 'border',
        suggestion: 'Use rounded-md class instead of hardcoded border-radius'
      },
      {
        id: 'v6',
        file: 'components/DataViews/UniversalDrawer.tsx',
        line: 156,
        column: 18,
        property: 'margin',
        value: '12px',
        expectedToken: 'm-sm',
        severity: 'info',
        category: 'spacing',
        suggestion: 'Consider using m-sm class for consistent spacing'
      }
    ];
  }, []);

  // Generate mock token usage data
  const generateMockTokenUsage = useCallback((): DesignTokenUsage[] => {
    return [
      {
        token: 'bg-background',
        category: 'color',
        usageCount: 145,
        files: ['Button.tsx', 'Card.tsx', 'Input.tsx', 'Modal.tsx'],
        isDeprecated: false
      },
      {
        token: 'text-foreground',
        category: 'color',
        usageCount: 89,
        files: ['Typography.tsx', 'Button.tsx', 'Label.tsx'],
        isDeprecated: false
      },
      {
        token: 'p-md',
        category: 'spacing',
        usageCount: 67,
        files: ['Card.tsx', 'Modal.tsx', 'Drawer.tsx'],
        isDeprecated: false
      },
      {
        token: 'text-muted',
        category: 'color',
        usageCount: 23,
        files: ['Label.tsx', 'Helper.tsx'],
        isDeprecated: true,
        replacement: 'text-muted-foreground'
      },
      {
        token: 'rounded-lg',
        category: 'border',
        usageCount: 156,
        files: ['Card.tsx', 'Button.tsx', 'Input.tsx', 'Badge.tsx'],
        isDeprecated: false
      }
    ];
  }, []);

  // Run validation
  const runValidation = useCallback(async () => {
    setIsValidating(true);
    
    // Simulate validation process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockViolations = generateMockViolations();
    const mockTokenUsage = generateMockTokenUsage();
    
    const newStats: ValidationStats = {
      totalFiles: 156,
      validatedFiles: 156,
      violations: mockViolations.length,
      tokenUsage: mockTokenUsage.reduce((sum, usage) => sum + usage.usageCount, 0),
      complianceScore: Math.round(((156 - mockViolations.length) / 156) * 100),
      lastValidated: new Date()
    };
    
    setViolations(mockViolations);
    setTokenUsage(mockTokenUsage);
    setStats(newStats);
    
    onValidationComplete?.(newStats);
    setIsValidating(false);
  }, [generateMockViolations, generateMockTokenUsage, onValidationComplete]);

  // Fix violation
  const fixViolation = useCallback(async (violation: DesignTokenViolation) => {
    // Simulate fixing the violation
    console.log(`Fixing violation: ${violation.id}`);
    
    setViolations(prev => prev.filter(v => v.id !== violation.id));
    setStats(prev => ({
      ...prev,
      violations: prev.violations - 1,
      complianceScore: Math.round(((prev.validatedFiles - (prev.violations - 1)) / prev.validatedFiles) * 100)
    }));
    
    onViolationFixed?.(violation);
  }, [onViolationFixed]);

  // Filter violations
  const filteredViolations = useMemo(() => {
    let filtered = violations;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(violation =>
        violation.file.toLowerCase().includes(query) ||
        violation.property.toLowerCase().includes(query) ||
        violation.suggestion.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(violation => violation.category === selectedCategory);
    }
    
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(violation => violation.severity === selectedSeverity);
    }
    
    return filtered.sort((a, b) => {
      const severityOrder = { error: 3, warning: 2, info: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }, [violations, searchQuery, selectedCategory, selectedSeverity]);

  // Auto-validate on mount
  useEffect(() => {
    if (autoValidate) {
      runValidation();
    }
  }, [autoValidate, runValidation]);

  const containerClasses = `
    design-token-validator bg-background border border-border rounded-lg overflow-hidden
    ${className}
  `.trim();

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-center justify-between p-md border-b border-border">
        <div className="flex items-center gap-sm">
          <Palette className="h-5 w-5 text-accent" />
          <div>
            <h3 className="font-semibold">Design Token Validator</h3>
            <p className="text-sm text-muted-foreground">
              Ensure consistent design token usage across components
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-sm">
          <Badge 
            variant={stats.complianceScore >= 95 ? 'success' : stats.complianceScore >= 80 ? 'warning' : 'destructive'}
            
          >
            {stats.complianceScore}% Compliant
          </Badge>
          <Button
            variant="default"
            
            onClick={runValidation}
            disabled={isValidating}
          >
            {isValidating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-xs animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-xs" />
                Validate
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="p-md gap-lg">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <Card className="p-sm">
            <div className="flex items-center gap-sm mb-sm">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm font-medium">Files Validated</span>
            </div>
            <div className="text-2xl font-bold">
              {stats.validatedFiles}
            </div>
            <div className="text-xs text-muted-foreground">
              of {stats.totalFiles} total
            </div>
          </Card>

          <Card className="p-sm">
            <div className="flex items-center gap-sm mb-sm">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Violations</span>
            </div>
            <div className="text-2xl font-bold">
              {stats.violations}
            </div>
            <div className="text-xs text-muted-foreground">
              need attention
            </div>
          </Card>

          <Card className="p-sm">
            <div className="flex items-center gap-sm mb-sm">
              <Palette className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Token Usage</span>
            </div>
            <div className="text-2xl font-bold">
              {stats.tokenUsage}
            </div>
            <div className="text-xs text-muted-foreground">
              instances found
            </div>
          </Card>

          <Card className="p-sm">
            <div className="flex items-center gap-sm mb-sm">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Last Validated</span>
            </div>
            <div className="text-sm font-bold">
              {stats.lastValidated.toLocaleTimeString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.lastValidated.toLocaleDateString()}
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search violations..."
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
              className="pl-2xl"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e: any) => setSelectedCategory(e.target.value)}
            className="px-sm py-sm border border-border rounded-md bg-background text-foreground"
          >
            <option value="all">All Categories</option>
            <option value="color">Color</option>
            <option value="spacing">Spacing</option>
            <option value="typography">Typography</option>
            <option value="border">Border</option>
            <option value="shadow">Shadow</option>
          </select>
          
          <select
            value={selectedSeverity}
            onChange={(e: any) => setSelectedSeverity(e.target.value)}
            className="px-sm py-sm border border-border rounded-md bg-background text-foreground"
          >
            <option value="all">All Severities</option>
            <option value="error">Errors</option>
            <option value="warning">Warnings</option>
            <option value="info">Info</option>
          </select>
        </div>

        {/* Violations List */}
        <div>
          <h4 className="font-medium mb-sm flex items-center gap-sm">
            <XCircle className="h-4 w-4 text-destructive" />
            Design Token Violations ({filteredViolations.length})
          </h4>
          
          <div className="gap-sm max-h-96 overflow-y-auto">
            {filteredViolations.map(violation => (
              <Card key={violation.id} className="p-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-sm mb-sm">
                      <Badge 
                        variant={violation.severity === 'error' ? 'destructive' : 
                                violation.severity === 'warning' ? 'warning' : 'secondary'}
                        
                      >
                        {violation.severity}
                      </Badge>
                      <Badge variant="outline" >
                        {violation.category}
                      </Badge>
                      <span className="text-sm font-medium">
                        {violation.file}:{violation.line}:{violation.column}
                      </span>
                    </div>
                    
                    <div className="gap-xs text-sm">
                      <div>
                        <span className="font-medium">Property:</span> {violation.property}
                      </div>
                      <div>
                        <span className="font-medium">Current:</span> 
                        <code className="ml-xs px-xs py-0.5 bg-muted rounded text-xs">
                          {violation.value}
                        </code>
                      </div>
                      <div>
                        <span className="font-medium">Expected:</span> 
                        <code className="ml-xs px-xs py-0.5 bg-accent/10 rounded text-xs">
                          {violation.expectedToken}
                        </code>
                      </div>
                      <div className="text-muted-foreground">
                        {violation.suggestion}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="default"
                    
                    onClick={() => fixViolation(violation)}
                  >
                    Fix
                  </Button>
                </div>
              </Card>
            ))}
            
            {filteredViolations.length === 0 && (
              <div className="text-center py-xl text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-sm text-success" />
                <div className="text-sm">
                  {violations.length === 0 ? 'No violations found!' : 'No violations match your filters.'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Token Usage Summary */}
        <div>
          <h4 className="font-medium mb-sm flex items-center gap-sm">
            <Palette className="h-4 w-4 text-accent" />
            Token Usage Summary
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-sm">
            {tokenUsage.slice(0, 6).map(usage => (
              <Card key={usage.token} className="p-sm">
                <div className="flex items-center justify-between mb-sm">
                  <code className="text-sm font-medium">{usage.token}</code>
                  {usage.isDeprecated && (
                    <Badge variant="warning" >Deprecated</Badge>
                  )}
                </div>
                
                <div className="gap-xs text-xs text-muted-foreground">
                  <div>Used {usage.usageCount} times</div>
                  <div>{usage.files.length} files</div>
                  {usage.replacement && (
                    <div>
                      Use <code className="text-accent">{usage.replacement}</code> instead
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-md border-t border-border">
          <div className="text-sm text-muted-foreground">
            Last validated: {stats.lastValidated.toLocaleString()}
          </div>
          
          <div className="flex items-center gap-sm">
            <Button variant="ghost" >
              <Download className="h-4 w-4 mr-xs" />
              Export Report
            </Button>
            <Button variant="ghost" >
              <Settings className="h-4 w-4 mr-xs" />
              Configure Rules
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
