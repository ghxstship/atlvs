'use client';

import { Star, ArrowUpDown, ArrowUp, ArrowDown, Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { useState } from 'react';
import {
 Card,
 Badge,
 Button,
 Checkbox,
} from '@ghxstship/ui';
import type { PerformanceReview, PerformanceSort } from '../types';
import {
 formatDateShort,
 getRatingLabel,
 getStatusBadgeVariant,
 REVIEW_TYPE_LABELS,
 REVIEW_STATUS_LABELS,
} from '../types';

interface PerformanceTableViewProps {
 reviews: PerformanceReview[];
 selectedIds: string[];
 sort: PerformanceSort;
 onSelectItem: (id: string, selected: boolean) => void;
 onSelectAll: (selected: boolean) => void;
 onSort: (sort: PerformanceSort) => void;
 onView: (review: PerformanceReview) => void;
 onEdit: (review: PerformanceReview) => void;
 onDelete: (review: PerformanceReview) => void;
 loading?: boolean;
}

type SortField = PerformanceSort['field'];

export default function PerformanceTableView({
 reviews,
 selectedIds,
 sort,
 onSelectItem,
 onSelectAll,
 onSort,
 onView,
 onEdit,
 onDelete,
 loading = false,
}: PerformanceTableViewProps) {
 const allSelected = reviews.length > 0 && selectedIds.length === reviews.length;
 const someSelected = selectedIds.length > 0 && selectedIds.length < reviews.length;

 const handleSort = (field: SortField) => {
 const direction = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
 onSort({ field, direction });
 };

 const getSortIcon = (field: SortField) => {
 if (sort.field !== field) {
 return <ArrowUpDown className="h-4 w-4" />;
 }
 return sort.direction === 'asc' ? 
 <ArrowUp className="h-4 w-4" /> : 
 <ArrowDown className="h-4 w-4" />;
 };

 if (loading) {
 return (
 <Card className="overflow-hidden">
 <div className="p-4">
 <div className="animate-pulse space-y-4">
 <div className="h-4 bg-muted rounded w-full"></div>
 {[...Array(5)].map((_, i) => (
 <div key={i} className="h-12 bg-muted rounded"></div>
 ))}
 </div>
 </div>
 </Card>
 );
 }

 if (reviews.length === 0) {
 return (
 <Card className="p-12 text-center">
 <div className="flex flex-col items-center gap-4">
 <Star className="h-12 w-12 text-muted-foreground" />
 <div>
 <h3 className="text-lg font-semibold">No Performance Reviews</h3>
 <p className="text-muted-foreground mt-2">
 No performance reviews found matching your criteria.
 </p>
 </div>
 </div>
 </Card>
 );
 }

 return (
 <Card className="overflow-hidden">
 {/* Header with bulk selection */}
 <div className="p-4 border-b">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <Checkbox
 checked={allSelected}
 indeterminate={someSelected}
 onCheckedChange={(checked) => onSelectAll(!!checked)}
 />
 <span className="text-sm text-muted-foreground">
 {selectedIds.length > 0 ? `${selectedIds.length} selected` : `${reviews.length} reviews`}
 </span>
 </div>
 {selectedIds.length > 0 && (
 <div className="flex items-center gap-2">
 <Button variant="outline" size="sm">
 Export Selected
 </Button>
 <Button variant="outline" size="sm">
 Bulk Actions
 </Button>
 </div>
 )}
 </div>
 </div>

 {/* Table */}
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="bg-muted/50">
 <tr>
 <th className="w-12 p-4">
 <Checkbox
 checked={allSelected}
 indeterminate={someSelected}
 onCheckedChange={(checked) => onSelectAll(!!checked)}
 />
 </th>
 <th className="text-left p-4 font-medium">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('review_period_start')}
 className="h-auto p-0 font-medium"
 >
 Review Period
 {getSortIcon('review_period_start')}
 </Button>
 </th>
 <th className="text-left p-4 font-medium">Type</th>
 <th className="text-left p-4 font-medium">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('status')}
 className="h-auto p-0 font-medium"
 >
 Status
 {getSortIcon('status')}
 </Button>
 </th>
 <th className="text-left p-4 font-medium">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('overall_rating')}
 className="h-auto p-0 font-medium"
 >
 Rating
 {getSortIcon('overall_rating')}
 </Button>
 </th>
 <th className="text-left p-4 font-medium">Reviewer</th>
 <th className="text-left p-4 font-medium">Goals</th>
 <th className="text-left p-4 font-medium">Promotion</th>
 <th className="text-left p-4 font-medium">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('created_at')}
 className="h-auto p-0 font-medium"
 >
 Created
 {getSortIcon('created_at')}
 </Button>
 </th>
 <th className="w-24 p-4 font-medium">Actions</th>
 </tr>
 </thead>
 <tbody>
 {reviews.map((review, index) => {
 const isSelected = selectedIds.includes(review.id);
 const rating = review.overall_rating ?? 0;

 return (
 <tr 
 key={review.id}
 className={`border-b hover:bg-muted/50 ${
 isSelected ? 'bg-primary/5' : ''
 } ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
 >
 <td className="p-4">
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => onSelectItem(review.id, !!checked)}
 />
 </td>
 <td className="p-4">
 <div className="font-medium">
 {formatDateShort(review.review_period_start)}
 </div>
 <div className="text-sm text-muted-foreground">
 to {formatDateShort(review.review_period_end)}
 </div>
 </td>
 <td className="p-4">
 <div className="font-medium">
 {REVIEW_TYPE_LABELS[review.review_type]}
 </div>
 </td>
 <td className="p-4">
 <Badge variant={getStatusBadgeVariant(review.status)}>
 {REVIEW_STATUS_LABELS[review.status]}
 </Badge>
 </td>
 <td className="p-4">
 <div className="flex items-center gap-2">
 <div className="flex items-center gap-1">
 {[...Array(5)].map((_, i) => (
 <Star
 key={i}
 className={`h-3 w-3 ${
 i < rating
 ? 'text-yellow-500 fill-yellow-500'
 : 'text-gray-300'
 }`}
 />
 ))}
 </div>
 <span className="text-sm font-medium">
 {rating}/5
 </span>
 </div>
 <div className="text-xs text-muted-foreground">
 {getRatingLabel(rating)}
 </div>
 </td>
 <td className="p-4">
 <div className="font-medium">
 {review.reviewer_name || 'Not assigned'}
 </div>
 </td>
 <td className="p-4">
 <div className="text-center">
 <div className="font-medium">
 {review.goals ? review.goals.length : 0}
 </div>
 <div className="text-xs text-muted-foreground">
 goals
 </div>
 </div>
 </td>
 <td className="p-4">
 <Badge variant={review.promotion_recommended ? 'default' : 'outline'}>
 {review.promotion_recommended ? 'Yes' : 'No'}
 </Badge>
 </td>
 <td className="p-4">
 <div className="text-sm">
 {formatDateShort(review.created_at)}
 </div>
 </td>
 <td className="p-4">
 <div className="flex items-center gap-1">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(review)}
 title="View"
 >
 <Eye className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(review)}
 title="Edit"
 >
 <Edit className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(review)}
 title="Delete"
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>

 {/* Footer */}
 <div className="p-4 border-t bg-muted/20">
 <div className="flex items-center justify-between text-sm text-muted-foreground">
 <div>
 Showing {reviews.length} performance reviews
 </div>
 <div className="flex items-center gap-2">
 <span>Rows per page: 50</span>
 <Button variant="outline" size="sm">
 Previous
 </Button>
 <Button variant="outline" size="sm">
 Next
 </Button>
 </div>
 </div>
 </div>
 </Card>
 );
}
