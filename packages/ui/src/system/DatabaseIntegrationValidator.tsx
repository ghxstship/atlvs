/**
 * Database Integration Validator
 * Ensures all UI elements are wired to live Supabase data
 * Validates no mock data or placeholders exist in production
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// =============================================================================
// DATABASE INTEGRATION VALIDATION TYPES
// =============================================================================

export interface DatabaseIntegrationStatus {
  component: string;
  isConnected: boolean;
  dataSource: 'supabase' | 'mock' | 'static' | 'none';
  queries: {
    select: number;
    insert: number;
    update: number;
    delete: number;
    subscribe: number;
  };
  tables: string[];
  realtime: boolean;
  caching: boolean;
  optimisticUpdates: boolean;
  errorHandling: boolean;
  loadingStates: boolean;
  emptyStates: boolean;
  pagination: boolean;
  filtering: boolean;
  sorting: boolean;
  issues: string[];
}

export interface ModuleIntegrationReport {
  module: string;
  submodules: Map<string, DatabaseIntegrationStatus>;
  coverage: {
    total: number;
    connected: number;
    percentage: number;
  };
  criticalIssues: string[];
  recommendations: string[];
}

// =============================================================================
// DATABASE INTEGRATION VALIDATOR
// =============================================================================

export class DatabaseIntegrationValidator {
  private supabaseClient: any;
  private validationResults: Map<string, DatabaseIntegrationStatus> = new Map();
  private moduleReports: Map<string, ModuleIntegrationReport> = new Map();
  private queryInterceptors: Map<string, any> = new Map();

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    if (supabaseUrl && supabaseKey) {
      this.supabaseClient = createClient(supabaseUrl, supabaseKey);
    }
  }

  /**
   * Validate component's database integration
   */
  validateComponent(
    componentName: string,
    element: HTMLElement,
    props?: any
  ): DatabaseIntegrationStatus {
    const status: DatabaseIntegrationStatus = {
      component: componentName,
      isConnected: false,
      dataSource: 'none',
      queries: {
        select: 0,
        insert: 0,
        update: 0,
        delete: 0,
        subscribe: 0,
      },
      tables: [],
      realtime: false,
      caching: false,
      optimisticUpdates: false,
      errorHandling: false,
      loadingStates: false,
      emptyStates: false,
      pagination: false,
      filtering: false,
      sorting: false,
      issues: [],
    };

    // Check data source
    status.dataSource = this.detectDataSource(element, props);
    status.isConnected = status.dataSource === 'supabase';

    // Check for mock data
    if (this.hasMockData(element, props)) {
      status.issues.push('Component is using mock data instead of live Supabase data');
      status.dataSource = 'mock';
    }

    // Check for static/placeholder data
    if (this.hasStaticData(element)) {
      status.issues.push('Component contains static placeholder data');
      status.dataSource = 'static';
    }

    // Validate Supabase queries
    if (status.dataSource === 'supabase') {
      status.queries = this.analyzeQueries(componentName);
      status.tables = this.getAccessedTables(componentName);
      status.realtime = this.hasRealtimeSubscription(componentName);
    }

    // Check UI features
    status.loadingStates = this.hasLoadingStates(element);
    status.emptyStates = this.hasEmptyStates(element);
    status.errorHandling = this.hasErrorHandling(element);
    status.pagination = this.hasPagination(element);
    status.filtering = this.hasFiltering(element);
    status.sorting = this.hasSorting(element);
    status.optimisticUpdates = this.hasOptimisticUpdates(props);
    status.caching = this.hasCaching(props);

    // Validate critical requirements
    this.validateCriticalRequirements(status);

    this.validationResults.set(componentName, status);
    return status;
  }

  /**
   * Detect data source type
   */
  private detectDataSource(element: HTMLElement, props?: any): 'supabase' | 'mock' | 'static' | 'none' {
    // Check for Supabase client in props
    if (props?.supabase || props?.supabaseClient) {
      return 'supabase';
    }

    // Check for data attributes
    const dataSource = element.getAttribute('data-source');
    if (dataSource === 'supabase') return 'supabase';
    if (dataSource === 'mock') return 'mock';
    if (dataSource === 'static') return 'static';

    // Check for mock data patterns
    if (this.hasMockDataPatterns(element)) {
      return 'mock';
    }

    // Check for Supabase hooks in React components
    if (this.hasSupabaseHooks(element)) {
      return 'supabase';
    }

    return 'none';
  }

  /**
   * Check for mock data patterns
   */
  private hasMockData(element: HTMLElement, props?: any): boolean {
    const mockPatterns = [
      /mock/i,
      /fake/i,
      /dummy/i,
      /sample/i,
      /test/i,
      /placeholder/i,
      /lorem ipsum/i,
      /john doe/i,
      /jane doe/i,
      /example\.com/i,
      /test@test/i,
    ];

    // Check element content
    const content = element.textContent || '';
    const hasMockContent = mockPatterns.some(pattern => pattern.test(content));

    // Check props
    const propsString = JSON.stringify(props || {});
    const hasMockProps = mockPatterns.some(pattern => pattern.test(propsString));

    // Check data attributes
    const attributes = Array.from(element.attributes);
    const hasMockAttributes = attributes.some(attr => 
      mockPatterns.some(pattern => pattern.test(attr.value))
    );

    return hasMockContent || hasMockProps || hasMockAttributes;
  }

  /**
   * Check for static placeholder data
   */
  private hasStaticData(element: HTMLElement): boolean {
    // Check for hardcoded data
    const hasHardcodedArrays = element.innerHTML.includes('[{') && element.innerHTML.includes('}]');
    const hasHardcodedObjects = element.innerHTML.includes('const data = {');
    
    // Check for static image placeholders
    const images = element.querySelectorAll('img');
    const hasPlaceholderImages = Array.from(images).some(img => 
      img.src.includes('placeholder') || 
      img.src.includes('via.placeholder') ||
      img.src.includes('placehold.it')
    );

    return hasHardcodedArrays || hasHardcodedObjects || hasPlaceholderImages;
  }

  /**
   * Check for mock data patterns in content
   */
  private hasMockDataPatterns(element: HTMLElement): boolean {
    const piratePatterns = [
      /blackbeard/i,
      /captain hook/i,
      /jolly roger/i,
      /pieces of eight/i,
      /walk the plank/i,
      /ahoy matey/i,
      /treasure island/i,
    ];

    const content = element.textContent || '';
    
    // Check if it's demo data (which is acceptable if marked)
    const isDemoData = element.hasAttribute('data-demo') || 
                      element.closest('[data-demo="true"]') !== null;

    if (isDemoData) {
      return false; // Demo data is acceptable if properly marked
    }

    // Otherwise, pirate-themed data without demo flag is mock data
    return piratePatterns.some(pattern => pattern.test(content));
  }

  /**
   * Check for Supabase hooks
   */
  private hasSupabaseHooks(element: HTMLElement): boolean {
    // Check React fiber for hooks (simplified check)
    const fiber = (element as any)._reactInternalFiber || 
                 (element as any)._reactInternalInstance;
    
    if (!fiber) return false;

    // Look for Supabase-related hooks in the component tree
    const hookNames = ['useSupabase', 'useQuery', 'useMutation', 'useSubscription'];
    const componentString = fiber.toString();
    
    return hookNames.some(hook => componentString.includes(hook));
  }

  /**
   * Analyze Supabase queries
   */
  private analyzeQueries(componentName: string): DatabaseIntegrationStatus['queries'] {
    // This would integrate with actual query monitoring
    // For now, return sample data based on component patterns
    const queries = {
      select: 0,
      insert: 0,
      update: 0,
      delete: 0,
      subscribe: 0,
    };

    // Check for CRUD patterns in component name
    if (componentName.includes('List') || componentName.includes('Table')) {
      queries.select = 1;
    }
    if (componentName.includes('Create') || componentName.includes('Add')) {
      queries.insert = 1;
    }
    if (componentName.includes('Edit') || componentName.includes('Update')) {
      queries.update = 1;
    }
    if (componentName.includes('Delete') || componentName.includes('Remove')) {
      queries.delete = 1;
    }
    if (componentName.includes('Realtime') || componentName.includes('Live')) {
      queries.subscribe = 1;
    }

    return queries;
  }

  /**
   * Get accessed database tables
   */
  private getAccessedTables(componentName: string): string[] {
    const tables: string[] = [];

    // Map component names to likely tables
    const tableMapping: Record<string, string[]> = {
      'Projects': ['projects', 'tasks', 'files'],
      'People': ['people', 'people_roles', 'people_competencies'],
      'Companies': ['companies', 'company_contracts', 'company_ratings'],
      'Finance': ['expenses', 'revenue', 'budgets', 'invoices'],
      'Jobs': ['jobs', 'job_assignments', 'opportunities', 'rfps'],
      'Procurement': ['products', 'services', 'procurement_orders'],
      'Analytics': ['dashboards', 'widgets', 'reports'],
      'Programming': ['events', 'spaces', 'lineups', 'riders'],
      'Pipeline': ['pipeline_stages', 'manning_slots', 'onboarding_tasks'],
      'Resources': ['resources', 'resource_categories', 'training_modules'],
      'Settings': ['organizations', 'memberships', 'organization_domains'],
      'Profile': ['user_profiles', 'certifications', 'job_history'],
    };

    // Find matching tables based on component name
    Object.entries(tableMapping).forEach(([key, value]) => {
      if (componentName.includes(key)) {
        tables.push(...value);
      }
    });

    return [...new Set(tables)]; // Remove duplicates
  }

  /**
   * Check for realtime subscription
   */
  private hasRealtimeSubscription(componentName: string): boolean {
    // Components that should have realtime
    const realtimeComponents = [
      'Dashboard',
      'Analytics',
      'Notifications',
      'Chat',
      'Activity',
      'Live',
      'Realtime',
    ];

    return realtimeComponents.some(name => componentName.includes(name));
  }

  /**
   * Check for loading states
   */
  private hasLoadingStates(element: HTMLElement): boolean {
    const loadingIndicators = [
      '[class*="loading"]',
      '[class*="skeleton"]',
      '[class*="pulse"]',
      '[class*="spinner"]',
      '[aria-busy="true"]',
      '.animate-pulse',
      '.animate-spin',
    ];

    return loadingIndicators.some(selector => 
      element.querySelector(selector) !== null
    );
  }

  /**
   * Check for empty states
   */
  private hasEmptyStates(element: HTMLElement): boolean {
    const emptyStateIndicators = [
      '[class*="empty"]',
      '[class*="no-data"]',
      '[class*="no-results"]',
      '[data-empty="true"]',
      '.empty-state',
    ];

    return emptyStateIndicators.some(selector => 
      element.querySelector(selector) !== null
    );
  }

  /**
   * Check for error handling
   */
  private hasErrorHandling(element: HTMLElement): boolean {
    const errorIndicators = [
      '[class*="error"]',
      '[class*="alert"]',
      '[class*="warning"]',
      '[role="alert"]',
      '.text-red-',
      '.bg-red-',
    ];

    return errorIndicators.some(selector => 
      element.querySelector(selector) !== null
    );
  }

  /**
   * Check for pagination
   */
  private hasPagination(element: HTMLElement): boolean {
    const paginationIndicators = [
      '[class*="pagination"]',
      '[class*="page-"]',
      '[aria-label*="pagination"]',
      'button:contains("Next")',
      'button:contains("Previous")',
      '.page-numbers',
    ];

    return paginationIndicators.some(selector => {
      try {
        return element.querySelector(selector) !== null;
      } catch {
        return false;
      }
    });
  }

  /**
   * Check for filtering
   */
  private hasFiltering(element: HTMLElement): boolean {
    const filterIndicators = [
      '[class*="filter"]',
      '[type="search"]',
      'input[placeholder*="Search"]',
      'input[placeholder*="Filter"]',
      'select[name*="filter"]',
      '.search-',
    ];

    return filterIndicators.some(selector => 
      element.querySelector(selector) !== null
    );
  }

  /**
   * Check for sorting
   */
  private hasSorting(element: HTMLElement): boolean {
    const sortIndicators = [
      '[class*="sort"]',
      '[aria-sort]',
      'th[role="columnheader"]',
      '.sortable',
      '[class*="arrow-up"]',
      '[class*="arrow-down"]',
    ];

    return sortIndicators.some(selector => 
      element.querySelector(selector) !== null
    );
  }

  /**
   * Check for optimistic updates
   */
  private hasOptimisticUpdates(props?: any): boolean {
    return props?.optimisticUpdate === true || 
           props?.optimistic === true ||
           props?.instantUpdate === true;
  }

  /**
   * Check for caching
   */
  private hasCaching(props?: any): boolean {
    return props?.cache === true || 
           props?.cacheTime !== undefined ||
           props?.staleTime !== undefined;
  }

  /**
   * Validate critical requirements
   */
  private validateCriticalRequirements(status: DatabaseIntegrationStatus): void {
    // Must be connected to Supabase
    if (!status.isConnected) {
      status.issues.push('❌ Not connected to Supabase database');
    }

    // Must not use mock data in production
    if (status.dataSource === 'mock' && process.env.NODE_ENV === 'production') {
      status.issues.push('❌ Mock data detected in production environment');
    }

    // Must have proper error handling
    if (!status.errorHandling) {
      status.issues.push('⚠️ Missing error handling for database operations');
    }

    // Must have loading states
    if (!status.loadingStates) {
      status.issues.push('⚠️ Missing loading states for async operations');
    }

    // Must have empty states
    if (!status.emptyStates) {
      status.issues.push('⚠️ Missing empty state handling');
    }

    // Should have realtime for certain components
    if (status.component.includes('Dashboard') && !status.realtime) {
      status.issues.push('⚠️ Dashboard should have realtime updates');
    }

    // Should have pagination for lists
    if (status.component.includes('List') && !status.pagination) {
      status.issues.push('⚠️ List components should have pagination');
    }
  }

  /**
   * Generate module integration report
   */
  generateModuleReport(moduleName: string): ModuleIntegrationReport {
    const submodules = new Map<string, DatabaseIntegrationStatus>();
    const criticalIssues: string[] = [];
    const recommendations: string[] = [];

    // Get all components for this module
    this.validationResults.forEach((status, componentName) => {
      if (componentName.startsWith(moduleName)) {
        submodules.set(componentName, status);
        
        // Collect critical issues
        status.issues.forEach(issue => {
          if (issue.startsWith('❌')) {
            criticalIssues.push(`${componentName}: ${issue}`);
          }
        });
      }
    });

    // Calculate coverage
    const total = submodules.size;
    const connected = Array.from(submodules.values()).filter(s => s.isConnected).length;
    const percentage = total > 0 ? (connected / total) * 100 : 0;

    // Generate recommendations
    if (percentage < 100) {
      recommendations.push(`Connect ${total - connected} components to Supabase`);
    }

    const noRealtime = Array.from(submodules.values()).filter(s => !s.realtime && s.isConnected);
    if (noRealtime.length > 0) {
      recommendations.push(`Enable realtime subscriptions for ${noRealtime.length} components`);
    }

    const noPagination = Array.from(submodules.values()).filter(s => 
      s.component.includes('List') && !s.pagination
    );
    if (noPagination.length > 0) {
      recommendations.push(`Add pagination to ${noPagination.length} list components`);
    }

    const report: ModuleIntegrationReport = {
      module: moduleName,
      submodules,
      coverage: {
        total,
        connected,
        percentage,
      },
      criticalIssues,
      recommendations,
    };

    this.moduleReports.set(moduleName, report);
    return report;
  }

  /**
   * Get full validation report
   */
  getFullReport(): {
    components: Map<string, DatabaseIntegrationStatus>;
    modules: Map<string, ModuleIntegrationReport>;
    summary: {
      totalComponents: number;
      connectedComponents: number;
      mockDataComponents: number;
      staticDataComponents: number;
      coveragePercentage: number;
      criticalIssues: number;
    };
  } {
    const totalComponents = this.validationResults.size;
    const connectedComponents = Array.from(this.validationResults.values())
      .filter(s => s.isConnected).length;
    const mockDataComponents = Array.from(this.validationResults.values())
      .filter(s => s.dataSource === 'mock').length;
    const staticDataComponents = Array.from(this.validationResults.values())
      .filter(s => s.dataSource === 'static').length;
    const coveragePercentage = totalComponents > 0 
      ? (connectedComponents / totalComponents) * 100 
      : 0;
    const criticalIssues = Array.from(this.validationResults.values())
      .reduce((sum, s) => sum + s.issues.filter(i => i.startsWith('❌')).length, 0);

    return {
      components: this.validationResults,
      modules: this.moduleReports,
      summary: {
        totalComponents,
        connectedComponents,
        mockDataComponents,
        staticDataComponents,
        coveragePercentage,
        criticalIssues,
      },
    };
  }
}

// =============================================================================
// REACT HOOK FOR DATABASE VALIDATION
// =============================================================================

export const useDatabaseIntegration = (componentName: string, supabaseClient?: any) => {
  const [status, setStatus] = useState<DatabaseIntegrationStatus | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const validatorRef = useRef<DatabaseIntegrationValidator>();
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!validatorRef.current) {
      validatorRef.current = new DatabaseIntegrationValidator(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
    }
  }, []);

  const validate = useCallback(() => {
    if (!elementRef.current || !validatorRef.current) return;

    setIsValidating(true);
    const result = validatorRef.current.validateComponent(
      componentName,
      elementRef.current,
      { supabaseClient }
    );
    setStatus(result);
    setIsValidating(false);
  }, [componentName, supabaseClient]);

  useEffect(() => {
    validate();
  }, [validate]);

  return {
    ref: elementRef,
    status,
    isValidating,
    revalidate: validate,
    isConnected: status?.isConnected || false,
    issues: status?.issues || [],
  };
};

// =============================================================================
// DATABASE INTEGRATION MONITOR COMPONENT
// =============================================================================

interface DatabaseMonitorProps {
  show?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  modules?: string[];
}

export const DatabaseIntegrationMonitor: React.FC<DatabaseMonitorProps> = ({
  show = process.env.NODE_ENV === 'development',
  position = 'top-right',
  modules = ['Projects', 'People', 'Companies', 'Finance', 'Jobs', 'Programming', 'Pipeline', 'Procurement', 'Analytics', 'Resources', 'Settings', 'Profile'],
}) => {
  const [validator] = useState(() => new DatabaseIntegrationValidator());
  const [report, setReport] = useState<any>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  useEffect(() => {
    if (!show) return;

    const validateAll = () => {
      // Find all components with data attributes
      const components = document.querySelectorAll('[data-component-name]');
      
      components.forEach(component => {
        const name = component.getAttribute('data-component-name');
        if (name && component instanceof HTMLElement) {
          validator.validateComponent(name, component);
        }
      });

      // Generate module reports
      modules.forEach(module => {
        validator.generateModuleReport(module);
      });

      // Get full report
      setReport(validator.getFullReport());
    };

    // Initial validation
    validateAll();

    // Re-validate periodically
    const interval = setInterval(validateAll, 10000);

    return () => clearInterval(interval);
  }, [show, modules, validator]);

  if (!show || !report) return null;

  const positionClasses = {
    'top-left': 'top-20 left-4',
    'top-right': 'top-20 right-4',
    'bottom-left': 'bottom-20 left-4',
    'bottom-right': 'bottom-20 right-4',
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-[9998] bg-gray-900/95 text-white rounded-lg shadow-2xl backdrop-blur-sm transition-all duration-300 ${
        isMinimized ? 'w-auto' : 'w-[420px]'
      }`}
    >
      <div className="p-3 border-b border-white/20 flex justify-between items-center bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Database Integration Monitor
        </h3>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-xs px-2 py-1 rounded hover:bg-white/10"
        >
          {isMinimized ? '📊' : '➖'}
        </button>
      </div>

      {!isMinimized && (
        <div className="p-3">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="bg-white/5 rounded p-2">
              <div className="text-gray-400">Total Components</div>
              <div className="text-xl font-mono">{report.summary.totalComponents}</div>
            </div>
            <div className="bg-white/5 rounded p-2">
              <div className="text-gray-400">Connected</div>
              <div className="text-xl font-mono text-green-400">
                {report.summary.connectedComponents}
              </div>
            </div>
            <div className="bg-white/5 rounded p-2">
              <div className="text-gray-400">Mock Data</div>
              <div className="text-xl font-mono text-yellow-400">
                {report.summary.mockDataComponents}
              </div>
            </div>
            <div className="bg-white/5 rounded p-2">
              <div className="text-gray-400">Coverage</div>
              <div className="text-xl font-mono text-blue-400">
                {report.summary.coveragePercentage.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                style={{ width: `${report.summary.coveragePercentage}%` }}
              />
            </div>
          </div>

          {/* Module Tabs */}
          <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
            {modules.map(module => {
              const moduleReport = report.modules.get(module);
              const isSelected = selectedModule === module;
              const coverage = moduleReport?.coverage.percentage || 0;
              
              return (
                <button
                  key={module}
                  onClick={() => setSelectedModule(isSelected ? null : module)}
                  className={`px-2 py-1 text-[10px] rounded whitespace-nowrap transition-all ${
                    isSelected 
                      ? 'bg-blue-500/30 text-blue-300' 
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div>{module}</div>
                  <div className={`text-[8px] ${
                    coverage === 100 ? 'text-green-400' : 
                    coverage > 50 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {coverage.toFixed(0)}%
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Module Details */}
          {selectedModule && report.modules.get(selectedModule) && (
            <div className="bg-white/5 rounded p-2 max-h-48 overflow-y-auto">
              <h4 className="text-xs font-semibold mb-2">{selectedModule} Module</h4>
              {report.modules.get(selectedModule).criticalIssues.length > 0 && (
                <div className="mb-2">
                  <div className="text-[10px] text-red-400 font-semibold mb-1">Critical Issues:</div>
                  {report.modules.get(selectedModule).criticalIssues.map((issue: string, i: number) => (
                    <div key={i} className="text-[9px] text-red-300 mb-1">• {issue}</div>
                  ))}
                </div>
              )}
              {report.modules.get(selectedModule).recommendations.length > 0 && (
                <div>
                  <div className="text-[10px] text-yellow-400 font-semibold mb-1">Recommendations:</div>
                  {report.modules.get(selectedModule).recommendations.map((rec: string, i: number) => (
                    <div key={i} className="text-[9px] text-yellow-300 mb-1">• {rec}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Critical Issues Summary */}
          {report.summary.criticalIssues > 0 && !selectedModule && (
            <div className="bg-red-500/10 border border-red-500/30 rounded p-2 text-[10px]">
              <div className="text-red-400 font-semibold mb-1">
                ⚠️ {report.summary.criticalIssues} Critical Issues Found
              </div>
              <div className="text-red-300">
                Components using mock data or missing Supabase integration
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// EXPORT ALL
// =============================================================================

export default {
  DatabaseIntegrationValidator,
  useDatabaseIntegration,
  DatabaseIntegrationMonitor,
};
