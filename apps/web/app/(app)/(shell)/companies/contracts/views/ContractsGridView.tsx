'use client';

import { FileText, Calendar, DollarSign, Building, AlertTriangle } from "lucide-react";
import { Badge, Button, Card } from '@ghxstship/ui';
import type { CompanyContract } from '../types';

interface ContractsGridViewProps {
 contracts: CompanyContract[];
 onEdit: (contract: CompanyContract) => void;
 onView: (contract: CompanyContract) => void;
 onRenew: (contract: CompanyContract) => void;
 onTerminate: (contract: CompanyContract) => void;
}

export default function ContractsGridView({
 contracts,
 onEdit,
 onView,
 onRenew,
 onTerminate
}: ContractsGridViewProps) {
 const getStatusColor = (status: string): "secondary" | "outline" | "default" | "destructive" | "success" | "warning" | "info" | "ghost" | "gradient" => {
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
 return 'info';
 default:
 return 'secondary';
 }
 };

 const getTypeIcon = (type: string) => {
 switch (type) {
 case 'msa':
 return FileText;
 case 'sow':
 return Building;
 case 'nda':
 return FileText;
 default:
 return FileText;
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
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {contracts.map((contract) => {
 const TypeIcon = getTypeIcon(contract.type);
 const expiringSoon = isExpiringSoon(contract.end_date);
 
 return (
 <Card key={contract.id} className="p-md hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between mb-sm">
 <div className="flex items-center gap-sm">
 <TypeIcon className="h-icon-sm w-icon-sm text-muted-foreground" />
 <Badge variant={getStatusColor(contract.status)} size="sm">
 {contract.status}
 </Badge>
 </div>
 {expiringSoon && (
 <AlertTriangle className="h-icon-xs w-icon-xs text-yellow-600" />
 )}
 </div>
 
 <div className="mb-md">
 <h3 className="font-semibold text-lg mb-xs">{contract.title}</h3>
 <p className="text-sm text-muted-foreground mb-sm">
 {contract.company?.name || 'Unknown Company'}
 </p>
 {contract.description && (
 <p className="text-sm text-muted-foreground line-clamp-xs">
 {contract.description}
 </p>
 )}
 </div>
 
 <div className="space-y-xs mb-md">
 <div className="flex items-center gap-sm text-sm">
 <span className="font-medium">Type:</span>
 <span className="text-muted-foreground uppercase">{contract.type}</span>
 </div>
 
 {contract.value && (
 <div className="flex items-center gap-sm text-sm">
 <DollarSign className="h-icon-xs w-icon-xs text-green-600" />
 <span className="text-green-600 font-medium">
 {contract.value.toLocaleString()} {contract.currency}
 </span>
 </div>
 )}
 
 {contract.end_date && (
 <div className="flex items-center gap-sm text-sm">
 <Calendar className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className={expiringSoon ? 'text-yellow-600 font-medium' : 'text-muted-foreground'}>
 Expires: {new Date(contract.end_date).toLocaleDateString()}
 </span>
 </div>
 )}
 
 {contract.auto_renew && (
 <div className="flex items-center gap-sm text-sm">
 <span className="text-blue-600 text-xs bg-blue-50 px-xs py-xs rounded">
 Auto-renewal enabled
 </span>
 </div>
 )}
 </div>
 
 <div className="flex items-center gap-sm">
 <Button
 variant="secondary"
 size="sm"
 onClick={() => onView(contract)}
 className="flex-1"
 >
 View
 </Button>
 
 <Button
 variant="secondary"
 size="sm"
 onClick={() => onEdit(contract)}
 className="flex-1"
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
 </div>
 
 {expiringSoon && (
 <div className="mt-sm p-sm bg-yellow-50 border border-yellow-component-lg0 rounded text-xs text-yellow-container-md0">
 This contract is expiring soon. Consider renewal or termination.
 </div>
 )}
 </Card>
 );
 })}
 
 {contracts.length === 0 && (
 <div className="col-span-full text-center py-xl">
 <FileText className="h-icon-2xl w-icon-2xl text-muted-foreground mx-auto mb-md" />
 <p className="text-muted-foreground">No contracts found</p>
 </div>
 )}
 </div>
 );
}
