'use client';

import { TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle, Calendar, FileText, Edit, Building, DollarSign, MapPin } from "lucide-react";
import { Badge, Button } from '@ghxstship/ui';
import { AppDrawer } from '@ghxstship/ui';
import type { JobOpportunity, OpportunityDrawerProps } from '../types';

interface ViewOpportunityDrawerProps extends Omit<OpportunityDrawerProps, 'mode' | 'onSave'> {
 opportunity: JobOpportunity;
 onEdit?: () => void;
 onClose?: () => void;
 onAward?: () => void;
 onCancel?: () => void;
}

export default function ViewOpportunityDrawer({
 opportunity,
 onEdit,
 onClose: onCloseOpportunity,
 onAward,
 onCancel,
 onClose,
 open
}: ViewOpportunityDrawerProps) {

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'open': return 'success';
 case 'awarded': return 'info';
 case 'closed': return 'secondary';
 case 'cancelled': return 'destructive';
 default: return 'secondary';
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'open': return <TrendingUp className="h-icon-xs w-icon-xs" />;
 case 'awarded': return <CheckCircle className="h-icon-xs w-icon-xs" />;
 case 'closed': return <Clock className="h-icon-xs w-icon-xs" />;
 case 'cancelled': return <XCircle className="h-icon-xs w-icon-xs" />;
 default: return <TrendingUp className="h-icon-xs w-icon-xs" />;
 }
 };

 const getStageColor = (stage?: string) => {
 switch (stage) {
 case 'won': return 'success';
 case 'negotiation': return 'info';
 case 'proposal': return 'warning';
 case 'qualified': return 'info';
 case 'lead': return 'secondary';
 case 'lost': return 'destructive';
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

 const isClosingSoon = (closesAt?: string) => {
 if (!closesAt) return false;
 const closes = new Date(closesAt);
 const now = new Date();
 const sevenDaysFromNow = new Date();
 sevenDaysFromNow.setDate(now.getDate() + 7);
 return closes <= sevenDaysFromNow && closes > now;
 };

 return (
 <AppDrawer
 open={open}
 onClose={onClose}
 title="Opportunity Details"
 record={opportunity}
 mode="view"
 >
 <div className="stack-lg">
 {/* Header */}
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <h2 className="text-heading-4 color-foreground">
 {opportunity.title || 'Untitled Opportunity'}
 </h2>
 <p className="text-body-sm color-muted">
 Opportunity ID: {opportunity.id}
 </p>
 </div>
 <div className="flex gap-sm">
 {onAward && opportunity.status === 'open' && (
 <Button variant="outline" onClick={onAward} className="color-success">
 Award
 </Button>
 )}
 {onCloseOpportunity && opportunity.status === 'open' && (
 <Button variant="outline" onClick={onCloseOpportunity} className="color-info">
 Close
 </Button>
 )}
 {onCancel && opportunity.status === 'open' && (
 <Button variant="outline" onClick={onCancel} className="color-warning">
 Cancel
 </Button>
 )}
 {onEdit && opportunity.status === 'open' && (
 <Button variant="outline" onClick={onEdit}>
 <Edit className="h-icon-xs w-icon-xs mr-xs" />
 Edit
 </Button>
 )}
 </div>
 </div>

 {/* Status and Stage */}
 <div className="flex items-center gap-lg">
 <Badge variant={getStatusColor(opportunity.status)} className="flex items-center gap-xs">
 {getStatusIcon(opportunity.status)}
 {opportunity.status ? opportunity.status.toUpperCase() : 'UNKNOWN'}
 </Badge>
 {opportunity.stage && (
 <Badge variant={getStageColor(opportunity.stage)} className="capitalize">
 {opportunity.stage}
 </Badge>
 )}
 {opportunity.probability && (
 <div className="flex items-center gap-xs">
 <TrendingUp className="h-icon-xs w-icon-xs color-info" />
 <span className="text-body-sm color-info font-medium">
 {opportunity.probability}% probability
 </span>
 </div>
 )}
 </div>

 {/* Opportunity Details */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
 {/* Basic Information */}
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Basic Information</h3>
 
 <div className="stack-sm">
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Organization</p>
 <div className="flex items-center gap-sm">
 <Building className="h-icon-xs w-icon-xs color-muted" />
 <p className="text-body-sm color-foreground">
 {opportunity.organization_name || 'Unknown Organization'}
 </p>
 </div>
 </div>

 {opportunity.project_title && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Project</p>
 <p className="text-body-sm color-foreground">
 {opportunity.project_title}
 </p>
 </div>
 )}

 {opportunity.client_name && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Client</p>
 <p className="text-body-sm color-foreground">
 {opportunity.client_name}
 </p>
 </div>
 )}

 {opportunity.client_contact && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Client Contact</p>
 <p className="text-body-sm color-foreground">
 {opportunity.client_contact}
 </p>
 </div>
 )}

 {opportunity.location && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Location</p>
 <div className="flex items-center gap-xs">
 <MapPin className="h-icon-xs w-icon-xs color-muted" />
 <p className="text-body-sm color-foreground">
 {opportunity.location}
 </p>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Financial Information */}
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Financial Information</h3>
 
 <div className="stack-sm">
 {opportunity.estimated_value && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Estimated Value</p>
 <div className="flex items-center gap-xs">
 <DollarSign className="h-icon-xs w-icon-xs color-success" />
 <p className="text-heading-4 font-semibold color-success">
 {formatCurrency(opportunity.estimated_value)}
 </p>
 </div>
 </div>
 )}

 {(opportunity.budget_min || opportunity.budget_max) && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Budget Range</p>
 <p className="text-body-sm color-foreground">
 {opportunity.budget_min ? formatCurrency(opportunity.budget_min) : '—'} - {opportunity.budget_max ? formatCurrency(opportunity.budget_max) : '—'}
 </p>
 </div>
 )}

 {opportunity.currency && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Currency</p>
 <Badge variant="outline" size="sm">
 {opportunity.currency}
 </Badge>
 </div>
 )}

 {opportunity.duration && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Duration</p>
 <p className="text-body-sm color-foreground">
 {opportunity.duration}
 </p>
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
 {opportunity.created_at 
 ? new Date(opportunity.created_at).toLocaleString()
 : 'Unknown'
 }
 </p>
 </div>
 </div>

 {opportunity.opens_at && (
 <div className="flex items-center gap-sm p-sm border border-border rounded-md">
 <Calendar className="h-icon-xs w-icon-xs color-info" />
 <div>
 <p className="text-body-sm color-info">Opens</p>
 <p className="text-body-xs color-muted">
 {new Date(opportunity.opens_at).toLocaleString()}
 </p>
 </div>
 </div>
 )}

 {opportunity.closes_at && (
 <div className={`flex items-center gap-sm p-sm border rounded-md ${
 isClosingSoon(opportunity.closes_at) 
 ? 'border-warning/20 bg-warning/5' 
 : 'border-border'
 }`}>
 <Calendar className={`h-icon-xs w-icon-xs ${
 isClosingSoon(opportunity.closes_at) ? 'color-warning' : 'color-muted'
 }`} />
 <div>
 <p className={`text-body-sm ${
 isClosingSoon(opportunity.closes_at) ? 'color-warning' : 'color-foreground'
 }`}>
 Closes
 </p>
 <p className={`text-body-xs ${
 isClosingSoon(opportunity.closes_at) ? 'color-warning' : 'color-muted'
 }`}>
 {new Date(opportunity.closes_at).toLocaleString()}
 {isClosingSoon(opportunity.closes_at) && ' (Closing Soon)'}
 </p>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Description */}
 {opportunity.description && (
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Description</h3>
 <div className="p-md bg-secondary/50 rounded-md">
 <p className="text-body-sm color-foreground whitespace-pre-wrap">
 {opportunity.description}
 </p>
 </div>
 </div>
 )}

 {/* Requirements */}
 {opportunity.requirements && opportunity.requirements.length > 0 && (
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Requirements</h3>
 <div className="stack-sm">
 {opportunity.requirements.map((requirement, index) => (
 <div key={index} className="flex items-start gap-sm p-sm border border-border rounded-md">
 <div className="h-icon-sm w-icon-sm bg-accent/10 rounded-full flex items-center justify-center mt-xs">
 <span className="text-body-xs color-accent font-medium">{index + 1}</span>
 </div>
 <p className="text-body-sm color-foreground">{requirement}</p>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Skills Required */}
 {opportunity.skills_required && opportunity.skills_required.length > 0 && (
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Skills Required</h3>
 <div className="flex flex-wrap gap-xs">
 {opportunity.skills_required.map((skill, index) => (
 <Badge key={index} variant="outline" size="sm">
 {skill}
 </Badge>
 ))}
 </div>
 </div>
 )}

 {/* Notes */}
 {opportunity.notes && (
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Notes</h3>
 <div className="p-md bg-secondary/50 rounded-md">
 <div className="flex items-start gap-sm">
 <FileText className="h-icon-xs w-icon-xs color-muted mt-xs" />
 <p className="text-body-sm color-foreground whitespace-pre-wrap">
 {opportunity.notes}
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
 {onAward && opportunity.status === 'open' && (
 <Button onClick={onAward} className="color-success">
 <CheckCircle className="h-icon-xs w-icon-xs mr-xs" />
 Award Opportunity
 </Button>
 )}
 {onCloseOpportunity && opportunity.status === 'open' && (
 <Button onClick={onCloseOpportunity} variant="outline" className="color-info">
 Close Opportunity
 </Button>
 )}
 {onCancel && opportunity.status === 'open' && (
 <Button onClick={onCancel} variant="outline" className="color-warning">
 Cancel
 </Button>
 )}
 {onEdit && opportunity.status === 'open' && (
 <Button onClick={onEdit}>
 <Edit className="h-icon-xs w-icon-xs mr-xs" />
 Edit Opportunity
 </Button>
 )}
 </div>
 </div>
 </AppDrawer>
 );
}
