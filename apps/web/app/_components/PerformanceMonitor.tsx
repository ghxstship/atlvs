'use client'

import { useEffect, useState } from 'react';
// import { usePerformanceMonitoring } from '../../_components/lib/performance';

interface PerformanceDisplayProps {
  showDetails?: boolean;
}

export function PerformanceMonitor({ showDetails = false }: PerformanceDisplayProps) {
  // const { metrics, score } = usePerformanceMonitoring();
  const [isVisible, setIsVisible] = useState(false);
  
  // Placeholder data until performance monitoring is implemented
  const metrics = { fcp: 0, lcp: 0, cls: 0, fid: 0, ttfb: 0 };
  const score = { grade: 'A', score: 100 };

  useEffect(() => {
    // Only show in development or when explicitly enabled
    setIsVisible(process.env.NODE_ENV === 'development' || showDetails);
  }, [showDetails]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-background/95 backdrop-blur-sm border rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Performance</h3>
        <div className={`text-xs px-2 py-1 rounded ${
          score.grade === 'A' ? 'bg-success text-success-foreground' :
          score.grade === 'B' ? 'bg-warning text-warning-foreground' :
          'bg-destructive text-destructive-foreground'
        }`}>
          {score.grade} ({Math.round(score.score)})
        </div>
      </div>
      
      <div className="space-y-1 text-xs">
        {metrics.lcp && (
          <div className="flex justify-between">
            <span>LCP:</span>
            <span className={metrics.lcp <= 2500 ? 'text-success' : 'text-warning'}>
              {Math.round(metrics.lcp)}ms
            </span>
          </div>
        )}
        
        {metrics.fid && (
          <div className="flex justify-between">
            <span>FID:</span>
            <span className={metrics.fid <= 100 ? 'text-success' : 'text-warning'}>
              {Math.round(metrics.fid)}ms
            </span>
          </div>
        )}
        
        {metrics.cls !== undefined && (
          <div className="flex justify-between">
            <span>CLS:</span>
            <span className={metrics.cls <= 0.1 ? 'text-success' : 'text-warning'}>
              {metrics.cls.toFixed(3)}
            </span>
          </div>
        )}
        
        {metrics.fcp && (
          <div className="flex justify-between">
            <span>FCP:</span>
            <span>{Math.round(metrics.fcp)}ms</span>
          </div>
        )}
        
        {metrics.ttfb && (
          <div className="flex justify-between">
            <span>TTFB:</span>
            <span>{Math.round(metrics.ttfb)}ms</span>
          </div>
        )}
      </div>
    </div>
  );
}
