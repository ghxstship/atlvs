/**
 * DashboardLayout Template
 * Layout template for dashboard pages
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { RefreshCw, Download, Settings } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';

export interface DashboardLayoutProps {
  /** Page title */
  title: string;
  
  /** Page subtitle */
  subtitle?: string;
  
  /** Show refresh button */
  showRefresh?: boolean;
  
  /** Show export button */
  showExport?: boolean;
  
  /** Show settings button */
  showSettings?: boolean;
  
  /** Refresh handler */
  onRefresh?: () => void;
  
  /** Export handler */
  onExport?: () => void;
  
  /** Settings handler */
  onSettings?: () => void;
  
  /** Sidebar content */
  sidebar?: React.ReactNode;
  
  /** Right panel content */
  rightPanel?: React.ReactNode;
  
  /** Main content */
  children: React.ReactNode;
}

/**
 * DashboardLayout Component
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  subtitle,
  showRefresh = false,
  showExport = false,
  showSettings = false,
  onRefresh,
  onExport,
  onSettings,
  sidebar,
  rightPanel,
  children,
}) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {showRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={RefreshCw}
                  onClick={onRefresh}
                >
                  Refresh
                </Button>
              )}
              {showExport && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={Download}
                  onClick={onExport}
                >
                  Export
                </Button>
              )}
              {showSettings && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={Settings}
                  onClick={onSettings}
                >
                  Settings
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          {sidebar && (
            <aside className="w-64 flex-shrink-0">
              <div className="sticky top-6">
                {sidebar}
              </div>
            </aside>
          )}
          
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
          
          {/* Right Panel */}
          {rightPanel && (
            <aside className="w-80 flex-shrink-0">
              <div className="sticky top-6">
                {rightPanel}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

DashboardLayout.displayName = 'DashboardLayout';
