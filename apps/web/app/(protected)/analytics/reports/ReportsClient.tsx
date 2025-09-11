'use client';

import { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import { getStatusColor, StatusBadge } from '../../components/ui/DesignTokens';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  Plus,
  Edit3,
  Trash2,
  Play,
  Pause,
  Download,
  Share2,
  Copy,
  Calendar,
  Clock,
  FileText,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  Users,
  DollarSign,
  TrendingUp,
  Activity
} from 'lucide-react';
import CreateReportClient from './CreateReportClient';

interface ReportField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  source: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  value: any;
}

interface Report {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: 'table' | 'chart' | 'summary';
  chartType?: 'bar' | 'line' | 'pie' | 'area';
  fields: ReportField[];
  filters: ReportFilter[];
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
  isPublic: boolean;
  status: 'draft' | 'active' | 'paused';
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface ReportsClientProps {
  organizationId: string;
  translations: Record<string, string>;
}

export default function ReportsClient({ organizationId, translations }: ReportsClientProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateReport, setShowCreateReport] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const supabase = createBrowserClient();

  useEffect(() => {
    loadReports();
  }, [organizationId]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load reports from API
      const response = await fetch(`/api/v1/analytics/reports?organization_id=${organizationId}`, {
        headers: {
          'x-org-id': organizationId
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load reports');
      }

      const data = await response.json();
      
      // Add mock reports for demonstration
      const mockReports: Report[] = [
        {
          id: '1',
          organizationId,
          name: 'Monthly Revenue Report',
          description: 'Comprehensive revenue analysis by project and department',
          type: 'chart',
          chartType: 'bar',
          fields: [
            { id: 'f1', name: 'Project Name', type: 'string', source: 'projects.name' },
            { id: 'f2', name: 'Revenue', type: 'number', source: 'finance_transactions.amount', aggregation: 'sum' },
            { id: 'f3', name: 'Date', type: 'date', source: 'finance_transactions.created_at' }
          ],
          filters: [
            { id: 'filter1', field: 'finance_transactions.type', operator: 'equals', value: 'income' }
          ],
          schedule: {
            enabled: true,
            frequency: 'monthly',
            time: '09:00',
            recipients: ['admin@ghxstship.com']
          },
          isPublic: false,
          status: 'active',
          lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          nextRun: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'user-1'
        },
        {
          id: '2',
          organizationId,
          name: 'Team Performance Summary',
          description: 'Weekly summary of team productivity and project completion rates',
          type: 'table',
          fields: [
            { id: 'f4', name: 'Team Member', type: 'string', source: 'people.name' },
            { id: 'f5', name: 'Tasks Completed', type: 'number', source: 'tasks.status', aggregation: 'count' },
            { id: 'f6', name: 'Projects Active', type: 'number', source: 'projects.id', aggregation: 'count' }
          ],
          filters: [
            { id: 'filter2', field: 'tasks.status', operator: 'equals', value: 'completed' }
          ],
          schedule: {
            enabled: true,
            frequency: 'weekly',
            time: '08:00',
            recipients: ['manager@ghxstship.com']
          },
          isPublic: true,
          status: 'active',
          lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
          nextRun: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'user-2'
        },
        {
          id: '3',
          organizationId,
          name: 'Project Budget Analysis',
          description: 'Budget vs actual spending analysis for all active projects',
          type: 'chart',
          chartType: 'line',
          fields: [
            { id: 'f7', name: 'Project', type: 'string', source: 'projects.name' },
            { id: 'f8', name: 'Budget', type: 'number', source: 'projects.budget' },
            { id: 'f9', name: 'Spent', type: 'number', source: 'finance_transactions.amount', aggregation: 'sum' }
          ],
          filters: [
            { id: 'filter3', field: 'projects.status', operator: 'equals', value: 'active' }
          ],
          isPublic: false,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'user-1'
        }
      ];

      setReports([...data.items || [], ...mockReports]);

    } catch (err) {
      console.error('Error loading reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const createReport = async (reportData: Partial<Report>) => {
    try {
      const response = await fetch('/api/v1/analytics/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': organizationId
        },
        body: JSON.stringify({
          name: reportData.name,
          definition: {
            description: reportData.description,
            type: reportData.type,
            chartType: reportData.chartType,
            fields: reportData.fields || [],
            filters: reportData.filters || []
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create report');
      }

      const data = await response.json();
      
      // Add to local state
      const newReport: Report = {
        id: data.report.id,
        organizationId,
        name: data.report.name,
        description: data.report.definition.description,
        type: data.report.definition.type || 'table',
        chartType: data.report.definition.chartType,
        fields: data.report.definition.fields || [],
        filters: data.report.definition.filters || [],
        isPublic: false,
        status: 'draft',
        createdAt: data.report.createdAt,
        updatedAt: data.report.updatedAt,
        createdBy: 'current-user'
      };

      setReports(prev => [...prev, newReport]);
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating report:', err);
      setError('Failed to create report');
    }
  };

  const deleteReport = async (reportId: string) => {
    try {
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err) {
      console.error('Error deleting report:', err);
      setError('Failed to delete report');
    }
  };

  const runReport = async (reportId: string) => {
    try {
      // Update last run time
      setReports(prev => prev.map(r => 
        r.id === reportId 
          ? { ...r, lastRun: new Date().toISOString() }
          : r
      ));
    } catch (err) {
      console.error('Error running report:', err);
      setError('Failed to run report');
    }
  };

  const toggleReportStatus = async (reportId: string) => {
    try {
      setReports(prev => prev.map(r => 
        r.id === reportId 
          ? { ...r, status: r.status === 'active' ? 'paused' : 'active' }
          : r
      ));
    } catch (err) {
      console.error('Error updating report status:', err);
      setError('Failed to update report status');
    }
  };

  const getReportIcon = (report: Report) => {
    if (report.type === 'chart') {
      switch (report.chartType) {
        case 'bar': return BarChart3;
        case 'line': return LineChart;
        case 'pie': return PieChart;
        default: return BarChart3;
      }
    }
    return report.type === 'table' ? Table : FileText;
  };

  // Using design tokens for status colors

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card title="Error">
          <div className="text-center py-12 text-destructive">{error}</div>
        <Button onClick={loadReports} className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  return (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{translations.title}</h1>
        <p className="text-sm text-muted-foreground">Build and schedule custom reports</p>
      </div>
      <Button onClick={() => setShowCreateForm(true)}>
        <Plus className="h-4 w-4 mr-2" />
        New Report
      </Button>
    </div>

    {/* Filters */}
    <div className="flex items-center space-x-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <input
          type="text"
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="" className="text-muted-foreground">All Statuses</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="draft">Draft</option>
      </select>
    </div>

    {/* Reports Grid */}
    {filteredReports.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => {
          const IconComponent = getReportIcon(report);
          return (
            <Card key={report.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{report.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                  </div>
                </div>
                <StatusBadge status={report.status} />
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{report.type}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Fields:</span>
                  <span className="font-medium">{report.fields.length}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Filters:</span>
                  <span className="font-medium">{report.filters.length}</span>
                </div>

                {report.schedule?.enabled && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Schedule:</span>
                      <Badge variant="outline" className="text-xs">
                        {report.schedule.frequency}
                      </Badge>
                    </div>
                  )}

                {report.lastRun && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Run:</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(report.lastRun).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground mt-2">
                  Created {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => runReport(report.id)}>
                    <Play className="h-3 w-3 mr-1" />
                    Run
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteReport(report.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No reports found</h3>
          <p className="text-muted-foreground mb-4">Create your first report to get started with analytics.</p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </Card>
      )}

      {/* Create Report Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Report</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const reportData = {
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  type: formData.get('type') as Report['type'],
                  chartType: formData.get('chartType') as Report['chartType']
                };
                createReport(reportData);
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Report Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Monthly Revenue Report"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Brief description of this report..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Report Type
                    </label>
                    <select
                      name="type"
                      required
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="table">Table</option>
                      <option value="chart">Chart</option>
                      <option value="summary">Summary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Chart Type (if applicable)
                    </label>
                    <select
                      name="chartType"
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="" className="text-muted-foreground">All Types</option>
                      <option value="bar">Bar Chart</option>
                      <option value="line">Line Chart</option>
                      <option value="pie">Pie Chart</option>
                      <option value="area">Area Chart</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Create Report
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
