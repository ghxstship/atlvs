export interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

export function getMemoryStats(): MemoryStats | null {
  if (typeof window === 'undefined') return null;
  
  const performance = window.performance as any;
  if (!performance || !performance.memory) return null;

  return {
    usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
    totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
    jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1048576), // MB
    timestamp: Date.now()
  };
}

export function startMemoryMonitoring(intervalMs: number = 30000) {
  if (typeof window === 'undefined') return;

  const monitorInterval = setInterval(() => {
    const stats = getMemoryStats();
    if (stats) {
      console.log('Memory Usage:', stats);

      // Alert if memory usage exceeds 100MB
      if (stats.usedJSHeapSize > 100) {
        console.warn('High memory usage detected:', stats.usedJSHeapSize, 'MB');
      }

      // Send to analytics
      fetch('/api/analytics/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats)
      }).catch(console.error);
    }
  }, intervalMs);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(monitorInterval);
  });

  return monitorInterval;
}
