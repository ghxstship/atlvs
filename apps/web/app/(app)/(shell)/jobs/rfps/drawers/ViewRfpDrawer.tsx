'use client';

import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, Calendar, Edit, Building, DollarSign, MapPin, Mail, User } from "lucide-react";
import { Badge, Button } from '@ghxstship/ui';
import { AppDrawer } from '@ghxstship/ui';
import type { JobRfp, RfpDrawerProps } from '../types';

interface ViewRfpDrawerProps extends Omit<RfpDrawerProps, 'mode' | 'onSave'> {
 rfp: JobRfp;
 onEdit?: () => void;
 onClose?: () => void;
 onAward?: () => void;
 onCancel?: () => void;
 onPublish?: () => void;
}

export default function ViewRfpDrawer({
 rfp,
 onEdit,
 onClose: onCloseRfp,
 onAward,
 onCancel,
 onPublish,
 onClose,
 open
}: ViewRfpDrawerProps) {

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
 case 'open': return <FileText className="h-icon-xs w-icon-xs" />;
 case 'awarded': return <CheckCircle className="h-icon-xs w-icon-xs" />;
 case 'closed': return <Clock className="h-icon-xs w-icon-xs" />;
 case 'cancelled': return <XCircle className="h-icon-xs w-icon-xs" />;
 default: return <FileText className="h-icon-xs w-icon-xs" />;
 }
 };

 const getCategoryColor = (category?: string) => {
 switch (category) {
 case 'construction': return 'warning';
 case 'consulting': return 'info';
 case 'technology': return 'success';
 case 'services': return 'secondary';
 case 'supplies': return 'info';
 case 'other': return 'secondary';
 default: return 'secondary';
 }
 };

 const formatCurrency = (amount?: number) => {
 if (!amount) return '—';
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD',
 minimumFractionDigits: 0,
 maximumFractionDigits: 0
 }).format(amount);
 };

 const isDueSoon = (dueAt?: string) => {
 if (!dueAt) return false;
 const due = new Date(dueAt);
 const now = new Date();
 const sevenDaysFromNow = new Date();
 sevenDaysFromNow.setDate(now.getDate() + 7);
 return due <= sevenDaysFromNow && due > now;
 };

 return (
 <AppDrawer
 open={open}
 onClose={onClose}
 title="RFP Details"
 record={rfp}
 mode="view"
 >
 <div className="stack-lg">
 {/* Header */}
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <h2 className="text-heading-4 color-foreground">
 {rfp.title || 'Untitled RFP'}
 </h2>
 <p className="text-body-sm color-muted">
 RFP ID: {rfp.id}
 </p>
 </div>
 <div className="flex gap-sm">
 {onPublish && rfp.status === 'open' && (
 <Button variant="outline" onClick={onPublish} className="color-info">
 Publish
 </Button>
 )}
 {onAward && rfp.status === 'open' && (
 <Button variant="outline" onClick={onAward} className="color-success">
 Award
 </Button>
 )}
 {onCloseRfp && rfp.status === 'open' && (
 <Button variant="outline" onClick={onCloseRfp} className="color-info">
 Close
 </Button>
 )}
 {onCancel && rfp.status === 'open' && (
 <Button variant="outline" onClick={onCancel} className="color-warning">
 Cancel
 </Button>
 )}
 {onEdit && rfp.status === 'open' && (
 <Button variant="outline" onClick={onEdit}>
 <Edit className="h-icon-xs w-icon-xs mr-xs" />
 Edit
 </Button>
 )}
 </div>
 </div>

 {/* Status and Category */}
 <div className="flex items-center gap-lg">
 <Badge variant={getStatusColor(rfp.status)} className="flex items-center gap-xs">
 {getStatusIcon(rfp.status)}
 {rfp.status ? rfp.status.toUpperCase() : 'UNKNOWN'}
 </Badge>
 {rfp.category && (
 <Badge variant={getCategoryColor(rfp.category)} className="capitalize">
 {rfp.category}
 </Badge>
 )}
 </div>

 {/* RFP Details */}
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
 {rfp.organization_name || 'Unknown Organization'}
 </p>
 </div>
 </div>

 {rfp.project_title && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Project</p>
 <p className="text-body-sm color-foreground">
 {rfp.project_title}
 </p>
 </div>
 )}

 {rfp.category && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Category</p>
 <Badge variant={getCategoryColor(rfp.category)} className="capitalize">
 {rfp.category}
 </Badge>
 </div>
 )}

 {rfp.location && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Location</p>
 <div className="flex items-center gap-xs">
 <MapPin className="h-icon-xs w-icon-xs color-muted" />
 <p className="text-body-sm color-foreground">
 {rfp.location}
 </p>
 </div>
 </div>
 )}

 {rfp.duration && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Duration</p>
 <p className="text-body-sm color-foreground">
 {rfp.duration}
 </p>
 </div>
 )}
 </div>
 </div>

 {/* Financial Information */}
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Financial Information</h3>
 
 <div className="stack-sm">
 {(rfp.budget_min || rfp.budget_max) && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Budget Range</p>
 <div className="flex items-center gap-xs">
 <DollarSign className="h-icon-xs w-icon-xs color-success" />
 <p className="text-heading-4 font-semibold color-success">
 {rfp.budget_min && rfp.budget_max 
 ? `${formatCurrency(rfp.budget_min)} - ${formatCurrency(rfp.budget_max)}`
 : formatCurrency(rfp.budget_max || rfp.budget_min)
 }
 </p>
 </div>
 </div>
 )}

 {rfp.currency && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Currency</p>
 <Badge variant="outline" size="sm">
 {rfp.currency}
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
 {rfp.created_at 
 ? new Date(rfp.created_at).toLocaleString()
 : 'Unknown'
 }
 </p>
 </div>
 </div>

 {rfp.due_at && (
 <div className={`flex items-center gap-sm p-sm border rounded-md ${
 isDueSoon(rfp.due_at) 
 ? 'border-warning/20 bg-warning/5' 
 : 'border-border'
 }`}>
 <Calendar className={`h-icon-xs w-icon-xs ${
 isDueSoon(rfp.due_at) ? 'color-warning' : 'color-muted'
 }`} />
 <div>
 <p className={`text-body-sm ${
 isDueSoon(rfp.due_at) ? 'color-warning' : 'color-foreground'
 }`}>
 Due Date
 </p>
 <p className={`text-body-xs ${
 isDueSoon(rfp.due_at) ? 'color-warning' : 'color-muted'
 }`}>
 {new Date(rfp.due_at).toLocaleString()}
 {isDueSoon(rfp.due_at) && ' (Due Soon)'}
 </p>
 </div>
 </div>
 )}

 {rfp.start_date && (
 <div className="flex items-center gap-sm p-sm border border-border rounded-md">
 <Calendar className="h-icon-xs w-icon-xs color-info" />
 <div>
 <p className="text-body-sm color-info">Start Date</p>
 <p className="text-body-xs color-muted">
 {new Date(rfp.start_date).toLocaleDateString()}
 </p>
 </div>
 </div>
 )}

 {rfp.end_date && (
 <div className="flex items-center gap-sm p-sm border border-border rounded-md">
 <Calendar className="h-icon-xs w-icon-xs color-muted" />
 <div>
 <p className="text-body-sm color-foreground">End Date</p>
 <p className="text-body-xs color-muted">
 {new Date(rfp.end_date).toLocaleDateString()}
 </p>
 </div>
 </div>
 )}

 {rfp.award_date && (
 <div className="flex items-center gap-sm p-sm border border-success/20 bg-success/5 rounded-md">
 <CheckCircle className="h-icon-xs w-icon-xs color-success" />
 <div>
 <p className="text-body-sm color-success">Awarded</p>
 <p className="text-body-xs color-muted">
 {new Date(rfp.award_date).toLocaleString()}
 {rfp.winner_name && ` to ${rfp.winner_name}`}
 </p>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Contact Information */}
 {(rfp.contact_person || rfp.contact_email) && (
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Contact Information</h3>
 
 <div className="stack-sm">
 {rfp.contact_person && (
 <div className="flex items-center gap-sm">
 <User className="h-icon-xs w-icon-xs color-muted" />
 <div>
 <p className="text-body-sm color-foreground">{rfp.contact_person}</p>
 <p className="text-body-xs color-muted">Contact Person</p>
 </div>
 </div>
 )}

 {rfp.contact_email && (
 <div className="flex items-center gap-sm">
 <Mail className="h-icon-xs w-icon-xs color-muted" />
 <div>
 <p className="text-body-sm color-foreground">{rfp.contact_email}</p>
 <p className="text-body-xs color-muted">Email</p>
 </div>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Description */}
 {rfp.description && (
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Description</h3>
 <div className="p-md bg-secondary/50 rounded-md">
 <p className="text-body-sm color-foreground whitespace-pre-wrap">
 {rfp.description}
 </p>
 </div>
 </div>
 )}

 {/* Requirements */}
 {rfp.requirements && rfp.requirements.length > 0 && (
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Requirements</h3>
 <div className="stack-sm">
 {rfp.requirements.map((requirement, index) => (
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

 {/* Evaluation Criteria */}
 {rfp.evaluation_criteria && rfp.evaluation_criteria.length > 0 && (
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Evaluation Criteria</h3>
 <div className="flex flex-wrap gap-xs">
 {rfp.evaluation_criteria.map((criteria, index) => (
 <Badge key={index} variant="outline" size="sm" className="capitalize">
 {criteria}
 </Badge>
 ))}
 </div>
 </div>
 )}

 {/* Submission Guidelines */}
 {rfp.submission_guidelines && (
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Submission Guidelines</h3>
 <div className="p-md bg-secondary/50 rounded-md">
 <p className="text-body-sm color-foreground whitespace-pre-wrap">
 {rfp.submission_guidelines}
 </p>
 </div>
 </div>
 )}

 {/* Notes */}
 {rfp.notes && (
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Notes</h3>
 <div className="p-md bg-secondary/50 rounded-md">
 <div className="flex items-start gap-sm">
 <FileText className="h-icon-xs w-icon-xs color-muted mt-xs" />
 <p className="text-body-sm color-foreground whitespace-pre-wrap">
 {rfp.notes}
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
 {onPublish && rfp.status === 'open' && (
 <Button onClick={onPublish} className="color-info">
 Publish RFP
 </Button>
 )}
 {onAward && rfp.status === 'open' && (
 <Button onClick={onAward} className="color-success">
 <CheckCircle className="h-icon-xs w-icon-xs mr-xs" />
 Award RFP
 </Button>
 )}
 {onCloseRfp && rfp.status === 'open' && (
 <Button onClick={onCloseRfp} variant="outline" className="color-info">
 Close RFP
 </Button>
 )}
 {onCancel && rfp.status === 'open' && (
 <Button onClick={onCancel} variant="outline" className="color-warning">
 Cancel
 </Button>
 )}
 {onEdit && rfp.status === 'open' && (
 <Button onClick={onEdit}>
 <Edit className="h-icon-xs w-icon-xs mr-xs" />
 Edit RFP
 </Button>
 )}
 </div>
 </div>
 </AppDrawer>
 );
}
