'use client';

import { CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp, DollarSign, FileText, Calendar, BarChart3, Eye } from "lucide-react";
import { useMemo } from 'react';
import { 
 Card, 
 Badge, 
 Button
} from '@ghxstship/ui';
import type { ProcurementRequest } from '../types';

interface RequestDashboardViewProps {
 requests: ProcurementRequest[];
 onViewRequest: (request: ProcurementRequest) => void;
 loading?: boolean;
}

export default function RequestDashboardView({
 requests,
 onViewRequest,
 loading = false
}: RequestDashboardViewProps) {
 const statistics = useMemo(() => {
 const total = requests.length;
 const byStatus = requests.reduce((acc, request) => {
 acc[request.status] = (acc[request.status] || 0) + 1;
 return acc;
 }, {} as Record<string, number>);

 const byPriority = requests.reduce((acc, request) => {
 acc[request.priority] = (acc[request.priority] || 0) + 1;
 return acc;
 }, {} as Record<string, number>);

 const totalValue = requests.reduce((sum, request) => sum + request.estimated_total, 0);
 const avgValue = total > 0 ? totalValue / total : 0;

 const recentRequests = requests
 .filter(r => r.created_at)
 .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
 .slice(0, 5);

 const pendingRequests = requests.filter(r => r.status === 'draft' || r.status === 'submitted');
 const approvedRequests = requests.filter(r => r.status === 'approved');

 return {
 total,
 byStatus,
 byPriority,
 totalValue,
 avgValue,
 recentRequests,
 pendingRequests,
 approvedRequests
 };
 }, [requests]);

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'approved':
 return <CheckCircle className="h-4 w-4 text-success" />;
 case 'rejected':
 return <XCircle className="h-4 w-4 text-destructive" />;
 case 'under_review':
 return <Clock className="h-4 w-4 text-warning" />;
 case 'submitted':
 return <AlertTriangle className="h-4 w-4 text-info" />;
 default:
 return <Clock className="h-4 w-4 text-muted-foreground" />;
 }
 };

 const getStatusVariant = (status: string) => {
 switch (status) {
 case 'approved':
 return 'success';
 case 'rejected':
 return 'destructive';
 case 'under_review':
 return 'warning';
 case 'submitted':
 return 'info';
 default:
 return 'secondary';
 }
 };

 const getPriorityVariant = (priority: string) => {
 switch (priority) {
 case 'urgent':
 return 'destructive';
 case 'high':
 return 'warning';
 case 'medium':
 return 'info';
 default:
 return 'secondary';
 }
 };

 if (loading) {
 return (
 <div className="space-y-lg">
 {/* KPI Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
 {Array.from({ length: 4 }).map((_, i) => (
 <Card key={i} className="p-md animate-pulse">
 <div className="space-y-sm">
 <div className="h-4 bg-muted rounded w-1/2" />
 <div className="h-8 bg-muted rounded w-3/4" />
 </div>
 </Card>
 ))}
 </div>

 {/* Charts */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
 <Card className="p-md animate-pulse">
 <div className="h-64 bg-muted rounded" />
 </Card>
 <Card className="p-md animate-pulse">
 <div className="h-64 bg-muted rounded" />
 </Card>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-lg">
 {/* KPI Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Total Requests</p>
 <p className="text-2xl font-bold">{statistics.total}</p>
 </div>
 <FileText className="h-8 w-8 text-info" />
 </div>
 </Card>

 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Pending Approval</p>
 <p className="text-2xl font-bold">{statistics.pendingRequests.length}</p>
 </div>
 <Clock className="h-8 w-8 text-warning" />
 </div>
 </Card>

 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Approved</p>
 <p className="text-2xl font-bold">{statistics.approvedRequests.length}</p>
 </div>
 <CheckCircle className="h-8 w-8 text-success" />
 </div>
 </Card>

 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Total Value</p>
 <p className="text-2xl font-bold">
 {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD',
 notation: 'compact'
 }).format(statistics.totalValue)}
 </p>
 </div>
 <DollarSign className="h-8 w-8 text-success" />
 </div>
 </Card>
 </div>

 {/* Charts and Lists */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
 {/* Status Breakdown */}
 <Card className="p-md">
 <div className="flex items-center gap-sm mb-md">
 <BarChart3 className="h-5 w-5" />
 <h3 className="text-lg font-semibold">Status Breakdown</h3>
 </div>
 <div className="space-y-sm">
 {Object.entries(statistics.byStatus).map(([status, count]) => (
 <div key={status} className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 {getStatusIcon(status)}
 <span className="capitalize">{status.replace('_', ' ')}</span>
 </div>
 <div className="flex items-center gap-sm">
 <Badge variant={getStatusVariant(status) as unknown} size="sm">
 {count}
 </Badge>
 <span className="text-sm text-muted-foreground">
 ({statistics.total > 0 ? Math.round((count / statistics.total) * 100) : 0}%)
 </span>
 </div>
 </div>
 ))}
 </div>
 </Card>

 {/* Priority Distribution */}
 <Card className="p-md">
 <div className="flex items-center gap-sm mb-md">
 <TrendingUp className="h-5 w-5" />
 <h3 className="text-lg font-semibold">Priority Distribution</h3>
 </div>
 <div className="space-y-sm">
 {Object.entries(statistics.byPriority).map(([priority, count]) => (
 <div key={priority} className="flex items-center justify-between">
 <span className="capitalize">{priority}</span>
 <div className="flex items-center gap-sm">
 <Badge variant={getPriorityVariant(priority) as unknown} size="sm">
 {count}
 </Badge>
 <span className="text-sm text-muted-foreground">
 ({statistics.total > 0 ? Math.round((count / statistics.total) * 100) : 0}%)
 </span>
 </div>
 </div>
 ))}
 </div>
 </Card>
 </div>

 {/* Recent Requests */}
 <Card className="p-md">
 <div className="flex items-center gap-sm mb-md">
 <Calendar className="h-5 w-5" />
 <h3 className="text-lg font-semibold">Recent Requests</h3>
 </div>
 {statistics.recentRequests.length === 0 ? (
 <div className="text-center py-lg">
 <FileText className="h-12 w-12 mx-auto mb-md text-muted-foreground" />
 <p className="text-sm text-muted-foreground">No requests found</p>
 </div>
 ) : (
 <div className="space-y-sm">
 {statistics.recentRequests.map((request) => (
 <div key={request.id} className="flex items-center justify-between p-sm rounded-md hover:bg-muted/50">
 <div className="flex-1">
 <div className="flex items-center gap-sm">
 {getStatusIcon(request.status)}
 <span className="font-medium text-sm">{request.title}</span>
 <Badge variant={getStatusVariant(request.status) as unknown} size="sm">
 {request.status.replace('_', ' ')}
 </Badge>
 </div>
 <div className="flex items-center gap-md mt-xs text-xs text-muted-foreground">
 <span>
 {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: request.currency || 'USD'
 }).format(request.estimated_total)}
 </span>
 <span className="capitalize">{request.category}</span>
 <span>
 {new Date(request.created_at!).toLocaleDateString()}
 </span>
 </div>
 </div>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onViewRequest(request)}
 >
 <Eye className="h-4 w-4" />
 </Button>
 </div>
 ))}
 </div>
 )}
 </Card>
 </div>
 );
}
