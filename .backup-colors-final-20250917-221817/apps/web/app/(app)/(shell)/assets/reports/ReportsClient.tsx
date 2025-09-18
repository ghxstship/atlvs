'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, Drawer } from '@ghxstship/ui';
// ChartBar component removed - using simple div for now
import { Plus, Search, Filter, Download, Upload, BarChart3, PieChart, TrendingUp, Calendar, DollarSign, Package } from 'lucide-react';
import { createBrowserClient } from '@ghxstship/auth';
import { useTranslations } from 'next-intl';

interface AssetReport {
  id: string;
  organizationId: string;
  title: string;
  type: 'usage' | 'cost' | 'maintenance' | 'depreciation' | 'inventory' | 'performance';
  status: 'generating' | 'ready' | 'scheduled' | 'failed';
  dateRange: {
    start: string;
    end: string;
  };
  filters?: {
    categories?: string[];
    locations?: string[];
    assignees?: string[];
  };
  generatedBy: string;
  generatedAt?: string;
  scheduledFor?: string;
  fileUrl?: string;
  summary?: {
    totalAssets?: number;
    totalValue?: number;
    utilizationRate?: number;
    maintenanceCost?: number;
    topCategory?: string;
  };
  createdAt?: string;
}

interface ReportsClientProps {
  orgId: string;
}

const REPORT_TYPES = [
  { id: 'usage', name: 'Asset Usage Report', description: 'Track asset utilization and assignment patterns', icon: BarChart3 },
  { id: 'cost', name: 'Cost Analysis Report', description: 'Analyze asset costs, ROI, and financial performance', icon: DollarSign },
  { id: 'maintenance', name: 'Maintenance Report', description: 'Review maintenance schedules, costs, and performance', icon: Package },
  { id: 'depreciation', name: 'Depreciation Report', description: 'Calculate asset depreciation and current values', icon: TrendingUp },
  { id: 'inventory', name: 'Inventory Report', description: 'Complete asset inventory and status overview', icon: Package },
  { id: 'performance', name: 'Performance Report', description: 'Asset performance metrics and KPIs', icon: PieChart }
];

export default function ReportsClient({ orgId }: ReportsClientProps) {
  const t = useTranslations('assets.reports');
  const supabase = createBrowserClient();
  const [reports, setReports] = useState<AssetReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<AssetReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedReport, setSelectedReport] = useState<AssetReport | null>(null);
  const [activeTab, setActiveTab] = useState<'reports' | 'analytics'>('reports');

  useEffect(() => {
    loadReports();
  }, [orgId]);

  useEffect(() => {
    filterReports();
  }, [reports, searchQuery, selectedType, selectedStatus]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('asset_reports')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading reports:', error);
        setReports(generateDemoReports());
      } else {
        setReports(data || []);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      setReports(generateDemoReports());
    } finally {
      setLoading(false);
    }
  };

  const generateDemoReports = (): AssetReport[] => [
    {
      id: '1',
      organizationId: orgId,
      title: 'Monthly Asset Usage Report - August 2024',
      type: 'usage',
      status: 'ready',
      dateRange: {
        start: '2024-08-01T00:00:00Z',
        end: '2024-08-31T23:59:59Z'
      },
      generatedBy: 'Captain Blackbeard',
      generatedAt: '2024-08-07T10:00:00Z',
      fileUrl: '/reports/usage-august-2024.pdf',
      summary: {
        totalAssets: 156,
        utilizationRate: 78.5,
        topCategory: 'Artist Technical'
      },
      createdAt: '2024-08-07T10:00:00Z'
    },
    {
      id: '2',
      organizationId: orgId,
      title: 'Q2 2024 Cost Analysis Report',
      type: 'cost',
      status: 'ready',
      dateRange: {
        start: '2024-04-01T00:00:00Z',
        end: '2024-06-30T23:59:59Z'
      },
      generatedBy: 'Quartermaster Hook',
      generatedAt: '2024-07-15T14:30:00Z',
      fileUrl: '/reports/cost-analysis-q2-2024.pdf',
      summary: {
        totalAssets: 142,
        totalValue: 2450000,
        maintenanceCost: 45000
      },
      createdAt: '2024-07-15T14:30:00Z'
    },
    {
      id: '3',
      organizationId: orgId,
      title: 'Maintenance Performance Report - July 2024',
      type: 'maintenance',
      status: 'ready',
      dateRange: {
        start: '2024-07-01T00:00:00Z',
        end: '2024-07-31T23:59:59Z'
      },
      generatedBy: 'Chief Engineer Sparks',
      generatedAt: '2024-08-01T09:15:00Z',
      fileUrl: '/reports/maintenance-july-2024.pdf',
      summary: {
        totalAssets: 156,
        maintenanceCost: 12500,
        utilizationRate: 95.2
      },
      createdAt: '2024-08-01T09:15:00Z'
    },
    {
      id: '4',
      organizationId: orgId,
      title: 'Annual Depreciation Report 2024',
      type: 'depreciation',
      status: 'generating',
      dateRange: {
        start: '2024-01-01T00:00:00Z',
        end: '2024-12-31T23:59:59Z'
      },
      generatedBy: 'Financial Officer Doubloon',
      createdAt: '2024-08-07T16:00:00Z'
    },
    {
      id: '5',
      organizationId: orgId,
      title: 'Weekly Inventory Report',
      type: 'inventory',
      status: 'scheduled',
      dateRange: {
        start: '2024-08-05T00:00:00Z',
        end: '2024-08-11T23:59:59Z'
      },
      generatedBy: 'Inventory Manager Compass',
      scheduledFor: '2024-08-12T08:00:00Z',
      createdAt: '2024-08-05T11:30:00Z'
    },
    {
      id: '6',
      organizationId: orgId,
      title: 'Asset Performance Dashboard - Failed',
      type: 'performance',
      status: 'failed',
      dateRange: {
        start: '2024-08-01T00:00:00Z',
        end: '2024-08-07T23:59:59Z'
      },
      generatedBy: 'Data Analyst Sextant',
      createdAt: '2024-08-06T13:45:00Z'
    }
  ];

  const filterReports = () => {
    let filtered = [...reports];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.generatedBy.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(report => report.type === selectedType);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(report => report.status === selectedStatus);
    }

    setFilteredReports(filtered);
  };

  const handleCreateReport = () => {
    setSelectedReport(null);
    setShowDrawer(true);
  };

  const handleDownloadReport = (report: AssetReport) => {
    if (report.fileUrl) {
      // Simulate download
      alert(`Downloading: ${report.title}`);
    }
  };

  const handleRegenerateReport = async (reportId: string) => {
    if (confirm('Regenerate this report with current data?')) {
      setReports(prev => prev.map(r => 
        r.id === reportId 
          ? { ...r, status: 'generating' as const, generatedAt: undefined }
          : r
      ));
      
      // Simulate report generation
      setTimeout(() => {
        setReports(prev => prev.map(r => 
          r.id === reportId 
            ? { ...r, status: 'ready' as const, generatedAt: new Date().toISOString() }
            : r
        ));
      }, 3000);
    }
  };

  const getStatusBadge = (status: AssetReport['status']) => {
    switch (status) {
      case 'ready':
        return <Badge variant="success">Ready</Badge>;
      case 'generating':
        return <Badge variant="warning">Generating</Badge>;
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: AssetReport['type']) => {
    const reportType = REPORT_TYPES.find(t => t.id === type);
    return <Badge variant="outline">{reportType?.name || type}</Badge>;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="stack-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 text-heading-3 font-anton uppercase">Asset Reports & Analytics</h1>
          <p className="text-body-sm color-muted">Generate insights and reports on asset performance</p>
        </div>
        <div className="flex items-center gap-sm">
          <Button variant="outline" className="flex items-center gap-sm">
            <Download className="w-4 h-4" />
            Export All
          </Button>
          <Button onClick={handleCreateReport} className="flex items-center gap-sm">
            <Plus className="w-4 h-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex cluster-xs bg-secondary p-xs rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-md py-sm rounded-md text-body-sm form-label transition-colors ${
            activeTab === 'reports'
              ? 'bg-background color-foreground shadow-surface'
              : 'color-muted hover:color-foreground'
          }`}
        >
          Reports
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-md py-sm rounded-md text-body-sm form-label transition-colors ${
            activeTab === 'analytics'
              ? 'bg-background color-foreground shadow-surface'
              : 'color-muted hover:color-foreground'
          }`}
        >
          Analytics Dashboard
        </button>
      </div>

      {activeTab === 'reports' ? (
        <>
          {/* Filters */}
          <Card>
            <div className="p-md">
              <div className="flex flex-wrap items-center gap-md">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 color-muted w-4 h-4" />
                    <Input
                      placeholder="Search reports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-2xl"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-sm">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-sm py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Types</option>
                    {REPORT_TYPES.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-sm py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Status</option>
                    <option value="ready">Ready</option>
                    <option value="generating">Generating</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Reports List */}
          {loading ? (
            <Card>
              <div className="p-xl text-center color-muted">Loading reports...</div>
            </Card>
          ) : filteredReports.length === 0 ? (
            <Card>
              <div className="p-xl text-center color-muted">
                No reports found matching your criteria.
              </div>
            </Card>
          ) : (
            <div className="stack-md">
              {filteredReports.map(report => (
                <Card key={report.id} className="hover:shadow-elevated transition-shadow">
                  <div className="p-md">
                    <div className="flex items-start justify-between mb-sm">
                      <div className="flex items-center gap-sm">
                        <BarChart3 className="w-5 h-5 color-muted" />
                        <div>
                          <h3 className="text-heading-4">{report.title}</h3>
                          <p className="text-body-sm color-muted">
                            Generated by {report.generatedBy} • 
                            {report.generatedAt ? formatDateTime(report.generatedAt) : 
                             report.scheduledFor ? `Scheduled for ${formatDateTime(report.scheduledFor)}` : 
                             'In progress'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-sm">
                        {getStatusBadge(report.status)}
                        {getTypeBadge(report.type)}
                        <div className="flex items-center gap-xs ml-sm">
                          {report.status === 'ready' && (
                            <Button
                             
                              variant="outline"
                              onClick={() => handleDownloadReport(report)}
                            >
                              <Download className="w-3 h-3 mr-xs" />
                              Download
                            </Button>
                          )}
                          {(report.status === 'ready' || report.status === 'failed') && (
                            <Button
                             
                              variant="outline"
                              onClick={() => handleRegenerateReport(report.id)}
                            >
                              Regenerate
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-md">
                      <div>
                        <span className="text-body-sm color-muted block">Date Range</span>
                        <span className="text-body-sm form-label">
                          {new Date(report.dateRange.start).toLocaleDateString()} - {new Date(report.dateRange.end).toLocaleDateString()}
                        </span>
                      </div>
                      {report.summary?.totalAssets && (
                        <div>
                          <span className="text-body-sm color-muted block">Total Assets</span>
                          <span className="form-label">{report.summary.totalAssets}</span>
                        </div>
                      )}
                      {report.summary?.totalValue && (
                        <div>
                          <span className="text-body-sm color-muted block">Total Value</span>
                          <span className="form-label">{formatCurrency(report.summary.totalValue)}</span>
                        </div>
                      )}
                      {report.summary?.utilizationRate && (
                        <div>
                          <span className="text-body-sm color-muted block">Utilization</span>
                          <span className="form-label">{report.summary.utilizationRate}%</span>
                        </div>
                      )}
                    </div>

                    {report.summary?.maintenanceCost && (
                      <div className="flex items-center gap-md text-body-sm mb-sm">
                        <span className="color-muted">Maintenance Cost:</span>
                        <span className="form-label">{formatCurrency(report.summary.maintenanceCost)}</span>
                        {report.summary.topCategory && (
                          <>
                            <span className="color-muted">Top Category:</span>
                            <span>{report.summary.topCategory}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Analytics Dashboard */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {/* Asset Overview */}
          <Card>
            <div className="p-lg">
              <div className="flex items-center gap-sm mb-md">
                <Package className="w-5 h-5 color-primary" />
                <h3 className="text-heading-4">Asset Overview</h3>
              </div>
              <div className="stack-sm">
                <div className="flex justify-between">
                  <span className="text-body-sm color-muted">Total Assets</span>
                  <span className="form-label">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-sm color-muted">Available</span>
                  <span className="form-label color-success">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-sm color-muted">In Use</span>
                  <span className="form-label color-primary">52</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-sm color-muted">Maintenance</span>
                  <span className="form-label color-warning">15</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Financial Summary */}
          <Card>
            <div className="p-lg">
              <div className="flex items-center gap-sm mb-md">
                <DollarSign className="w-5 h-5 color-success" />
                <h3 className="text-heading-4">Financial Summary</h3>
              </div>
              <div className="stack-sm">
                <div className="flex justify-between">
                  <span className="text-body-sm color-muted">Total Value</span>
                  <span className="form-label">{formatCurrency(2450000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-sm color-muted">This Month</span>
                  <span className="form-label color-success">{formatCurrency(45000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-sm color-muted">Maintenance</span>
                  <span className="form-label color-destructive">{formatCurrency(12500)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-sm color-muted">Depreciation</span>
                  <span className="form-label color-warning">{formatCurrency(8200)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Utilization Metrics */}
          <Card>
            <div className="p-lg">
              <div className="flex items-center gap-sm mb-md">
                <TrendingUp className="w-5 h-5 color-secondary" />
                <h3 className="text-heading-4">Utilization</h3>
              </div>
              <div className="stack-sm">
                <div className="flex justify-between">
                  <span className="text-body-sm color-muted">Overall Rate</span>
                  <span className="form-label">78.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-sm color-muted">Artist Technical</span>
                  <span className="form-label color-success">92%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-sm color-muted">Site Vehicles</span>
                  <span className="form-label color-primary">85%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-sm color-muted">Heavy Machinery</span>
                  <span className="form-label color-warning">65%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Top Categories */}
          <Card className="md:col-span-2">
            <div className="p-lg">
              <div className="flex items-center gap-sm mb-md">
                <PieChart className="w-5 h-5 color-primary" />
                <h3 className="text-heading-4">Asset Distribution by Category</h3>
              </div>
              <div className="stack-sm">
                <div className="flex justify-between text-sm">
                  <span>Active (65%)</span>
                  <span>45</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{width: '65%'}}></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <div className="p-lg">
              <div className="flex items-center gap-sm mb-md">
                <Calendar className="w-5 h-5 color-primary" />
                <h3 className="text-heading-4">Recent Activity</h3>
              </div>
              <div className="stack-sm">
                <div className="text-body-sm">
                  <div className="form-label">Sound System</div>
                  <div className="color-muted">Assigned to Main Stage</div>
                  <div className="text-body-sm color-muted">2 hours ago</div>
                </div>
                <div className="text-body-sm">
                  <div className="form-label">Generator Maintenance</div>
                  <div className="color-muted">Completed inspection</div>
                  <div className="text-body-sm color-muted">5 hours ago</div>
                </div>
                <div className="text-body-sm">
                  <div className="form-label">New LED Panels</div>
                  <div className="color-muted">Added to inventory</div>
                  <div className="text-body-sm color-muted">1 day ago</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Report Generation Drawer */}
      <Drawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        title="Generate New Report"
       
      >
        <div className="p-lg stack-md">
          <div>
            <label className="block text-body-sm form-label mb-xs">Report Type</label>
            <select className="w-full px-sm py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              {REPORT_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-body-sm form-label mb-xs">Report Title</label>
            <Input placeholder="Enter report title" />
          </div>
          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="block text-body-sm form-label mb-xs">Start Date</label>
              <Input type="date" />
            </div>
            <div>
              <label className="block text-body-sm form-label mb-xs">End Date</label>
              <Input type="date" />
            </div>
          </div>
          <div>
            <label className="block text-body-sm form-label mb-xs">Categories (Optional)</label>
            <Input placeholder="Select categories to include" />
          </div>
          <div>
            <label className="block text-body-sm form-label mb-xs">Additional Filters</label>
            <textarea
              className="w-full px-sm py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Specify any additional filters or requirements"
            />
          </div>
          <div className="flex gap-sm pt-md">
            <Button className="flex-1">Generate Report</Button>
            <Button variant="outline" onClick={() => setShowDrawer(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
