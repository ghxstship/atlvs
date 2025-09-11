'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, Drawer } from '@ghxstship/ui';
import { ChartBar } from '../../components/ui/ChartBar';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-anton uppercase">Asset Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Generate insights and reports on asset performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export All
          </Button>
          <Button onClick={handleCreateReport} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'reports'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Reports
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Analytics Dashboard
        </button>
      </div>

      {activeTab === 'reports' ? (
        <>
          {/* Filters */}
          <Card>
            <div className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search reports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
              <div className="p-8 text-center text-muted-foreground">Loading reports...</div>
            </Card>
          ) : filteredReports.length === 0 ? (
            <Card>
              <div className="p-8 text-center text-muted-foreground">
                No reports found matching your criteria.
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredReports.map(report => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-semibold">{report.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Generated by {report.generatedBy} • 
                            {report.generatedAt ? formatDateTime(report.generatedAt) : 
                             report.scheduledFor ? `Scheduled for ${formatDateTime(report.scheduledFor)}` : 
                             'In progress'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(report.status)}
                        {getTypeBadge(report.type)}
                        <div className="flex items-center gap-1 ml-2">
                          {report.status === 'ready' && (
                            <Button
                             
                              variant="outline"
                              onClick={() => handleDownloadReport(report)}
                            >
                              <Download className="w-3 h-3 mr-1" />
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

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-xs text-muted-foreground block">Date Range</span>
                        <span className="text-sm font-medium">
                          {new Date(report.dateRange.start).toLocaleDateString()} - {new Date(report.dateRange.end).toLocaleDateString()}
                        </span>
                      </div>
                      {report.summary?.totalAssets && (
                        <div>
                          <span className="text-xs text-muted-foreground block">Total Assets</span>
                          <span className="font-medium">{report.summary.totalAssets}</span>
                        </div>
                      )}
                      {report.summary?.totalValue && (
                        <div>
                          <span className="text-xs text-muted-foreground block">Total Value</span>
                          <span className="font-medium">{formatCurrency(report.summary.totalValue)}</span>
                        </div>
                      )}
                      {report.summary?.utilizationRate && (
                        <div>
                          <span className="text-xs text-muted-foreground block">Utilization</span>
                          <span className="font-medium">{report.summary.utilizationRate}%</span>
                        </div>
                      )}
                    </div>

                    {report.summary?.maintenanceCost && (
                      <div className="flex items-center gap-4 text-sm mb-3">
                        <span className="text-muted-foreground">Maintenance Cost:</span>
                        <span className="font-medium">{formatCurrency(report.summary.maintenanceCost)}</span>
                        {report.summary.topCategory && (
                          <>
                            <span className="text-muted-foreground">Top Category:</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Asset Overview */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Asset Overview</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Assets</span>
                  <span className="font-medium">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Available</span>
                  <span className="font-medium text-success">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">In Use</span>
                  <span className="font-medium text-primary">52</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Maintenance</span>
                  <span className="font-medium text-warning">15</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Financial Summary */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-5 h-5 text-success" />
                <h3 className="font-semibold">Financial Summary</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Value</span>
                  <span className="font-medium">{formatCurrency(2450000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="font-medium text-success">{formatCurrency(45000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Maintenance</span>
                  <span className="font-medium text-destructive">{formatCurrency(12500)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Depreciation</span>
                  <span className="font-medium text-warning">{formatCurrency(8200)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Utilization Metrics */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-secondary" />
                <h3 className="font-semibold">Utilization</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Overall Rate</span>
                  <span className="font-medium">78.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Artist Technical</span>
                  <span className="font-medium text-success">92%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Site Vehicles</span>
                  <span className="font-medium text-primary">85%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Heavy Machinery</span>
                  <span className="font-medium text-warning">65%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Top Categories */}
          <Card className="md:col-span-2">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <PieChart className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Asset Distribution by Category</h3>
              </div>
              <ChartBar 
                data={[
                  { label: 'Artist Technical', value: 32, percentage: 65, color: 'info' },
                  { label: 'Site Infrastructure', value: 28, percentage: 56, color: 'success' },
                  { label: 'Site Vehicles', value: 18, percentage: 36, color: 'default' },
                  { label: 'Heavy Machinery', value: 15, percentage: 30, color: 'warning' }
                ]}
                showValues={true}
                animated={true}
              />
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Recent Activity</h3>
              </div>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium">Sound System</div>
                  <div className="text-muted-foreground">Assigned to Main Stage</div>
                  <div className="text-xs text-muted-foreground">2 hours ago</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Generator Maintenance</div>
                  <div className="text-muted-foreground">Completed inspection</div>
                  <div className="text-xs text-muted-foreground">5 hours ago</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">New LED Panels</div>
                  <div className="text-muted-foreground">Added to inventory</div>
                  <div className="text-xs text-muted-foreground">1 day ago</div>
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
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Report Type</label>
            <select className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              {REPORT_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Report Title</label>
            <Input placeholder="Enter report title" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Input type="date" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Input type="date" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categories (Optional)</label>
            <Input placeholder="Select categories to include" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Additional Filters</label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Specify any additional filters or requirements"
            />
          </div>
          <div className="flex gap-2 pt-4">
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
