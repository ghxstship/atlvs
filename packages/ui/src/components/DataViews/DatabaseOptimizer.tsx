'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '../atomic/Button';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Input } from '../atomic/Input';
import { Select } from '../Select';
import { 
  Database, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  RefreshCw,
  Eye,
  Play,
  Pause,
  Target
} from 'lucide-react';

interface QueryPerformance {
  id: string;
  query: string;
  table: string;
  executionTime: number;
  rowsScanned: number;
  rowsReturned: number;
  indexesUsed: string[];
  cost: number;
  frequency: number;
  lastExecuted: Date;
}

interface IndexRecommendation {
  id: string;
  table: string;
  columns: string[];
  type: 'btree' | 'gin' | 'gist' | 'hash';
  reason: string;
  estimatedImprovement: number;
  impact: 'high' | 'medium' | 'low';
  queries: string[];
}

interface DatabaseMetrics {
  totalQueries: number;
  avgQueryTime: number;
  slowQueries: number;
  cacheHitRatio: number;
  connectionCount: number;
  indexEfficiency: number;
  tableScans: number;
  deadlocks: number;
}

interface DatabaseOptimizerProps {
  className?: string;
  autoOptimize?: boolean;
  monitoringEnabled?: boolean;
  slowQueryThreshold?: number;
  onOptimizationApplied?: (optimization: any) => void;
  onMetricsUpdate?: (metrics: DatabaseMetrics) => void;
}

export function DatabaseOptimizer({
  className = '',
  autoOptimize = false,
  monitoringEnabled = true,
  slowQueryThreshold = 1000, // ms
  onOptimizationApplied,
  onMetricsUpdate
}: DatabaseOptimizerProps) {
  const [metrics, setMetrics] = useState<DatabaseMetrics>({
    totalQueries: 0,
    avgQueryTime: 0,
    slowQueries: 0,
    cacheHitRatio: 0,
    connectionCount: 0,
    indexEfficiency: 0,
    tableScans: 0,
    deadlocks: 0
  });

  const [queryPerformance, setQueryPerformance] = useState<QueryPerformance[]>([]);
  const [indexRecommendations, setIndexRecommendations] = useState<IndexRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('1h');

  // Mock database tables for demo
  const tables = [
    'companies', 'projects', 'people', 'assets', 'events', 
    'budgets', 'expenses', 'transactions', 'jobs', 'opportunities'
  ];

  // Generate mock query performance data
  const generateMockQueryPerformance = useCallback((): QueryPerformance[] => {
    const mockQueries = [
      {
        query: 'SELECT * FROM companies WHERE organization_id = $1 AND status = $2',
        table: 'companies',
        executionTime: 250,
        rowsScanned: 1500,
        rowsReturned: 45,
        indexesUsed: ['companies_organization_id_idx'],
        cost: 125.5
      },
      {
        query: 'SELECT p.*, c.name as company_name FROM projects p JOIN companies c ON p.company_id = c.id WHERE p.status = $1',
        table: 'projects',
        executionTime: 850,
        rowsScanned: 5000,
        rowsReturned: 120,
        indexesUsed: ['projects_status_idx', 'companies_pkey'],
        cost: 445.2
      },
      {
        query: 'SELECT COUNT(*) FROM expenses WHERE organization_id = $1 AND created_at >= $2',
        table: 'expenses',
        executionTime: 1200,
        rowsScanned: 25000,
        rowsReturned: 1,
        indexesUsed: [],
        cost: 1250.0
      },
      {
        query: 'UPDATE people SET last_login = NOW() WHERE id = $1',
        table: 'people',
        executionTime: 45,
        rowsScanned: 1,
        rowsReturned: 1,
        indexesUsed: ['people_pkey'],
        cost: 0.5
      },
      {
        query: 'SELECT e.*, p.name FROM events e LEFT JOIN projects p ON e.project_id = p.id WHERE e.starts_at BETWEEN $1 AND $2',
        table: 'events',
        executionTime: 650,
        rowsScanned: 3200,
        rowsReturned: 85,
        indexesUsed: ['events_starts_at_idx'],
        cost: 320.8
      }
    ];

    return mockQueries.map((query, index) => ({
      id: `query-${index}`,
      ...query,
      frequency: Math.floor(Math.random() * 100) + 10,
      lastExecuted: new Date(Date.now() - Math.random() * 3600000)
    }));
  }, []);

  // Generate mock index recommendations
  const generateIndexRecommendations = useCallback((): IndexRecommendation[] => {
    return [
      {
        id: 'idx-1',
        table: 'expenses',
        columns: ['organization_id', 'created_at'],
        type: 'btree',
        reason: 'Frequent filtering by organization and date range',
        estimatedImprovement: 75,
        impact: 'high',
        queries: ['SELECT COUNT(*) FROM expenses WHERE organization_id = $1 AND created_at >= $2']
      },
      {
        id: 'idx-2',
        table: 'projects',
        columns: ['status', 'company_id'],
        type: 'btree',
        reason: 'Common JOIN and WHERE conditions',
        estimatedImprovement: 45,
        impact: 'medium',
        queries: ['SELECT p.*, c.name FROM projects p JOIN companies c WHERE p.status = $1']
      },
      {
        id: 'idx-3',
        table: 'people',
        columns: ['email'],
        type: 'btree',
        reason: 'Unique constraint and frequent lookups',
        estimatedImprovement: 30,
        impact: 'medium',
        queries: ['SELECT * FROM people WHERE email = $1']
      },
      {
        id: 'idx-4',
        table: 'events',
        columns: ['project_id', 'status'],
        type: 'btree',
        reason: 'Composite index for project event queries',
        estimatedImprovement: 55,
        impact: 'high',
        queries: ['SELECT * FROM events WHERE project_id = $1 AND status = $2']
      }
    ];
  }, []);

  // Generate mock database metrics
  const generateMockMetrics = useCallback((): DatabaseMetrics => {
    return {
      totalQueries: Math.floor(Math.random() * 10000) + 5000,
      avgQueryTime: Math.random() * 500 + 100,
      slowQueries: Math.floor(Math.random() * 50) + 10,
      cacheHitRatio: Math.random() * 20 + 80,
      connectionCount: Math.floor(Math.random() * 50) + 20,
      indexEfficiency: Math.random() * 30 + 70,
      tableScans: Math.floor(Math.random() * 100) + 50,
      deadlocks: Math.floor(Math.random() * 5)
    };
  }, []);

  // Analyze database performance
  const analyzePerformance = useCallback(async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newMetrics = generateMockMetrics();
    const newQueryPerformance = generateMockQueryPerformance();
    const newIndexRecommendations = generateIndexRecommendations();
    
    setMetrics(newMetrics);
    setQueryPerformance(newQueryPerformance);
    setIndexRecommendations(newIndexRecommendations);
    
    onMetricsUpdate?.(newMetrics);
    setIsAnalyzing(false);
  }, [generateMockMetrics, generateMockQueryPerformance, generateIndexRecommendations, onMetricsUpdate]);

  // Apply index recommendation
  const applyIndexRecommendation = useCallback(async (recommendation: IndexRecommendation) => {
    try {
      // Simulate index creation
      console.log(`Creating index on ${recommendation.table}(${recommendation.columns.join(', ')})`);
      
      // In real implementation, this would execute:
      // CREATE INDEX CONCURRENTLY idx_name ON table_name (columns);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove applied recommendation
      setIndexRecommendations(prev => prev.filter(rec => rec.id !== recommendation.id));
      
      onOptimizationApplied?.(recommendation);
    } catch (error) {
      console.error('Failed to apply index recommendation:', error);
    }
  }, [onOptimizationApplied]);

  // Filter query performance data
  const filteredQueries = useMemo(() => {
    let filtered = queryPerformance;
    
    if (selectedTable !== 'all') {
      filtered = filtered.filter(query => query.table === selectedTable);
    }
    
    return filtered.sort((a, b) => b.executionTime - a.executionTime);
  }, [queryPerformance, selectedTable]);

  // Calculate performance score
  const performanceScore = useMemo(() => {
    const scores = {
      queryTime: Math.max(0, 100 - (metrics.avgQueryTime / 1000) * 100),
      cacheHit: metrics.cacheHitRatio,
      indexEfficiency: metrics.indexEfficiency,
      slowQueries: Math.max(0, 100 - (metrics.slowQueries / 100) * 100)
    };
    
    return Math.round((scores.queryTime + scores.cacheHit + scores.indexEfficiency + scores.slowQueries) / 4);
  }, [metrics]);

  // Auto-refresh metrics
  useEffect(() => {
    if (monitoringEnabled) {
      const interval = setInterval(() => {
        const newMetrics = generateMockMetrics();
        setMetrics(newMetrics);
        onMetricsUpdate?.(newMetrics);
      }, 30000); // Update every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [monitoringEnabled, generateMockMetrics, onMetricsUpdate]);

  // Initial analysis
  useEffect(() => {
    analyzePerformance();
  }, [analyzePerformance]);

  const containerClasses = `
    database-optimizer bg-background border border-border rounded-lg overflow-hidden
    ${className}
  `.trim();

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-center justify-between p-md border-b border-border">
        <div className="flex items-center gap-sm">
          <Database className="h-icon-sm w-icon-sm text-accent" />
          <div>
            <h3 className="font-semibold">Database Optimizer</h3>
            <p className="text-sm text-muted-foreground">
              Query performance analysis and optimization recommendations
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-sm">
          <Badge 
            variant={performanceScore >= 80 ? 'success' : performanceScore >= 60 ? 'warning' : 'destructive'}
            
          >
            Score: {performanceScore}
          </Badge>
          <Button
            variant="default"
            
            onClick={analyzePerformance}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-icon-xs w-icon-xs mr-xs animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="h-icon-xs w-icon-xs mr-xs" />
                Analyze
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="p-md gap-lg">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <Card className="p-sm">
            <div className="flex items-center gap-sm mb-sm">
              <Clock className="h-icon-xs w-icon-xs text-muted-foreground" />
              <span className="text-sm font-medium">Avg Query Time</span>
            </div>
            <div className="text-2xl font-bold">
              {metrics.avgQueryTime.toFixed(0)}ms
            </div>
            <div className="text-xs text-muted-foreground">
              {metrics.totalQueries.toLocaleString()} total queries
            </div>
          </Card>

          <Card className="p-sm">
            <div className="flex items-center gap-sm mb-sm">
              <TrendingUp className="h-icon-xs w-icon-xs text-muted-foreground" />
              <span className="text-sm font-medium">Cache Hit Ratio</span>
            </div>
            <div className="text-2xl font-bold">
              {metrics.cacheHitRatio.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              Target: &gt;95%
            </div>
          </Card>

          <Card className="p-sm">
            <div className="flex items-center gap-sm mb-sm">
              <AlertTriangle className="h-icon-xs w-icon-xs text-muted-foreground" />
              <span className="text-sm font-medium">Slow Queries</span>
            </div>
            <div className="text-2xl font-bold">
              {metrics.slowQueries}
            </div>
            <div className="text-xs text-muted-foreground">
              &gt;{slowQueryThreshold}ms
            </div>
          </Card>

          <Card className="p-sm">
            <div className="flex items-center gap-sm mb-sm">
              <Target className="h-icon-xs w-icon-xs text-muted-foreground" />
              <span className="text-sm font-medium">Index Efficiency</span>
            </div>
            <div className="text-2xl font-bold">
              {metrics.indexEfficiency.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {metrics.tableScans} table scans
            </div>
          </Card>
        </div>

        {/* Index Recommendations */}
        {indexRecommendations.length > 0 && (
          <div>
            <h4 className="font-medium mb-sm flex items-center gap-sm">
              <Zap className="h-icon-xs w-icon-xs text-warning" />
              Index Recommendations
            </h4>
            <div className="space-y-sm">
              {indexRecommendations.map(recommendation => (
                <Card key={recommendation.id} className="p-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-sm mb-sm">
                        <span className="font-medium">
                          {recommendation.table}({recommendation.columns.join(', ')})
                        </span>
                        <Badge variant="outline" >
                          {recommendation.type}
                        </Badge>
                        <Badge 
                          variant={recommendation.impact === 'high' ? 'destructive' : 
                                  recommendation.impact === 'medium' ? 'warning' : 'secondary'}
                          
                        >
                          {recommendation.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-sm">
                        {recommendation.reason}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Estimated improvement: {recommendation.estimatedImprovement}%
                      </div>
                    </div>
                    <Button
                      variant="default"
                      
                      onClick={() => applyIndexRecommendation(recommendation)}
                    >
                      Create Index
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Query Performance Analysis */}
        <div>
          <div className="flex items-center justify-between mb-sm">
            <h4 className="font-medium flex items-center gap-sm">
              <Eye className="h-icon-xs w-icon-xs" />
              Query Performance
            </h4>
            <div className="flex items-center gap-sm">
              <Select
                value={selectedTable}
                onChange={(e: any) => setSelectedTable(e.target.value)}
              >
                <option value="all">All Tables</option>
                {tables.map(table => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </Select>
              <Select
                value={timeRange}
                onChange={(e: any) => setTimeRange(e.target.value)}
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </Select>
            </div>
          </div>
          
          <div className="gap-sm max-h-container-lg overflow-y-auto">
            {filteredQueries.map(query => (
              <Card key={query.id} className="p-sm">
                <div className="flex items-start justify-between mb-sm">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-sm mb-xs">
                      <Badge variant="outline" >{query.table}</Badge>
                      <span className="text-sm font-medium">
                        {query.executionTime}ms
                      </span>
                      {query.executionTime > slowQueryThreshold && (
                        <Badge variant="destructive" >Slow</Badge>
                      )}
                    </div>
                    <code className="text-xs text-muted-foreground block truncate">
                      {query.query}
                    </code>
                  </div>
                  <div className="text-right text-xs text-muted-foreground ml-md">
                    <div>Cost: {query.cost}</div>
                    <div>Freq: {query.frequency}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-md">
                    <span>Scanned: {query.rowsScanned.toLocaleString()}</span>
                    <span>Returned: {query.rowsReturned.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    {query.indexesUsed.length > 0 ? (
                      <Badge variant="success" >
                        {query.indexesUsed.length} indexes
                      </Badge>
                    ) : (
                      <Badge variant="destructive" >
                        No indexes
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-md pt-md border-t border-border">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Active Connections</div>
            <div className="text-lg font-semibold">{metrics.connectionCount}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Table Scans</div>
            <div className="text-lg font-semibold">{metrics.tableScans}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Deadlocks</div>
            <div className="text-lg font-semibold">{metrics.deadlocks}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
