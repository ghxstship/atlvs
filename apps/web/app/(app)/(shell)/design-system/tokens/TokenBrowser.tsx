'use client';

/**
 * Token Browser Component
 * Interactive design token documentation
 */

import { useState } from 'react';
import { DESIGN_TOKENS, SEMANTIC_TOKENS } from '@ghxstship/ui/tokens/unified-design-tokens';
import { Card } from '@ghxstship/ui';
import { Search, Copy, Check } from 'lucide-react';

type TokenCategory = 'colors' | 'typography' | 'spacing' | 'shadows' | 'borders' | 'motion' | 'breakpoints' | 'zIndex';

export function TokenBrowser() {
  const [activeCategory, setActiveCategory] = useState<TokenCategory>('colors');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const categories: { key: TokenCategory; label: string; icon: string }[] = [
    { key: 'colors', label: 'Colors', icon: '🎨' },
    { key: 'typography', label: 'Typography', icon: '✍️' },
    { key: 'spacing', label: 'Spacing', icon: '📏' },
    { key: 'shadows', label: 'Shadows', icon: '🌑' },
    { key: 'borders', label: 'Borders', icon: '🔲' },
    { key: 'motion', label: 'Motion', icon: '⚡' },
    { key: 'breakpoints', label: 'Breakpoints', icon: '📱' },
    { key: 'zIndex', label: 'Z-Index', icon: '📚' },
  ];

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-md">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-xl">
          <h1 className="text-4xl font-bold mb-sm">Design Tokens</h1>
          <p className="text-muted-foreground text-lg">
            Browse and copy design tokens for consistent styling across GHXSTSHIP
          </p>
        </div>

        {/* Search */}
        <div className="mb-lg">
          <div className="relative">
            <Search className="absolute left-3 top-xs/2 -translate-y-1/2 text-muted-foreground w-icon-sm h-icon-sm" />
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-xs mb-lg overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`
                px-md py-xs rounded-lg font-medium whitespace-nowrap transition-colors
                ${activeCategory === cat.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
                }
              `}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Token Display */}
        <div className="grid gap-md">
          {activeCategory === 'colors' && <ColorTokens searchQuery={searchQuery} copyToken={copyToken} copiedToken={copiedToken} />}
          {activeCategory === 'typography' && <TypographyTokens searchQuery={searchQuery} copyToken={copyToken} copiedToken={copiedToken} />}
          {activeCategory === 'spacing' && <SpacingTokens searchQuery={searchQuery} copyToken={copyToken} copiedToken={copiedToken} />}
          {activeCategory === 'shadows' && <ShadowTokens searchQuery={searchQuery} copyToken={copyToken} copiedToken={copiedToken} />}
          {activeCategory === 'borders' && <BorderTokens searchQuery={searchQuery} copyToken={copyToken} copiedToken={copiedToken} />}
          {activeCategory === 'motion' && <MotionTokens searchQuery={searchQuery} copyToken={copyToken} copiedToken={copiedToken} />}
          {activeCategory === 'breakpoints' && <BreakpointTokens searchQuery={searchQuery} copyToken={copyToken} copiedToken={copiedToken} />}
          {activeCategory === 'zIndex' && <ZIndexTokens searchQuery={searchQuery} copyToken={copyToken} copiedToken={copiedToken} />}
        </div>
      </div>
    </div>
  );
}

// Color Tokens Component
function ColorTokens({ searchQuery, copyToken, copiedToken }: any) {
  const filterTokens = (obj: any, prefix = ''): any[] => {
    const results: any[] = [];
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'string') {
        if (fullKey.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ key: fullKey, value });
        }
      } else if (typeof value === 'object') {
        results.push(...filterTokens(value, fullKey));
      }
    }
    return results;
  };

  const tokens = filterTokens(DESIGN_TOKENS.colors);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
      {tokens.map(({ key, value }) => (
        <Card key={key} className="p-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-sm">
            <span className="font-mono text-sm text-muted-foreground">{key}</span>
            <button
              onClick={() => copyToken(`DESIGN_TOKENS.colors.${key}`)}
              className="p-xs rounded hover:bg-muted transition-colors"
            >
              {copiedToken === `DESIGN_TOKENS.colors.${key}` ? (
                <Check className="w-icon-xs h-icon-xs text-success" />
              ) : (
                <Copy className="w-icon-xs h-icon-xs" />
              )}
            </button>
          </div>
          <div
            className="w-full h-component-md rounded-md border border-border mb-sm"
            style={{ backgroundColor: value }}
          />
          <code className="text-xs text-muted-foreground">{value}</code>
        </Card>
      ))}
    </div>
  );
}

// Typography Tokens Component
function TypographyTokens({ searchQuery, copyToken, copiedToken }: any) {
  const fontSizes = Object.entries(DESIGN_TOKENS.typography.fontSize).filter(([key]) =>
    key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-md">
      <h2 className="text-2xl font-bold">Font Sizes</h2>
      <div className="grid gap-md">
        {fontSizes.map(([key, value]) => (
          <Card key={key} className="p-md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-sm mb-xs">
                  <span className="font-mono text-sm font-medium">{key}</span>
                  <button
                    onClick={() => copyToken(`DESIGN_TOKENS.typography.fontSize.${key}`)}
                    className="p-xs rounded hover:bg-muted transition-colors"
                  >
                    {copiedToken === `DESIGN_TOKENS.typography.fontSize.${key}` ? (
                      <Check className="w-icon-xs h-icon-xs text-success" />
                    ) : (
                      <Copy className="w-icon-xs h-icon-xs" />
                    )}
                  </button>
                </div>
                <p style={{ fontSize: value }} className="mb-xs">
                  The quick brown fox jumps over the lazy dog
                </p>
                <code className="text-xs text-muted-foreground">{value}</code>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Spacing Tokens Component
function SpacingTokens({ searchQuery, copyToken, copiedToken }: any) {
  const spacing = Object.entries(DESIGN_TOKENS.spacing).filter(([key]) =>
    key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
      {spacing.map(([key, value]) => (
        <Card key={key} className="p-md">
          <div className="flex items-center justify-between mb-sm">
            <span className="font-mono text-sm font-medium">{key}</span>
            <button
              onClick={() => copyToken(`DESIGN_TOKENS.spacing.${key}`)}
              className="p-xs rounded hover:bg-muted transition-colors"
            >
              {copiedToken === `DESIGN_TOKENS.spacing.${key}` ? (
                <Check className="w-icon-xs h-icon-xs text-success" />
              ) : (
                <Copy className="w-icon-xs h-icon-xs" />
              )}
            </button>
          </div>
          <div className="bg-primary/20 rounded" style={{ width: value, height: '2rem' }} />
          <code className="text-xs text-muted-foreground mt-sm block">{value}</code>
        </Card>
      ))}
    </div>
  );
}

// Shadow Tokens Component
function ShadowTokens({ searchQuery, copyToken, copiedToken }: any) {
  const shadows = [
    { key: 'sm', value: DESIGN_TOKENS.shadows.sm },
    { key: 'base', value: DESIGN_TOKENS.shadows.base },
    { key: 'md', value: DESIGN_TOKENS.shadows.md },
    { key: 'lg', value: DESIGN_TOKENS.shadows.lg },
    { key: 'xl', value: DESIGN_TOKENS.shadows.xl },
    { key: '2xl', value: DESIGN_TOKENS.shadows['2xl'] },
  ].filter(({ key }) => key.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
      {shadows.map(({ key, value }) => (
        <Card key={key} className="p-lg">
          <div className="flex items-center justify-between mb-md">
            <span className="font-mono text-sm font-medium">{key}</span>
            <button
              onClick={() => copyToken(`DESIGN_TOKENS.shadows.${key}`)}
              className="p-xs rounded hover:bg-muted transition-colors"
            >
              {copiedToken === `DESIGN_TOKENS.shadows.${key}` ? (
                <Check className="w-icon-xs h-icon-xs text-success" />
              ) : (
                <Copy className="w-icon-xs h-icon-xs" />
              )}
            </button>
          </div>
          <div
            className="w-full h-component-lg bg-card rounded-lg"
            style={{ boxShadow: value }}
          />
          <code className="text-xs text-muted-foreground mt-sm block break-all">{value}</code>
        </Card>
      ))}
    </div>
  );
}

// Placeholder components for other categories
function BorderTokens({ searchQuery, copyToken, copiedToken }: any) {
  const borders = Object.entries(DESIGN_TOKENS.borderRadius).filter(([key]) =>
    key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
      {borders.map(([key, value]) => (
        <Card key={key} className="p-md">
          <div className="flex items-center justify-between mb-sm">
            <span className="font-mono text-sm">{key}</span>
            <button onClick={() => copyToken(`DESIGN_TOKENS.borderRadius.${key}`)}>
              {copiedToken === `DESIGN_TOKENS.borderRadius.${key}` ? <Check className="w-icon-xs h-icon-xs" /> : <Copy className="w-icon-xs h-icon-xs" />}
            </button>
          </div>
          <div className="w-component-md h-component-md bg-primary/20 border-2 border-primary" style={{ borderRadius: value }} />
          <code className="text-xs mt-sm block">{value}</code>
        </Card>
      ))}
    </div>
  );
}

function MotionTokens({ searchQuery, copyToken, copiedToken }: any) {
  return <div className="text-muted-foreground">Motion tokens documentation coming soon...</div>;
}

function BreakpointTokens({ searchQuery, copyToken, copiedToken }: any) {
  return <div className="text-muted-foreground">Breakpoint tokens documentation coming soon...</div>;
}

function ZIndexTokens({ searchQuery, copyToken, copiedToken }: any) {
  return <div className="text-muted-foreground">Z-index tokens documentation coming soon...</div>;
}
