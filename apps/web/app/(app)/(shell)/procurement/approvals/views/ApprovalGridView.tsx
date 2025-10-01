'use client';

import { Eye, CheckCircle, XCircle, Clock, AlertTriangle, User, Calendar } from "lucide-react";
import { useState } from 'react';
import { 
 Card, 
 Badge, 
 Button,
 Checkbox
} from '@ghxstship/ui';
import type { ApprovalStep } from '../types';

interface ApprovalGridViewProps {
 approvals: ApprovalStep[];
 selectedApprovals: string[];
 onSelectApproval: (approvalId: string) => void;
 onSelectAll: () => void;
 onViewApproval: (approval: ApprovalStep) => void;
 onApproveApproval: (approval: ApprovalStep) => void;
 onRejectApproval: (approval: ApprovalStep) => void;
 onSkipApproval: (approval: ApprovalStep) => void;
 loading?: boolean;
}

export default function ApprovalGridView({
 approvals,
 selectedApprovals,
 onSelectApproval,
 onSelectAll,
 onViewApproval,
 onApproveApproval,
 onRejectApproval,
 onSkipApproval,
 loading = false
}: ApprovalGridViewProps) {
 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'approved':
 return <CheckCircle className="h-icon-xs w-icon-xs text-success" />;
 case 'rejected':
 return <XCircle className="h-icon-xs w-icon-xs text-destructive" />;
 case 'skipped':
 return <AlertTriangle className="h-icon-xs w-icon-xs text-warning" />;
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
 case 'skipped':
 return 'warning';
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
 <div className="h-icon-xs bg-muted rounded w-3/4"></div>
 <div className="h-3 bg-muted rounded w-1/2"></div>
 <div className="h-3 bg-muted rounded w-2/3"></div>
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (approvals.length === 0) {
 return (
 <Card className="p-xl text-center">
 <AlertTriangle className="h-icon-2xl w-icon-2xl mx-auto mb-md text-muted-foreground" />
 <h3 className="text-lg font-medium mb-sm">No approvals found</h3>
 <p className="text-sm text-muted-foreground">
 No approval requests are currently pending your action.
 </p>
 </Card>
 );
 }

 return (
 <div className="space-y-md">
 {/* Bulk Actions Header */}
 {selectedApprovals.length > 0 && (
 <Card className="p-sm">
 <div className="flex items-center justify-between">
 <span className="text-sm text-muted-foreground">
 {selectedApprovals.length} approval{selectedApprovals.length !== 1 ? 's' : ''} selected
 </span>
 <div className="flex gap-sm">
 <Button variant="outline" size="sm">
 Approve Selected
 </Button>
 <Button variant="outline" size="sm">
 Reject Selected
 </Button>
 </div>
 </div>
 </Card>
 )}

 {/* Grid Layout */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {approvals.map((approval) => (
 <Card key={approval.id} className="p-md hover:shadow-md transition-shadow">
 <div className="space-y-sm">
 {/* Header with Checkbox and Status */}
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-sm">
 <Checkbox
 checked={selectedApprovals.includes(approval.id)}
 onCheckedChange={() => onSelectApproval(approval.id)}
 />
 {getStatusIcon(approval.status)}
 </div>
 <Badge variant={getStatusVariant(approval.status) as unknown}>
 {approval.status}
 </Badge>
 </div>

 {/* Request Information */}
 <div>
 <h3 className="font-medium text-sm mb-xs line-clamp-xs">
 {approval.request?.title || 'Unknown Request'}
 </h3>
 <p className="text-xs text-muted-foreground">
 Step {approval.step_order} of approval workflow
 </p>
 </div>

 {/* Metadata */}
 <div className="space-y-xs">
 {approval.request && (
 <div className="flex items-center justify-between text-xs">
 <span className="text-muted-foreground">Amount:</span>
 <span className="font-medium">
 {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD'
 }).format(approval.request.estimated_total)}
 </span>
 </div>
 )}
 
 {approval.approver && (
 <div className="flex items-center gap-xs text-xs">
 <User className="h-3 w-3 text-muted-foreground" />
 <span className="text-muted-foreground">Approver:</span>
 <span>{approval.approver.name}</span>
 </div>
 )}

 <div className="flex items-center gap-xs text-xs">
 <Calendar className="h-3 w-3 text-muted-foreground" />
 <span className="text-muted-foreground">Created:</span>
 <span>
 {new Date(approval.created_at!).toLocaleDateString()}
 </span>
 </div>

 {approval.approved_at && (
 <div className="flex items-center gap-xs text-xs">
 <Calendar className="h-3 w-3 text-muted-foreground" />
 <span className="text-muted-foreground">
 {approval.status === 'approved' ? 'Approved:' : 
 approval.status === 'rejected' ? 'Rejected:' : 'Processed:'}
 </span>
 <span>
 {new Date(approval.approved_at).toLocaleDateString()}
 </span>
 </div>
 )}
 </div>

 {/* Notes */}
 {approval.notes && (
 <div className="text-xs">
 <span className="text-muted-foreground">Notes:</span>
 <p className="text-foreground line-clamp-xs mt-xs">{approval.notes}</p>
 </div>
 )}

 {/* Actions */}
 <div className="flex gap-xs pt-sm border-t">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onViewApproval(approval)}
 className="flex-1"
 >
 <Eye className="h-3 w-3 mr-xs" />
 View
 </Button>
 {approval.status === 'pending' && (
 <>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onApproveApproval(approval)}
 className="flex-1"
 >
 <CheckCircle className="h-3 w-3 mr-xs" />
 Approve
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onRejectApproval(approval)}
 >
 <XCircle className="h-3 w-3" />
 </Button>
 </>
 )}
 </div>
 </div>
 </Card>
 ))}
 </div>
 </div>
 );
}
