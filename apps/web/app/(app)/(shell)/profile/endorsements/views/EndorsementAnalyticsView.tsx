'use client';

import { Award, TrendingUp, Users, Star, Shield, Eye, Calendar, BarChart3, PieChart, Activity } from "lucide-react";
import { Card, Badge, Progress } from '@ghxstship/ui';
import type { EndorsementStats, EndorsementAnalytics } from '../types';
import {
 RELATIONSHIP_LABELS,
 formatDate,
 formatRating,
} from '../types';

interface EndorsementAnalyticsViewProps {
 stats: EndorsementStats;
 analytics: EndorsementAnalytics;
 loading: boolean;
 analyticsLoading: boolean;
}

export default function EndorsementAnalyticsView({
 stats,
 analytics,
 loading,
 analyticsLoading,
}: EndorsementAnalyticsViewProps) {
 if (loading || analyticsLoading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 {[...Array(8)].map((_, i) => (
 <Card key={i} className="p-6">
 <div className="space-y-3">
 <div className="h-4 w-24 bg-muted animate-pulse rounded" />
 <div className="h-8 w-16 bg-muted animate-pulse rounded" />
 <div className="h-2 w-full bg-muted animate-pulse rounded" />
 </div>
 </Card>
 ))}
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {/* Key Metrics */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 <Card className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Total Endorsements</p>
 <p className="text-3xl font-bold mt-1">{stats.totalEndorsements}</p>
 </div>
 <Award className="h-8 w-8 text-primary opacity-20" />
 </div>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Average Rating</p>
 <div className="flex items-center gap-2 mt-1">
 <p className="text-3xl font-bold">{stats.averageRating}</p>
 <span className="text-yellow-500">{formatRating(Math.round(stats.averageRating))}</span>
 </div>
 </div>
 <Star className="h-8 w-8 text-yellow-500 opacity-20" />
 </div>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Verified</p>
 <p className="text-3xl font-bold mt-1">{stats.verifiedCount}</p>
 <p className="text-xs text-muted-foreground mt-1">
 {stats.totalEndorsements > 0 
 ? `${Math.round((stats.verifiedCount / stats.totalEndorsements) * 100)}%`
 : '0%'}
 </p>
 </div>
 <Shield className="h-8 w-8 text-green-500 opacity-20" />
 </div>
 </Card>

 <Card className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Public</p>
 <p className="text-3xl font-bold mt-1">{stats.publicCount}</p>
 <p className="text-xs text-muted-foreground mt-1">
 {stats.totalEndorsements > 0 
 ? `${Math.round((stats.publicCount / stats.totalEndorsements) * 100)}%`
 : '0%'}
 </p>
 </div>
 <Eye className="h-8 w-8 text-blue-500 opacity-20" />
 </div>
 </Card>
 </div>

 {/* Charts Row */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Rating Distribution */}
 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-semibold">Rating Distribution</h3>
 <BarChart3 className="h-4 w-4 text-muted-foreground" />
 </div>
 <div className="space-y-3">
 {[5, 4, 3, 2, 1].map((rating) => {
 const ratingData = stats.byRating.find(r => r.rating === rating);
 const count = ratingData?.count || 0;
 const percentage = stats.totalEndorsements > 0 
 ? (count / stats.totalEndorsements) * 100 
 : 0;
 
 return (
 <div key={rating} className="space-y-1">
 <div className="flex items-center justify-between text-sm">
 <span className="flex items-center gap-2">
 <span className="text-yellow-500">{formatRating(rating)}</span>
 <span className="text-muted-foreground">({rating} star)</span>
 </span>
 <span className="font-medium">{count}</span>
 </div>
 <Progress value={percentage} className="h-2" />
 </div>
 );
 })}
 </div>
 </Card>

 {/* Relationship Distribution */}
 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-semibold">Relationship Types</h3>
 <PieChart className="h-4 w-4 text-muted-foreground" />
 </div>
 <div className="space-y-3">
 {stats.byRelationship.map(({ relationship, count }) => {
 const percentage = stats.totalEndorsements > 0 
 ? (count / stats.totalEndorsements) * 100 
 : 0;
 
 return (
 <div key={relationship} className="space-y-1">
 <div className="flex items-center justify-between text-sm">
 <span>{RELATIONSHIP_LABELS[relationship]}</span>
 <span className="font-medium">{count}</span>
 </div>
 <Progress value={percentage} className="h-2" />
 </div>
 );
 })}
 </div>
 </Card>
 </div>

 {/* Top Skills */}
 {stats.topSkills.length > 0 && (
 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-semibold">Top Endorsed Skills</h3>
 <TrendingUp className="h-4 w-4 text-muted-foreground" />
 </div>
 <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
 {stats.topSkills.map(({ skill, count }, index) => (
 <div key={skill} className="flex items-center justify-between p-3 bg-muted rounded-lg">
 <div className="flex items-center gap-2">
 <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
 <div>
 <p className="font-medium text-sm">{skill}</p>
 <p className="text-xs text-muted-foreground">{count} endorsements</p>
 </div>
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Trends */}
 {analytics.endorsementTrends.length > 0 && (
 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-semibold">Endorsement Trends</h3>
 <Activity className="h-4 w-4 text-muted-foreground" />
 </div>
 <div className="space-y-2">
 {analytics.endorsementTrends.map(({ month, count, averageRating }) => (
 <div key={month} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
 <div className="flex items-center gap-4">
 <Calendar className="h-4 w-4 text-muted-foreground" />
 <span className="font-medium">
 {new Date(month + '-01').toLocaleDateString('en-US', { 
 year: 'numeric', 
 month: 'long' 
 })}
 </span>
 </div>
 <div className="flex items-center gap-4">
 <Badge variant="secondary">{count} endorsements</Badge>
 <span className="text-sm text-yellow-500">
 {formatRating(Math.round(averageRating))} ({averageRating})
 </span>
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Recent Endorsements */}
 {analytics.recentEndorsements.length > 0 && (
 <Card className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-semibold">Recent Endorsements</h3>
 <Users className="h-4 w-4 text-muted-foreground" />
 </div>
 <div className="space-y-3">
 {analytics.recentEndorsements.map((endorsement) => (
 <div key={endorsement.id} className="flex items-center justify-between p-3 border rounded-lg">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <p className="font-medium">{endorsement.endorser_name}</p>
 <Badge variant="outline" className="text-xs">
 {RELATIONSHIP_LABELS[endorsement.relationship]}
 </Badge>
 </div>
 <p className="text-sm text-muted-foreground line-clamp-1">
 {endorsement.endorsement_text}
 </p>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-yellow-500">{formatRating(endorsement.rating)}</span>
 <span className="text-xs text-muted-foreground">
 {formatDate(endorsement.date_received)}
 </span>
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Skill Cloud */}
 {analytics.skillCloud.length > 0 && (
 <Card className="p-6">
 <h3 className="font-semibold mb-4">Skill Cloud</h3>
 <div className="flex flex-wrap gap-2">
 {analytics.skillCloud.map(({ skill, frequency, weight }) => {
 const size = weight > 75 ? 'text-lg' : weight > 50 ? 'text-base' : weight > 25 ? 'text-sm' : 'text-xs';
 const opacity = weight > 75 ? 'opacity-100' : weight > 50 ? 'opacity-80' : weight > 25 ? 'opacity-60' : 'opacity-40';
 
 return (
 <Badge
 key={skill}
 variant="secondary"
 className={`${size} ${opacity} hover:opacity-100 transition-opacity`}
 >
 {skill} ({frequency})
 </Badge>
 );
 })}
 </div>
 </Card>
 )}

 {/* Summary Stats */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <Card className="p-4 bg-muted/50">
 <div className="flex items-center justify-between">
 <span className="text-sm text-muted-foreground">Verification Rate</span>
 <span className="font-semibold">{analytics.verificationRate}%</span>
 </div>
 </Card>
 <Card className="p-4 bg-muted/50">
 <div className="flex items-center justify-between">
 <span className="text-sm text-muted-foreground">Public Rate</span>
 <span className="font-semibold">{analytics.publicRate}%</span>
 </div>
 </Card>
 <Card className="p-4 bg-muted/50">
 <div className="flex items-center justify-between">
 <span className="text-sm text-muted-foreground">Featured Count</span>
 <span className="font-semibold">{stats.featuredCount}</span>
 </div>
 </Card>
 </div>
 </div>
 );
}
