'use client';

import { Eye, Edit, Trash2, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useState } from 'react';
import { 
 Card, 
 Badge, 
 Button,
 Checkbox
} from '@ghxstship/ui';
import type { ProcurementRequest } from '../types';

interface RequestGridViewProps {
 requests: ProcurementRequest[];
 selectedRequests: string[];
 onSelectRequest: (requestId: string) => void;
 onSelectAll: () => void;
 onViewRequest: (request: ProcurementRequest) => void;
 onEditRequest: (request: ProcurementRequest) => void;
 onDeleteRequest: (request: ProcurementRequest) => void;
 onSubmitRequest: (request: ProcurementRequest) => void;
 loading?: boolean;
}

export default function RequestGridView({
 requests,
 selectedRequests,
 onSelectRequest,
 onSelectAll,
 onViewRequest,
 onEditRequest,
 onDeleteRequest,
 onSubmitRequest,
 loading = false
}: RequestGridViewProps) {
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
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {Array.from({ length: 6 }).map((_, i) => (
 <Card key={i} className="p-md animate-pulse">
 <div className="space-y-sm">
 <div className="h-4 bg-muted rounded w-3/4"></div>
 <div className="h-3 bg-muted rounded w-1/2"></div>
 <div className="h-3 bg-muted rounded w-2/3"></div>
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (requests.length === 0) {
 return (
 <Card className="p-xl text-center">
 <AlertTriangle className="h-12 w-12 mx-auto mb-md text-muted-foreground" />
 <h3 className="text-lg font-medium mb-sm">No requests found</h3>
 <p className="text-sm text-muted-foreground">
 Create your first procurement request to get started.
 </p>
 </Card>
 );
 }

 return (
 <div className="space-y-md">
 {/* Bulk Actions Header */}
 {selectedRequests.length > 0 && (
 <Card className="p-sm">
 <div className="flex items-center justify-between">
 <span className="text-sm text-muted-foreground">
 {selectedRequests.length} request{selectedRequests.length !== 1 ? 's' : ''} selected
 </span>
 <div className="flex gap-sm">
 <Button variant="outline" size="sm">
 Submit Selected
 </Button>
 <Button variant="outline" size="sm">
 Delete Selected
 </Button>
 </div>
 </div>
 </Card>
 )}

 {/* Grid Layout */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {requests.map((request) => (
 <Card key={request.id} className="p-md hover:shadow-md transition-shadow">
 <div className="space-y-sm">
 {/* Header with Checkbox and Status */}
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-sm">
 <Checkbox
 checked={selectedRequests.includes(request.id!)}
 onCheckedChange={() => onSelectRequest(request.id!)}
 />
 {getStatusIcon(request.status)}
 </div>
 <Badge variant={getStatusVariant(request.status) as unknown}>
 {request.status.replace('_', ' ')}
 </Badge>
 </div>

 {/* Title and Description */}
 <div>
 <h3 className="font-medium text-sm mb-xs line-clamp-2">
 {request.title}
 </h3>
 {request.description && (
 <p className="text-xs text-muted-foreground line-clamp-2">
 {request.description}
 </p>
 )}
 </div>

 {/* Metadata */}
 <div className="space-y-xs">
 <div className="flex items-center justify-between text-xs">
 <span className="text-muted-foreground">Priority:</span>
 <Badge size="sm" variant={getPriorityVariant(request.priority) as unknown}>
 {request.priority}
 </Badge>
 </div>
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
 <div className="flex gap-xs pt-sm border-t">
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
 className="flex-1"
 >
 <Edit className="h-3 w-3 mr-xs" />
 Edit
 </Button>
 )}
 {request.status === 'draft' && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onSubmitRequest(request)}
 className="flex-1"
 >
 <CheckCircle className="h-3 w-3 mr-xs" />
 Submit
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
 ))}
 </div>
 </div>
 );
}
