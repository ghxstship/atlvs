'use client';

import React from 'react';
import { 
  SidebarNavigation,
  SidebarProvider,
  SidebarBreadcrumbs,
  SidebarPersonalization,
  AnimationOptimizer,
  SidebarLandmarks,
  SkipNavigation
} from './index';

// 2026 Sidebar Integration Example
// Complete implementation with all features

interface SidebarExampleProps {
  userId?: string;
  currentPath?: string;
  onNavigate?: (href: string) => void;
}

export const SidebarExample: React.FC<SidebarExampleProps> = ({
  userId = 'demo-user',
  currentPath = '/dashboard',
  onNavigate,
}) => {
  // Generate breadcrumbs from current path
  const generateBreadcrumbs = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs = [
      { id: 'home', label: 'Home', href: '/' }
    ];
    
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      breadcrumbs.push({
        id: segment,
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: currentPath,
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs(currentPath);

  return (
    <AnimationOptimizer>
      <SidebarProvider userId={userId}>
        <div className="flex h-screen bg-muted">
          <SkipNavigation />
          
          <SidebarLandmarks>
            <div className="flex flex-col h-full">
              {/* AI Personalization Insights */}
              <SidebarPersonalization
                userId={userId}
                navigationData={[]}
                onInsightApplied={(insight: any) => {
                  console.log('Applied insight:', insight);
                }}
              />
              
              {/* Main Sidebar Navigation */}
              <SidebarNavigation
                variant="default"
                onNavigate={onNavigate}
              />
            </div>
          </SidebarLandmarks>
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Breadcrumbs */}
            <SidebarBreadcrumbs
              items={breadcrumbs}
              onNavigate={onNavigate}
            />
            
            {/* Main Content */}
            <main 
              id="main-content"
              className="flex-1 overflow-auto p-lg"
              role="main"
              aria-label="Main content"
            >
              <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-foreground mb-lg">
                  2026 Sidebar Navigation Demo
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                  <div className="bg-card p-lg rounded-lg border border-border">
                    <h2 className="text-lg font-semibold mb-sm">Features</h2>
                    <ul className="gap-sm text-sm text-muted-foreground">
                      <li>✅ Multi-level expand/collapse</li>
                      <li>✅ Responsive design (desktop/tablet/mobile)</li>
                      <li>✅ Micro-animations & GPU acceleration</li>
                      <li>✅ WCAG 2.2 AA+ accessibility</li>
                      <li>✅ AI-powered personalization</li>
                      <li>✅ Searchable navigation</li>
                      <li>✅ Pin/unpin functionality</li>
                      <li>✅ Adaptive shortcuts</li>
                    </ul>
                  </div>
                  
                  <div className="bg-card p-lg rounded-lg border border-border">
                    <h2 className="text-lg font-semibold mb-sm">Keyboard Shortcuts</h2>
                    <ul className="gap-sm text-sm text-muted-foreground">
                      <li><kbd className="px-sm py-xs bg-muted rounded text-xs">↑/↓</kbd> Navigate items</li>
                      <li><kbd className="px-sm py-xs bg-muted rounded text-xs">←/→</kbd> Expand/collapse</li>
                      <li><kbd className="px-sm py-xs bg-muted rounded text-xs">Enter</kbd> Activate item</li>
                      <li><kbd className="px-sm py-xs bg-muted rounded text-xs">Home/End</kbd> First/last item</li>
                      <li><kbd className="px-sm py-xs bg-muted rounded text-xs">Esc</kbd> Clear search</li>
                    </ul>
                  </div>
                  
                  <div className="bg-card p-lg rounded-lg border border-border">
                    <h2 className="text-lg font-semibold mb-sm">AI Personalization</h2>
                    <ul className="gap-sm text-sm text-muted-foreground">
                      <li>🧠 Time-based suggestions</li>
                      <li>📈 Usage pattern analysis</li>
                      <li>⭐ Adaptive item ordering</li>
                      <li>🎯 Contextual shortcuts</li>
                      <li>📊 Behavioral insights</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-xl p-lg bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                  <h2 className="text-lg font-semibold text-foreground mb-sm">
                    🚀 2026-Ready Features
                  </h2>
                  <p className="text-accent/80 mb-md">
                    This sidebar navigation system represents the future of enterprise UI/UX design with advanced personalization, 
                    accessibility, and performance optimizations.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div>
                      <h3 className="font-medium text-foreground mb-sm">Performance</h3>
                      <ul className="text-sm text-accent/80 gap-xs">
                        <li>• GPU-accelerated animations</li>
                        <li>• Reduced motion support</li>
                        <li>• Optimized re-renders</li>
                        <li>• Lazy loading patterns</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-sm">Accessibility</h3>
                      <ul className="text-sm text-accent/80 gap-xs">
                        <li>• Screen reader optimized</li>
                        <li>• Focus management</li>
                        <li>• ARIA landmarks</li>
                        <li>• High contrast support</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AnimationOptimizer>
  );
};

export default SidebarExample;
