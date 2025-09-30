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
        {theme === 'light' && <Sun className="h-4 w-4" />}
        {theme === 'dark' && <Moon className="h-4 w-4" />}
        {theme === 'auto' && <Monitor className="h-4 w-4" />}
      </Button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Theme Toggle */}
      <div className="flex items-center gap-1">
        <Button
          variant={theme === 'light' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTheme('light')}
          className="h-8 w-8 p-0"
          aria-label="Light theme"
        >
          <Sun className="h-4 w-4" />
        </Button>
        <Button
          variant={theme === 'dark' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTheme('dark')}
          className="h-8 w-8 p-0"
          aria-label="Dark theme"
        >
          <Moon className="h-4 w-4" />
        </Button>
        <Button
          variant={theme === 'auto' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTheme('auto')}
          className="h-8 w-8 p-0"
          aria-label="Auto theme"
        >
          <Monitor className="h-4 w-4" />
        </Button>
      </div>

      {/* Contrast Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setContrast(contrast === 'normal' ? 'high' : 'normal')}
        className="h-8 w-8 p-0"
        aria-label={`Toggle ${contrast === 'normal' ? 'high' : 'normal'} contrast`}
      >
        {contrast === 'high' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </Button>

      {/* Motion Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMotion(motion === 'normal' ? 'reduced' : 'normal')}
        className="h-8 w-8 p-0"
        aria-label={`Toggle ${motion === 'normal' ? 'reduced' : 'normal'} motion`}
      >
        {motion === 'reduced' ? <ZapOff className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
      </Button>
    </div>
  );
}
