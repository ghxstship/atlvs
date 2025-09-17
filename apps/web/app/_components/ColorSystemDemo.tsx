'use client';

import React from 'react';
import { Badge, Button, Card } from '@ghxstship/ui';

/**
 * Color System Demo Component
 * Showcases the 2026/2027 design system with subway-style accents
 */
export default function ColorSystemDemo() {
  return (
    <div className="p-8 space-y-8 bg-background text-foreground">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">GHXSTSHIP 2026/2027 Color System</h1>
          <p className="text-lg text-muted-foreground">
            Timeless minimal core with subway-style metropolitan accents
          </p>
        </div>

        {/* Neutral Foundation (Semantic Tokens) */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Neutral Foundation</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
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
                <div className={`w-full h-16 rounded-md border mb-2 ${color.className}`} />
                <div className="text-xs font-mono">{color.name}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Subway-Style Metro Accents */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Subway-Style Metro Accents</h2>
          
          {/* NYC Subway (Semantic Mapping) */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">NYC Subway Inspired</h3>
            <div className="grid grid-cols-6 gap-4">
              {[
                { name: 'Red Line', className: 'bg-destructive text-destructive-foreground', desc: '4/5/6 Line' },
                { name: 'Blue Line', className: 'bg-primary text-primary-foreground', desc: 'A/C/E Line' },
                { name: 'Green Line', className: 'bg-success text-success-foreground', desc: '4/5/6 Line' },
                { name: 'Orange Line', className: 'bg-warning text-warning-foreground', desc: 'B/D/F/M Line' },
                { name: 'Purple Line', className: 'bg-accent text-accent-foreground', desc: '7 Line' },
                { name: 'Yellow Line', className: 'bg-warning text-warning-foreground', desc: 'N/Q/R/W Line' },
              ].map((metro) => (
                <div key={metro.name} className="text-center">
                  <div className={`w-full h-12 rounded-md mb-2 ${metro.className}`} />
                  <div className="text-xs font-semibold">{metro.name}</div>
                  <div className="text-xs text-muted-foreground">{metro.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* London Underground (Semantic Mapping) */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">London Underground Inspired</h3>
            <div className="grid grid-cols-7 gap-4">
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
                  <div className={`w-full h-12 rounded-md mb-2 border ${metro.className}`} />
                  <div className="text-xs font-semibold">{metro.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tokyo Metro (Semantic Mapping) */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Tokyo Metro Inspired</h3>
            <div className="grid grid-cols-6 gap-4">
              {[
                { name: 'Ginza', className: 'bg-warning text-warning-foreground' },
                { name: 'Marunouchi', className: 'bg-destructive text-destructive-foreground' },
                { name: 'Hibiya', className: 'bg-muted text-foreground' },
                { name: 'Tozai', className: 'bg-primary text-primary-foreground' },
                { name: 'Chiyoda', className: 'bg-success text-success-foreground' },
                { name: 'Yurakucho', className: 'bg-warning text-warning-foreground' },
              ].map((metro) => (
                <div key={metro.name} className="text-center">
                  <div className={`w-full h-12 rounded-md mb-2 ${metro.className}`} />
                  <div className="text-xs font-semibold">{metro.name}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Interactive Components */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Interactive Components</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Buttons */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Buttons</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Button variant="primary" size="lg">Primary Large</Button>
                  <Button variant="primary" size="md">Primary Medium</Button>
                  <Button variant="primary" size="sm">Primary Small</Button>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="lg">Secondary Large</Button>
                  <Button variant="outline" size="md">Outline Medium</Button>
                  <Button variant="ghost" size="sm">Ghost Small</Button>
                </div>
                <div className="flex gap-3">
                  <Button variant="destructive" size="md">Destructive</Button>
                  <Button disabled size="md">Disabled</Button>
                </div>
              </div>
            </div>

            {/* Status Indicators */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Status Indicators</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Badge variant="success" className="px-3 py-1 text-sm font-medium">
                    Success
                  </Badge>
                  <Badge variant="warning" className="px-3 py-1 text-sm font-medium">
                    Warning
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Badge variant="destructive" className="px-3 py-1 text-sm font-medium">
                    Error
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                    Info
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Subway-Style Badges (Semantic) */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Subway-Style Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                className={`px-4 py-2 rounded-full text-center font-bold text-sm ${badge.className}`}
              >
                {badge.name}
              </div>
            ))}
          </div>
        </Card>

        {/* Typography Hierarchy */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Typography Hierarchy</h2>
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold text-primary">Heading 1 - Display</h1>
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
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Accessibility Compliance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">AA Compliant (4.5:1)</h3>
              <div className="space-y-2">
                <div className="p-3 rounded-md bg-background text-muted-foreground border">
                  White background + Grey 600 text
                </div>
                <div className="p-3 rounded-md bg-primary text-primary-foreground">
                  Primary + Primary Foreground
                </div>
                <div className="p-3 rounded-md bg-destructive text-destructive-foreground">
                  Destructive + Destructive Foreground
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">AAA Compliant (7:1)</h3>
              <div className="space-y-2">
                <div className="p-3 rounded-md bg-background text-foreground border">
                  White background + Grey 700 text
                </div>
                <div className="p-3 rounded-md bg-background text-foreground border">
                  White background + Grey 900 text
                </div>
                <div className="p-3 rounded-md bg-foreground text-background">
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
