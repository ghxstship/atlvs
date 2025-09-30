import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SecurityLogger } from '@ghxstship/auth';
import { Button } from '@ghxstship/ui';
import { Shield, AlertTriangle, Eye, Download, Filter } from 'lucide-react';

interface SecurityDashboardProps {
  organizationId?: string;
}

export function SecurityDashboard({ organizationId }: SecurityDashboardProps) {
  const [activeTab, setActiveTab] = useState<'events' | 'audit' | 'alerts'>('events');
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    severity: '',
    eventType: '',
    dateRange: '7d'
  });

  const supabase = createClient();
  const securityLogger = new SecurityLogger();

  useEffect(() => {
    loadData();
  }, [activeTab, filters, organizationId]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'events') {
        const events = await securityLogger.getSecurityEvents(
          organizationId,
          filters.severity || undefined,
          100
        );
        setSecurityEvents(events);
      } else if (activeTab === 'audit') {
        const logs = await securityLogger.getAuditLogs(
          organizationId,
          undefined,
          filters.eventType || undefined,
          100
        );
        setAuditLogs(logs);
      }
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    const data = activeTab === 'events' ? securityEvents : auditLogs;
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row =>
      Object.values(row).map(value =>
        typeof value === 'object' ? JSON.stringify(value) : String(value)
      ).join(',')
    ).join('\n');

    return `${headers}\n${rows}`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Security Dashboard</h1>
            <p className="text-muted-foreground">Monitor security events and audit logs</p>
          </div>
        </div>
        <Button onClick={exportData} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        {[
          { id: 'events', label: 'Security Events', icon: AlertTriangle },
          { id: 'audit', label: 'Audit Logs', icon: Eye },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        {activeTab === 'events' && (
          <select
            value={filters.severity}
            onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        )}

        {activeTab === 'audit' && (
          <select
            value={filters.eventType}
            onChange={(e) => setFilters(prev => ({ ...prev, eventType: e.target.value }))}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="">All Actions</option>
            <option value="INSERT">Insert</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="SELECT">Select</option>
          </select>
        )}

        <select
          value={filters.dateRange}
          onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
          className="px-3 py-1 border rounded-md text-sm"
        >
          <option value="1d">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Content */}
      <div className="bg-card border rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : activeTab === 'events' ? (
          <SecurityEventsTable events={securityEvents} getSeverityColor={getSeverityColor} />
        ) : (
          <AuditLogsTable logs={auditLogs} />
        )}
      </div>
    </div>
  );
}

function SecurityEventsTable({ events, getSeverityColor }: { events: any[], getSeverityColor: (severity: string) => string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b">
          <tr className="text-left">
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">Event</th>
            <th className="px-4 py-3 font-medium">Severity</th>
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">IP Address</th>
            <th className="px-4 py-3 font-medium">Details</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-b hover:bg-muted/50">
              <td className="px-4 py-3 text-sm">
                {new Date(event.created_at).toLocaleString()}
              </td>
              <td className="px-4 py-3 font-medium">{event.event_type}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                  {event.severity}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">{event.user_id || 'System'}</td>
              <td className="px-4 py-3 text-sm font-mono">{event.ip_address}</td>
              <td className="px-4 py-3 text-sm max-w-xs truncate">
                {event.details ? JSON.stringify(event.details) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {events.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No security events found
        </div>
      )}
    </div>
  );
}

function AuditLogsTable({ logs }: { logs: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b">
          <tr className="text-left">
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">Action</th>
            <th className="px-4 py-3 font-medium">Table</th>
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Record ID</th>
            <th className="px-4 py-3 font-medium">Changes</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b hover:bg-muted/50">
              <td className="px-4 py-3 text-sm">
                {new Date(log.created_at).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                  log.action === 'INSERT' ? 'bg-green-100 text-green-700' :
                  log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {log.action}
                </span>
              </td>
              <td className="px-4 py-3 font-medium">{log.table_name}</td>
              <td className="px-4 py-3 text-sm">{log.user_id || 'System'}</td>
              <td className="px-4 py-3 text-sm font-mono">{log.record_id}</td>
              <td className="px-4 py-3 text-sm max-w-xs truncate">
                {log.changed_fields ? log.changed_fields.join(', ') : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {logs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No audit logs found
        </div>
      )}
    </div>
  );
}
