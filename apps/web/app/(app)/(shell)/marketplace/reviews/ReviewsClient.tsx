'use client';

import { Award, Calendar, Filter, Flag, MessageSquare, Plus, Search, Share, Star, ThumbsDown, ThumbsUp, TrendingUp, User } from "lucide-react";
import { useState, useEffect } from 'react';
import { 
 Card,
 Button,
 Badge,
 Input,
 Textarea,
 Avatar
} from '@ghxstship/ui';

interface ReviewsClientProps {
 orgId: string;
 userId: string;
}

interface Review {
 id: string;
 reviewer_id: string;
 reviewer_name: string;
 reviewer_avatar?: string;
 reviewee_id: string;
 reviewee_name: string;
 project_title?: string;
 rating: number;
 title: string;
 content: string;
 categories: {
 communication: number;
 quality: number;
 timeliness: number;
 professionalism: number;
 };
 helpful_count: number;
 created_at: string;
 response?: {
 content: string;
 created_at: string;
 };
 verified: boolean;
 type: 'received' | 'given';
}

export default function ReviewsClient({ orgId, userId }: ReviewsClientProps) {
 const [reviews, setReviews] = useState<Review[]>([]);
 const [loading, setLoading] = useState(true);
 const [filter, setFilter] = useState<'all' | 'received' | 'given'>('all');
 const [ratingFilter, setRatingFilter] = useState<number | null>(null);
 const [searchQuery, setSearchQuery] = useState('');
 const [showWriteReview, setShowWriteReview] = useState(false);
 const [stats, setStats] = useState({
 averageRating: 0,
 totalReviews: 0,
 fiveStars: 0,
 fourStars: 0,
 threeStars: 0,
 twoStars: 0,
 oneStars: 0
 });

 useEffect(() => {
 loadReviews();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [orgId]);

 const loadReviews = async () => {
 try {
 setLoading(true);
 
 // Mock review data - would integrate with real reviews API
 const mockReviews: Review[] = [
 {
 id: '1',
 reviewer_id: 'user1',
 reviewer_name: 'TechCorp Solutions',
 reviewer_avatar: '',
 reviewee_id: userId,
 reviewee_name: 'Your Organization',
 project_title: 'LED Wall System Rental',
 rating: 5,
 title: 'Excellent service and equipment quality',
 content: 'The LED wall system was exactly what we needed for our event. Setup was smooth, equipment worked flawlessly throughout the 3-day event, and the support team was very responsive.',
 categories: {
 communication: 5,
 quality: 5,
 timeliness: 4,
 professionalism: 5
 },
 helpful_count: 8,
 created_at: '2024-01-15T10:00:00Z',
 verified: true,
 type: 'received'
 },
 {
 id: '2',
 reviewer_id: userId,
 reviewer_name: 'Your Organization',
 reviewee_id: 'vendor1',
 reviewee_name: 'AudioPro Services',
 project_title: 'Corporate Event Sound Engineering',
 rating: 4,
 title: 'Professional sound engineering services',
 content: 'AudioPro delivered great sound quality for our corporate event. The team was professional and handled all technical aspects smoothly. Minor delay in setup but overall excellent work.',
 categories: {
 communication: 4,
 quality: 5,
 timeliness: 3,
 professionalism: 4
 },
 helpful_count: 3,
 created_at: '2024-01-12T14:30:00Z',
 response: {
 content: 'Thank you for the feedback! We apologize for the setup delay and have improved our processes since then.',
 created_at: '2024-01-13T09:00:00Z'
 },
 verified: true,
 type: 'given'
 },
 {
 id: '3',
 reviewer_id: 'user2',
 reviewer_name: 'LightMaster Inc',
 reviewee_id: userId,
 reviewee_name: 'Your Organization',
 project_title: 'Concert Series Lighting Contract',
 rating: 5,
 title: 'Outstanding collaboration and project management',
 content: 'Working with this team was a pleasure. Clear communication, well-defined requirements, and prompt payments. The concert series was a huge success thanks to their professional approach.',
 categories: {
 communication: 5,
 quality: 5,
 timeliness: 5,
 professionalism: 5
 },
 helpful_count: 12,
 created_at: '2024-01-10T16:45:00Z',
 verified: true,
 type: 'received'
 }
 ];

 setReviews(mockReviews);

 // Calculate stats
 const receivedReviews = mockReviews.filter(r => r.type === 'received');
 const totalReviews = receivedReviews.length;
 const avgRating = totalReviews > 0 
 ? receivedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
 : 0;

 const ratingDistribution = receivedReviews.reduce((acc, review) => {
 acc[review.rating] = (acc[review.rating] || 0) + 1;
 return acc;
 }, {} as Record<number, number>);

 setStats({
 averageRating: Math.round(avgRating * 10) / 10,
 totalReviews,
 fiveStars: ratingDistribution[5] || 0,
 fourStars: ratingDistribution[4] || 0,
 threeStars: ratingDistribution[3] || 0,
 twoStars: ratingDistribution[2] || 0,
 oneStars: ratingDistribution[1] || 0
 });
 } catch (error) {
 console.error('Error loading reviews:', error);
 } finally {
 setLoading(false);
 }
 };

 const filteredReviews = reviews.filter(review => {
 const matchesFilter = filter === 'all' || review.type === filter;
 const matchesRating = ratingFilter === null || review.rating === ratingFilter;
 const matchesSearch = review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
 review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
 review.reviewer_name.toLowerCase().includes(searchQuery.toLowerCase());
 return matchesFilter && matchesRating && matchesSearch;
 });

 const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
 return (
 <div className="flex items-center gap-xs">
 {[1, 2, 3, 4, 5].map((star) => (
 <Star
 key={star}
 className={`${size === 'sm' ? 'h-icon-xs w-icon-xs' : 'h-icon-sm w-icon-sm'} ${
 star <= rating ? 'fill-current color-warning' : 'color-muted'
 }`}
 />
 ))}
 </div>
 );
 };

 const renderCategoryRating = (label: string, rating: number) => (
 <div className="flex items-center justify-between">
 <span className="text-body-sm">{label}</span>
 <div className="flex items-center gap-xs">
 {renderStars(rating)}
 <span className="text-body-sm font-medium">{rating}</span>
 </div>
 </div>
 );

 return (
 <div className="stack-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-heading-2">Reviews & Ratings</h1>
 <p className="color-muted">Manage feedback and build your reputation</p>
 </div>
 <Button onClick={() => setShowWriteReview(true)}>
 <Plus className="h-icon-xs w-icon-xs mr-sm" />
 Write Review
 </Button>
 </div>

 {/* Stats Overview */}
 <div className="grid grid-cols-1 lg:grid-cols-4 gap-md">
 <Card className="p-md">
 <div className="text-center">
 <div className="flex items-center justify-center mb-sm">
 {renderStars(Math.round(stats.averageRating), 'md')}
 </div>
 <div className="text-heading-2 font-bold mb-xs">{stats.averageRating}</div>
 <p className="text-body-sm color-muted">{stats.totalReviews} reviews</p>
 </div>
 </Card>

 <Card className="p-md lg:col-span-2">
 <h3 className="text-heading-5 mb-sm">Rating Distribution</h3>
 <div className="stack-xs">
 {[5, 4, 3, 2, 1].map((rating) => {
 const count = stats[`${rating === 1 ? 'one' : rating === 2 ? 'two' : rating === 3 ? 'three' : rating === 4 ? 'four' : 'five'}Stars` as keyof typeof stats] as number;
 const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
 
 return (
 <div key={rating} className="flex items-center gap-sm">
 <span className="text-body-sm w-icon-lg">{rating}</span>
 <Star className="h-icon-xs w-icon-xs fill-current color-warning" />
 <div className="flex-1 bg-muted rounded-full h-2">
 <div 
 className="bg-warning rounded-full h-2 transition-all"
 style={{ width: `${percentage}%` }}
 />
 </div>
 <span className="text-body-sm w-icon-lg text-right">{count}</span>
 </div>
 );
 })}
 </div>
 </Card>

 <Card className="p-md">
 <div className="stack-sm">
 <div className="flex items-center justify-between">
 <span className="text-body-sm">Response Rate</span>
 <span className="text-body font-medium">95%</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-body-sm">Avg Response Time</span>
 <span className="text-body font-medium">2 hours</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-body-sm">Verified Reviews</span>
 <span className="text-body font-medium">100%</span>
 </div>
 </div>
 </Card>
 </div>

 {/* Filters and Reviews */}
 <Card className="p-md">
 <div className="flex items-center justify-between mb-md">
 <h3 className="text-heading-4">All Reviews</h3>
 <div className="flex items-center gap-sm">
 <Button variant="outline" size="sm">
 <Filter className="h-icon-xs w-icon-xs mr-xs" />
 Filter
 </Button>
 </div>
 </div>

 <div className="flex items-center gap-sm mb-md">
 <Input
 placeholder="Search reviews..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="flex-1"
 />
 <div className="flex items-center gap-sm">
 <Button
 variant={filter === 'all' ? 'default' : 'outline'}
 size="sm"
 onClick={() => setFilter('all')}
 >
 All
 </Button>
 <Button
 variant={filter === 'received' ? 'default' : 'outline'}
 size="sm"
 onClick={() => setFilter('received')}
 >
 Received
 </Button>
 <Button
 variant={filter === 'given' ? 'default' : 'outline'}
 size="sm"
 onClick={() => setFilter('given')}
 >
 Given
 </Button>
 </div>
 </div>

 <div className="stack-md">
 {filteredReviews.map((review) => (
 <Card key={review.id} className="p-md border">
 <div className="flex items-start justify-between mb-sm">
 <div className="flex items-center gap-sm">
 <Avatar className="h-icon-xl w-icon-xl">
 <div className="flex items-center justify-center h-full w-full bg-primary/10">
 <User className="h-icon-sm w-icon-sm color-primary" />
 </div>
 </Avatar>
 <div>
 <div className="flex items-center gap-sm mb-xs">
 <h4 className="text-body font-medium">{review.reviewer_name}</h4>
 {review.verified && (
 <Badge variant="success" size="sm">
 <Award className="h-3 w-3 mr-xs" />
 Verified
 </Badge>
 )}
 <Badge variant={review.type === 'received' ? 'secondary' : 'outline'} size="sm">
 {review.type === 'received' ? 'Received' : 'Given'}
 </Badge>
 </div>
 <div className="flex items-center gap-sm">
 {renderStars(review.rating)}
 <span className="text-body-sm color-muted">
 {new Date(review.created_at).toLocaleDateString()}
 </span>
 {review.project_title && (
 <span className="text-body-sm color-muted">
 • {review.project_title}
 </span>
 )}
 </div>
 </div>
 </div>
 <Button variant="ghost" size="sm">
 <Flag className="h-icon-xs w-icon-xs" />
 </Button>
 </div>

 <h3 className="text-body font-medium mb-sm">{review.title}</h3>
 <p className="text-body-sm mb-md">{review.content}</p>

 {/* Category Ratings */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-md mb-md p-sm bg-muted/50 rounded">
 {renderCategoryRating('Communication', review.categories.communication)}
 {renderCategoryRating('Quality', review.categories.quality)}
 {renderCategoryRating('Timeliness', review.categories.timeliness)}
 {renderCategoryRating('Professionalism', review.categories.professionalism)}
 </div>

 {/* Response */}
 {review.response && (
 <div className="p-sm bg-primary/5 rounded mb-sm">
 <div className="flex items-center gap-sm mb-xs">
 <MessageSquare className="h-icon-xs w-icon-xs color-primary" />
 <span className="text-body-sm font-medium">Response from {review.reviewee_name}</span>
 <span className="text-body-sm color-muted">
 {new Date(review.response.created_at).toLocaleDateString()}
 </span>
 </div>
 <p className="text-body-sm">{review.response.content}</p>
 </div>
 )}

 {/* Actions */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <Button variant="ghost" size="sm">
 <ThumbsUp className="h-icon-xs w-icon-xs mr-xs" />
 Helpful ({review.helpful_count})
 </Button>
 {review.type === 'received' && !review.response && (
 <Button variant="outline" size="sm">
 <MessageSquare className="h-icon-xs w-icon-xs mr-xs" />
 Respond
 </Button>
 )}
 </div>
 <Button variant="ghost" size="sm">
 Share
 </Button>
 </div>
 </Card>
 ))}
 </div>
 </Card>
 </div>
 );
}
