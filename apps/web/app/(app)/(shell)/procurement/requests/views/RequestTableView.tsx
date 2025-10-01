'use client';

import { Eye, Edit, Trash2, CheckCircle, XCircle, Clock, AlertTriangle, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from 'react';
import { 
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
 Badge, 
 Button,
 Checkbox
} from '@ghxstship/ui';
import type { ProcurementRequest } from '../types';

interface RequestTableViewProps {
 requests: ProcurementRequest[];
 selectedRequests: string[];
 onSelectRequest: (requestId: string) => void;
 onSelectAll: () => void;
 onViewRequest: (request: ProcurementRequest) => void;
 onEditRequest: (request: ProcurementRequest) => void;
 onDeleteRequest: (request: ProcurementRequest) => void;
 onSubmitRequest: (request: ProcurementRequest) => void;
 onSort: (field: string) => void;
 sortField?: string;
 sortDirection?: 'asc' | 'desc';
 loading?: boolean;
}

export default function RequestTableView({
 requests,
 selectedRequests,
 onSelectRequest,
 onSelectAll,
 onViewRequest,
 onEditRequest,
 onDeleteRequest,
 onSubmitRequest,
 onSort,
 sortField,
 sortDirection,
 loading = false
}: RequestTableViewProps) {
 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'approved':
 return <CheckCircle className="h-icon-xs w-icon-xs text-success" />;
 case 'rejected':
 return <XCircle className="h-icon-xs w-icon-xs text-destructive" />;
 case 'under_review':
 return <Clock className="h-icon-xs w-icon-xs text-warning" />;
 case 'submitted':
 return <AlertTriangle className="h-icon-xs w-icon-xs text-info" />;
 default:
 return <Clock className="h-icon-xs w-icon-xs text-muted-foreground" />;
 }
 };

 const getStatusVariant = (status: string) => {
 switch (status) {
 case 'approved':
 return 'success';
 case 'rejected':
 return 'destructive';
 case 'under_review':
 return 'warning';
 case 'submitted':
 return 'info';
 default:
 return 'secondary';
 }
 };

 const getPriorityVariant = (priority: string) => {
 switch (priority) {
 case 'urgent':
 return 'destructive';
 case 'high':
 return 'warning';
 case 'medium':
 return 'info';
 default:
 return 'secondary';
 }
 };

 const getSortIcon = (field: string) => {
 if (sortField !== field) {
 return <ArrowUpDown className="h-icon-xs w-icon-xs" />;
 }
 return sortDirection === 'asc' ? 
 <ArrowUp className="h-icon-xs w-icon-xs" /> : 
 <ArrowDown className="h-icon-xs w-icon-xs" />;
 };

 const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
 <TableHead>
 <Button
 variant="ghost"
 onClick={() => onSort(field)}
 className="h-auto p-0 font-medium hover:bg-transparent"
 >
 <div className="flex items-center gap-xs">
 {children}
 {getSortIcon(field)}
 </div>
 </Button>
 </TableHead>
 );

 if (loading) {
 return (
 <div className="rounded-md border">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead className="w-icon-2xl">
 <Checkbox disabled />
 </TableHead>
 <TableHead>Title</TableHead>
 <TableHead>Status</TableHead>
 <TableHead>Priority</TableHead>
 <TableHead>Amount</TableHead>
 <TableHead>Category</TableHead>
 <TableHead>Due Date</TableHead>
 <TableHead>Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {Array.from({ length: 5 }).map((_, i) => (
 <TableRow key={i}>
 <TableCell><div className="h-icon-xs w-icon-xs bg-muted rounded animate-pulse" /></TableCell>
 <TableCell><div className="h-icon-xs bg-muted rounded animate-pulse" /></TableCell>
 <TableCell><div className="h-icon-xs bg-muted rounded animate-pulse" /></TableCell>
 <TableCell><div className="h-icon-xs bg-muted rounded animate-pulse" /></TableCell>
 <TableCell><div className="h-icon-xs bg-muted rounded animate-pulse" /></TableCell>
 <TableCell><div className="h-icon-xs bg-muted rounded animate-pulse" /></TableCell>
 <TableCell><div className="h-icon-xs bg-muted rounded animate-pulse" /></TableCell>
 <TableCell><div className="h-icon-xs bg-muted rounded animate-pulse" /></TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 );
 }

 return (
 <div className="rounded-md border">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead className="w-icon-2xl">
 <Checkbox
 checked={selectedRequests.length === requests.length && requests.length > 0}
 onCheckedChange={onSelectAll}
 />
 </TableHead>
 <SortableHeader field="title">Title</SortableHeader>
 <SortableHeader field="status">Status</SortableHeader>
 <SortableHeader field="priority">Priority</SortableHeader>
 <SortableHeader field="estimated_total">Amount</SortableHeader>
 <SortableHeader field="category">Category</SortableHeader>
 <SortableHeader field="requested_delivery_date">Due Date</SortableHeader>
 <SortableHeader field="created_at">Created</SortableHeader>
 <TableHead>Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {requests.length === 0 ? (
 <TableRow>
 <TableCell colSpan={9} className="text-center py-xl">
 <div className="flex flex-col items-center gap-sm">
 <AlertTriangle className="h-icon-lg w-icon-lg text-muted-foreground" />
 <p className="text-sm text-muted-foreground">No requests found</p>
 </div>
 </TableCell>
 </TableRow>
 ) : (
 requests.map((request) => (
 <TableRow key={request.id} className="hover:bg-muted/50">
 <TableCell>
 <Checkbox
 checked={selectedRequests.includes(request.id!)}
 onCheckedChange={() => onSelectRequest(request.id!)}
 />
 </TableCell>
 <TableCell>
 <div>
 <div className="font-medium text-sm">{request.title}</div>
 {request.description && (
 <div className="text-xs text-muted-foreground line-clamp-xs">
 {request.description}
 </div>
 )}
 </div>
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-xs">
 {getStatusIcon(request.status)}
 <Badge variant={getStatusVariant(request.status) as unknown} size="sm">
 {request.status.replace('_', ' ')}
 </Badge>
 </div>
 </TableCell>
 <TableCell>
 <Badge variant={getPriorityVariant(request.priority) as unknown} size="sm">
 {request.priority}
 </Badge>
 </TableCell>
 <TableCell>
 <span className="font-medium">
 {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: request.currency || 'USD'
 }).format(request.estimated_total)}
 </span>
 </TableCell>
 <TableCell>
 <span className="capitalize">{request.category}</span>
 </TableCell>
 <TableCell>
 {request.requested_delivery_date ? (
 <span className="text-sm">
 {new Date(request.requested_delivery_date).toLocaleDateString()}
 </span>
 ) : (
 <span className="text-muted-foreground">-</span>
 )}
 </TableCell>
 <TableCell>
 <span className="text-sm text-muted-foreground">
 {new Date(request.created_at!).toLocaleDateString()}
 </span>
 </TableCell>
 <TableCell>
 <div className="flex gap-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onViewRequest(request)}
 >
 <Eye className="h-3 w-3" />
 </Button>
 {request.status === 'draft' && (
 <>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEditRequest(request)}
 >
 <Edit className="h-3 w-3" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onSubmitRequest(request)}
 >
 <CheckCircle className="h-3 w-3" />
 </Button>
 </>
 )}
 {(request.status === 'draft' || request.status === 'rejected') && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDeleteRequest(request)}
 >
 <Trash2 className="h-3 w-3" />
 </Button>
 )}
 </div>
 </TableCell>
 </TableRow>
 ))
 )}
 </TableBody>
 </Table>
 </div>
 );
}
