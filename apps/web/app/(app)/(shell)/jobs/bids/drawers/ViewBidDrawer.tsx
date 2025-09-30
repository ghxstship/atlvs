'use client';

import { DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Calendar, FileText, Edit, Building } from "lucide-react";
import { Badge, Button } from '@ghxstship/ui';
import { AppDrawer } from '@ghxstship/ui';
import type { JobBid, BidDrawerProps } from '../types';

interface ViewBidDrawerProps extends Omit<BidDrawerProps, 'mode' | 'onSave'> {
 bid: JobBid;
 onEdit?: () => void;
 onWithdraw?: () => void;
}

export default function ViewBidDrawer({
 bid,
 onEdit,
 onWithdraw,
 onClose,
 open
}: ViewBidDrawerProps) {

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'accepted': return 'success';
 case 'under_review': return 'info';
 case 'submitted': return 'warning';
 case 'rejected': return 'destructive';
 case 'withdrawn': return 'secondary';
 default: return 'secondary';
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'accepted': return <CheckCircle className="h-4 w-4" />;
 case 'under_review': return <Clock className="h-4 w-4" />;
 case 'submitted': return <DollarSign className="h-4 w-4" />;
 case 'rejected': return <XCircle className="h-4 w-4" />;
 case 'withdrawn': return <AlertCircle className="h-4 w-4" />;
 default: return <Clock className="h-4 w-4" />;
 }
 };

 const formatCurrency = (amount: number) => {
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD',
 minimumFractionDigits: 0,
 maximumFractionDigits: 0,
 }).format(amount);
 };

 return (
 <AppDrawer
 open={open}
 onClose={onClose}
 title="Bid Details"
 record={bid}
 mode="view"
 >
 <div className="stack-lg">
 {/* Header */}
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <h2 className="text-heading-4 color-foreground">
 {bid.opportunity_title || 'Untitled Opportunity'}
 </h2>
 <p className="text-body-sm color-muted">
 Bid ID: {bid.id}
 </p>
 </div>
 <div className="flex gap-sm">
 {onWithdraw && bid.status === 'submitted' && (
 <Button variant="outline" onClick={onWithdraw} className="color-warning">
 Withdraw Bid
 </Button>
 )}
 {onEdit && bid.status === 'submitted' && (
 <Button variant="outline" onClick={onEdit}>
 <Edit className="h-4 w-4 mr-xs" />
 Edit
 </Button>
 )}
 </div>
 </div>

 {/* Status and Amount */}
 <div className="flex items-center gap-lg">
 <Badge variant={getStatusColor(bid.status)} className="flex items-center gap-xs">
 {getStatusIcon(bid.status)}
 {bid.status ? bid.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
 </Badge>
 <div className="flex items-center gap-xs">
 <DollarSign className="h-5 w-5 color-success" />
 <span className="text-heading-4 font-semibold color-success">
 {formatCurrency(bid.amount)}
 </span>
 </div>
 </div>

 {/* Bid Details */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
 {/* Opportunity Information */}
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Opportunity Information</h3>
 
 <div className="stack-sm">
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Opportunity Title</p>
 <p className="text-body-sm color-foreground">
 {bid.opportunity_title || '—'}
 </p>
 </div>

 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Opportunity ID</p>
 <p className="text-body-sm color-foreground font-mono">
 {bid.opportunity_id}
 </p>
 </div>

 {bid.project_title && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Project</p>
 <p className="text-body-sm color-foreground">
 {bid.project_title}
 </p>
 </div>
 )}

 {bid.response_deadline && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Response Deadline</p>
 <div className="flex items-center gap-xs">
 <Calendar className="h-4 w-4 color-muted" />
 <p className={`text-body-sm ${
 new Date(bid.response_deadline) < new Date() 
 ? 'color-destructive' 
 : 'color-foreground'
 }`}>
 {new Date(bid.response_deadline).toLocaleDateString()}
 {new Date(bid.response_deadline) < new Date() && ' (Overdue)'}
 </p>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Company Information */}
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Company Information</h3>
 
 <div className="stack-sm">
 <div className="flex items-center gap-sm">
 <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
 <Building className="h-5 w-5" />
 </div>
 <div>
 <p className="text-body-sm font-medium color-foreground">
 {bid.company_name || 'Unknown Company'}
 </p>
 <p className="text-body-xs color-muted">
 ID: {bid.company_id}
 </p>
 </div>
 </div>

 {bid.client_contact && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Client Contact</p>
 <p className="text-body-sm color-foreground">
 {bid.client_contact}
 </p>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Bid Timeline */}
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Timeline</h3>
 
 <div className="stack-sm">
 <div className="flex items-center gap-sm p-sm border border-border rounded-md">
 <Calendar className="h-4 w-4 color-muted" />
 <div>
 <p className="text-body-sm color-foreground">Submitted</p>
 <p className="text-body-xs color-muted">
 {bid.submitted_at 
 ? new Date(bid.submitted_at).toLocaleString()
 : 'Not submitted'
 }
 </p>
 </div>
 </div>

 {bid.status === 'accepted' && (
 <div className="flex items-center gap-sm p-sm border border-success/20 bg-success/5 rounded-md">
 <CheckCircle className="h-4 w-4 color-success" />
 <div>
 <p className="text-body-sm color-success">Accepted</p>
 <p className="text-body-xs color-muted">
 Congratulations! Your bid was accepted.
 </p>
 </div>
 </div>
 )}

 {bid.status === 'rejected' && (
 <div className="flex items-center gap-sm p-sm border border-destructive/20 bg-destructive/5 rounded-md">
 <XCircle className="h-4 w-4 color-destructive" />
 <div>
 <p className="text-body-sm color-destructive">Rejected</p>
 <p className="text-body-xs color-muted">
 Your bid was not selected for this opportunity.
 </p>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Bid Details */}
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Bid Details</h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Bid Amount</p>
 <p className="text-heading-4 font-semibold color-success">
 {formatCurrency(bid.amount)}
 </p>
 </div>

 {bid.estimated_duration && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Estimated Duration</p>
 <p className="text-body-sm color-foreground">
 {bid.estimated_duration}
 </p>
 </div>
 )}
 </div>
 </div>

 {/* Proposal Document */}
 {bid.proposal_document_url && (
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Proposal Document</h3>
 <div className="flex items-center gap-sm p-sm border border-border rounded-md">
 <FileText className="h-4 w-4 color-muted" />
 <div className="flex-1">
 <p className="text-body-sm color-foreground">Proposal Document</p>
 <p className="text-body-xs color-muted">Click to view or download</p>
 </div>
 <Button variant="outline" size="sm" asChild>
 <a href={bid.proposal_document_url as any as any} target="_blank" rel="noopener noreferrer">
 View
 </a>
 </Button>
 </div>
 </div>
 )}

 {/* Notes */}
 {bid.notes && (
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Notes</h3>
 <div className="p-md bg-secondary/50 rounded-md">
 <div className="flex items-start gap-sm">
 <FileText className="h-4 w-4 color-muted mt-xs" />
 <p className="text-body-sm color-foreground whitespace-pre-wrap">
 {bid.notes}
 </p>
 </div>
 </div>
 </div>
 )}

 {/* Actions */}
 <div className="flex items-center justify-end gap-sm pt-md border-t border-border">
 <Button variant="outline" onClick={onClose}>
 Close
 </Button>
 {onWithdraw && bid.status === 'submitted' && (
 <Button variant="outline" onClick={onWithdraw} className="color-warning">
 Withdraw Bid
 </Button>
 )}
 {onEdit && bid.status === 'submitted' && (
 <Button onClick={onEdit}>
 <Edit className="h-4 w-4 mr-xs" />
 Edit Bid
 </Button>
 )}
 </div>
 </div>
 </AppDrawer>
 );
}
