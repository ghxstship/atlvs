'use client';

import React from 'react';
import { Badge, Button, Card } from '@ghxstship/ui';

/**
 * Color System Demo Component
 * Showcases the 2026/2027 design system with subway-style accents
 */
export default function ColorSystemDemo() {
  return (
    <div className="p-xl stack-xl bg-background text-foreground">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-lg">
          <h1 className="text-4xl font-bold mb-sm">GHXSTSHIP 2026/2027 Color System</h1>
          <p className="text-lg text-muted-foreground">
            Timeless minimal core with subway-style metropolitan accents
          </p>
        </div>

        {/* Neutral Foundation (Semantic Tokens) */}
        <Card className="p-lg mb-md">
          <h2 className="text-2xl font-bold mb-md">Neutral Foundation</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-sm">
            {[
              { name: 'Background', className: 'bg-background' },
              { name: 'Foreground', className: 'bg-foreground' },
              { name: 'Card', className: 'bg-card' },
              { name: 'Popover', className: 'bg-popover' },
              { name: 'Muted', className: 'bg-muted' },
              { name: 'Accent', className: 'bg-accent' },
              { name: 'Secondary', className: 'bg-secondary' },
              { name: 'Border', className: 'bg-border' },
              { name: 'Primary', className: 'bg-primary' },
              { name: 'Success', className: 'bg-success' },
              { name: 'Warning', className: 'bg-warning' },
              { name: 'Destructive', className: 'bg-destructive' },
            ].map((color) => (
              <div key={color.name} className="text-center">
                <div className={`w-full h-16 rounded-md border mb-xs ${color.className}`} />
                <div className="text-xs font-mono">{color.name}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Subway-Style Metro Accents */}
        <Card className="p-lg mb-md">
          <h2 className="text-2xl font-bold mb-md">Subway-Style Metro Accents</h2>
          
          {/* NYC Subway (Semantic Mapping) */}
          <div className="mb-md">
            <h3 className="text-lg font-semibold mb-sm">NYC Subway Inspired</h3>
            <div className="grid grid-cols-6 gap-md">
              {[
                { name: 'Red Line', className: 'bg-destructive text-destructive-foreground', desc: '4/5/6 Line' },
                { name: 'Blue Line', className: 'bg-primary text-primary-foreground', desc: 'A/C/E Line' },
                { name: 'Green Line', className: 'bg-success text-success-foreground', desc: '4/5/6 Line' },
                { name: 'Orange Line', className: 'bg-warning text-warning-foreground', desc: 'B/D/F/M Line' },
                { name: 'Purple Line', className: 'bg-accent text-accent-foreground', desc: '7 Line' },
                { name: 'Yellow Line', className: 'bg-warning text-warning-foreground', desc: 'N/Q/R/W Line' },
              ].map((metro) => (
                <div key={metro.name} className="text-center">
                  <div className={`w-full h-12 rounded-md mb-xs ${metro.className}`} />
                  <div className="text-xs font-semibold">{metro.name}</div>
                  <div className="text-xs text-muted-foreground">{metro.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* London Underground (Semantic Mapping) */}
          <div className="mb-md">
            <h3 className="text-lg font-semibold mb-sm">London Underground Inspired</h3>
            <div className="grid grid-cols-7 gap-md">
              {[
                { name: 'Bakerloo', className: 'bg-secondary text-secondary-foreground' },
                { name: 'Central', className: 'bg-destructive text-destructive-foreground' },
                { name: 'District', className: 'bg-success text-success-foreground' },
                { name: 'Jubilee', className: 'bg-muted text-foreground' },
                { name: 'Northern', className: 'bg-foreground text-background' },
                { name: 'Piccadilly', className: 'bg-primary text-primary-foreground' },
                { name: 'Victoria', className: 'bg-accent text-accent-foreground' },
              ].map((metro) => (
                <div key={metro.name} className="text-center">
                  <div className={`w-full h-12 rounded-md mb-xs border ${metro.className}`} />
                  <div className="text-xs font-semibold">{metro.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tokyo Metro (Semantic Mapping) */}
          <div>
            <h3 className="text-lg font-semibold mb-sm">Tokyo Metro Inspired</h3>
            <div className="grid grid-cols-6 gap-md">
              {[
                { name: 'Ginza', className: 'bg-warning text-warning-foreground' },
                { name: 'Marunouchi', className: 'bg-destructive text-destructive-foreground' },
                { name: 'Hibiya', className: 'bg-muted text-foreground' },
                { name: 'Tozai', className: 'bg-primary text-primary-foreground' },
                { name: 'Chiyoda', className: 'bg-success text-success-foreground' },
                { name: 'Yurakucho', className: 'bg-warning text-warning-foreground' },
              ].map((metro) => (
                <div key={metro.name} className="text-center">
                  <div className={`w-full h-12 rounded-md mb-xs ${metro.className}`} />
                  <div className="text-xs font-semibold">{metro.name}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Interactive Components */}
        <Card className="p-lg mb-md">
          <h2 className="text-2xl font-bold mb-md">Interactive Components</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
            {/* Buttons */}
            <div>
              <h3 className="text-lg font-semibold mb-sm">Buttons</h3>
              <div className="stack-sm">
                <div className="flex gap-sm">
                  <Button variant="primary" size="lg">Primary Large</Button>
                  <Button variant="primary" size="md">Primary Medium</Button>
                  <Button variant="primary" size="sm">Primary Small</Button>
                </div>
                <div className="flex gap-sm">
                  <Button variant="outline" size="lg">Secondary Large</Button>
                  <Button variant="outline" size="md">Outline Medium</Button>
                  <Button variant="ghost" size="sm">Ghost Small</Button>
                </div>
                <div className="flex gap-sm">
                  <Button variant="destructive" size="md">Destructive</Button>
                  <Button disabled size="md">Disabled</Button>
                </div>
              </div>
            </div>

            {/* Status Indicators */}
            <div>
              <h3 className="text-lg font-semibold mb-sm">Status Indicators</h3>
              <div className="stack-sm">
                <div className="flex gap-sm">
                  <Badge variant="success" className="px-sm py-xs text-sm font-medium">
                    Success
                  </Badge>
                  <Badge variant="warning" className="px-sm py-xs text-sm font-medium">
                    Warning
                  </Badge>
                </div>
                <div className="flex gap-sm">
                  <Badge variant="destructive" className="px-sm py-xs text-sm font-medium">
                    Error
                  </Badge>
                  <Badge variant="secondary" className="px-sm py-xs text-sm font-medium">
                    Info
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Subway-Style Badges (Semantic) */}
        <Card className="p-lg mb-md">
          <h2 className="text-2xl font-bold mb-md">Subway-Style Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            {[
              { name: 'Red Line', className: 'bg-destructive text-destructive-foreground' },
              { name: 'Blue Line', className: 'bg-primary text-primary-foreground' },
              { name: 'Green Line', className: 'bg-success text-success-foreground' },
              { name: 'Orange Line', className: 'bg-warning text-warning-foreground' },
              { name: 'Purple Line', className: 'bg-accent text-accent-foreground' },
              { name: 'Yellow Line', className: 'bg-warning text-warning-foreground' },
              { name: 'Grey Line', className: 'bg-muted text-foreground' },
              { name: 'Express', className: 'bg-foreground text-background' },
            ].map((badge) => (
              <div 
                key={badge.name}
                className={`px-md py-sm rounded-full text-center font-bold text-sm ${badge.className}`}
              >
                {badge.name}
              </div>
            ))}
          </div>
        </Card>

        {/* Typography Hierarchy */}
        <Card className="p-lg mb-md">
          <h2 className="text-2xl font-bold mb-md">Typography Hierarchy</h2>
          <div className="stack-md">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Heading 1 - Display</h1>
              <p className="text-sm text-muted-foreground">4xl / Bold / Primary Color</p>
            </div>
            <div>
              <h2 className="text-3xl font-bold">Heading 2 - Section</h2>
              <p className="text-sm text-muted-foreground">3xl / Bold / Foreground</p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold">Heading 3 - Subsection</h3>
              <p className="text-sm text-muted-foreground">2xl / Semibold / Foreground</p>
            </div>
            <div>
              <p className="text-lg">Large Body Text - Important content</p>
              <p className="text-sm text-muted-foreground">lg / Regular / Foreground</p>
            </div>
            <div>
              <p className="text-base">Body Text - Standard content for reading</p>
              <p className="text-sm text-muted-foreground">base / Regular / Foreground</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Small Text - Secondary information</p>
              <p className="text-xs text-muted-foreground">sm / Regular / Muted Foreground</p>
            </div>
          </div>
        </Card>

        {/* Accessibility Compliance (Semantic) */}
        <Card className="p-lg">
          <h2 className="text-2xl font-bold mb-md">Accessibility Compliance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div>
              <h3 className="text-lg font-semibold mb-sm">AA Compliant (4.5:1)</h3>
              <div className="stack-sm">
                <div className="p-sm rounded-md bg-background text-muted-foreground border">
                  White background + Grey 600 text
                </div>
                <div className="p-sm rounded-md bg-primary text-primary-foreground">
                  Primary + Primary Foreground
                </div>
                <div className="p-sm rounded-md bg-destructive text-destructive-foreground">
                  Destructive + Destructive Foreground
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-sm">AAA Compliant (7:1)</h3>
              <div className="stack-sm">
                <div className="p-sm rounded-md bg-background text-foreground border">
                  White background + Grey 700 text
                </div>
                <div className="p-sm rounded-md bg-background text-foreground border">
                  White background + Grey 900 text
                </div>
                <div className="p-sm rounded-md bg-foreground text-background">
                  Foreground + Background text
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
