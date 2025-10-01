'use client';

import { CheckCircle, XCircle, Clock, AlertTriangle, FileText, User, Calendar, DollarSign, Package, Building } from "lucide-react";
import { 
 Badge, 
 Button,
 Separator
} from '@ghxstship/ui';
import { AppDrawer } from '@ghxstship/ui';
import type { ProcurementRequest } from '../types';

interface ViewRequestDrawerProps {
 request: ProcurementRequest | null;
 open: boolean;
 onClose: () => void;
 onEdit?: (request: ProcurementRequest) => void;
 onSubmit?: (request: ProcurementRequest) => void;
 onDelete?: (request: ProcurementRequest) => void;
}

export default function ViewRequestDrawer({
 request,
 open,
 onClose,
 onEdit,
 onSubmit,
 onDelete
}: ViewRequestDrawerProps) {
 if (!request) return null;

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'approved':
 return <CheckCircle className="h-icon-xs w-icon-xs text-success" />;
 case 'rejected':
 return <XCircle className="h-icon-xs w-icon-xs text-destructive" />;
 case 'under_review':
 return <Clock className="h-icon-xs w-icon-xs text-warning" />;
 case 'submitted':
 return <AlertTriangle className="h-icon-xs w-icon-xs text-info" />;
 default:
 return <Clock className="h-icon-xs w-icon-xs text-muted-foreground" />;
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

 return (
 <AppDrawer
 open={open}
 onClose={onClose}
 title="Request Details"
 >
 <div className="space-y-lg">
 {/* Header */}
 <div className="space-y-sm">
 <div className="flex items-start justify-between">
 <h2 className="text-xl font-semibold">{request.title}</h2>
 <div className="flex items-center gap-sm">
 {getStatusIcon(request.status)}
 <Badge variant={getStatusVariant(request.status) as unknown}>
 {request.status.replace('_', ' ')}
 </Badge>
 </div>
 </div>
 {request.description && (
 <p className="text-muted-foreground">{request.description}</p>
 )}
 </div>

 <Separator />

 {/* Key Information */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-sm">
 <div className="flex items-center gap-sm">
 <DollarSign className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="text-sm font-medium">Estimated Total</span>
 </div>
 <p className="text-lg font-semibold">
 {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: request.currency || 'USD'
 }).format(request.estimated_total)}
 </p>
 </div>

 <div className="space-y-sm">
 <div className="flex items-center gap-sm">
 <AlertTriangle className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="text-sm font-medium">Priority</span>
 </div>
 <Badge variant={getPriorityVariant(request.priority) as unknown}>
 {request.priority}
 </Badge>
 </div>

 <div className="space-y-sm">
 <div className="flex items-center gap-sm">
 <Package className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="text-sm font-medium">Category</span>
 </div>
 <p className="capitalize">{request.category}</p>
 </div>

 {request.requested_delivery_date && (
 <div className="space-y-sm">
 <div className="flex items-center gap-sm">
 <Calendar className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="text-sm font-medium">Requested Delivery</span>
 </div>
 <p>{new Date(request.requested_delivery_date).toLocaleDateString()}</p>
 </div>
 )}
 </div>

 <Separator />

 {/* Business Justification */}
 <div className="space-y-sm">
 <div className="flex items-center gap-sm">
 <FileText className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="text-sm font-medium">Business Justification</span>
 </div>
 <p className="text-sm text-muted-foreground whitespace-pre-wrap">
 {request.business_justification}
 </p>
 </div>

 {/* Additional Details */}
 {(request.budget_code || request.department) && (
 <>
 <Separator />
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 {request.budget_code && (
 <div className="space-y-sm">
 <div className="flex items-center gap-sm">
 <Building className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="text-sm font-medium">Budget Code</span>
 </div>
 <p>{request.budget_code}</p>
 </div>
 )}

 {request.department && (
 <div className="space-y-sm">
 <div className="flex items-center gap-sm">
 <Building className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="text-sm font-medium">Department</span>
 </div>
 <p>{request.department}</p>
 </div>
 )}
 </div>
 </>
 )}

 {/* Approval Information */}
 {(request.approval_notes || request.rejected_reason) && (
 <>
 <Separator />
 <div className="space-y-sm">
 <div className="flex items-center gap-sm">
 <User className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="text-sm font-medium">
 {request.status === 'rejected' ? 'Rejection Reason' : 'Approval Notes'}
 </span>
 </div>
 <p className="text-sm text-muted-foreground whitespace-pre-wrap">
 {request.rejected_reason || request.approval_notes}
 </p>
 </div>
 </>
 )}

 {/* Request Items */}
 {request.items && request.items.length > 0 && (
 <>
 <Separator />
 <div className="space-y-sm">
 <div className="flex items-center gap-sm">
 <Package className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="text-sm font-medium">Request Items</span>
 </div>
 <div className="space-y-sm">
 {request.items.map((item, index) => (
 <div key={index} className="p-sm border rounded-md">
 <div className="flex justify-between items-start mb-xs">
 <h4 className="font-medium text-sm">{item.name}</h4>
 <span className="text-sm font-medium">
 {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD'
 }).format(item.estimated_total_price)}
 </span>
 </div>
 {item.description && (
 <p className="text-xs text-muted-foreground mb-xs">{item.description}</p>
 )}
 <div className="flex justify-between text-xs text-muted-foreground">
 <span>Qty: {item.quantity} {item.unit}</span>
 <span>
 Unit Price: {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD'
 }).format(item.estimated_unit_price)}
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </>
 )}

 {/* Timestamps */}
 <Separator />
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-sm text-muted-foreground">
 <div>
 <span className="font-medium">Created:</span>{' '}
 {new Date(request.created_at!).toLocaleString()}
 </div>
 <div>
 <span className="font-medium">Updated:</span>{' '}
 {new Date(request.updated_at!).toLocaleString()}
 </div>
 {request.submitted_at && (
 <div>
 <span className="font-medium">Submitted:</span>{' '}
 {new Date(request.submitted_at).toLocaleString()}
 </div>
 )}
 {request.approved_at && (
 <div>
 <span className="font-medium">Approved:</span>{' '}
 {new Date(request.approved_at).toLocaleString()}
 </div>
 )}
 </div>

 {/* Actions */}
 <Separator />
 <div className="flex gap-sm">
 {request.status === 'draft' && onEdit && (
 <Button onClick={() => onEdit(request)}>
 Edit Request
 </Button>
 )}
 {request.status === 'draft' && onSubmit && (
 <Button onClick={() => onSubmit(request)}>
 Submit for Approval
 </Button>
 )}
 {(request.status === 'draft' || request.status === 'rejected') && onDelete && (
 <Button variant="outline" onClick={() => onDelete(request)}>
 Delete Request
 </Button>
 )}
 <Button variant="outline" onClick={onClose}>
 Close
 </Button>
 </div>
 </div>
 </AppDrawer>
 );
}
