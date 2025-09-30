'use client';

import { Eye, Edit, Trash2, CheckCircle, XCircle, Clock, AlertTriangle, Plus } from "lucide-react";
import { useState } from 'react';
import { 
 Card, 
 Badge, 
 Button
} from '@ghxstship/ui';
import type { ProcurementRequest } from '../types';

interface RequestKanbanViewProps {
 requests: ProcurementRequest[];
 onViewRequest: (request: ProcurementRequest) => void;
 onEditRequest: (request: ProcurementRequest) => void;
 onDeleteRequest: (request: ProcurementRequest) => void;
 onSubmitRequest: (request: ProcurementRequest) => void;
 onStatusChange: (request: ProcurementRequest, newStatus: string) => void;
 loading?: boolean;
}

export default function RequestKanbanView({
 requests,
 onViewRequest,
 onEditRequest,
 onDeleteRequest,
 onSubmitRequest,
 onStatusChange,
 loading = false
}: RequestKanbanViewProps) {
 const columns = [
 {
 id: 'draft',
 title: 'Draft',
 icon: <Edit className="h-4 w-4" />,
 color: 'bg-muted'
 },
 {
 id: 'submitted',
 title: 'Submitted',
 icon: <AlertTriangle className="h-4 w-4 text-info" />,
 color: 'bg-info/10'
 },
 {
 id: 'under_review',
 title: 'Under Review',
 icon: <Clock className="h-4 w-4 text-warning" />,
 color: 'bg-warning/10'
 },
 {
 id: 'approved',
 title: 'Approved',
 icon: <CheckCircle className="h-4 w-4 text-success" />,
 color: 'bg-success/10'
 },
 {
 id: 'rejected',
 title: 'Rejected',
 icon: <XCircle className="h-4 w-4 text-destructive" />,
 color: 'bg-destructive/10'
 }
 ];

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

 const getRequestsByStatus = (status: string) => {
 return requests.filter(request => request.status === status);
 };

 const RequestCard = ({ request }: { request: ProcurementRequest }) => (
 <Card className="p-sm mb-sm hover:shadow-md transition-shadow cursor-pointer">
 <div className="space-y-xs">
 {/* Header */}
 <div className="flex items-start justify-between">
 <h4 className="font-medium text-sm line-clamp-2 flex-1">
 {request.title}
 </h4>
 <Badge variant={getPriorityVariant(request.priority) as unknown} size="sm">
 {request.priority}
 </Badge>
 </div>

 {/* Description */}
 {request.description && (
 <p className="text-xs text-muted-foreground line-clamp-2">
 {request.description}
 </p>
 )}

 {/* Metadata */}
 <div className="space-y-xs">
 <div className="flex items-center justify-between text-xs">
 <span className="text-muted-foreground">Amount:</span>
 <span className="font-medium">
 {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: request.currency || 'USD'
 }).format(request.estimated_total)}
 </span>
 </div>
 <div className="flex items-center justify-between text-xs">
 <span className="text-muted-foreground">Category:</span>
 <span className="capitalize">{request.category}</span>
 </div>
 {request.requested_delivery_date && (
 <div className="flex items-center justify-between text-xs">
 <span className="text-muted-foreground">Due:</span>
 <span>
 {new Date(request.requested_delivery_date).toLocaleDateString()}
 </span>
 </div>
 )}
 </div>

 {/* Actions */}
 <div className="flex gap-xs pt-xs border-t">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onViewRequest(request)}
 className="flex-1"
 >
 <Eye className="h-3 w-3 mr-xs" />
 View
 </Button>
 {request.status === 'draft' && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEditRequest(request)}
 >
 <Edit className="h-3 w-3" />
 </Button>
 )}
 {request.status === 'draft' && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onSubmitRequest(request)}
 >
 <CheckCircle className="h-3 w-3" />
 </Button>
 )}
 {(request.status === 'draft' || request.status === 'rejected') && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDeleteRequest(request)}
 >
 <Trash2 className="h-3 w-3" />
 </Button>
 )}
 </div>
 </div>
 </Card>
 );

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-md">
 {columns.map((column) => (
 <div key={column.id} className="space-y-sm">
 <Card className="p-sm">
 <div className="flex items-center gap-sm">
 <div className="h-4 w-4 bg-muted rounded animate-pulse" />
 <div className="h-4 bg-muted rounded flex-1 animate-pulse" />
 </div>
 </Card>
 {Array.from({ length: 2 }).map((_, i) => (
 <Card key={i} className="p-sm animate-pulse">
 <div className="space-y-xs">
 <div className="h-4 bg-muted rounded" />
 <div className="h-3 bg-muted rounded w-3/4" />
 <div className="h-3 bg-muted rounded w-1/2" />
 </div>
 </Card>
 ))}
 </div>
 ))}
 </div>
 );
 }

 return (
 <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-md">
 {columns.map((column) => {
 const columnRequests = getRequestsByStatus(column.id);
 
 return (
 <div key={column.id} className="space-y-sm">
 {/* Column Header */}
 <Card className={`p-sm ${column.color}`}>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 {column.icon}
 <h3 className="font-medium text-sm">{column.title}</h3>
 </div>
 <Badge variant="secondary" size="sm">
 {columnRequests.length}
 </Badge>
 </div>
 </Card>

 {/* Column Content */}
 <div className="min-h-[200px]">
 {columnRequests.length === 0 ? (
 <Card className="p-md text-center border-dashed">
 <div className="text-muted-foreground">
 <div className="text-xs">No {column.title.toLowerCase()} requests</div>
 </div>
 </Card>
 ) : (
 columnRequests.map((request) => (
 <RequestCard key={request.id} request={request} />
 ))
 )}
 </div>
 </div>
 );
 })}
 </div>
 );
}
