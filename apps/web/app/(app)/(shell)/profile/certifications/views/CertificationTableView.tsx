'use client';

import { Award, Calendar, ExternalLink, Edit, Trash2, Eye, Download, ArrowUpDown, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { 
 Card, 
 Badge, 
 Button,
 Skeleton,
} from '@ghxstship/ui';
import type { Certification, CertificationSort } from '../types';
import { getCertificationStatus } from '../types';

interface CertificationTableViewProps {
 certifications: Certification[];
 loading: boolean;
 selectedItems: string[];
 onSelectItem: (id: string, selected: boolean) => void;
 onSelectAll: (ids: string[], selected: boolean) => void;
 onSort?: (sort: CertificationSort) => void;
 onEdit?: (certification: Certification) => void;
 onView?: (certification: Certification) => void;
 onDelete?: (certification: Certification) => void;
 onExport?: (certification: Certification) => void;
 currentSort?: CertificationSort;
}

export default function CertificationTableView({
 certifications,
 loading,
 selectedItems,
 onSelectItem,
 onSelectAll,
 onSort,
 onEdit,
 onView,
 onDelete,
 onExport,
 currentSort,
}: CertificationTableViewProps) {
 const allSelected = certifications.length > 0 && certifications.every(cert => selectedItems.includes(cert.id));
 const someSelected = certifications.some(cert => selectedItems.includes(cert.id));

 const handleSelectAll = () => {
 const certificationIds = certifications.map(cert => cert.id);
 onSelectAll(certificationIds, !allSelected);
 };

 const handleSort = (field: keyof Certification) => {
 if (!onSort) return;
 
 const direction = currentSort?.field === field && currentSort?.direction === 'asc' ? 'desc' : 'asc';
 onSort({ field, direction });
 };

 const getSortIcon = (field: keyof Certification) => {
 if (currentSort?.field !== field) return <ArrowUpDown className="h-3 w-3 opacity-50" />;
 return <ArrowUpDown className={`h-3 w-3 ${currentSort.direction === 'desc' ? 'rotate-180' : ''}`} />;
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
 <Card className="p-6">
 <div className="space-y-4">
 <Skeleton className="h-8 w-full" />
 {Array.from({ length: 5 }).map((_, i) => (
 <div key={i} className="flex items-center gap-4">
 <Skeleton className="h-4 w-4" />
 <Skeleton className="h-4 flex-1" />
 <Skeleton className="h-4 w-20" />
 <Skeleton className="h-4 w-16" />
 </div>
 ))}
 </div>
 </Card>
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
 <Card className="p-6">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b">
 <th className="text-left p-2">
 <input
 type="checkbox"
 checked={allSelected}
 ref={(input) => {
 if (input) input.indeterminate = someSelected && !allSelected;
 }}
 onChange={handleSelectAll}
 className="h-4 w-4 rounded border-border"
 />
 </th>
 <th className="text-left p-2">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('name')}
 className="h-auto p-0 font-semibold"
 >
 Certification
 {getSortIcon('name')}
 </Button>
 </th>
 <th className="text-left p-2">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('issuing_organization')}
 className="h-auto p-0 font-semibold"
 >
 Organization
 {getSortIcon('issuing_organization')}
 </Button>
 </th>
 <th className="text-left p-2">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('status')}
 className="h-auto p-0 font-semibold"
 >
 Status
 {getSortIcon('status')}
 </Button>
 </th>
 <th className="text-left p-2">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('issue_date')}
 className="h-auto p-0 font-semibold"
 >
 Issue Date
 {getSortIcon('issue_date')}
 </Button>
 </th>
 <th className="text-left p-2">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('expiry_date')}
 className="h-auto p-0 font-semibold"
 >
 Expiry Date
 {getSortIcon('expiry_date')}
 </Button>
 </th>
 <th className="text-left p-2">Actions</th>
 </tr>
 </thead>
 <tbody>
 {certifications.map((certification) => {
 const isSelected = selectedItems.includes(certification.id);
 const status = getCertificationStatus(certification);
 
 return (
 <tr 
 key={certification.id} 
 className={`border-b hover:bg-muted/50 ${
 isSelected ? 'bg-muted/30' : ''
 }`}
 >
 <td className="p-2">
 <input
 type="checkbox"
 checked={isSelected}
 onChange={(e) => onSelectItem(certification.id, e.target.checked)}
 className="h-4 w-4 rounded border-border"
 />
 </td>
 
 <td className="p-2">
 <div className="flex items-center gap-3">
 <div className="p-1 rounded bg-primary/10">
 <Award className="h-4 w-4 text-primary" />
 </div>
 <div>
 <div className="font-medium text-sm">
 {certification.name}
 </div>
 {certification.certification_number && (
 <div className="text-xs text-muted-foreground">
 #{certification.certification_number}
 </div>
 )}
 </div>
 </div>
 </td>
 
 <td className="p-2">
 <div className="text-sm">
 {certification.issuing_organization}
 </div>
 </td>
 
 <td className="p-2">
 <div className="flex items-center gap-2">
 {getStatusIcon(certification)}
 <Badge className={status.color}>
 {status.status}
 </Badge>
 </div>
 {status.daysUntilExpiry !== undefined && status.daysUntilExpiry > 0 && (
 <div className="text-xs text-muted-foreground mt-1">
 {status.daysUntilExpiry} days left
 </div>
 )}
 </td>
 
 <td className="p-2">
 <div className="text-sm">
 {certification.issue_date 
 ? new Date(certification.issue_date).toLocaleDateString()
 : 'Not specified'
 }
 </div>
 </td>
 
 <td className="p-2">
 <div className="text-sm">
 {certification.expiry_date 
 ? new Date(certification.expiry_date).toLocaleDateString()
 : 'No expiry'
 }
 </div>
 </td>
 
 <td className="p-2">
 <div className="flex items-center gap-1">
 {certification.verification_url && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => window.open(certification.verification_url, '_blank')}
 className="h-6 w-6 p-0"
 title="Verify"
 >
 <ExternalLink className="h-3 w-3" />
 </Button>
 )}
 {onView && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(certification)}
 className="h-6 w-6 p-0"
 title="View"
 >
 <Eye className="h-3 w-3" />
 </Button>
 )}
 {onEdit && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(certification)}
 className="h-6 w-6 p-0"
 title="Edit"
 >
 <Edit className="h-3 w-3" />
 </Button>
 )}
 {onExport && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onExport(certification)}
 className="h-6 w-6 p-0"
 title="Export"
 >
 <Download className="h-3 w-3" />
 </Button>
 )}
 {onDelete && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(certification)}
 className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
 title="Delete"
 >
 <Trash2 className="h-3 w-3" />
 </Button>
 )}
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </Card>
 );
}
