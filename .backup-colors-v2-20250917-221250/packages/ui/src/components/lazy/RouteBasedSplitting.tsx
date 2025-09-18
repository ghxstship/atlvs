'use client';

import React, { Suspense, lazy } from 'react';
import { createRouteComponent, LazyComponentLoader, BundleAnalyzer } from './LazyComponentLoader';
import { Card } from '../Card';
import { RefreshCw, Home, BarChart3, Settings, Users, FolderOpen, Bell, Database, Zap } from 'lucide-react';

// Route-specific loading components
const RouteLoadingFallback: React.FC<{ routeName: string; icon?: React.ReactNode }> = ({ 
  routeName, 
  icon 
}) => (
  <Card className="p-2xl flex flex-col items-center justify-center min-h-[400px]">
    <div className="flex items-center space-x-sm mb-md">
      {icon}
      <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-sm">Loading {routeName}</h3>
    <p className="text-gray-600 text-center max-w-md">
      Please wait while we load the {routeName.toLowerCase()} interface...
    </p>
  </Card>
);

// Route component definitions with code splitting
export const RouteComponents = {
  // Dashboard routes
  Dashboard: createRouteComponent(
    BundleAnalyzer.measureComponentLoad('Dashboard', () => 
      import('../DataViews/DashboardView')
    ),
    ['MonitoringDashboard', 'PerformanceMetrics']
  ),

  // Monitoring routes
  MonitoringDashboard: createRouteComponent(
    BundleAnalyzer.measureComponentLoad('MonitoringDashboard', () => 
      import('../monitoring/DatabaseMonitoringDashboard').then(m => ({ default: m.DatabaseMonitoringDashboard }))
    )
  ),

  AlertingSystem: createRouteComponent(
    BundleAnalyzer.measureComponentLoad('AlertingSystem', () => 
      import('../monitoring/AlertingSystem').then(m => ({ default: m.AlertingSystem }))
    )
  ),

  PerformanceMetrics: createRouteComponent(
    BundleAnalyzer.measureComponentLoad('PerformanceMetrics', () => 
      import('../monitoring/PerformanceMetricsChart').then(m => ({ default: m.PerformanceMetricsChart }))
    )
  ),

  // Data management routes
  KanbanBoard: createRouteComponent(
    BundleAnalyzer.measureComponentLoad('KanbanBoard', () => 
      import('../DataViews/KanbanBoard')
    )
  ),

  AdvancedSearch: createRouteComponent(
    BundleAnalyzer.measureComponentLoad('AdvancedSearch', () => 
      import('../DataViews/AdvancedSearchSystem')
    )
  ),

  DatabaseManager: createRouteComponent(
    BundleAnalyzer.measureComponentLoad('DatabaseManager', () => 
      import('../DataViews/DatabaseTransactionManager')
    ),
    ['MonitoringDashboard']
  ),

  // Settings and administration
  Settings: createRouteComponent(
    BundleAnalyzer.measureComponentLoad('Settings', () => 
      Promise.resolve({ default: () => <div>Settings Component (To be implemented)</div> })
    )
  ),

  UserManagement: createRouteComponent(
    BundleAnalyzer.measureComponentLoad('UserManagement', () => 
      Promise.resolve({ default: () => <div>User Management Component (To be implemented)</div> })
    )
  ),

  // Project management
  Projects: createRouteComponent(
    BundleAnalyzer.measureComponentLoad('Projects', () => 
      Promise.resolve({ default: () => <div>Projects Component (To be implemented)</div> })
    ),
    ['KanbanBoard']
  ),

  // File management
  FileManager: createRouteComponent(
    BundleAnalyzer.measureComponentLoad('FileManager', () => 
      Promise.resolve({ default: () => <div>File Manager Component (To be implemented)</div> })
    )
  ),

  // Notifications
  Notifications: createRouteComponent(
    BundleAnalyzer.measureComponentLoad('Notifications', () => 
      Promise.resolve({ default: () => <div>Notifications Component (To be implemented)</div> })
    )
  )
};

// Route configuration with metadata
export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  name: string;
  description: string;
  icon: React.ReactNode;
  preload?: boolean;
  chunkName?: string;
  dependencies?: string[];
}

export const routeConfigs: Record<string, RouteConfig> = {
  dashboard: {
    path: '/',
    component: RouteComponents.Dashboard,
    name: 'Dashboard',
    description: 'Main dashboard with overview and key metrics',
    icon: <Home className="h-5 w-5" />,
    preload: true,
    chunkName: 'dashboard',
    dependencies: ['monitoring', 'metrics']
  },
  
  monitoring: {
    path: '/monitoring',
    component: RouteComponents.MonitoringDashboard,
    name: 'Database Monitoring',
    description: 'Real-time database performance monitoring',
    icon: <Database className="h-5 w-5" />,
    chunkName: 'monitoring',
    dependencies: ['charts']
  },
  
  alerts: {
    path: '/alerts',
    component: RouteComponents.AlertingSystem,
    name: 'Alerting System',
    description: 'Configure and manage system alerts',
    icon: <Bell className="h-5 w-5" />,
    chunkName: 'alerts'
  },
  
  metrics: {
    path: '/metrics',
    component: RouteComponents.PerformanceMetrics,
    name: 'Performance Metrics',
    description: 'Detailed performance metrics and analytics',
    icon: <BarChart3 className="h-5 w-5" />,
    chunkName: 'metrics',
    dependencies: ['charts']
  },
  
  kanban: {
    path: '/kanban',
    component: RouteComponents.KanbanBoard,
    name: 'Kanban Board',
    description: 'Project management with kanban boards',
    icon: <Zap className="h-5 w-5" />,
    chunkName: 'kanban'
  },
  
  search: {
    path: '/search',
    component: RouteComponents.AdvancedSearch,
    name: 'Advanced Search',
    description: 'Advanced search and filtering capabilities',
    icon: <BarChart3 className="h-5 w-5" />,
    chunkName: 'search'
  },
  
  database: {
    path: '/database',
    component: RouteComponents.DatabaseManager,
    name: 'Database Manager',
    description: 'Database transaction and schema management',
    icon: <Database className="h-5 w-5" />,
    chunkName: 'database',
    dependencies: ['monitoring']
  },
  
  projects: {
    path: '/projects',
    component: RouteComponents.Projects,
    name: 'Projects',
    description: 'Project management and collaboration',
    icon: <FolderOpen className="h-5 w-5" />,
    chunkName: 'projects',
    dependencies: ['kanban']
  },
  
  files: {
    path: '/files',
    component: RouteComponents.FileManager,
    name: 'File Manager',
    description: 'File storage and management system',
    icon: <FolderOpen className="h-5 w-5" />,
    chunkName: 'files'
  },
  
  users: {
    path: '/users',
    component: RouteComponents.UserManagement,
    name: 'User Management',
    description: 'User accounts and permissions management',
    icon: <Users className="h-5 w-5" />,
    chunkName: 'users'
  },
  
  settings: {
    path: '/settings',
    component: RouteComponents.Settings,
    name: 'Settings',
    description: 'Application settings and configuration',
    icon: <Settings className="h-5 w-5" />,
    chunkName: 'settings'
  },
  
  notifications: {
    path: '/notifications',
    component: RouteComponents.Notifications,
    name: 'Notifications',
    description: 'System notifications and alerts',
    icon: <Bell className="h-5 w-5" />,
    chunkName: 'notifications'
  }
};

// Route wrapper with loading states
export const RouteWrapper: React.FC<{
  routeKey: keyof typeof routeConfigs;
  props?: Record<string, any>;
}> = ({ routeKey, props = {} }) => {
  const config = routeConfigs[routeKey];
  
  if (!config) {
    return (
      <Card className="p-xl border-red-200 bg-red-50">
        <h3 className="text-lg font-semibold text-red-800 mb-sm">Route Not Found</h3>
        <p className="text-red-700">Route "{routeKey}" is not configured.</p>
      </Card>
    );
  }

  const Component = config.component;
  
  return (
    <Suspense 
      fallback={
        <RouteLoadingFallback 
          routeName={config.name} 
          icon={config.icon}
        />
      }
    >
      <Component {...props} />
    </Suspense>
  );
};

// Hook for route preloading
export const useRoutePreloader = () => {
  const [preloadedRoutes, setPreloadedRoutes] = React.useState(new Set<string>());

  const preloadRoute = React.useCallback((routeKey: keyof typeof routeConfigs) => {
    if (preloadedRoutes.has(routeKey)) {
      return;
    }

    const config = routeConfigs[routeKey];
    if (!config) {
      console.warn(`Unknown route: ${routeKey}`);
      return;
    }

    // Mark as preloaded immediately to prevent duplicate requests
    setPreloadedRoutes(prev => new Set(prev).add(routeKey));

    // Preload the route component
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        config.component;
      });
    } else {
      setTimeout(() => {
        config.component;
      }, 100);
    }
  }, [preloadedRoutes]);

  const preloadRoutes = React.useCallback((routeKeys: Array<keyof typeof routeConfigs>) => {
    routeKeys.forEach(preloadRoute);
  }, [preloadRoute]);

  // Preload critical routes on mount
  React.useEffect(() => {
    const criticalRoutes = Object.entries(routeConfigs)
      .filter(([_, config]) => config.preload)
      .map(([key, _]) => key as keyof typeof routeConfigs);
    
    preloadRoutes(criticalRoutes);
  }, [preloadRoutes]);

  return { preloadRoute, preloadRoutes, preloadedRoutes: Array.from(preloadedRoutes) };
};

// Navigation component with intelligent preloading
export const NavigationWithPreloading: React.FC<{
  currentRoute: keyof typeof routeConfigs;
  onRouteChange: (route: keyof typeof routeConfigs) => void;
}> = ({ currentRoute, onRouteChange }) => {
  const { preloadRoute } = useRoutePreloader();

  const handleRouteHover = (routeKey: keyof typeof routeConfigs) => {
    preloadRoute(routeKey);
  };

  return (
    <nav className="space-y-xs">
      {Object.entries(routeConfigs).map(([key, config]) => (
        <button
          key={key}
          onClick={() => onRouteChange(key as keyof typeof routeConfigs)}
          onMouseEnter={() => handleRouteHover(key as keyof typeof routeConfigs)}
          className={`w-full flex items-center space-x-sm px-sm py-sm text-left rounded-md transition-colors ${
            currentRoute === key
              ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-500'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {config.icon}
          <div className="flex-1">
            <div className="font-medium">{config.name}</div>
            <div className="text-xs text-gray-500">{config.description}</div>
          </div>
        </button>
      ))}
    </nav>
  );
};

// Bundle size monitoring component (development only)
export const BundleSizeMonitor: React.FC = () => {
  const [bundleInfo, setBundleInfo] = React.useState<{
    loadedChunks: string[];
    totalSize: number;
    loadTimes: Record<string, number>;
  }>({
    loadedChunks: [],
    totalSize: 0,
    loadTimes: {}
  });

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // Monitor performance entries for chunk loading
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes('chunk') || entry.name.includes('.js')) {
          setBundleInfo(prev => ({
            ...prev,
            loadedChunks: [...prev.loadedChunks, entry.name],
            loadTimes: {
              ...prev.loadTimes,
              [entry.name]: entry.duration
            }
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });

    return () => observer.disconnect();
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="p-md mb-md bg-yellow-50 border-yellow-200">
      <h4 className="font-semibold text-yellow-800 mb-sm">Bundle Monitor (Dev Only)</h4>
      <div className="text-sm text-yellow-700 space-y-xs">
        <div>Loaded Chunks: {bundleInfo.loadedChunks.length}</div>
        <div>Average Load Time: {
          Object.values(bundleInfo.loadTimes).length > 0
            ? (Object.values(bundleInfo.loadTimes).reduce((a, b) => a + b, 0) / Object.values(bundleInfo.loadTimes).length).toFixed(2) + 'ms'
            : 'N/A'
        }</div>
      </div>
    </Card>
  );
};
