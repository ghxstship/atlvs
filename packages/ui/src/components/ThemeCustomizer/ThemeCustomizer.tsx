/**
 * ThemeCustomizer Component — Visual theme builder and customizer
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React, { useState } from 'react';
import { useTheme } from '../../core/theme';
import { Button } from '../../atoms/Button/Button';
import { Input } from '../../atoms/Input/Input';
import { Card, CardHeader, CardBody } from '../../molecules/Card/Card';
import { Stack } from '../../layout/Stack/Stack';
import { Badge } from '../../atoms/Badge/Badge';

export interface ThemeCustomizerProps {
  onThemeChange?: (theme: Record<string, string>) => void;
  className?: string;
}

/**
 * ThemeCustomizer - Visual interface for customizing themes
 * 
 * @example
 * ```tsx
 * <ThemeCustomizer onThemeChange={(theme) => console.log(theme)} />
 * ```
 */
export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  onThemeChange,
  className,
}) => {
  const { theme, setTheme } = useTheme();
  const [customColors, setCustomColors] = useState({
    primary: '#000000',
    secondary: '#64748b',
    accent: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
  });

  const handleColorChange = (colorKey: string, value: string) => {
    const newColors = { ...customColors, [colorKey]: value };
    setCustomColors(newColors);
    onThemeChange?.(newColors);
  };

  const presetThemes = [
    { name: 'Default', mode: 'light' as const },
    { name: 'Dark', mode: 'dark' as const },
    { name: 'High Contrast', mode: 'high-contrast' as const },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold">Theme Customizer</h3>
        <p className="text-sm text-muted-foreground">
          Customize your theme colors and appearance
        </p>
      </CardHeader>
      
      <CardBody>
        <Stack spacing="lg">
          {/* Theme Mode Selection */}
          <div>
            <label className="block text-sm font-medium mb-sm">
              Theme Mode
            </label>
            <div className="flex gap-sm flex-wrap">
              {presetThemes.map((preset) => (
                <Button
                  key={preset.name}
                  variant={theme === preset.mode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme(preset.mode)}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Color Customization */}
          <div>
            <label className="block text-sm font-medium mb-sm">
              Color Palette
            </label>
            <Stack spacing="sm">
              {Object.entries(customColors).map(([key, value]) => (
                <div key={key} className="flex items-center gap-md">
                  <div className="flex-1">
                    <label className="block text-sm text-muted-foreground mb-xs capitalize">
                      {key}
                    </label>
                    <div className="flex gap-sm items-center">
                      <Input
                        type="color"
                        value={value}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={value}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div
                    className="w-12 h-10 rounded-md border"
                    style={{ backgroundColor: value }}
                  />
                </div>
              ))}
            </Stack>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium mb-sm">
              Preview
            </label>
            <div className="p-md border rounded-lg bg-background">
              <Stack spacing="sm">
                <div className="flex gap-sm flex-wrap">
                  <Button>Primary Button</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                </div>
                <div className="flex gap-sm flex-wrap">
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="info">Info</Badge>
                </div>
              </Stack>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-sm">
            <Button variant="outline" className="flex-1">
              Reset to Default
            </Button>
            <Button className="flex-1">
              Apply Theme
            </Button>
          </div>
        </Stack>
      </CardBody>
    </Card>
  );
};

ThemeCustomizer.displayName = 'ThemeCustomizer';
