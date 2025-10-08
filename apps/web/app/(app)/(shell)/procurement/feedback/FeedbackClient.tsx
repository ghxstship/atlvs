'use client';

import { AlertCircle, BarChart3, CheckCircle, Clock, Filter, MessageSquare, Plus, Search, Send, Star, ThumbsDown, ThumbsUp, TrendingUp, Users } from 'lucide-react';
import React, { useState, useCallback, useState, useEffect } from 'react';
import { Badge, Button, Card, CardBody, CardContent, CardDescription, CardHeader, CardTitle, Input, Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from '@ghxstship/ui';

interface FeedbackClientProps {
 className?: string;
 orgId?: string;
}

interface FeedbackItem {
 id: string;
 type: 'vendor' | 'process' | 'system' | 'general';
 title: string;
 description: string;
 rating: number;
 sentiment: 'positive' | 'negative' | 'neutral';
 category: string;
 submittedBy: string;
 submittedAt: string;
 status: 'new' | 'reviewed' | 'in_progress' | 'resolved';
 tags: string[];
 upvotes: number;
 responses: number;
}

interface FeedbackSummary {
 totalFeedback: number;
 averageRating: number;
 sentimentBreakdown: {
 positive: number;
 negative: number;
 neutral: number;
 };
 topCategories: Array<{
 category: string;
 count: number;
 avgRating: number;
 }>;
}

export default function FeedbackClient({ className, orgId }: FeedbackClientProps) {
 const [loading, setLoading] = useState(false);
 const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
 const [summary, setSummary] = useState<FeedbackSummary | null>(null);
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedType, setSelectedType] = useState<string>('all');
 const [showNewFeedbackForm, setShowNewFeedbackForm] = useState(false);
 const [newFeedback, setNewFeedback] = useState({
 type: 'general' as const,
 title: '',
 description: '',
 rating: 5,
 category: 'general'
 });

 // eslint-disable-next-line react-hooks/exhaustive-deps
 useEffect(() => {
 loadFeedbackData();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [orgId]);

 async function loadFeedbackData() {
 setLoading(true);
 try {
 // In a real implementation, this would fetch from feedback API
 // For now, we'll use demo data
 
 const demoFeedback: FeedbackItem[] = [
 {
 id: '1',
 type: 'vendor',
 title: 'Excellent service from Tech Equipment Co.',
 description: 'Fast delivery, great communication, and high-quality products. Would definitely recommend for future camera equipment purchases.',
 rating: 5,
 sentiment: 'positive',
 category: 'vendor_performance',
 submittedBy: 'Captain Blackbeard',
 submittedAt: '2024-01-20T10:30:00Z',
 status: 'reviewed',
 tags: ['delivery', 'communication', 'quality'],
 upvotes: 8,
 responses: 2
 },
 {
 id: '2',
 type: 'process',
 title: 'Approval process is too slow',
 description: 'The multi-step approval process for equipment requests takes too long. We need a faster way to approve urgent requests.',
 rating: 2,
 sentiment: 'negative',
 category: 'approval_workflow',
 submittedBy: 'Quartermaster',
 submittedAt: '2024-01-18T14:15:00Z',
 status: 'in_progress',
 tags: ['approval', 'workflow', 'urgent'],
 upvotes: 12,
 responses: 5
 },
 {
 id: '3',
 type: 'system',
 title: 'Love the new tracking features',
 description: 'The real-time shipment tracking has been incredibly helpful. We can now see exactly where our orders are and plan accordingly.',
 rating: 5,
 sentiment: 'positive',
 category: 'system_features',
 submittedBy: 'Bosun',
 submittedAt: '2024-01-17T09:45:00Z',
 status: 'resolved',
 tags: ['tracking', 'features', 'planning'],
 upvotes: 6,
 responses: 1
 },
 {
 id: '4',
 type: 'vendor',
 title: 'Issues with West Marine delivery',
 description: 'Recent orders from West Marine have been consistently late. Need to address this with the vendor or find alternatives.',
 rating: 2,
 sentiment: 'negative',
 category: 'vendor_performance',
 submittedBy: 'First Mate',
 submittedAt: '2024-01-15T16:20:00Z',
 status: 'new',
 tags: ['delivery', 'delays', 'vendor_issues'],
 upvotes: 15,
 responses: 8
 },
 {
 id: '5',
 type: 'general',
 title: 'Great improvement in procurement efficiency',
 description: 'Overall, the new procurement system has significantly improved our efficiency. The unified dashboard is particularly helpful.',
 rating: 4,
 sentiment: 'positive',
 category: 'general_feedback',
 submittedBy: 'Ship Engineer',
 submittedAt: '2024-01-12T11:10:00Z',
 status: 'reviewed',
 tags: ['efficiency', 'dashboard', 'improvement'],
 upvotes: 4,
 responses: 0
 }
 ];

 const demoSummary: FeedbackSummary = {
 totalFeedback: 47,
 averageRating: 3.8,
 sentimentBreakdown: {
 positive: 28,
 negative: 12,
 neutral: 7
 },
 topCategories: [
 { category: 'Vendor Performance', count: 18, avgRating: 3.2 },
 { category: 'System Features', count: 12, avgRating: 4.1 },
 { category: 'Approval Workflow', count: 9, avgRating: 2.8 },
 { category: 'General Feedback', count: 8, avgRating: 4.3 }
 ]
 };

 setFeedback(demoFeedback);
 setSummary(demoSummary);
 
 } catch (error) {
 console.error('Error loading feedback data:', error);
 }
 setLoading(false);
 }

 const handleSubmitFeedback = async () => {
 try {
 // In a real implementation, this would submit to the API
 
 // Reset form and close
 setNewFeedback({
 type: 'general',
 title: '',
 description: '',
 rating: 5,
 category: 'general'
 });
 setShowNewFeedbackForm(false);
 
 // Reload data
 await loadFeedbackData();
 } catch (error) {
 console.error('Error submitting feedback:', error);
 }
 };

 const filteredFeedback = feedback.filter(item => {
 const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
 item.description.toLowerCase().includes(searchQuery.toLowerCase());
 const matchesType = selectedType === 'all' || item.type === selectedType;
 return matchesSearch && matchesType;
 });

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'new':
 return <AlertCircle className="h-icon-xs w-icon-xs text-blue-500" />;
 case 'in_progress':
 return <Clock className="h-icon-xs w-icon-xs text-yellow-500" />;
 case 'resolved':
 return <CheckCircle className="h-icon-xs w-icon-xs text-green-500" />;
 default:
 return <MessageSquare className="h-icon-xs w-icon-xs text-gray-500" />;
 }
 };

 const getSentimentColor = (sentiment: string) => {
 switch (sentiment) {
 case 'positive':
 return 'text-green-500';
 case 'negative':
 return 'text-red-500';
 default:
 return 'text-gray-500';
 }
 };

 const renderStars = (rating: number) => {
 return Array.from({ length: 5 }, (_, i) => (
 <Star
 key={i}
 className={`h-icon-xs w-icon-xs ${
 i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
 }`}
 />
 ));
 };

 return (
 <div className={className}>
 <div className="space-y-lg">
 {/* Summary Cards */}
 {summary && (
 <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
 <MessageSquare className="h-icon-xs w-icon-xs text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{summary.totalFeedback}</div>
 <p className="text-xs text-muted-foreground">
 Collected this month
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
 <Star className="h-icon-xs w-icon-xs text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{summary.averageRating}/5</div>
 <div className="flex items-center mt-1">
 {renderStars(Math.round(summary.averageRating))}
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Positive Sentiment</CardTitle>
 <ThumbsUp className="h-icon-xs w-icon-xs text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold text-green-500">
 {Math.round((summary.sentimentBreakdown.positive / summary.totalFeedback) * 100)}%
 </div>
 <p className="text-xs text-muted-foreground">
 {summary.sentimentBreakdown.positive} positive reviews
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
 <Users className="h-icon-xs w-icon-xs text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">73%</div>
 <p className="text-xs text-muted-foreground">
 Team engagement rate
 </p>
 </CardContent>
 </Card>
 </div>
 )}

 {/* Controls */}
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-xs">
 <div className="relative">
 <Search className="absolute left-2 top-xs.5 h-icon-xs w-icon-xs text-muted-foreground" />
 <Input
 placeholder="Search feedback..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-8 w-container-sm"
 />
 </div>
 <select
 value={selectedType}
 onChange={(e) => setSelectedType(e.target.value)}
 className="px-sm py-xs border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 >
 <option value="all">All Types</option>
 <option value="vendor">Vendor</option>
 <option value="process">Process</option>
 <option value="system">System</option>
 <option value="general">General</option>
 </select>
 </div>
 <Button onClick={() => setShowNewFeedbackForm(true)}>
 <Plus className="h-icon-xs w-icon-xs mr-2" />
 Add Feedback
 </Button>
 </div>

 {/* Feedback Tabs */}
 <Tabs defaultValue="feedback-list" className="space-y-md">
 <TabsList>
 <TabsTrigger value="feedback-list">
 <MessageSquare className="h-icon-xs w-icon-xs mr-2" />
 Feedback List
 </TabsTrigger>
 <TabsTrigger value="analytics">
 <BarChart3 className="h-icon-xs w-icon-xs mr-2" />
 Analytics
 </TabsTrigger>
 <TabsTrigger value="trends">
 <TrendingUp className="h-icon-xs w-icon-xs mr-2" />
 Trends
 </TabsTrigger>
 </TabsList>

 <TabsContent value="feedback-list" className="space-y-md">
 {filteredFeedback.map((item) => (
 <Card key={item.id}>
 <CardHeader>
 <div className="flex items-start justify-between">
 <div className="space-y-xs">
 <CardTitle className="text-lg">{item.title}</CardTitle>
 <div className="flex items-center space-x-md text-sm text-muted-foreground">
 <span>By {item.submittedBy}</span>
 <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
 <Badge variant="secondary" className="capitalize">
 {item.type}
 </Badge>
 </div>
 </div>
 <div className="flex items-center space-x-xs">
 {getStatusIcon(item.status)}
 <div className="flex items-center">
 {renderStars(item.rating)}
 </div>
 </div>
 </div>
 </CardHeader>
 <CardContent>
 <p className="text-muted-foreground mb-4">{item.description}</p>
 
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-md">
 <div className="flex items-center space-x-xs">
 <ThumbsUp className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="text-sm">{item.upvotes}</span>
 </div>
 <div className="flex items-center space-x-xs">
 <MessageSquare className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="text-sm">{item.responses}</span>
 </div>
 <div className="flex items-center space-x-xs">
 {item.tags.map((tag, index) => (
 <Badge key={index} variant="secondary" className="text-xs">
 {tag}
 </Badge>
 ))}
 </div>
 </div>
 
 <Badge 
 variant="secondary" 
 className={getSentimentColor(item.sentiment)}
 >
 {item.sentiment}
 </Badge>
 </div>
 </CardContent>
 </Card>
 ))}
 </TabsContent>

 <TabsContent value="analytics" className="space-y-md">
 {summary && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <Card>
 <CardHeader>
 <CardTitle>Top Categories</CardTitle>
 <CardDescription>
 Most common feedback categories
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 {summary.topCategories.map((category, index) => (
 <div key={index} className="flex items-center justify-between">
 <div>
 <div className="font-medium">{category.category}</div>
 <div className="text-sm text-muted-foreground">
 {category.count} items
 </div>
 </div>
 <div className="text-right">
 <div className="flex items-center">
 {renderStars(Math.round(category.avgRating))}
 </div>
 <div className="text-sm text-muted-foreground">
 {category.avgRating}/5
 </div>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle>Sentiment Analysis</CardTitle>
 <CardDescription>
 Overall sentiment breakdown
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-xs">
 <ThumbsUp className="h-icon-xs w-icon-xs text-green-500" />
 <span>Positive</span>
 </div>
 <span className="font-medium text-green-500">
 {summary.sentimentBreakdown.positive}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-xs">
 <ThumbsDown className="h-icon-xs w-icon-xs text-red-500" />
 <span>Negative</span>
 </div>
 <span className="font-medium text-red-500">
 {summary.sentimentBreakdown.negative}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-xs">
 <div className="h-icon-xs w-icon-xs rounded-full bg-gray-400" />
 <span>Neutral</span>
 </div>
 <span className="font-medium text-gray-500">
 {summary.sentimentBreakdown.neutral}
 </span>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 )}
 </TabsContent>

 <TabsContent value="trends" className="space-y-md">
 <Card>
 <CardHeader>
 <CardTitle>Feedback Trends</CardTitle>
 <CardDescription>
 Historical feedback patterns and insights
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="h-container-sm flex items-center justify-center text-muted-foreground">
 <div className="text-center">
 <TrendingUp className="h-icon-2xl w-icon-2xl mx-auto mb-4 opacity-50" />
 <p>Trend analysis and historical data</p>
 <p className="text-sm">Would integrate with analytics service</p>
 </div>
 </div>
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>

 {/* New Feedback Form Modal */}
 {showNewFeedbackForm && (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
 <Card className="w-full max-w-md mx-4">
 <CardHeader>
 <CardTitle>Submit Feedback</CardTitle>
 <CardDescription>
 Help us improve the procurement process
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-md">
 <div>
 <label className="text-sm font-medium">Type</label>
 <select
 value={newFeedback.type}
 onChange={(e) => setNewFeedback({
 ...newFeedback,
 type: e.target.value as unknown
 })}
 className="w-full mt-1 px-sm py-xs border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 >
 <option value="general">General</option>
 <option value="vendor">Vendor</option>
 <option value="process">Process</option>
 <option value="system">System</option>
 </select>
 </div>

 <div>
 <label className="text-sm font-medium">Title</label>
 <Input
 value={newFeedback.title}
 onChange={(e) => setNewFeedback({
 ...newFeedback,
 title: e.target.value
 })}
 placeholder="Brief summary of your feedback"
 className="mt-1"
 />
 </div>

 <div>
 <label className="text-sm font-medium">Description</label>
 <Textarea
 value={newFeedback.description}
 onChange={(e) => setNewFeedback({
 ...newFeedback,
 description: e.target.value
 })}
 placeholder="Detailed feedback..."
 className="mt-1"
 rows={4}
 />
 </div>

 <div>
 <label className="text-sm font-medium">Rating</label>
 <div className="flex items-center space-x-xs mt-1">
 {Array.from({ length: 5 }, (_, i) => (
 <button
 key={i}
 onClick={() => setNewFeedback({
 ...newFeedback,
 rating: i + 1
 })}
 className="focus:outline-none"
 >
 <Star
 className={`h-icon-md w-icon-md ${
 i < newFeedback.rating 
 ? 'text-yellow-400 fill-current' 
 : 'text-gray-300'
 }`}
 />
 </button>
 ))}
 </div>
 </div>

 <div className="flex justify-end space-x-xs pt-4">
 <Button
 variant="secondary"
 onClick={() => setShowNewFeedbackForm(false)}
 >
 Cancel
 </Button>
 <Button onClick={handleSubmitFeedback}>
 <Send className="h-icon-xs w-icon-xs mr-2" />
 Submit
 </Button>
 </div>
 </CardContent>
 </Card>
 </div>
 )}
 </div>
 </div>
 );
}
