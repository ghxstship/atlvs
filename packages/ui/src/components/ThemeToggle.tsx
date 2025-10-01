'use client';

import { useTheme } from '../providers/ThemeProvider';
import { Button } from '../index-unified';
import {
  Sun,
  Moon,
  Monitor,
  Eye,
  EyeOff,
  Zap,
  ZapOff
} from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'simple' | 'full';
  className?: string;
}

export function ThemeToggle({ variant = 'simple', className = '' }: ThemeToggleProps) {
  const { theme, contrast, motion, setTheme, setContrast, setMotion } = useTheme();

  if (variant === 'simple') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light';
          setTheme(newTheme);
        }}
        className={className}
        aria-label="Toggle theme"
      >
        {theme === 'light' && <Sun className="h-icon-xs w-icon-xs" />}
        {theme === 'dark' && <Moon className="h-icon-xs w-icon-xs" />}
        {theme === 'auto' && <Monitor className="h-icon-xs w-icon-xs" />}
      </Button>
    );
  }

  return (
    <div className={`flex items-center gap-xs ${className}`}>
      {/* Theme Toggle */}
      <div className="flex items-center gap-1">
        <Button
          variant={theme === 'light' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTheme('light')}
          className="h-icon-lg w-icon-lg p-0"
          aria-label="Light theme"
        >
          <Sun className="h-icon-xs w-icon-xs" />
        </Button>
        <Button
          variant={theme === 'dark' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTheme('dark')}
          className="h-icon-lg w-icon-lg p-0"
          aria-label="Dark theme"
        >
          <Moon className="h-icon-xs w-icon-xs" />
        </Button>
        <Button
          variant={theme === 'auto' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTheme('auto')}
          className="h-icon-lg w-icon-lg p-0"
          aria-label="Auto theme"
        >
          <Monitor className="h-icon-xs w-icon-xs" />
        </Button>
      </div>

      {/* Contrast Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setContrast(contrast === 'normal' ? 'high' : 'normal')}
        className="h-icon-lg w-icon-lg p-0"
        aria-label={`Toggle ${contrast === 'normal' ? 'high' : 'normal'} contrast`}
      >
        {contrast === 'high' ? <Eye className="h-icon-xs w-icon-xs" /> : <EyeOff className="h-icon-xs w-icon-xs" />}
      </Button>

      {/* Motion Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMotion(motion === 'normal' ? 'reduced' : 'normal')}
        className="h-icon-lg w-icon-lg p-0"
        aria-label={`Toggle ${motion === 'normal' ? 'reduced' : 'normal'} motion`}
      >
        {motion === 'reduced' ? <ZapOff className="h-icon-xs w-icon-xs" /> : <Zap className="h-icon-xs w-icon-xs" />}
      </Button>
    </div>
  );
}
