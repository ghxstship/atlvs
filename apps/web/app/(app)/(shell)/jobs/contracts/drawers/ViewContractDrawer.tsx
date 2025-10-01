'use client';

import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, Calendar, Edit, Building, DollarSign, User, Mail } from "lucide-react";
import { Badge, Button } from '@ghxstship/ui';
import { AppDrawer } from '@ghxstship/ui';
import type { JobContract, ContractDrawerProps } from '../types';

interface ViewContractDrawerProps extends Omit<ContractDrawerProps, 'mode' | 'onSave'> {
 contract: JobContract;
 onEdit?: () => void;
 onActivate?: () => void;
 onTerminate?: () => void;
 onRenew?: () => void;
}

export default function ViewContractDrawer({
 contract,
 onEdit,
 onActivate,
 onTerminate,
 onRenew,
 onClose,
 open
}: ViewContractDrawerProps) {

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'active': return 'success';
 case 'completed': return 'info';
 case 'draft': return 'secondary';
 case 'terminated': return 'destructive';
 default: return 'secondary';
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'active': return <CheckCircle className="h-icon-xs w-icon-xs" />;
 case 'completed': return <Clock className="h-icon-xs w-icon-xs" />;
 case 'draft': return <FileText className="h-icon-xs w-icon-xs" />;
 case 'terminated': return <XCircle className="h-icon-xs w-icon-xs" />;
 default: return <FileText className="h-icon-xs w-icon-xs" />;
 }
 };

 const getTypeColor = (type?: string) => {
 switch (type) {
 case 'employment': return 'info';
 case 'freelance': return 'warning';
 case 'nda': return 'secondary';
 case 'vendor': return 'success';
 case 'service': return 'info';
 default: return 'secondary';
 }
 };

 const formatCurrency = (amount?: number) => {
 if (!amount) return '—';
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD',
 minimumFractionDigits: 0,
 maximumFractionDigits: 0,
 }).format(amount);
 };

 const isExpiringSoon = (endDate?: string) => {
 if (!endDate) return false;
 const end = new Date(endDate);
 const now = new Date();
 const thirtyDaysFromNow = new Date();
 thirtyDaysFromNow.setDate(now.getDate() + 30);
 return end <= thirtyDaysFromNow && end > now;
 };

 const isExpired = (endDate?: string) => {
 if (!endDate) return false;
 return new Date(endDate) < new Date();
 };

 return (
 <AppDrawer
 open={open}
 onClose={onClose}
 title="Contract Details"
 record={contract}
 mode="view"
 >
 <div className="stack-lg">
 {/* Header */}
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <h2 className="text-heading-4 color-foreground">
 {contract.job_title || 'Contract'}
 </h2>
 <p className="text-body-sm color-muted">
 Contract ID: {contract.id}
 </p>
 </div>
 <div className="flex gap-sm">
 {onActivate && contract.status === 'draft' && (
 <Button variant="outline" onClick={onActivate} className="color-success">
 Activate
 </Button>
 )}
 {onRenew && (contract.status === 'active' || contract.status === 'completed') && (
 <Button variant="outline" onClick={onRenew} className="color-info">
 Renew
 </Button>
 )}
 {onTerminate && contract.status === 'active' && (
 <Button variant="outline" onClick={onTerminate} className="color-destructive">
 Terminate
 </Button>
 )}
 {onEdit && contract.status !== 'terminated' && (
 <Button variant="outline" onClick={onEdit}>
 <Edit className="h-icon-xs w-icon-xs mr-xs" />
 Edit
 </Button>
 )}
 </div>
 </div>

 {/* Status and Type */}
 <div className="flex items-center gap-lg">
 <Badge variant={getStatusColor(contract.status)} className="flex items-center gap-xs">
 {getStatusIcon(contract.status)}
 {contract.status ? contract.status.toUpperCase() : 'UNKNOWN'}
 </Badge>
 {contract.contract_type && (
 <Badge variant={getTypeColor(contract.contract_type)} className="capitalize">
 {contract.contract_type.replace('_', ' ')}
 </Badge>
 )}
 </div>

 {/* Contract Details */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
 {/* Basic Information */}
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Basic Information</h3>
 
 <div className="stack-sm">
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Job</p>
 <p className="text-body-sm color-foreground">
 {contract.job_title || 'Unknown Job'}
 </p>
 </div>

 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Company</p>
 <div className="flex items-center gap-sm">
 <Building className="h-icon-xs w-icon-xs color-muted" />
 <p className="text-body-sm color-foreground">
 {contract.company_name || 'Unknown Company'}
 </p>
 </div>
 </div>

 {contract.project_title && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Project</p>
 <p className="text-body-sm color-foreground">
 {contract.project_title}
 </p>
 </div>
 )}

 {contract.organization_name && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Organization</p>
 <p className="text-body-sm color-foreground">
 {contract.organization_name}
 </p>
 </div>
 )}
 </div>
 </div>

 {/* Financial Information */}
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Financial Information</h3>
 
 <div className="stack-sm">
 {contract.contract_value && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Contract Value</p>
 <div className="flex items-center gap-xs">
 <DollarSign className="h-icon-xs w-icon-xs color-success" />
 <p className="text-heading-4 font-semibold color-success">
 {formatCurrency(contract.contract_value)}
 </p>
 </div>
 </div>
 )}

 {contract.currency && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Currency</p>
 <Badge variant="outline" size="sm">
 {contract.currency}
 </Badge>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Timeline */}
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Timeline</h3>
 
 <div className="stack-sm">
 <div className="flex items-center gap-sm p-sm border border-border rounded-md">
 <Calendar className="h-icon-xs w-icon-xs color-muted" />
 <div>
 <p className="text-body-sm color-foreground">Created</p>
 <p className="text-body-xs color-muted">
 {contract.created_at 
 ? new Date(contract.created_at).toLocaleString()
 : 'Unknown'
 }
 </p>
 </div>
 </div>

 {contract.start_date && (
 <div className="flex items-center gap-sm p-sm border border-success/20 bg-success/5 rounded-md">
 <Calendar className="h-icon-xs w-icon-xs color-success" />
 <div>
 <p className="text-body-sm color-success">Start Date</p>
 <p className="text-body-xs color-muted">
 {new Date(contract.start_date).toLocaleDateString()}
 </p>
 </div>
 </div>
 )}

 {contract.end_date && (
 <div className={`flex items-center gap-sm p-sm border rounded-md ${
 isExpired(contract.end_date) 
 ? 'border-destructive/20 bg-destructive/5' 
 : isExpiringSoon(contract.end_date)
 ? 'border-warning/20 bg-warning/5'
 : 'border-border'
 }`}>
 <Calendar className={`h-icon-xs w-icon-xs ${
 isExpired(contract.end_date) 
 ? 'color-destructive' 
 : isExpiringSoon(contract.end_date)
 ? 'color-warning'
 : 'color-muted'
 }`} />
 <div>
 <p className={`text-body-sm ${
 isExpired(contract.end_date) 
 ? 'color-destructive' 
 : isExpiringSoon(contract.end_date)
 ? 'color-warning'
 : 'color-foreground'
 }`}>
 End Date
 </p>
 <p className={`text-body-xs ${
 isExpired(contract.end_date) 
 ? 'color-destructive' 
 : isExpiringSoon(contract.end_date)
 ? 'color-warning'
 : 'color-muted'
 }`}>
 {new Date(contract.end_date).toLocaleDateString()}
 {isExpired(contract.end_date) && ' (Expired)'}
 {isExpiringSoon(contract.end_date) && !isExpired(contract.end_date) && ' (Expires Soon)'}
 </p>
 </div>
 </div>
 )}

 {contract.renewal_date && (
 <div className="flex items-center gap-sm p-sm border border-info/20 bg-info/5 rounded-md">
 <Calendar className="h-icon-xs w-icon-xs color-info" />
 <div>
 <p className="text-body-sm color-info">Renewal Date</p>
 <p className="text-body-xs color-muted">
 {new Date(contract.renewal_date).toLocaleDateString()}
 </p>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Document */}
 {contract.document_url && (
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Contract Document</h3>
 
 <div className="flex items-center gap-sm p-md border border-border rounded-md">
 <FileText className="h-icon-lg w-icon-lg color-accent" />
 <div className="flex-1">
 <p className="text-body-sm font-medium color-foreground">Contract Document</p>
 <p className="text-body-xs color-muted">Click to view or download</p>
 </div>
 <Button 
 variant="outline" 
 size="sm"
 onClick={() => window.open(contract.document_url, '_blank')}
 >
 View Document
 </Button>
 </div>
 </div>
 )}

 {/* Terms */}
 {contract.terms && (
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Terms & Conditions</h3>
 <div className="p-md bg-secondary/50 rounded-md">
 <p className="text-body-sm color-foreground whitespace-pre-wrap">
 {contract.terms}
 </p>
 </div>
 </div>
 )}

 {/* Notes */}
 {contract.notes && (
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Notes</h3>
 <div className="p-md bg-secondary/50 rounded-md">
 <div className="flex items-start gap-sm">
 <FileText className="h-icon-xs w-icon-xs color-muted mt-xs" />
 <p className="text-body-sm color-foreground whitespace-pre-wrap">
 {contract.notes}
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
 {onActivate && contract.status === 'draft' && (
 <Button onClick={onActivate} className="color-success">
 <CheckCircle className="h-icon-xs w-icon-xs mr-xs" />
 Activate Contract
 </Button>
 )}
 {onRenew && (contract.status === 'active' || contract.status === 'completed') && (
 <Button onClick={onRenew} variant="outline" className="color-info">
 Renew Contract
 </Button>
 )}
 {onTerminate && contract.status === 'active' && (
 <Button onClick={onTerminate} variant="outline" className="color-destructive">
 <XCircle className="h-icon-xs w-icon-xs mr-xs" />
 Terminate
 </Button>
 )}
 {onEdit && contract.status !== 'terminated' && (
 <Button onClick={onEdit}>
 <Edit className="h-icon-xs w-icon-xs mr-xs" />
 Edit Contract
 </Button>
 )}
 </div>
 </div>
 </AppDrawer>
 );
}
