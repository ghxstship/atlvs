'use client';

import { Shield, Clock, CheckCircle, XCircle, AlertTriangle, Calendar, FileText, Edit, Upload } from "lucide-react";
import {
  AppDrawer,
  Badge,
  Button
} from "@ghxstship/ui";
import { AppDrawer } from '@ghxstship/ui';
import type { JobCompliance, ComplianceDrawerProps } from '../types';

interface ViewComplianceDrawerProps extends Omit<ComplianceDrawerProps, 'mode' | 'onSave'> {
 compliance: JobCompliance;
 onEdit?: () => void;
 onSubmit?: () => void;
 onApprove?: () => void;
 onReject?: () => void;
}

export default function ViewComplianceDrawer({
 compliance,
 onEdit,
 onSubmit,
 onApprove,
 onReject,
 onClose,
 open
}: ViewComplianceDrawerProps) {

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'approved': return 'success';
 case 'submitted': return 'info';
 case 'pending': return 'warning';
 case 'rejected': return 'destructive';
 default: return 'secondary';
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'approved': return <CheckCircle className="h-icon-xs w-icon-xs" />;
 case 'submitted': return <Clock className="h-icon-xs w-icon-xs" />;
 case 'pending': return <AlertTriangle className="h-icon-xs w-icon-xs" />;
 case 'rejected': return <XCircle className="h-icon-xs w-icon-xs" />;
 default: return <Shield className="h-icon-xs w-icon-xs" />;
 }
 };

 const getKindColor = (kind: string) => {
 switch (kind) {
 case 'safety': return 'destructive';
 case 'security': return 'warning';
 case 'regulatory': return 'info';
 case 'quality': return 'success';
 case 'environmental': return 'secondary';
 case 'legal': return 'info';
 case 'financial': return 'warning';
 default: return 'secondary';
 }
 };

 const getRiskColor = (riskLevel?: string) => {
 switch (riskLevel) {
 case 'critical': return 'destructive';
 case 'high': return 'warning';
 case 'medium': return 'info';
 case 'low': return 'success';
 default: return 'secondary';
 }
 };

 const isOverdue = (dueDate?: string) => {
 if (!dueDate) return false;
 return new Date(dueDate) < new Date();
 };

 return (
 <AppDrawer
 open={open}
 onClose={onClose}
 title="Compliance Details"
 record={compliance}
 mode="view"
 >
 <div className="stack-lg">
 {/* Header */}
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <h2 className="text-heading-4 color-foreground">
 {compliance.compliance_title || `${compliance.kind} Compliance`}
 </h2>
 <p className="text-body-sm color-muted">
 Compliance ID: {compliance.id}
 </p>
 </div>
 <div className="flex gap-sm">
 {onSubmit && compliance.status === 'pending' && (
 <Button variant="outline" onClick={onSubmit} className="color-info">
 Submit for Review
 </Button>
 )}
 {onApprove && compliance.status === 'submitted' && (
 <Button variant="outline" onClick={onApprove} className="color-success">
 Approve
 </Button>
 )}
 {onReject && compliance.status === 'submitted' && (
 <Button variant="outline" onClick={onReject} className="color-warning">
 Reject
 </Button>
 )}
 {onEdit && compliance.status === 'pending' && (
 <Button variant="outline" onClick={onEdit}>
 <Edit className="h-icon-xs w-icon-xs mr-xs" />
 Edit
 </Button>
 )}
 </div>
 </div>

 {/* Status and Risk Level */}
 <div className="flex items-center gap-lg">
 <Badge variant={getStatusColor(compliance.status)} className="flex items-center gap-xs">
 {getStatusIcon(compliance.status)}
 {compliance.status ? compliance.status.toUpperCase() : 'UNKNOWN'}
 </Badge>
 <Badge variant={getKindColor(compliance.kind)} className="capitalize">
 {compliance.kind}
 </Badge>
 {compliance.risk_level && (
 <Badge variant={getRiskColor(compliance.risk_level)} className="capitalize">
 {compliance.risk_level} Risk
 </Badge>
 )}
 </div>

 {/* Compliance Details */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
 {/* Job Information */}
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Job Information</h3>
 
 <div className="stack-sm">
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Job Title</p>
 <p className="text-body-sm color-foreground">
 {compliance.job_title || '—'}
 </p>
 </div>

 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Job ID</p>
 <p className="text-body-sm color-foreground font-mono">
 {compliance.job_id}
 </p>
 </div>

 {compliance.project_title && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Project</p>
 <p className="text-body-sm color-foreground">
 {compliance.project_title}
 </p>
 </div>
 )}

 {compliance.job_status && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Job Status</p>
 <Badge variant="outline" size="sm">
 {compliance.job_status}
 </Badge>
 </div>
 )}
 </div>
 </div>

 {/* Compliance Information */}
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Compliance Information</h3>
 
 <div className="stack-sm">
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Compliance Type</p>
 <Badge variant={getKindColor(compliance.kind)} className="capitalize">
 {compliance.kind}
 </Badge>
 </div>

 {compliance.risk_level && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Risk Level</p>
 <Badge variant={getRiskColor(compliance.risk_level)} className="capitalize">
 {compliance.risk_level}
 </Badge>
 </div>
 )}

 {compliance.assessor_name && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Assessor</p>
 <p className="text-body-sm color-foreground">
 {compliance.assessor_name}
 </p>
 </div>
 )}

 {compliance.assessment_date && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Assessment Date</p>
 <div className="flex items-center gap-xs">
 <Calendar className="h-icon-xs w-icon-xs color-muted" />
 <p className="text-body-sm color-foreground">
 {new Date(compliance.assessment_date).toLocaleDateString()}
 </p>
 </div>
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
 {compliance.created_at 
 ? new Date(compliance.created_at).toLocaleString()
 : 'Unknown'
 }
 </p>
 </div>
 </div>

 {compliance.due_at && (
 <div className={`flex items-center gap-sm p-sm border rounded-md ${
 isOverdue(compliance.due_at) 
 ? 'border-destructive/20 bg-destructive/5' 
 : 'border-border'
 }`}>
 <Calendar className={`h-icon-xs w-icon-xs ${
 isOverdue(compliance.due_at) ? 'color-destructive' : 'color-muted'
 }`} />
 <div>
 <p className={`text-body-sm ${
 isOverdue(compliance.due_at) ? 'color-destructive' : 'color-foreground'
 }`}>
 Due Date
 </p>
 <p className={`text-body-xs ${
 isOverdue(compliance.due_at) ? 'color-destructive' : 'color-muted'
 }`}>
 {new Date(compliance.due_at).toLocaleString()}
 {isOverdue(compliance.due_at) && ' (Overdue)'}
 </p>
 </div>
 </div>
 )}

 {compliance.completion_date && (
 <div className="flex items-center gap-sm p-sm border border-success/20 bg-success/5 rounded-md">
 <CheckCircle className="h-icon-xs w-icon-xs color-success" />
 <div>
 <p className="text-body-sm color-success">Completed</p>
 <p className="text-body-xs color-muted">
 {new Date(compliance.completion_date).toLocaleString()}
 </p>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Description */}
 {compliance.description && (
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Description</h3>
 <div className="p-md bg-secondary/50 rounded-md">
 <p className="text-body-sm color-foreground whitespace-pre-wrap">
 {compliance.description}
 </p>
 </div>
 </div>
 )}

 {/* Requirements */}
 {compliance.requirements && compliance.requirements.length > 0 && (
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Requirements</h3>
 <div className="stack-sm">
 {compliance.requirements.map((requirement, index) => (
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

 {/* Evidence Documents */}
 {compliance.evidence_documents && compliance.evidence_documents.length > 0 && (
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Evidence Documents</h3>
 <div className="stack-sm">
 {compliance.evidence_documents.map((doc, index) => (
 <div key={index} className="flex items-center gap-sm p-sm border border-border rounded-md">
 <FileText className="h-icon-xs w-icon-xs color-muted" />
 <div className="flex-1">
 <p className="text-body-sm color-foreground">Document {index + 1}</p>
 <p className="text-body-xs color-muted">Evidence file</p>
 </div>
 <Button variant="outline" size="sm" asChild>
 <a href={doc as any as any} target="_blank" rel="noopener noreferrer">
 View
 </a>
 </Button>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Notes */}
 {compliance.notes && (
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Notes</h3>
 <div className="p-md bg-secondary/50 rounded-md">
 <div className="flex items-start gap-sm">
 <FileText className="h-icon-xs w-icon-xs color-muted mt-xs" />
 <p className="text-body-sm color-foreground whitespace-pre-wrap">
 {compliance.notes}
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
 {onSubmit && compliance.status === 'pending' && (
 <Button onClick={onSubmit} className="color-info">
 Submit for Review
 </Button>
 )}
 {onApprove && compliance.status === 'submitted' && (
 <Button onClick={onApprove} className="color-success">
 <CheckCircle className="h-icon-xs w-icon-xs mr-xs" />
 Approve
 </Button>
 )}
 {onReject && compliance.status === 'submitted' && (
 <Button onClick={onReject} variant="outline" className="color-warning">
 Reject
 </Button>
 )}
 {onEdit && compliance.status === 'pending' && (
 <Button onClick={onEdit}>
 <Edit className="h-icon-xs w-icon-xs mr-xs" />
 Edit Compliance
 </Button>
 )}
 </div>
 </div>
 </AppDrawer>
 );
}
