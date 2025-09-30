'use client';

import { Award, Calendar, ExternalLink, Edit, Trash2, Eye, Download, MoreHorizontal, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useState } from 'react';
import { 
 Card, 
 Badge, 
 Button,
 Skeleton,
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
 onExport,
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
 return <AlertTriangle className="h-4 w-4 text-red-500" />;
 }
 
 if (status.isExpiring) {
 return <Clock className="h-4 w-4 text-yellow-500" />;
 }
 
 return <CheckCircle className="h-4 w-4 text-green-500" />;
 };

 if (loading) {
 return (
 <div className="space-y-4">
 {Array.from({ length: 5 }).map((_, i) => (
 <Card key={i} className="p-6">
 <div className="flex items-start gap-4">
 <Skeleton className="h-12 w-12 rounded-full" />
 <div className="flex-1 space-y-2">
 <Skeleton className="h-4 w-3/4" />
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
 <Card className="p-12 text-center">
 <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
 <h3 className="text-lg font-semibold mb-2">No Certifications Found</h3>
 <p className="text-muted-foreground">
 No certifications match the current filters.
 </p>
 </Card>
 );
 }

 return (
 <div className="space-y-4">
 {/* Header with bulk selection */}
 <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
 <input
 type="checkbox"
 checked={allSelected}
 ref={(input) => {
 if (input) input.indeterminate = someSelected && !allSelected;
 }}
 onChange={handleSelectAll}
 className="h-4 w-4 rounded border-border"
 />
 <span className="text-sm text-muted-foreground">
 {selectedItems.length > 0 
 ? `${selectedItems.length} of ${certifications.length} selected`
 : `${certifications.length} certifications`
 }
 </span>
 </div>

 {/* Certification List */}
 <div className="space-y-3">
 {certifications.map((certification) => {
 const isSelected = selectedItems.includes(certification.id);
 const status = getCertificationStatus(certification);

 return (
 <Card key={certification.id} className={`p-6 transition-colors ${
 isSelected ? 'ring-2 ring-primary' : ''
 }`}>
 <div className="flex items-start gap-4">
 <input
 type="checkbox"
 checked={isSelected}
 onChange={(e) => onSelectItem(certification.id, e.target.checked)}
 className="h-4 w-4 rounded border-border mt-1"
 />
 
 <div className="p-3 rounded-full bg-primary/10">
 <Award className="h-6 w-6 text-primary" />
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-2 mb-3">
 <div className="flex-1">
 <h4 className="font-semibold text-lg mb-1">
 {certification.name}
 </h4>
 <p className="text-muted-foreground mb-2">
 Issued by {certification.issuing_organization}
 </p>
 <div className="flex items-center gap-2 mb-2">
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
 
 <div className="flex items-center gap-2">
 {onView && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(certification)}
 className="h-8 w-8 p-0"
 >
 <Eye className="h-4 w-4" />
 </Button>
 )}
 {onEdit && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(certification)}
 className="h-8 w-8 p-0"
 >
 <Edit className="h-4 w-4" />
 </Button>
 )}
 {onExport && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onExport(certification)}
 className="h-8 w-8 p-0"
 >
 <Download className="h-4 w-4" />
 </Button>
 )}
 {onDelete && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(certification)}
 className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 )}
 </div>
 </div>

 {/* Certification Details */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
 {certification.certification_number && (
 <div>
 <span className="font-medium text-muted-foreground">Number:</span>
 <span className="ml-2">{certification.certification_number}</span>
 </div>
 )}
 
 {certification.issue_date && (
 <div className="flex items-center gap-1">
 <Calendar className="h-3 w-3 text-muted-foreground" />
 <span className="font-medium text-muted-foreground">Issued:</span>
 <span className="ml-1">{new Date(certification.issue_date).toLocaleDateString()}</span>
 </div>
 )}
 
 {certification.expiry_date && (
 <div className="flex items-center gap-1">
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
 className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
 >
 <ExternalLink className="h-3 w-3" />
 <span>Verify</span>
 </a>
 </div>
 )}
 </div>

 {certification.notes && (
 <div className="mt-3 p-3 bg-muted/50 rounded-lg">
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
