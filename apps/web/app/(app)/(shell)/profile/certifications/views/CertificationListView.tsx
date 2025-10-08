'use client';

import { AlertTriangle, Award, Calendar, CheckCircle, Clock, Download, Edit, ExternalEdit, ExternalLink, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { 
 Card, 
 Badge, 
 Button,
 Skeleton
} from '@ghxstship/ui';
import type { Certification } from '../types';
import { getCertificationStatus } from '../types';

interface CertificationListViewProps {
 certifications: Certification[];
 loading: boolean;
 selectedItems: string[];
 onSelectItem: (id: string, selected: boolean) => void;
 onSelectAll: (ids: string[], selected: boolean) => void;
 onEdit?: (certification: Certification) => void;
 onView?: (certification: Certification) => void;
 onDelete?: (certification: Certification) => void;
 onExport?: (certification: Certification) => void;
}

export default function CertificationListView({
 certifications,
 loading,
 selectedItems,
 onSelectItem,
 onSelectAll,
 onEdit,
 onView,
 onDelete,
 onExport
}: CertificationListViewProps) {
 const allSelected = certifications.length > 0 && certifications.every(cert => selectedItems.includes(cert.id));
 const someSelected = certifications.some(cert => selectedItems.includes(cert.id));

 const handleSelectAll = () => {
 const certificationIds = certifications.map(cert => cert.id);
 onSelectAll(certificationIds, !allSelected);
 };

 const getStatusIcon = (certification: Certification) => {
 const status = getCertificationStatus(certification);
 
 if (status.status === 'Expired') {
 return <AlertTriangle className="h-icon-xs w-icon-xs text-red-500" />;
 }
 
 if (status.isExpiring) {
 return <Clock className="h-icon-xs w-icon-xs text-yellow-500" />;
 }
 
 return <CheckCircle className="h-icon-xs w-icon-xs text-green-500" />;
 };

 if (loading) {
 return (
 <div className="space-y-md">
 {Array.from({ length: 5 }).map((_, i) => (
 <Card key={i} className="p-lg">
 <div className="flex items-start gap-md">
 <Skeleton className="h-icon-2xl w-icon-2xl rounded-full" />
 <div className="flex-1 space-y-xs">
 <Skeleton className="h-icon-xs w-3/4" />
 <Skeleton className="h-3 w-1/2" />
 <Skeleton className="h-3 w-1/4" />
 </div>
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (certifications.length === 0) {
 return (
 <Card className="p-xsxl text-center">
 <Award className="h-icon-2xl w-icon-2xl text-muted-foreground mx-auto mb-4" />
 <h3 className="text-lg font-semibold mb-2">No Certifications Found</h3>
 <p className="text-muted-foreground">
 No certifications match the current filters.
 </p>
 </Card>
 );
 }

 return (
 <div className="space-y-md">
 {/* Header with bulk selection */}
 <div className="flex items-center gap-md p-md bg-muted/50 rounded-lg">
 <input
 type="checkbox"
 checked={allSelected}
 ref={(input) => {
 if (input) input.indeterminate = someSelected && !allSelected;
 }}
 onChange={handleSelectAll}
 className="h-icon-xs w-icon-xs rounded border-border"
 />
 <span className="text-sm text-muted-foreground">
 {selectedItems.length > 0 
 ? `${selectedItems.length} of ${certifications.length} selected`
 : `${certifications.length} certifications`
 }
 </span>
 </div>

 {/* Certification List */}
 <div className="space-y-sm">
 {certifications.map((certification) => {
 const isSelected = selectedItems.includes(certification.id);
 const status = getCertificationStatus(certification);

 return (
 <Card key={certification.id} className={`p-lg transition-colors ${
 isSelected ? 'ring-2 ring-primary' : ''
 }`}>
 <div className="flex items-start gap-md">
 <input
 type="checkbox"
 checked={isSelected}
 onChange={(e) => onSelectItem(certification.id, e.target.checked)}
 className="h-icon-xs w-icon-xs rounded border-border mt-1"
 />
 
 <div className="p-sm rounded-full bg-primary/10">
 <Award className="h-icon-md w-icon-md text-primary" />
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-xs mb-3">
 <div className="flex-1">
 <h4 className="font-semibold text-lg mb-1">
 {certification.name}
 </h4>
 <p className="text-muted-foreground mb-2">
 Issued by {certification.issuing_organization}
 </p>
 <div className="flex items-center gap-xs mb-2">
 {getStatusIcon(certification)}
 <Badge className={status.color}>
 {status.status}
 </Badge>
 {status.daysUntilExpiry !== undefined && status.daysUntilExpiry > 0 && (
 <span className="text-xs text-muted-foreground">
 {status.daysUntilExpiry} days remaining
 </span>
 )}
 </div>
 </div>
 
 <div className="flex items-center gap-xs">
 {onView && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(certification)}
 className="h-icon-lg w-icon-lg p-0"
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 )}
 {onEdit && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(certification)}
 className="h-icon-lg w-icon-lg p-0"
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 )}
 {onExport && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onExport(certification)}
 className="h-icon-lg w-icon-lg p-0"
 >
 <Download className="h-icon-xs w-icon-xs" />
 </Button>
 )}
 {onDelete && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(certification)}
 className="h-icon-lg w-icon-lg p-0 text-red-600 hover:text-red-700"
 >
 <Trash2 className="h-icon-xs w-icon-xs" />
 </Button>
 )}
 </div>
 </div>

 {/* Certification Details */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-sm">
 {certification.certification_number && (
 <div>
 <span className="font-medium text-muted-foreground">Number:</span>
 <span className="ml-2">{certification.certification_number}</span>
 </div>
 )}
 
 {certification.issue_date && (
 <div className="flex items-center gap-xs">
 <Calendar className="h-3 w-3 text-muted-foreground" />
 <span className="font-medium text-muted-foreground">Issued:</span>
 <span className="ml-1">{new Date(certification.issue_date).toLocaleDateString()}</span>
 </div>
 )}
 
 {certification.expiry_date && (
 <div className="flex items-center gap-xs">
 <Calendar className="h-3 w-3 text-muted-foreground" />
 <span className="font-medium text-muted-foreground">Expires:</span>
 <span className="ml-1">{new Date(certification.expiry_date).toLocaleDateString()}</span>
 </div>
 )}
 
 {certification.verification_url && (
 <div>
 <a
 href={certification.verification_url as any as any}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-xs text-blue-600 hover:text-blue-700"
 >
 <ExternalLink className="h-3 w-3" />
 <span>Verify</span>
 </a>
 </div>
 )}
 </div>

 {certification.notes && (
 <div className="mt-3 p-sm bg-muted/50 rounded-lg">
 <p className="text-sm text-muted-foreground">
 {certification.notes}
 </p>
 </div>
 )}

 <div className="mt-3 text-xs text-muted-foreground">
 Last updated: {new Date(certification.updated_at).toLocaleDateString()}
 </div>
 </div>
 </div>
 </Card>
 );
 })}
 </div>
 </div>
 );
}
