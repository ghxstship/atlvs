'use client';

import { Award, Calendar, ExternalLink, Edit, Trash2, Eye, Download, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { 
 Card, 
 Badge, 
 Button,
 Skeleton,
} from '@ghxstship/ui';
import type { Certification } from '../types';
import { getCertificationStatus } from '../types';

interface CertificationGridViewProps {
 certifications: Certification[];
 loading: boolean;
 selectedItems: string[];
 onSelectItem: (id: string, selected: boolean) => void;
 onEdit?: (certification: Certification) => void;
 onView?: (certification: Certification) => void;
 onDelete?: (certification: Certification) => void;
 onExport?: (certification: Certification) => void;
}

export default function CertificationGridView({
 certifications,
 loading,
 selectedItems,
 onSelectItem,
 onEdit,
 onView,
 onDelete,
 onExport,
}: CertificationGridViewProps) {
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
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
 {Array.from({ length: 6 }).map((_, i) => (
 <Card key={i} className="p-lg">
 <div className="space-y-md">
 <div className="flex items-center gap-sm">
 <Skeleton className="h-icon-xl w-icon-xl rounded-full" />
 <div className="flex-1 space-y-xs">
 <Skeleton className="h-icon-xs w-3/4" />
 <Skeleton className="h-3 w-1/2" />
 </div>
 </div>
 <Skeleton className="h-component-lg w-full" />
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
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
 {certifications.map((certification) => {
 const isSelected = selectedItems.includes(certification.id);
 const status = getCertificationStatus(certification);

 return (
 <Card key={certification.id} className={`p-lg transition-all hover:shadow-md ${
 isSelected ? 'ring-2 ring-primary' : ''
 }`}>
 <div className="space-y-md">
 {/* Header */}
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-sm">
 <input
 type="checkbox"
 checked={isSelected}
 onChange={(e) => onSelectItem(certification.id, e.target.checked)}
 className="h-icon-xs w-icon-xs rounded border-border"
 />
 <div className="p-xs rounded-full bg-primary/10">
 <Award className="h-icon-sm w-icon-sm text-primary" />
 </div>
 </div>
 
 <div className="flex items-center gap-xs">
 {getStatusIcon(certification)}
 <Badge className={status.color}>
 {status.status}
 </Badge>
 </div>
 </div>

 {/* Content */}
 <div className="space-y-sm">
 <div>
 <h4 className="font-semibold text-lg line-clamp-xs">
 {certification.name}
 </h4>
 <p className="text-sm text-muted-foreground">
 {certification.issuing_organization}
 </p>
 </div>

 {/* Details */}
 <div className="space-y-xs text-sm">
 {certification.certification_number && (
 <div>
 <span className="font-medium text-muted-foreground">Number:</span>
 <span className="ml-2">{certification.certification_number}</span>
 </div>
 )}
 
 <div className="flex items-center justify-between">
 {certification.issue_date && (
 <div className="flex items-center gap-xs">
 <Calendar className="h-3 w-3 text-muted-foreground" />
 <span className="text-xs text-muted-foreground">
 Issued: {new Date(certification.issue_date).toLocaleDateString()}
 </span>
 </div>
 )}
 </div>
 
 {certification.expiry_date && (
 <div className="flex items-center gap-xs">
 <Calendar className="h-3 w-3 text-muted-foreground" />
 <span className="text-xs text-muted-foreground">
 Expires: {new Date(certification.expiry_date).toLocaleDateString()}
 </span>
 </div>
 )}

 {status.daysUntilExpiry !== undefined && status.daysUntilExpiry > 0 && (
 <div className="text-xs font-medium text-yellow-600">
 {status.daysUntilExpiry} days remaining
 </div>
 )}
 </div>

 {/* Notes */}
 {certification.notes && (
 <div className="p-xs bg-muted/50 rounded text-xs text-muted-foreground line-clamp-xs">
 {certification.notes}
 </div>
 )}

 {/* Links */}
 <div className="flex items-center gap-xs">
 {certification.verification_url && (
 <a
 href={certification.verification_url as any as any}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-xs text-xs text-blue-600 hover:text-blue-700"
 >
 <ExternalLink className="h-3 w-3" />
 Verify
 </a>
 )}
 
 {certification.attachment_url && (
 <a
 href={certification.attachment_url as any as any}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-xs text-xs text-blue-600 hover:text-blue-700"
 >
 <Download className="h-3 w-3" />
 Download
 </a>
 )}
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center justify-between pt-2 border-t">
 <div className="text-xs text-muted-foreground">
 Updated: {new Date(certification.updated_at).toLocaleDateString()}
 </div>
 
 <div className="flex items-center gap-xs">
 {onView && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(certification)}
 className="h-7 w-7 p-0"
 >
 <Eye className="h-3 w-3" />
 </Button>
 )}
 {onEdit && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(certification)}
 className="h-7 w-7 p-0"
 >
 <Edit className="h-3 w-3" />
 </Button>
 )}
 {onExport && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onExport(certification)}
 className="h-7 w-7 p-0"
 >
 <Download className="h-3 w-3" />
 </Button>
 )}
 {onDelete && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(certification)}
 className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
 >
 <Trash2 className="h-3 w-3" />
 </Button>
 )}
 </div>
 </div>
 </div>
 </Card>
 );
 })}
 </div>
 );
}
