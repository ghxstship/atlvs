'use client';

import { BarChart3, TrendingUp, Users, Calendar, DollarSign, Award, Clock, Target } from "lucide-react";
import { useMemo } from 'react';
import {
 Badge,
 Card,
 CardContent,
 CardHeader,
 CardTitle,
 Progress
} from '@ghxstship/ui';

import { STATUS_COLORS, CHART_COLORS } from '@ghxstship/config/tokens/chart-colors';
import type { ProgrammingWorkshop, WorkshopAnalytics } from '../types';

interface ProgrammingWorkshopsAnalyticsViewProps {
 workshops: ProgrammingWorkshop[];
 loading: boolean;
}

// Workshop-specific color mappings using design tokens
const CATEGORY_COLORS = {
 technical: CHART_COLORS.info,
 creative: CHART_COLORS.pink,
 business: CHART_COLORS.muted,
 leadership: CHART_COLORS.warning,
 production: CHART_COLORS.error,
 design: CHART_COLORS.purple,
 marketing: CHART_COLORS.success,
 finance: CHART_COLORS.success,
 legal: CHART_COLORS.muted,
 other: CHART_COLORS.muted
};

const SKILL_LEVEL_COLORS = {
 beginner: CHART_COLORS.success,
 intermediate: CHART_COLORS.warning,
 advanced: CHART_COLORS.error,
 expert: CHART_COLORS.error,
 all_levels: CHART_COLORS.muted
};

const FORMAT_COLORS = {
 in_person: CHART_COLORS.success,
 virtual: CHART_COLORS.info,
 hybrid: CHART_COLORS.warning
};

export default function ProgrammingWorkshopsAnalyticsView({
 workshops,
 loading
}: ProgrammingWorkshopsAnalyticsViewProps) {
 const analytics = useMemo((): WorkshopAnalytics => {
 const totalWorkshops = workshops.length;
 const activeWorkshops = workshops.filter(w => 
 ['open_registration', 'registration_closed', 'full', 'in_progress'].includes(w.status)
 ).length;
 const completedWorkshops = workshops.filter(w => w.status === 'completed').length;
 const cancelledWorkshops = workshops.filter(w => w.status === 'cancelled').length;

 const totalParticipants = workshops.reduce((sum, w) => sum + w.current_participants, 0);
 const averageParticipants = totalWorkshops > 0 ? totalParticipants / totalWorkshops : 0;

 // Calculate total revenue
 const totalRevenue = workshops.reduce((sum, w) => {
 if (w.price && w.current_participants > 0) {
 return sum + (w.price * w.current_participants);
 }
 return sum;
 }, 0);

 // Calculate average rating (mock data - would come from feedback)
 const averageRating = 4.2 + Math.random() * 0.6; // Mock rating between 4.2-4.8

 // Group by category
 const workshopsByCategory = workshops.reduce((acc, workshop) => {
 const existing = acc.find(item => item.category === workshop.category);
 if (existing) {
 existing.count++;
 } else {
 acc.push({ category: workshop.category, count: 1 });
 }
 return acc;
 }, [] as Array<{ category: unknown; count: number }>);

 // Group by status
 const workshopsByStatus = workshops.reduce((acc, workshop) => {
 const existing = acc.find(item => item.status === workshop.status);
 if (existing) {
 existing.count++;
 } else {
 acc.push({ status: workshop.status, count: 1 });
 }
 return acc;
 }, [] as Array<{ status: unknown; count: number }>);

 // Group by skill level
 const workshopsBySkillLevel = workshops.reduce((acc, workshop) => {
 const existing = acc.find(item => item.skill_level === workshop.skill_level);
 if (existing) {
 existing.count++;
 } else {
 acc.push({ skill_level: workshop.skill_level, count: 1 });
 }
 return acc;
 }, [] as Array<{ skill_level: unknown; count: number }>);

 // Group by format
 const workshopsByFormat = workshops.reduce((acc, workshop) => {
 const existing = acc.find(item => item.format === workshop.format);
 if (existing) {
 existing.count++;
 } else {
 acc.push({ format: workshop.format, count: 1 });
 }
 return acc;
 }, [] as Array<{ format: unknown; count: number }>);

 // Monthly trends (mock data - would come from historical data)
 const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
 const date = new Date();
 date.setMonth(date.getMonth() - (5 - i));
 const monthWorkshops = Math.floor(Math.random() * totalWorkshops * 0.3) + 1;
 return {
 month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
 workshops: monthWorkshops,
 participants: monthWorkshops * Math.floor(averageParticipants),
 revenue: monthWorkshops * (totalRevenue / totalWorkshops || 0)
 };
 });

 // Top instructors (mock data - would come from instructor analytics)
 const topInstructors = workshops
 .filter(w => w.primary_instructor)
 .reduce((acc, workshop) => {
 const instructor = workshop.primary_instructor!;
 const name = instructor.full_name ?? instructor.name ?? instructor.email ?? 'Unknown Instructor';
 const existing = acc.find(item => item.instructor === name);
 if (existing) {
 existing.workshops++;
 } else {
 acc.push({
 instructor: name,
 workshops: 1,
 rating: 4.0 + Math.random() * 1.0, // Mock rating
 });
 }
 return acc;
 }, [] as Array<{ instructor: string; workshops: number; rating: number }>)
 .sort((a, b) => b.workshops - a.workshops)
 .slice(0, 5);

 // Popular categories
 const popularCategories = workshopsByCategory
 .map(item => ({
 category: item.category,
 participants: workshops
 .filter(w => w.category === item.category)
 .reduce((sum, w) => sum + w.current_participants, 0),
 rating: 4.0 + Math.random() * 1.0, // Mock rating
 }))
 .sort((a, b) => b.participants - a.participants)
 .slice(0, 5);

 // Revenue by workshop
 const revenueByWorkshop = workshops
 .filter(w => w.price && w.current_participants > 0)
 .map(workshop => ({
 workshop: workshop.title,
 revenue: (workshop.price || 0) * workshop.current_participants,
 participants: workshop.current_participants
 }))
 .sort((a, b) => b.revenue - a.revenue)
 .slice(0, 5);

 return {
 totalWorkshops,
 activeWorkshops,
 completedWorkshops,
 cancelledWorkshops,
 totalParticipants,
 averageParticipants,
 totalRevenue,
 averageRating,
 workshopsByCategory: workshopsByCategory.sort((a, b) => b.count - a.count),
 workshopsByStatus: workshopsByStatus.sort((a, b) => b.count - a.count),
 workshopsBySkillLevel: workshopsBySkillLevel.sort((a, b) => b.count - a.count),
 workshopsByFormat: workshopsByFormat.sort((a, b) => b.count - a.count),
 monthlyTrends,
 topInstructors,
 popularCategories,
 revenueByWorkshop
 };
 }, [workshops]);

 if (loading) {
 return (
 <div className="space-y-lg">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
 {Array.from({ length: 4 }).map((_, index) => (
 <Card key={index} className="animate-pulse">
 <CardHeader>
 <div className="h-icon-xs bg-muted rounded w-3/4"></div>
 </CardHeader>
 <CardContent>
 <div className="h-icon-lg bg-muted rounded w-1/2"></div>
 </CardContent>
 </Card>
 ))}
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
 {Array.from({ length: 4 }).map((_, index) => (
 <Card key={index} className="animate-pulse">
 <CardHeader>
 <div className="h-icon-xs bg-muted rounded w-1/2"></div>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 {Array.from({ length: 3 }).map((_, itemIndex) => (
 <div key={itemIndex} className="h-3 bg-muted rounded"></div>
 ))}
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 );
 }

 if (workshops.length === 0) {
 return (
 <Card className="p-xl">
 <div className="text-center">
 <BarChart3 className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-4" />
 <h3 className="text-lg font-semibold">No data to analyze</h3>
 <p className="text-muted-foreground">
 Create some workshops to see analytics and insights.
 </p>
 </div>
 </Card>
 );
 }

 return (
 <div className="space-y-lg">
 {/* Key Metrics */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Total Workshops</CardTitle>
 <Calendar className="h-icon-xs w-icon-xs text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{analytics.totalWorkshops}</div>
 <p className="text-xs text-muted-foreground">
 {analytics.activeWorkshops} currently active
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
 <Users className="h-icon-xs w-icon-xs text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{analytics.totalParticipants}</div>
 <p className="text-xs text-muted-foreground">
 Avg. {analytics.averageParticipants.toFixed(1)} per workshop
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
 <DollarSign className="h-icon-xs w-icon-xs text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</div>
 <p className="text-xs text-muted-foreground">
 From paid workshops
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
 <Award className="h-icon-xs w-icon-xs text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</div>
 <div className="flex items-center mt-1">
 <div className="flex">
 {Array.from({ length: 5 }).map((_, i) => (
 <span key={i} className={`text-sm ${i < Math.floor(analytics.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}>
 ★
 </span>
 ))}
 </div>
 <span className="text-xs text-muted-foreground ml-1">out of 5</span>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Charts and Breakdowns */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
 {/* Status Breakdown */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <TrendingUp className="h-icon-sm w-icon-sm" />
 Status Breakdown
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 {analytics.workshopsByStatus.map((item) => {
 const percentage = (item.count / analytics.totalWorkshops) * 100;
 return (
 <div key={item.status} className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <div 
 className="w-3 h-3 rounded-full"
 style={{ backgroundColor: STATUS_COLORS[item.status] }}
 />
 <span className="text-sm capitalize">
 {item.status.replace('_', ' ')}
 </span>
 </div>
 <div className="flex items-center gap-xs">
 <span className="text-sm font-medium">{item.count}</span>
 <span className="text-xs text-muted-foreground">
 ({percentage.toFixed(1)}%)
 </span>
 </div>
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>

 {/* Category Distribution */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <Target className="h-icon-sm w-icon-sm" />
 Categories
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 {analytics.workshopsByCategory.map((item) => {
 const percentage = (item.count / analytics.totalWorkshops) * 100;
 return (
 <div key={item.category} className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <div 
 className="w-3 h-3 rounded-full"
 style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
 />
 <span className="text-sm capitalize">
 {item.category}
 </span>
 </div>
 <div className="flex items-center gap-xs">
 <span className="text-sm font-medium">{item.count}</span>
 <span className="text-xs text-muted-foreground">
 ({percentage.toFixed(1)}%)
 </span>
 </div>
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>

 {/* Skill Level Distribution */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <Award className="h-icon-sm w-icon-sm" />
 Skill Levels
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 {analytics.workshopsBySkillLevel.map((item) => {
 const percentage = (item.count / analytics.totalWorkshops) * 100;
 return (
 <div key={item.skill_level} className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <div 
 className="w-3 h-3 rounded-full"
 style={{ backgroundColor: SKILL_LEVEL_COLORS[item.skill_level] }}
 />
 <span className="text-sm capitalize">
 {item.skill_level.replace('_', ' ')}
 </span>
 </div>
 <div className="flex items-center gap-xs">
 <span className="text-sm font-medium">{item.count}</span>
 <span className="text-xs text-muted-foreground">
 ({percentage.toFixed(1)}%)
 </span>
 </div>
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>

 {/* Format Distribution */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <Clock className="h-icon-sm w-icon-sm" />
 Formats
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 {analytics.workshopsByFormat.map((item) => {
 const percentage = (item.count / analytics.totalWorkshops) * 100;
 return (
 <div key={item.format} className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <div 
 className="w-3 h-3 rounded-full"
 style={{ backgroundColor: FORMAT_COLORS[item.format] }}
 />
 <span className="text-sm capitalize">
 {item.format.replace('_', ' ')}
 </span>
 </div>
 <div className="flex items-center gap-xs">
 <span className="text-sm font-medium">{item.count}</span>
 <span className="text-xs text-muted-foreground">
 ({percentage.toFixed(1)}%)
 </span>
 </div>
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Monthly Trends */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <Calendar className="h-icon-sm w-icon-sm" />
 Monthly Trends
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-md">
 {analytics.monthlyTrends.map((item) => (
 <div key={item.month} className="space-y-xs">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium">{item.month}</span>
 <div className="flex items-center gap-md text-sm">
 <span>{item.workshops} workshops</span>
 <span>{item.participants} participants</span>
 <span className="text-muted-foreground">
 ${item.revenue.toLocaleString()} revenue
 </span>
 </div>
 </div>
 <Progress value={(item.workshops / analytics.totalWorkshops) * 100} className="h-2" />
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Top Performers */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
 {/* Top Instructors */}
 {analytics.topInstructors.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <Users className="h-icon-sm w-icon-sm" />
 Top Instructors
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 {analytics.topInstructors.map((item, index) => (
 <div key={item.instructor} className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <Badge variant="outline" className="text-xs">
 #{index + 1}
 </Badge>
 <span className="text-sm truncate">{item.instructor}</span>
 </div>
 <div className="flex items-center gap-xs text-sm">
 <span>{item.workshops} workshops</span>
 <span className="text-muted-foreground">
 ({item.rating.toFixed(1)}★)
 </span>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 )}

 {/* Popular Categories */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <TrendingUp className="h-icon-sm w-icon-sm" />
 Popular Categories
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 {analytics.popularCategories.map((item, index) => (
 <div key={item.category} className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <Badge variant="outline" className="text-xs">
 #{index + 1}
 </Badge>
 <span className="text-sm capitalize">{item.category}</span>
 </div>
 <div className="flex items-center gap-xs text-sm">
 <span>{item.participants} participants</span>
 <span className="text-muted-foreground">
 ({item.rating.toFixed(1)}★)
 </span>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Top Revenue Workshops */}
 {analytics.revenueByWorkshop.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <DollarSign className="h-icon-sm w-icon-sm" />
 Top Revenue
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 {analytics.revenueByWorkshop.map((item, index) => (
 <div key={item.workshop} className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <Badge variant="outline" className="text-xs">
 #{index + 1}
 </Badge>
 <span className="text-sm truncate">{item.workshop}</span>
 </div>
 <div className="flex items-center gap-xs text-sm">
 <span>${item.revenue.toLocaleString()}</span>
 <span className="text-muted-foreground">
 ({item.participants}p)
 </span>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 )}
 </div>
 </div>
 );
}
