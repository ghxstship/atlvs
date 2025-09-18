'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Alert } from '../Alert';
import { RefreshCw, Database, Activity, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-react';

// Types for database monitoring data
interface TablePerformanceStats {
  tableName: string;
  tableSize: string;
  indexSize: string;
  totalSize: string;
  rowCount: number;
  seqScan: number;
  seqTupRead: number;
  idxScan: number;
  idxTupFetch: number;
  indexUsagePercent: number;
}

interface PerformanceRecommendation {
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  tableName: string;
  recommendation: string;
  impact: string;
}

interface DatabaseHealthReport {
  section: string;
  metric: string;
  value: string;
  status: 'OK' | 'WARNING' | 'CRITICAL' | 'INFO';
  recommendation: string;
}

interface VacuumCandidate {
  tableName: string;
  deadTuples: number;
  liveTuples: number;
  deadTupPercent: number;
  lastVacuum?: string;
  lastAutovacuum?: string;
  recommendation: string;
}

interface IndexUsageStats {
  tableName: string;
  indexName: string;
  timesUsed: number;
  indexSize: string;
  idxTupRead: number;
  idxTupFetch: number;
}

interface MonitoringData {
  healthReport: DatabaseHealthReport[];
  tableStats: TablePerformanceStats[];
  recommendations: PerformanceRecommendation[];
  vacuumCandidates: VacuumCandidate[];
  unusedIndexes: IndexUsageStats[];
}

interface DatabaseMonitoringDashboardProps {
  className?: string;
  refreshInterval?: number; // in milliseconds
  onDataUpdate?: (data: MonitoringData) => void;
}

export const DatabaseMonitoringDashboard: React.FC<DatabaseMonitoringDashboardProps> = ({
  className = '',
  refreshInterval = 30000, // 30 seconds default
  onDataUpdate
}) => {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data fetching function - replace with actual API call
  const fetchMonitoringData = useCallback(async (): Promise<MonitoringData> => {
    // This would be replaced with actual API call to DatabaseMonitoringService
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          healthReport: [
            {
              section: 'Database Size',
              metric: 'Total Database Size',
              value: '2.4 GB',
              status: 'INFO',
              recommendation: 'Monitor growth trends'
            },
            {
              section: 'Performance',
              metric: 'Tables with High Sequential Scans',
              value: '3',
              status: 'WARNING',
              recommendation: 'Review indexing strategy'
            },
            {
              section: 'Performance',
              metric: 'Unused Indexes',
              value: '7',
              status: 'OK',
              recommendation: 'Good'
            },
            {
              section: 'Maintenance',
              metric: 'Tables Needing Vacuum',
              value: '2',
              status: 'WARNING',
              recommendation: 'Schedule vacuum operations'
            }
          ],
          tableStats: [
            {
              tableName: 'public.projects',
              tableSize: '45 MB',
              indexSize: '12 MB',
              totalSize: '57 MB',
              rowCount: 15420,
              seqScan: 234,
              seqTupRead: 1234567,
              idxScan: 8945,
              idxTupFetch: 234567,
              indexUsagePercent: 97
            },
            {
              tableName: 'public.users',
              tableSize: '23 MB',
              indexSize: '8 MB',
              totalSize: '31 MB',
              rowCount: 8934,
              seqScan: 123,
              seqTupRead: 456789,
              idxScan: 5678,
              idxTupFetch: 123456,
              indexUsagePercent: 98
            }
          ],
          recommendations: [
            {
              category: 'Missing Indexes',
              priority: 'HIGH',
              tableName: 'public.audit_logs',
              recommendation: 'Add index on created_at (frequent filtering)',
              impact: 'Improves audit log queries by 10-50x'
            },
            {
              category: 'Query Optimization',
              priority: 'MEDIUM',
              tableName: 'public.notifications',
              recommendation: 'Consider adding composite index on (user_id, is_read)',
              impact: 'Reduces notification query time'
            }
          ],
          vacuumCandidates: [
            {
              tableName: 'public.audit_logs',
              deadTuples: 5432,
              liveTuples: 45678,
              deadTupPercent: 11.9,
              lastVacuum: '2024-09-14T10:30:00Z',
              recommendation: 'VACUUM recommended - high dead tuple ratio'
            }
          ],
          unusedIndexes: [
            {
              tableName: 'public.old_table',
              indexName: 'idx_old_column',
              timesUsed: 0,
              indexSize: '2 MB',
              idxTupRead: 0,
              idxTupFetch: 0
            }
          ]
        });
      }, 1000);
    });
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const monitoringData = await fetchMonitoringData();
      setData(monitoringData);
      setLastUpdated(new Date());
      onDataUpdate?.(monitoringData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  }, [fetchMonitoringData, onDataUpdate]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(loadData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'success';
      case 'WARNING': return 'warning';
      case 'CRITICAL': return 'destructive';
      case 'INFO': return 'info';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK': return <CheckCircle className="h-4 w-4" />;
      case 'WARNING': return <AlertTriangle className="h-4 w-4" />;
      case 'CRITICAL': return <XCircle className="h-4 w-4" />;
      case 'INFO': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <div>
            <h4 className="font-semibold">Monitoring Error</h4>
            <p>{error}</p>
          </div>
        </Alert>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Database className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Database Monitoring</h2>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-muted-foreground">
            {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
          </div>
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "primary" : "outline"}
            size="sm"
          >
            <Activity className="h-4 w-4 mr-2" />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button onClick={loadData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Health Overview */}
      {data?.healthReport && (
        <Card className="p-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-success" />
            System Health Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.healthReport.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">{item.metric}</span>
                  {getStatusIcon(item.status)}
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{item.value}</div>
                <Badge variant={getStatusColor(item.status)} className="text-xs">
                  {item.status}
                </Badge>
                <div className="text-xs text-muted-foreground mt-2">{item.recommendation}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Performance Recommendations */}
      {data?.recommendations && data.recommendations.length > 0 && (
        <Card className="p-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-warning" />
            Performance Recommendations
          </h3>
          <div className="space-y-sm">
            {data.recommendations.map((rec, index) => (
              <div key={index} className="p-4 border border-border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getPriorityColor(rec.priority)} className="text-xs">
                      {rec.priority}
                    </Badge>
                    <span className="text-sm font-medium text-muted-foreground">{rec.category}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{rec.tableName}</span>
                </div>
                <div className="text-sm text-foreground mb-1">{rec.recommendation}</div>
                <div className="text-xs text-muted-foreground">{rec.impact}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Table Performance Stats */}
      {data?.tableStats && (
        <Card className="p-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2 text-primary" />
            Table Performance Statistics
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2">Table</th>
                  <th className="text-left p-2">Size</th>
                  <th className="text-left p-2">Rows</th>
                  <th className="text-left p-2">Index Usage</th>
                  <th className="text-left p-2">Seq Scans</th>
                  <th className="text-left p-2">Index Scans</th>
                </tr>
              </thead>
              <tbody>
                {data.tableStats.map((table, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/50">
                    <td className="p-2 font-medium">{table.tableName}</td>
                    <td className="p-xs">{table.totalSize}</td>
                    <td className="p-xs">{table.rowCount.toLocaleString()}</td>
                    <td className="p-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              table.indexUsagePercent >= 90 ? 'bg-success' :
                              table.indexUsagePercent >= 70 ? 'bg-warning' : 'bg-destructive'
                            }`}
                            style={{ width: `${table.indexUsagePercent}%` }}
                          />
                        </div>
                        <span className="text-xs">{table.indexUsagePercent}%</span>
                      </div>
                    </td>
                    <td className="p-xs">{table.seqScan.toLocaleString()}</td>
                    <td className="p-xs">{table.idxScan.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Maintenance Alerts */}
      {data?.vacuumCandidates && data.vacuumCandidates.length > 0 && (
        <Card className="p-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingDown className="h-5 w-5 mr-2 text-destructive" />
            Maintenance Required
          </h3>
          <div className="space-y-sm">
            {data.vacuumCandidates.map((candidate, index) => (
              <Alert key={index} variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <div>
                  <h4 className="font-semibold">{candidate.tableName}</h4>
                  <p className="text-sm">
                    {candidate.deadTupPercent.toFixed(1)}% dead tuples ({candidate.deadTuples.toLocaleString()} dead, {candidate.liveTuples.toLocaleString()} live)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{candidate.recommendation}</p>
                </div>
              </Alert>
            ))}
          </div>
        </Card>
      )}

      {/* Unused Indexes */}
      {data?.unusedIndexes && data.unusedIndexes.length > 0 && (
        <Card className="p-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2 text-muted-foreground" />
            Unused Indexes
          </h3>
          <div className="text-sm text-muted-foreground mb-3">
            These indexes are not being used and could potentially be dropped to save space.
          </div>
          <div className="space-y-xs">
            {data.unusedIndexes.map((index, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <div className="font-medium">{index.indexName}</div>
                  <div className="text-sm text-muted-foreground">{index.tableName}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{index.indexSize}</div>
                  <div className="text-xs text-muted-foreground">0 uses</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {loading && (
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Loading monitoring data...</span>
        </div>
      )}
    </div>
  );
};
