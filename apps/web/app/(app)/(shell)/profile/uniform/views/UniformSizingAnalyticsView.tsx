'use client';

import { TrendingUp, TrendingDown, Users, Ruler, Shirt, Calendar, BarChart3, PieChart, Activity } from "lucide-react";
import { useState } from 'react';
import { 
 Card, 
 Badge, 
 Button, 
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue
} from '@ghxstship/ui';
import type { UniformSizing, UniformSizingStats, UniformSizingAnalytics, RecentActivity } from '../types';
import { SIZE_CATEGORIES, EQUIPMENT_TYPES } from '../types';

interface UniformSizingAnalyticsViewProps {
 sizings: UniformSizing[];
 stats: UniformSizingStats;
 analytics: UniformSizingAnalytics;
 recentActivity: RecentActivity[];
 loading: boolean;
}

export default function UniformSizingAnalyticsView({
 sizings,
 stats,
 analytics,
 recentActivity,
 loading,
}: UniformSizingAnalyticsViewProps) {
 const [selectedPeriod, setSelectedPeriod] = useState('30d');

 if (loading) {
 return (
 <div className="space-y-lg">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
 {[...Array(4)].map((_, i) => (
 <Card key={i} className="p-lg">
 <div className="animate-pulse space-y-sm">
 <div className="h-4 bg-muted rounded w-1/2"></div>
 <div className="h-8 bg-muted rounded w-3/4"></div>
 <div className="h-3 bg-muted rounded w-1/3"></div>
 </div>
 </Card>
 ))}
 </div>
 
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
 {[...Array(4)].map((_, i) => (
 <Card key={i} className="p-lg">
 <div className="animate-pulse space-y-md">
 <div className="h-6 bg-muted rounded w-1/3"></div>
 <div className="h-40 bg-muted rounded"></div>
 </div>
 </Card>
 ))}
 </div>
 </div>
 );
 }

 // Calculate size distribution
 const sizeDistribution = SIZE_CATEGORIES.reduce((acc, category) => {
 acc[category] = sizings.filter(s => s.size_category === category).length;
 return acc;
 }, {} as Record<string, number>);

 // Calculate completeness distribution
 const completenessRanges = [
 { label: '0-25%', min: 0, max: 25 },
 { label: '26-50%', min: 26, max: 50 },
 { label: '51-75%', min: 51, max: 75 },
 { label: '76-100%', min: 76, max: 100 },
 ];

 const completenessDistribution = completenessRanges.map(range => ({
 ...range,
 count: sizings.filter(s => {
 const completeness = calculateCompleteness(s);
 return completeness >= range.min && completeness <= range.max;
 }).length
 }));

 // Calculate average measurements by category
 const measurementsByCategory = SIZE_CATEGORIES.map(category => {
 const categoryData = sizings.filter(s => s.size_category === category);
 if (categoryData.length === 0) return { category, avgHeight: 0, avgWeight: 0, count: 0 };
 
 const avgHeight = categoryData.reduce((sum, s) => sum + (s.height || 0), 0) / categoryData.length;
 const avgWeight = categoryData.reduce((sum, s) => sum + (s.weight || 0), 0) / categoryData.length;
 
 return {
 category,
 avgHeight: Math.round(avgHeight),
 avgWeight: Math.round(avgWeight),
 count: categoryData.length
 };
 }).filter(item => item.count > 0);

 function calculateCompleteness(sizing: UniformSizing): number {
 const fields = [
 sizing.height, sizing.weight, sizing.chest, sizing.waist,
 sizing.shirt_size, sizing.pants_size, sizing.shoe_size, sizing.hat_size
 ];
 const filledFields = fields.filter(field => field !== null && field !== undefined).length;
 return Math.round((filledFields / fields.length) * 100);
 }

 return (
 <div className="space-y-lg">
 {/* Period Selector */}
 <div className="flex items-center justify-between">
 <h2 className="text-xl font-semibold">Uniform Sizing Analytics</h2>
 <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
 <SelectTrigger className="w-32">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="7d">7 Days</SelectItem>
 <SelectItem value="30d">30 Days</SelectItem>
 <SelectItem value="90d">90 Days</SelectItem>
 <SelectItem value="1y">1 Year</SelectItem>
 </SelectContent>
 </Select>
 </div>

 {/* Key Metrics */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Total Records</p>
 <p className="text-2xl font-bold">{stats.total_records}</p>
 <p className="text-xs text-green-600 flex items-center mt-xs">
 <TrendingUp className="h-3 w-3 mr-xs" />
 +{analytics.records_added_this_period} this period
 </p>
 </div>
 <Users className="h-8 w-8 text-primary" />
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Avg Completeness</p>
 <p className="text-2xl font-bold">{stats.average_completeness}%</p>
 <p className="text-xs text-muted-foreground mt-xs">
 {stats.complete_records} fully complete
 </p>
 </div>
 <BarChart3 className="h-8 w-8 text-primary" />
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Most Common Size</p>
 <p className="text-2xl font-bold">{stats.most_common_size_category}</p>
 <p className="text-xs text-muted-foreground mt-xs">
 {sizeDistribution[stats.most_common_size_category]} people
 </p>
 </div>
 <Shirt className="h-8 w-8 text-primary" />
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Recent Updates</p>
 <p className="text-2xl font-bold">{analytics.updates_this_period}</p>
 <p className="text-xs text-muted-foreground mt-xs">
 Last 30 days
 </p>
 </div>
 <Activity className="h-8 w-8 text-primary" />
 </div>
 </Card>
 </div>

 {/* Charts and Analysis */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
 {/* Size Category Distribution */}
 <Card className="p-lg">
 <div className="flex items-center justify-between mb-md">
 <h3 className="text-lg font-semibold">Size Category Distribution</h3>
 <PieChart className="h-5 w-5 text-muted-foreground" />
 </div>
 
 <div className="space-y-sm">
 {Object.entries(sizeDistribution).map(([category, count]) => {
 const percentage = stats.total_records > 0 ? (count / stats.total_records * 100).toFixed(1) : '0';
 return (
 <div key={category} className="flex items-center justify-between">
 <div className="flex items-center space-x-sm">
 <div className="w-3 h-3 rounded-full bg-primary"></div>
 <span className="text-sm font-medium capitalize">{category}</span>
 </div>
 <div className="flex items-center space-x-sm">
 <span className="text-sm text-muted-foreground">{count}</span>
 <Badge variant="secondary" className="text-xs">
 {percentage}%
 </Badge>
 </div>
 </div>
 );
 })}
 </div>
 </Card>

 {/* Completeness Distribution */}
 <Card className="p-lg">
 <div className="flex items-center justify-between mb-md">
 <h3 className="text-lg font-semibold">Profile Completeness</h3>
 <BarChart3 className="h-5 w-5 text-muted-foreground" />
 </div>
 
 <div className="space-y-sm">
 {completenessDistribution.map((range) => {
 const percentage = stats.total_records > 0 ? (range.count / stats.total_records * 100).toFixed(1) : '0';
 return (
 <div key={range.label} className="flex items-center justify-between">
 <div className="flex items-center space-x-sm">
 <div className={`w-3 h-3 rounded-full ${
 range.label === '76-100%' ? 'bg-green-500' :
 range.label === '51-75%' ? 'bg-yellow-500' :
 range.label === '26-50%' ? 'bg-orange-500' : 'bg-red-500'
 }`}></div>
 <span className="text-sm font-medium">{range.label}</span>
 </div>
 <div className="flex items-center space-x-sm">
 <span className="text-sm text-muted-foreground">{range.count}</span>
 <Badge variant="secondary" className="text-xs">
 {percentage}%
 </Badge>
 </div>
 </div>
 );
 })}
 </div>
 </Card>

 {/* Average Measurements by Category */}
 <Card className="p-lg">
 <div className="flex items-center justify-between mb-md">
 <h3 className="text-lg font-semibold">Avg Measurements by Size</h3>
 <Ruler className="h-5 w-5 text-muted-foreground" />
 </div>
 
 <div className="space-y-md">
 {measurementsByCategory.map((item) => (
 <div key={item.category} className="border rounded-lg p-sm">
 <div className="flex items-center justify-between mb-xs">
 <span className="font-medium capitalize">{item.category}</span>
 <Badge variant="outline" className="text-xs">
 {item.count} people
 </Badge>
 </div>
 <div className="grid grid-cols-2 gap-sm text-sm">
 <div className="flex justify-between">
 <span className="text-muted-foreground">Height:</span>
 <span>{item.avgHeight > 0 ? `${Math.floor(item.avgHeight / 12)}'${item.avgHeight % 12}"` : 'N/A'}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Weight:</span>
 <span>{item.avgWeight > 0 ? `${item.avgWeight} lbs` : 'N/A'}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </Card>

 {/* Recent Activity */}
 <Card className="p-lg">
 <div className="flex items-center justify-between mb-md">
 <h3 className="text-lg font-semibold">Recent Activity</h3>
 <Calendar className="h-5 w-5 text-muted-foreground" />
 </div>
 
 <div className="space-y-sm max-h-80 overflow-y-auto">
 {recentActivity.length > 0 ? (
 recentActivity.map((activity, index) => (
 <div key={index} className="flex items-start space-x-sm p-sm border rounded">
 <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium">{activity.description}</p>
 <p className="text-xs text-muted-foreground">
 {new Date(activity.timestamp).toLocaleString()}
 </p>
 </div>
 </div>
 ))
 ) : (
 <div className="text-center py-lg">
 <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-sm" />
 <p className="text-sm text-muted-foreground">No recent activity</p>
 </div>
 )}
 </div>
 </Card>
 </div>
 </div>
 );
}
