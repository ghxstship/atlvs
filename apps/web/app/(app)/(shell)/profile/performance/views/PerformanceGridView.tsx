'use client';

import { Star, Calendar, User, Eye, Edit, Trash2, Target, TrendingUp } from "lucide-react";
import {
 Card,
 Badge,
 Button,
 Checkbox,
} from '@ghxstship/ui';
import type { PerformanceReview } from '../types';
import {
 formatDateShort,
 getRatingLabel,
 getStatusBadgeVariant,
 REVIEW_TYPE_LABELS,
 REVIEW_STATUS_LABELS,
} from '../types';

interface PerformanceGridViewProps {
 reviews: PerformanceReview[];
 selectedIds: string[];
 onSelectItem: (id: string, selected: boolean) => void;
 onSelectAll: (selected: boolean) => void;
 onView: (review: PerformanceReview) => void;
 onEdit: (review: PerformanceReview) => void;
 onDelete: (review: PerformanceReview) => void;
 loading?: boolean;
}

export default function PerformanceGridView({
 reviews,
 selectedIds,
 onSelectItem,
 onSelectAll,
 onView,
 onEdit,
 onDelete,
 loading = false,
}: PerformanceGridViewProps) {
 const allSelected = reviews.length > 0 && selectedIds.length === reviews.length;
 const someSelected = selectedIds.length > 0 && selectedIds.length < reviews.length;

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
 {[...Array(6)].map((_, i) => (
 <Card key={i} className="p-lg">
 <div className="animate-pulse space-y-md">
 <div className="h-icon-xs bg-muted rounded w-3/4"></div>
 <div className="h-3 bg-muted rounded w-1/2"></div>
 <div className="h-component-lg bg-muted rounded"></div>
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (reviews.length === 0) {
 return (
 <Card className="p-xsxl text-center">
 <div className="flex flex-col items-center gap-md">
 <Star className="h-icon-2xl w-icon-2xl text-muted-foreground" />
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
 <div className="space-y-lg">
 {/* Header with bulk selection */}
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
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
 <div className="flex items-center gap-xs">
 <Button variant="outline" size="sm">
 Export Selected
 </Button>
 <Button variant="outline" size="sm">
 Bulk Actions
 </Button>
 </div>
 )}
 </div>
 </Card>

 {/* Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
 {reviews.map((review) => {
 const isSelected = selectedIds.includes(review.id);
 const rating = review.overall_rating ?? 0;

 return (
 <Card 
 key={review.id} 
 className={`p-lg hover:shadow-md transition-shadow ${
 isSelected ? 'ring-2 ring-primary' : ''
 }`}
 >
 <div className="space-y-md">
 {/* Header */}
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-xs">
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => onSelectItem(review.id, !!checked)}
 />
 <Badge variant={getStatusBadgeVariant(review.status)}>
 {REVIEW_STATUS_LABELS[review.status]}
 </Badge>
 </div>
 <div className="flex items-center gap-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(review)}
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(review)}
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(review)}
 >
 <Trash2 className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </div>

 {/* Title */}
 <div>
 <h3 className="font-semibold text-lg mb-1">
 {REVIEW_TYPE_LABELS[review.review_type]}
 </h3>
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Calendar className="h-icon-xs w-icon-xs" />
 {formatDateShort(review.review_period_start)} - {formatDateShort(review.review_period_end)}
 </div>
 </div>

 {/* Rating Display */}
 <div className="text-center py-md bg-muted/50 rounded-lg">
 <div className="text-3xl font-bold text-primary mb-1">
 {rating}/5
 </div>
 <div className="flex items-center justify-center gap-xs mb-2">
 {[...Array(5)].map((_, i) => (
 <Star
 key={i}
 className={`h-icon-xs w-icon-xs ${
 i < rating
 ? 'text-yellow-500 fill-yellow-500'
 : 'text-gray-300'
 }`}
 />
 ))}
 </div>
 <div className="text-sm text-muted-foreground">
 {getRatingLabel(rating)}
 </div>
 </div>

 {/* Key Metrics */}
 <div className="grid grid-cols-2 gap-md text-center">
 <div>
 <div className="flex items-center justify-center gap-xs mb-1">
 <Target className="h-icon-xs w-icon-xs text-blue-500" />
 <span className="text-sm font-medium">Goals</span>
 </div>
 <div className="text-lg font-semibold">
 {review.goals ? review.goals.length : 0}
 </div>
 </div>
 <div>
 <div className="flex items-center justify-center gap-xs mb-1">
 <TrendingUp className="h-icon-xs w-icon-xs text-green-500" />
 <span className="text-sm font-medium">Promotion</span>
 </div>
 <div className="text-lg font-semibold">
 {review.promotion_recommended ? 'Yes' : 'No'}
 </div>
 </div>
 </div>

 {/* Reviewer */}
 {review.reviewer_name && (
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <User className="h-icon-xs w-icon-xs" />
 <span>Reviewed by {review.reviewer_name}</span>
 </div>
 )}

 {/* Strengths Preview */}
 {review.strengths && (
 <div>
 <h4 className="font-medium text-sm mb-2">Key Strengths</h4>
 <p className="text-sm text-muted-foreground line-clamp-xs">
 {review.strengths}
 </p>
 </div>
 )}

 {/* Tags */}
 {review.tags && review.tags.length > 0 && (
 <div>
 <div className="flex flex-wrap gap-xs">
 {review.tags.slice(0, 3).map((tag) => (
 <Badge key={tag} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 {review.tags.length > 3 && (
 <Badge variant="outline" className="text-xs">
 +{review.tags.length - 3}
 </Badge>
 )}
 </div>
 </div>
 )}

 {/* Action Buttons */}
 <div className="flex gap-xs pt-2">
 <Button
 variant="outline"
 size="sm"
 className="flex-1"
 onClick={() => onView(review)}
 >
 View Details
 </Button>
 <Button
 variant="primary"
 size="sm"
 className="flex-1"
 onClick={() => onEdit(review)}
 >
 Edit Review
 </Button>
 </div>
 </div>
 </Card>
 );
 })}
 </div>
 </div>
 );
}
