'use client';

import { Star, Calendar, User, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { useState } from 'react';
import {
 Card,
 Badge,
 Button,
 Checkbox
} from '@ghxstship/ui';
import type { PerformanceReview } from '../types';
import {
 formatDate,
 getRatingLabel,
 getStatusBadgeVariant,
 REVIEW_TYPE_LABELS,
 REVIEW_STATUS_LABELS
} from '../types';

interface PerformanceListViewProps {
 reviews: PerformanceReview[];
 selectedIds: string[];
 onSelectItem: (id: string, selected: boolean) => void;
 onSelectAll: (selected: boolean) => void;
 onView: (review: PerformanceReview) => void;
 onEdit: (review: PerformanceReview) => void;
 onDelete: (review: PerformanceReview) => void;
 loading?: boolean;
}

export default function PerformanceListView({
 reviews,
 selectedIds,
 onSelectItem,
 onSelectAll,
 onView,
 onEdit,
 onDelete,
 loading = false
}: PerformanceListViewProps) {
 const [expandedIds, setExpandedIds] = useState<Set<string>(new Set());

 const toggleExpanded = (id: string) => {
 const newExpanded = new Set(expandedIds);
 if (newExpanded.has(id)) {
 newExpanded.delete(id);
 } else {
 newExpanded.add(id);
 }
 setExpandedIds(newExpanded);
 };

 const allSelected = reviews.length > 0 && selectedIds.length === reviews.length;
 const someSelected = selectedIds.length > 0 && selectedIds.length < reviews.length;

 if (loading) {
 return (
 <div className="space-y-md">
 {[...Array(3)].map((_, i) => (
 <Card key={i} className="p-md">
 <div className="animate-pulse">
 <div className="h-icon-xs bg-muted rounded w-3/4 mb-2"></div>
 <div className="h-3 bg-muted rounded w-1/2"></div>
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
 <div className="space-y-md">
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

 {/* Review List */}
 {reviews.map((review) => {
 const isSelected = selectedIds.includes(review.id);
 const isExpanded = expandedIds.has(review.id);
 const rating = review.overall_rating ?? 0;

 return (
 <Card key={review.id} className={`p-md ${isSelected ? 'ring-2 ring-primary' : ''}`}>
 <div className="space-y-md">
 {/* Header Row */}
 <div className="flex items-start justify-between">
 <div className="flex items-start gap-sm flex-1">
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => onSelectItem(review.id, !!checked)}
 />
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-xs mb-2">
 <h3 className="font-semibold text-lg">
 {REVIEW_TYPE_LABELS[review.review_type]} Review
 </h3>
 <Badge variant={getStatusBadgeVariant(review.status)}>
 {REVIEW_STATUS_LABELS[review.status]}
 </Badge>
 {review.promotion_recommended && (
 <Badge variant="secondary">Promotion Recommended</Badge>
 )}
 </div>
 
 <div className="flex items-center gap-md text-sm text-muted-foreground mb-2">
 <div className="flex items-center gap-xs">
 <Calendar className="h-icon-xs w-icon-xs" />
 {formatDate(review.review_period_start)} - {formatDate(review.review_period_end)}
 </div>
 {review.reviewer_name && (
 <div className="flex items-center gap-xs">
 <User className="h-icon-xs w-icon-xs" />
 {review.reviewer_name}
 </div>
 )}
 </div>

 {/* Rating */}
 <div className="flex items-center gap-xs">
 <div className="flex items-center gap-xs">
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
 <span className="text-sm font-medium">
 {rating}/5 - {getRatingLabel(rating)}
 </span>
 </div>
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center gap-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => toggleExpanded(review.id)}
 >
 {isExpanded ? 'Less' : 'More'}
 </Button>
 <div className="flex items-center">
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
 </div>

 {/* Expanded Content */}
 {isExpanded && (
 <div className="border-t pt-4 space-y-md">
 {/* Detailed Ratings */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
 {review.technical_skills_rating && (
 <div className="text-center">
 <div className="text-2xl font-bold text-primary">
 {review.technical_skills_rating}
 </div>
 <div className="text-xs text-muted-foreground">Technical Skills</div>
 </div>
 )}
 {review.communication_rating && (
 <div className="text-center">
 <div className="text-2xl font-bold text-primary">
 {review.communication_rating}
 </div>
 <div className="text-xs text-muted-foreground">Communication</div>
 </div>
 )}
 {review.teamwork_rating && (
 <div className="text-center">
 <div className="text-2xl font-bold text-primary">
 {review.teamwork_rating}
 </div>
 <div className="text-xs text-muted-foreground">Teamwork</div>
 </div>
 )}
 {review.leadership_rating && (
 <div className="text-center">
 <div className="text-2xl font-bold text-primary">
 {review.leadership_rating}
 </div>
 <div className="text-xs text-muted-foreground">Leadership</div>
 </div>
 )}
 </div>

 {/* Comments */}
 <div className="grid md:grid-cols-2 gap-md">
 {review.strengths && (
 <div>
 <h4 className="font-medium text-sm mb-2">Strengths</h4>
 <p className="text-sm text-muted-foreground bg-muted p-sm rounded">
 {review.strengths}
 </p>
 </div>
 )}
 {review.areas_for_improvement && (
 <div>
 <h4 className="font-medium text-sm mb-2">Areas for Improvement</h4>
 <p className="text-sm text-muted-foreground bg-muted p-sm rounded">
 {review.areas_for_improvement}
 </p>
 </div>
 )}
 </div>

 {/* Goals */}
 {review.goals && review.goals.length > 0 && (
 <div>
 <h4 className="font-medium text-sm mb-2">Goals ({review.goals.length})</h4>
 <div className="space-y-xs">
 {review.goals.slice(0, 3).map((goal) => (
 <div key={goal.id} className="flex items-center justify-between bg-muted p-xs rounded">
 <span className="text-sm">{goal.title}</span>
 <Badge variant="outline">{goal.status}</Badge>
 </div>
 ))}
 {review.goals.length > 3 && (
 <div className="text-xs text-muted-foreground">
 +{review.goals.length - 3} more goals
 </div>
 )}
 </div>
 </div>
 )}

 {/* Tags */}
 {review.tags && review.tags.length > 0 && (
 <div>
 <h4 className="font-medium text-sm mb-2">Tags</h4>
 <div className="flex flex-wrap gap-xs">
 {review.tags.map((tag) => (
 <Badge key={tag} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 </Card>
 );
 })}
 </div>
 );
}
