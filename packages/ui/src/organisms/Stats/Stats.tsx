/**
 * Stats Component — Statistics Display
 * Display key metrics and statistics
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Stat {
  id: string;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
}

export interface StatsProps {
  /** Statistics */
  stats: Stat[];
  
  /** Columns */
  columns?: 1 | 2 | 3 | 4;
}

/**
 * Stats Component
 */
export const Stats: React.FC<StatsProps> = ({
  stats,
  columns = 3,
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };
  
  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {stats.map((stat) => {
        const isPositive = stat.change !== undefined && stat.change > 0;
        const isNegative = stat.change !== undefined && stat.change < 0;
        
        return (
          <div
            key={stat.id}
            className="
              p-6 rounded-lg
              bg-card
              border border-border
              hover:border-primary
              transition-colors
            "
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
                <div className="text-3xl font-bold mt-2">
                  {stat.value}
                </div>
                
                {stat.change !== undefined && (
                  <div className="flex items-center gap-1 mt-2">
                    {isPositive && (
                      <>
                        <TrendingUp className="w-4 h-4 text-success" />
                        <span className="text-sm text-success">
                          +{stat.change}%
                        </span>
                      </>
                    )}
                    {isNegative && (
                      <>
                        <TrendingDown className="w-4 h-4 text-destructive" />
                        <span className="text-sm text-destructive">
                          {stat.change}%
                        </span>
                      </>
                    )}
                    {stat.changeLabel && (
                      <span className="text-xs text-muted-foreground">
                        {stat.changeLabel}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {stat.icon && (
                <stat.icon className="w-8 h-8 text-primary" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

Stats.displayName = 'Stats';
