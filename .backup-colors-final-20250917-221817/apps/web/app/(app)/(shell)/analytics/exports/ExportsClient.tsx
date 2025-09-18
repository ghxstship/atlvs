'use client';

import { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  Plus,
  Download,
  Calendar,
  Clock,
  FileText,
  Database,
  Filter,
  Search,
  Play,
  Pause,
  Trash2,
  Edit3,
  Eye,
  Share2,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileSpreadsheet,
  FileJson,
  Files,
  Archive,
  RefreshCw
} from 'lucide-react';

interface ExportJob {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  dataSource: 'projects' | 'people' | 'finance' | 'events' | 'custom_query';
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  filters: Record<string, any>;
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
  status: 'active' | 'paused' | 'failed' | 'completed';
  lastRun?: string;
  nextRun?: string;
  fileUrl?: string;
  fileSize?: number;
  recordCount?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface ExportHistory {
  id: string;
  exportJobId: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  fileUrl?: string;
  fileSize?: number;
  recordCount?: number;
  errorMessage?: string;
}

interface ExportsClientProps {
  organizationId: string;
  translations: Record<string, string>;
}

export default function ExportsClient({ organizationId, translations }: ExportsClientProps) {
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'jobs' | 'history'>('jobs');
  const [searchTerm, setSearchTerm] = useState('');

  const supabase = createBrowserClient();

  useEffect(() => {
    loadExportData();
  }, [organizationId]);

  const loadExportData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock export jobs for demonstration
      const mockJobs: ExportJob[] = [
        {
          id: '1',
          organizationId,
          name: 'Monthly Financial Report',
          description: 'Complete financial transactions and revenue data',
          dataSource: 'finance',
          format: 'xlsx',
          filters: {
            dateRange: 'last_30_days',
            transactionType: 'all'
          },
          schedule: {
            enabled: true,
            frequency: 'monthly',
            time: '09:00',
            dayOfMonth: 1
          },
          status: 'active',
          lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          nextRun: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
          fileUrl: '/exports/financial-report-2024-01.xlsx',
          fileSize: 2048576,
          recordCount: 1250,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'user-1'
        },
        {
          id: '2',
          organizationId,
          name: 'Team Directory Export',
          description: 'Complete team member contact information',
          dataSource: 'people',
          format: 'csv',
          filters: {
            status: 'active',
            includeContacts: true
          },
          schedule: {
            enabled: true,
            frequency: 'weekly',
            time: '08:00',
            dayOfWeek: 1
          },
          status: 'active',
          lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
          nextRun: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
          fileUrl: '/exports/team-directory-2024-01-15.csv',
          fileSize: 512000,
          recordCount: 85,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'user-2'
        },
        {
          id: '3',
          organizationId,
          name: 'Project Status Report',
          description: 'All active projects with current status and metrics',
          dataSource: 'projects',
          format: 'json',
          filters: {
            status: ['active', 'in_progress'],
            includeMetrics: true
          },
          status: 'paused',
          lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
          fileUrl: '/exports/project-status-2024-01-01.json',
          fileSize: 1024000,
          recordCount: 24,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'user-1'
        }
      ];

      // Mock export history
      const mockHistory: ExportHistory[] = [
        {
          id: 'h1',
          exportJobId: '1',
          status: 'completed',
          startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 5).toISOString(),
          fileUrl: '/exports/financial-report-2024-01-15.xlsx',
          fileSize: 2048576,
          recordCount: 1250
        },
        {
          id: 'h2',
          exportJobId: '2',
          status: 'completed',
          startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 2).toISOString(),
          fileUrl: '/exports/team-directory-2024-01-14.csv',
          fileSize: 512000,
          recordCount: 85
        },
        {
          id: 'h3',
          exportJobId: '1',
          status: 'failed',
          startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 3).toISOString(),
          errorMessage: 'Database connection timeout'
        }
      ];

      setExportJobs(mockJobs);
      setExportHistory(mockHistory);

    } catch (err) {
      console.error('Error loading export data:', err);
      setError('Failed to load export data');
    } finally {
      setLoading(false);
    }
  };

  const createExportJob = async (jobData: Partial<ExportJob>) => {
    try {
      const newJob: ExportJob = {
        id: crypto.randomUUID(),
        organizationId,
        name: jobData.name || '',
        description: jobData.description,
        dataSource: jobData.dataSource || 'projects',
        format: jobData.format || 'csv',
        filters: jobData.filters || {},
        schedule: jobData.schedule,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current-user'
      };

      setExportJobs(prev => [...prev, newJob]);
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating export job:', err);
      setError('Failed to create export job');
    }
  };

  const runExportJob = async (jobId: string) => {
    try {
      // Update job status and add to history
      setExportJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, lastRun: new Date().toISOString(), status: 'active' as const }
          : job
      ));

      // Add running history entry
      const historyEntry: ExportHistory = {
        id: crypto.randomUUID(),
        exportJobId: jobId,
        status: 'running',
        startedAt: new Date().toISOString()
      };

      setExportHistory(prev => [historyEntry, ...prev]);

      // Simulate completion after 3 seconds
      setTimeout(() => {
        setExportHistory(prev => prev.map(entry => 
          entry.id === historyEntry.id 
            ? { 
                ...entry, 
                status: 'completed' as const,
                completedAt: new Date().toISOString(),
                fileUrl: `/exports/export-${jobId}-${Date.now()}.csv`,
                fileSize: Math.floor(Math.random() * 2000000) + 100000,
                recordCount: Math.floor(Math.random() * 1000) + 50
              }
            : entry
        ));
      }, 3000);

    } catch (err) {
      console.error('Error running export job:', err);
      setError('Failed to run export job');
    }
  };

  const toggleJobStatus = async (jobId: string) => {
    try {
      setExportJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: job.status === 'active' ? 'paused' : 'active' }
          : job
      ));
    } catch (err) {
      console.error('Error updating job status:', err);
      setError('Failed to update job status');
    }
  };

  const deleteExportJob = async (jobId: string) => {
    try {
      setExportJobs(prev => prev.filter(job => job.id !== jobId));
      setExportHistory(prev => prev.filter(entry => entry.exportJobId !== jobId));
    } catch (err) {
      console.error('Error deleting export job:', err);
      setError('Failed to delete export job');
    }
  };

  const downloadFile = (fileUrl: string, fileName: string) => {
    // In a real implementation, this would handle the actual file download
    console.log(`Downloading file: ${fileUrl}`);
    alert(`Download started: ${fileName}`);
  };

  const getFormatIcon = (format: ExportJob['format']) => {
    switch (format) {
      case 'csv': return Files;
      case 'xlsx': return FileSpreadsheet;
      case 'json': return FileJson;
      case 'pdf': return FileText;
      default: return FileText;
    }
  };

  const getStatusIcon = (status: ExportJob['status'] | ExportHistory['status']) => {
    switch (status) {
      case 'active':
      case 'completed': return CheckCircle;
      case 'failed': return XCircle;
      case 'paused': return Pause;
      case 'running': return RefreshCw;
      default: return AlertCircle;
    }
  };

  const getStatusColor = (status: ExportJob['status'] | ExportHistory['status']) => {
    switch (status) {
      case 'active': return 'color-success';
      case 'completed': return 'color-success';
      case 'failed': return 'color-destructive';
      case 'paused': return 'color-warning';
      case 'running': return 'color-primary';
      default: return 'color-muted';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredJobs = exportJobs.filter(job =>
    job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="stack-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-secondary rounded w-1/4 mb-md"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card title="Error">
        <div className="text-body-sm color-destructive">{error}</div>
        <Button onClick={loadExportData} className="mt-md">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="stack-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 text-heading-3 color-foreground">Data Exports</h1>
          <p className="text-body-sm color-muted">Schedule and manage data exports</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-sm" />
          New Export Job
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex cluster-xl">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-sm px-xs border-b-2 form-label text-body-sm ${
              activeTab === 'jobs'
                ? 'border-primary color-primary'
                : 'border-transparent color-muted hover:color-foreground hover:border-muted'
            }`}
          >
            Export Jobs ({exportJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-sm px-xs border-b-2 form-label text-body-sm ${
              activeTab === 'history'
                ? 'border-primary color-primary'
                : 'border-transparent color-muted hover:color-foreground hover:border-muted'
            }`}
          >
            Export History ({exportHistory.length})
          </button>
        </nav>
      </div>

      {activeTab === 'jobs' && (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 color-muted" />
            <input
              type="text"
              placeholder="Search export jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-2xl pr-md py-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Export Jobs Grid */}
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
              {filteredJobs.map((job) => {
                const FormatIcon = getFormatIcon(job.format);
                const StatusIcon = getStatusIcon(job.status);
                
                return (
                  <Card key={job.id} className="p-lg">
                    <div className="flex items-start justify-between mb-md">
                      <div className="flex items-center cluster-sm">
                        <div className="p-sm bg-primary/10 rounded-lg">
                          <FormatIcon className="h-5 w-5 color-primary" />
                        </div>
                        <div>
                          <h3 className="text-heading-4 color-foreground">{job.name}</h3>
                          <div className="flex items-center cluster-sm mt-xs">
                            <StatusIcon className={`h-4 w-4 ${getStatusColor(job.status)}`} />
                            <Badge className={`text-body-sm ${
                              job.status === 'active' ? 'bg-success/10 color-success' :
                              job.status === 'paused' ? 'bg-warning/10 color-warning' :
                              'bg-secondary color-muted'
                            }`}>
                              {job.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center cluster-xs">
                        <Button
                          variant="ghost"
                         
                          onClick={() => runExportJob(job.id)}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                         
                          onClick={() => deleteExportJob(job.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {job.description && (
                      <p className="text-body-sm color-muted mb-md">{job.description}</p>
                    )}

                    <div className="stack-sm">
                      <div className="flex items-center justify-between text-body-sm">
                        <span className="color-muted">Data Source:</span>
                        <Badge variant="outline" className="text-body-sm">
                          {job.dataSource}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-body-sm">
                        <span className="color-muted">Format:</span>
                        <span className="form-label uppercase">{job.format}</span>
                      </div>

                      {job.schedule?.enabled && (
                        <div className="flex items-center justify-between text-body-sm">
                          <span className="color-muted">Schedule:</span>
                          <Badge variant="outline" className="text-body-sm">
                            {job.schedule.frequency}
                          </Badge>
                        </div>
                      )}

                      {job.lastRun && (
                        <div className="flex items-center justify-between text-body-sm">
                          <span className="color-muted">Last run:</span>
                          <span className="text-body-sm color-muted">
                            {new Date(job.lastRun).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {job.recordCount && (
                        <div className="flex items-center justify-between text-body-sm">
                          <span className="color-muted">Records:</span>
                          <span className="form-label">{job.recordCount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-md pt-md border-t">
                      {job.fileUrl ? (
                        <Button
                          variant="outline"
                         
                          onClick={() => downloadFile(job.fileUrl!, `${job.name}.${job.format}`)}
                        >
                          <Download className="h-3 w-3 mr-xs" />
                          Download
                        </Button>
                      ) : (
                        <div></div>
                      )}
                      
                      <Button
                        variant="outline"
                       
                        onClick={() => toggleJobStatus(job.id)}
                      >
                        {job.status === 'active' ? (
                          <Pause className="h-3 w-3 mr-xs" />
                        ) : (
                          <Play className="h-3 w-3 mr-xs" />
                        )}
                        {job.status === 'active' ? 'Pause' : 'Activate'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-xl text-center">
              <Archive className="h-12 w-12 color-muted mx-auto mb-md" />
              <h3 className="text-body form-label color-foreground mb-sm">
                No export jobs found
              </h3>
              <p className="text-body-sm color-muted mb-md">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Create your first export job to get started'
                }
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-sm" />
                Create Export Job
              </Button>
            </Card>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <div className="stack-md">
          {exportHistory.length > 0 ? (
            exportHistory.map((entry) => {
              const job = exportJobs.find(j => j.id === entry.exportJobId);
              const StatusIcon = getStatusIcon(entry.status);
              
              return (
                <Card key={entry.id} className="p-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center cluster">
                      <StatusIcon className={`h-5 w-5 ${getStatusColor(entry.status)}`} />
                      <div>
                        <h4 className="form-label color-foreground">
                          {job?.name || 'Unknown Job'}
                        </h4>
                        <div className="flex items-center cluster text-body-sm color-muted">
                          <span>Started: {new Date(entry.startedAt).toLocaleString()}</span>
                          {entry.completedAt && (
                            <span>Completed: {new Date(entry.completedAt).toLocaleString()}</span>
                          )}
                          {entry.recordCount && (
                            <span>{entry.recordCount.toLocaleString()} records</span>
                          )}
                          {entry.fileSize && (
                            <span>{formatFileSize(entry.fileSize)}</span>
                          )}
                        </div>
                        {entry.errorMessage && (
                          <div className="text-body-sm color-destructive mt-xs">
                            Error: {entry.errorMessage}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {entry.fileUrl && entry.status === 'completed' && (
                      <Button
                        variant="outline"
                       
                        onClick={() => downloadFile(entry.fileUrl!, `export-${entry.id}.${job?.format || 'csv'}`)}
                      >
                        <Download className="h-3 w-3 mr-xs" />
                        Download
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="p-xl text-center">
              <Clock className="h-12 w-12 color-muted mx-auto mb-md" />
              <h3 className="text-body form-label color-foreground mb-sm">
                No export history
              </h3>
              <p className="text-body-sm color-muted">
                Export history will appear here once you run some export jobs
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Create Export Job Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl p-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-body text-heading-4 mb-md">Create Export Job</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const jobData = {
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  dataSource: formData.get('dataSource') as ExportJob['dataSource'],
                  format: formData.get('format') as ExportJob['format'],
                  filters: {}
                };
                createExportJob(jobData);
              }}
            >
              <div className="stack-md">
                <div>
                  <label className="block text-body-sm form-label color-foreground mb-xs">
                    Export Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full px-sm py-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Monthly Financial Export"
                  />
                </div>
                
                <div>
                  <label className="block text-body-sm form-label color-foreground mb-xs">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-sm py-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Brief description of this export..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-md">
                  <div>
                    <label className="block text-body-sm form-label color-foreground mb-xs">
                      Data Source
                    </label>
                    <select
                      name="dataSource"
                      required
                      className="w-full px-sm py-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="projects">Projects</option>
                      <option value="people">People</option>
                      <option value="finance">Finance</option>
                      <option value="events">Events</option>
                      <option value="custom_query">Custom Query</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-body-sm form-label color-foreground mb-xs">
                      Export Format
                    </label>
                    <select
                      name="format"
                      required
                      className="w-full px-sm py-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="csv">CSV</option>
                      <option value="xlsx">Excel (XLSX)</option>
                      <option value="json">JSON</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end cluster-sm mt-lg">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Create Export Job
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
