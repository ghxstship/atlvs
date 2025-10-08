'use client';

import { FileText, Calendar, DollarSign, Building, AlertTriangle, ExternalLink } from "lucide-react";
import { Badge, Button } from '@ghxstship/ui';
import type { CompanyContract } from '../types';

interface ContractsListViewProps {
 contracts: CompanyContract[];
 onEdit: (contract: CompanyContract) => void;
 onView: (contract: CompanyContract) => void;
 onRenew: (contract: CompanyContract) => void;
 onTerminate: (contract: CompanyContract) => void;
}

export default function ContractsListView({
 contracts,
 onEdit,
 onView,
 onRenew,
 onTerminate
}: ContractsListViewProps) {
 const getStatusColor = (status: string) => {
 switch (status) {
 case 'active':
 return 'success';
 case 'pending':
 return 'warning';
 case 'expired':
 return 'destructive';
 case 'terminated':
 return 'secondary';
 case 'renewed':
 return 'primary';
 default:
 return 'secondary';
 }
 };

 const isExpiringSoon = (endDate?: string) => {
 if (!endDate) return false;
 const end = new Date(endDate);
 const now = new Date();
 const thirtyDaysFromNow = new Date();
 thirtyDaysFromNow.setDate(now.getDate() + 30);
 return end <= thirtyDaysFromNow && end > now;
 };

 return (
 <div className="space-y-sm">
 {contracts.map((contract) => {
 const expiringSoon = isExpiringSoon(contract.end_date);
 
 return (
 <div
 key={contract.id}
 className={`border rounded-lg p-md hover:shadow-sm transition-shadow ${
 expiringSoon ? 'border-yellow-300 bg-yellow-50' : 'border-border'
 }`}
 >
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-sm mb-sm">
 <FileText className="h-icon-xs w-icon-xs text-muted-foreground" />
 <h3 className="font-semibold">{contract.title}</h3>
 <Badge variant={getStatusColor(contract.status)} size="sm">
 {contract.status}
 </Badge>
 {expiringSoon && (
 <AlertTriangle className="h-icon-xs w-icon-xs text-yellow-600" />
 )}
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-sm">
 <div>
 <p className="text-xs text-muted-foreground mb-1">Company</p>
 <p className="text-sm font-medium">
 {contract.company?.name || 'Unknown Company'}
 </p>
 </div>
 
 <div>
 <p className="text-xs text-muted-foreground mb-1">Type</p>
 <p className="text-sm font-medium uppercase">{contract.type}</p>
 </div>
 
 {contract.value && (
 <div>
 <p className="text-xs text-muted-foreground mb-1">Value</p>
 <p className="text-sm font-medium text-green-600">
 {contract.value.toLocaleString()} {contract.currency}
 </p>
 </div>
 )}
 
 {contract.end_date && (
 <div>
 <p className="text-xs text-muted-foreground mb-1">End Date</p>
 <p className={`text-sm font-medium ${expiringSoon ? 'text-yellow-600' : ''}`}>
 {new Date(contract.end_date).toLocaleDateString()}
 </p>
 </div>
 )}
 </div>
 
 <div className="flex items-center gap-md text-xs text-muted-foreground">
 {contract.start_date && (
 <span>Started: {new Date(contract.start_date).toLocaleDateString()}</span>
 )}
 
 {contract.auto_renew && (
 <span className="text-blue-600 bg-blue-50 px-xs py-xs rounded">
 Auto-renewal
 </span>
 )}
 
 {contract.document_url && (
 <a
 href={contract.document_url as any as any}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-xs text-blue-600 hover:text-blue-700"
 >
 <ExternalLink className="h-3 w-3" />
 Document
 </a>
 )}
 </div>
 
 {contract.description && (
 <p className="text-sm text-muted-foreground mt-sm line-clamp-xs">
 {contract.description}
 </p>
 )}
 </div>
 
 <div className="flex items-center gap-sm ml-md">
 <Button
 variant="secondary"
 size="sm"
 onClick={() => onView(contract)}
 >
 View
 </Button>
 
 <Button
 variant="secondary"
 size="sm"
 onClick={() => onEdit(contract)}
 >
 Edit
 </Button>
 
 {contract.status === 'active' && (
 <Button
 variant="secondary"
 size="sm"
 onClick={() => onRenew(contract)}
 className="text-green-600 hover:text-green-700"
 >
 Renew
 </Button>
 )}
 
 {contract.status === 'active' && (
 <Button
 variant="secondary"
 size="sm"
 onClick={() => onTerminate(contract)}
 className="text-red-600 hover:text-red-700"
 >
 Terminate
 </Button>
 )}
 </div>
 </div>
 
 {expiringSoon && (
 <div className="mt-sm p-sm bg-yellow-100 border border-yellow-component-lg0 rounded text-xs text-yellow-container-md0">
 ⚠️ This contract expires within 30 days. Consider renewal or termination.
 </div>
 )}
 </div>
 );
 })}
 
 {contracts.length === 0 && (
 <div className="text-center py-xl">
 <FileText className="h-icon-2xl w-icon-2xl text-muted-foreground mx-auto mb-md" />
 <p className="text-muted-foreground">No contracts found</p>
 </div>
 )}
 </div>
 );
}
