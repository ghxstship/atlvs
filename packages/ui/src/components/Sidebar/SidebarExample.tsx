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
        <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900">
          <SkipNavigation />
          
          <SidebarLandmarks>
            <div className="flex flex-col h-full">
              {/* AI Personalization Insights */}
              <SidebarPersonalization
                userId={userId}
                navigationData={[]}
                onInsightApplied={(insight) => {
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
              className="flex-1 overflow-auto p-6"
              role="main"
              aria-label="Main content"
            >
              <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                  2026 Sidebar Navigation Demo
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <h2 className="text-lg font-semibold mb-3">Features</h2>
                    <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
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
                  
                  <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <h2 className="text-lg font-semibold mb-3">Keyboard Shortcuts</h2>
                    <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <li><kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-xs">↑/↓</kbd> Navigate items</li>
                      <li><kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-xs">←/→</kbd> Expand/collapse</li>
                      <li><kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-xs">Enter</kbd> Activate item</li>
                      <li><kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-xs">Home/End</kbd> First/last item</li>
                      <li><kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-xs">Esc</kbd> Clear search</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <h2 className="text-lg font-semibold mb-3">AI Personalization</h2>
                    <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <li>🧠 Time-based suggestions</li>
                      <li>📈 Usage pattern analysis</li>
                      <li>⭐ Adaptive item ordering</li>
                      <li>🎯 Contextual shortcuts</li>
                      <li>📊 Behavioral insights</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8 p-6 bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-950 dark:to-purple-950 rounded-lg border border-brand-200 dark:border-brand-800">
                  <h2 className="text-lg font-semibold text-brand-900 dark:text-brand-100 mb-3">
                    🚀 2026-Ready Features
                  </h2>
                  <p className="text-brand-700 dark:text-brand-300 mb-4">
                    This sidebar navigation system represents the future of enterprise UI/UX design with advanced personalization, 
                    accessibility, and performance optimizations.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-brand-800 dark:text-brand-200 mb-2">Performance</h3>
                      <ul className="text-sm text-brand-600 dark:text-brand-400 space-y-1">
                        <li>• GPU-accelerated animations</li>
                        <li>• Reduced motion support</li>
                        <li>• Optimized re-renders</li>
                        <li>• Lazy loading patterns</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium text-brand-800 dark:text-brand-200 mb-2">Accessibility</h3>
                      <ul className="text-sm text-brand-600 dark:text-brand-400 space-y-1">
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
