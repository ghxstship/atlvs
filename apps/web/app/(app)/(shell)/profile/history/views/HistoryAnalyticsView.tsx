'use client';

import { TrendingUp, Calendar, Award, Target, Clock, BarChart3, PieChart, Activity, Briefcase, GraduationCap, Star, Heart, Building, MapPin } from "lucide-react";
import { useMemo } from 'react';
import {
 Card,
 Badge,
 Progress,
} from '@ghxstship/ui';
import type { HistoryEntry, HistoryEntryType } from '../types';

interface HistoryAnalyticsViewProps {
 entries: HistoryEntry[];
 loading?: boolean;
}

interface AnalyticsData {
 totalEntries: number;
 typeDistribution: { [key: string]: number };
 skillsFrequency: { [key: string]: number };
 yearlyActivity: { [key: string]: number };
 averageDuration: number;
 currentEntries: number;
 totalExperience: number;
 topSkills: string[];
 topOrganizations: { [key: string]: number };
 locationDistribution: { [key: string]: number };
 completionRate: number;
 growthTrend: 'up' | 'down' | 'stable';
}

const getEntryTypeIcon = (type: HistoryEntryType) => {
 const iconMap = {
 employment: Briefcase,
 education: GraduationCap,
 project: Star,
 achievement: Award,
 certification: Award,
 volunteer: Heart,
 internship: Briefcase,
 freelance: Briefcase,
 other: Activity,
 };
 return iconMap[type] || Activity;
};

const getEntryTypeColor = (type: HistoryEntryType) => {
 const colorMap = {
 employment: 'blue',
 education: 'green',
 project: 'purple',
 achievement: 'yellow',
 certification: 'orange',
 volunteer: 'red',
 internship: 'cyan',
 freelance: 'pink',
 other: 'gray',
 };
 return colorMap[type] || 'gray';
};

const calculateDurationInMonths = (startDate: string, endDate?: string | null, isCurrent?: boolean) => {
 const start = new Date(startDate);
 const end = isCurrent ? new Date() : (endDate ? new Date(endDate) : new Date(startDate));
 
 const diffTime = Math.abs(end.getTime() - start.getTime());
 return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)); // Convert to months
};

export default function HistoryAnalyticsView({
 entries,
 loading = false,
}: HistoryAnalyticsViewProps) {
 const analytics = useMemo((): AnalyticsData => {
 if (entries.length === 0) {
 return {
 totalEntries: 0,
 typeDistribution: {},
 skillsFrequency: {},
 yearlyActivity: {},
 averageDuration: 0,
 currentEntries: 0,
 totalExperience: 0,
 topSkills: [],
 topOrganizations: {},
 locationDistribution: {},
 completionRate: 0,
 growthTrend: 'stable',
 };
 }

 // Type distribution
 const typeDistribution: { [key: string]: number } = {};
 entries.forEach((entry) => {
 typeDistribution[entry.entry_type] = (typeDistribution[entry.entry_type] || 0) + 1;
 });

 // Skills frequency
 const skillsFrequency: { [key: string]: number } = {};
 entries.forEach((entry) => {
 entry.skills_gained.forEach((skill) => {
 skillsFrequency[skill] = (skillsFrequency[skill] || 0) + 1;
 });
 });

 // Yearly activity
 const yearlyActivity: { [key: string]: number } = {};
 entries.forEach((entry) => {
 const year = new Date(entry.start_date).getFullYear().toString();
 yearlyActivity[year] = (yearlyActivity[year] || 0) + 1;
 });

 // Duration calculations
 const durations = entries.map((entry) => 
 calculateDurationInMonths(entry.start_date, entry.end_date, entry.is_current)
 );
 const averageDuration = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
 const totalExperience = durations.reduce((sum, duration) => sum + duration, 0);

 // Current entries
 const currentEntries = entries.filter((entry) => entry.is_current).length;

 // Top skills (most frequent)
 const topSkills = Object.entries(skillsFrequency)
 .sort(([, a], [, b]) => b - a)
 .slice(0, 10)
 .map(([skill]) => skill);

 // Top organizations
 const topOrganizations: { [key: string]: number } = {};
 entries.forEach((entry) => {
 if (entry.organization) {
 topOrganizations[entry.organization] = (topOrganizations[entry.organization] || 0) + 1;
 }
 });

 // Location distribution
 const locationDistribution: { [key: string]: number } = {};
 entries.forEach((entry) => {
 if (entry.location) {
 locationDistribution[entry.location] = (locationDistribution[entry.location] || 0) + 1;
 }
 });

 // Completion rate (entries with description and skills)
 const completeEntries = entries.filter((entry) => 
 entry.description && entry.skills_gained.length > 0
 ).length;
 const completionRate = (completeEntries / entries.length) * 100;

 // Growth trend (based on yearly activity)
 const years = Object.keys(yearlyActivity).sort();
 const recentYears = years.slice(-3);
 let growthTrend: 'up' | 'down' | 'stable' = 'stable';
 
 if (recentYears.length >= 2) {
 const firstYear = yearlyActivity[recentYears[0]];
 const lastYear = yearlyActivity[recentYears[recentYears.length - 1]];
 
 if (lastYear > firstYear) {
 growthTrend = 'up';
 } else if (lastYear < firstYear) {
 growthTrend = 'down';
 }
 }

 return {
 totalEntries: entries.length,
 typeDistribution,
 skillsFrequency,
 yearlyActivity,
 averageDuration,
 currentEntries,
 totalExperience,
 topSkills,
 topOrganizations,
 locationDistribution,
 completionRate,
 growthTrend,
 };
 }, [entries]);

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
 {Array.from({ length: 9 }).map((_, i) => (
 <Card key={i} className="p-lg animate-pulse">
 <div className="h-icon-xs bg-muted rounded mb-sm" />
 <div className="h-icon-lg bg-muted rounded mb-sm" />
 <div className="h-3 bg-muted rounded w-3/4" />
 </Card>
 ))}
 </div>
 );
 }

 if (entries.length === 0) {
 return (
 <div className="flex flex-col items-center justify-center py-xl text-center">
 <BarChart3 className="h-icon-2xl w-icon-2xl text-muted-foreground mb-md" />
 <h3 className="text-lg font-semibold mb-sm">No Analytics Available</h3>
 <p className="text-muted-foreground mb-lg max-w-md">
 Add some history entries to see detailed analytics about your professional journey, skills, and growth patterns.
 </p>
 </div>
 );
 }

 const formatDuration = (months: number) => {
 const years = Math.floor(months / 12);
 const remainingMonths = months % 12;
 
 if (years > 0) {
 return remainingMonths > 0 
 ? `${years}y ${remainingMonths}m`
 : `${years}y`;
 }
 
 return `${months}m`;
 };

 return (
 <div className="space-y-lg">
 {/* Overview Stats */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Total Entries</p>
 <p className="text-2xl font-bold">{analytics.totalEntries}</p>
 </div>
 <Activity className="h-icon-lg w-icon-lg text-blue-500" />
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Current Roles</p>
 <p className="text-2xl font-bold">{analytics.currentEntries}</p>
 </div>
 <Clock className="h-icon-lg w-icon-lg text-green-500" />
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Total Experience</p>
 <p className="text-2xl font-bold">{formatDuration(analytics.totalExperience)}</p>
 </div>
 <Calendar className="h-icon-lg w-icon-lg text-purple-500" />
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Profile Completion</p>
 <p className="text-2xl font-bold">{Math.round(analytics.completionRate)}%</p>
 </div>
 <Target className="h-icon-lg w-icon-lg text-orange-500" />
 </div>
 </Card>
 </div>

 {/* Entry Type Distribution */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
 <Card className="p-lg">
 <div className="flex items-center gap-sm mb-lg">
 <PieChart className="h-icon-sm w-icon-sm" />
 <h3 className="text-lg font-semibold">Entry Type Distribution</h3>
 </div>
 
 <div className="space-y-md">
 {Object.entries(analytics.typeDistribution)
 .sort(([, a], [, b]) => b - a)
 .map(([type, count]) => {
 const Icon = getEntryTypeIcon(type as HistoryEntryType);
 const percentage = (count / analytics.totalEntries) * 100;
 
 return (
 <div key={type} className="space-y-sm">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <Icon className={`h-icon-xs w-icon-xs text-${getEntryTypeColor(type as HistoryEntryType)}-500`} />
 <span className="capitalize font-medium">
 {type.replace('_', ' ')}
 </span>
 </div>
 <div className="text-sm text-muted-foreground">
 {count} ({Math.round(percentage)}%)
 </div>
 </div>
 <Progress value={percentage} className="h-2" />
 </div>
 );
 })}
 </div>
 </Card>

 {/* Top Skills */}
 <Card className="p-lg">
 <div className="flex items-center gap-sm mb-lg">
 <Star className="h-icon-sm w-icon-sm" />
 <h3 className="text-lg font-semibold">Top Skills</h3>
 </div>
 
 <div className="space-y-md">
 {analytics.topSkills.slice(0, 8).map((skill) => {
 const count = analytics.skillsFrequency[skill];
 const percentage = (count / analytics.totalEntries) * 100;
 
 return (
 <div key={skill} className="space-y-sm">
 <div className="flex items-center justify-between">
 <span className="font-medium">{skill}</span>
 <div className="text-sm text-muted-foreground">
 {count} mention{count !== 1 ? 's' : ''}
 </div>
 </div>
 <Progress value={percentage} className="h-2" />
 </div>
 );
 })}
 </div>
 </Card>
 </div>

 {/* Yearly Activity & Organizations */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
 <Card className="p-lg">
 <div className="flex items-center gap-sm mb-lg">
 <BarChart3 className="h-icon-sm w-icon-sm" />
 <h3 className="text-lg font-semibold">Activity by Year</h3>
 <div className="ml-auto">
 <Badge 
 variant={analytics.growthTrend === 'up' ? 'default' : analytics.growthTrend === 'down' ? 'destructive' : 'secondary'}
 >
 <TrendingUp className="h-3 w-3 mr-xs" />
 {analytics.growthTrend === 'up' ? 'Growing' : analytics.growthTrend === 'down' ? 'Declining' : 'Stable'}
 </Badge>
 </div>
 </div>
 
 <div className="space-y-md">
 {Object.entries(analytics.yearlyActivity)
 .sort(([a], [b]) => parseInt(b) - parseInt(a))
 .slice(0, 6)
 .map(([year, count]) => {
 const maxCount = Math.max(...Object.values(analytics.yearlyActivity));
 const percentage = (count / maxCount) * 100;
 
 return (
 <div key={year} className="space-y-sm">
 <div className="flex items-center justify-between">
 <span className="font-medium">{year}</span>
 <div className="text-sm text-muted-foreground">
 {count} entr{count !== 1 ? 'ies' : 'y'}
 </div>
 </div>
 <Progress value={percentage} className="h-2" />
 </div>
 );
 })}
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center gap-sm mb-lg">
 <Building className="h-icon-sm w-icon-sm" />
 <h3 className="text-lg font-semibold">Top Organizations</h3>
 </div>
 
 <div className="space-y-md">
 {Object.entries(analytics.topOrganizations)
 .sort(([, a], [, b]) => b - a)
 .slice(0, 6)
 .map(([org, count]) => {
 const maxCount = Math.max(...Object.values(analytics.topOrganizations));
 const percentage = (count / maxCount) * 100;
 
 return (
 <div key={org} className="space-y-sm">
 <div className="flex items-center justify-between">
 <span className="font-medium">{org}</span>
 <div className="text-sm text-muted-foreground">
 {count} role{count !== 1 ? 's' : ''}
 </div>
 </div>
 <Progress value={percentage} className="h-2" />
 </div>
 );
 })}
 </div>
 </Card>
 </div>

 {/* Additional Insights */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
 <Card className="p-lg">
 <div className="flex items-center gap-sm mb-md">
 <Clock className="h-icon-sm w-icon-sm" />
 <h3 className="text-lg font-semibold">Duration Insights</h3>
 </div>
 
 <div className="space-y-sm text-sm">
 <div className="flex justify-between">
 <span className="text-muted-foreground">Average Duration:</span>
 <span className="font-medium">{formatDuration(Math.round(analytics.averageDuration))}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Longest Role:</span>
 <span className="font-medium">
 {formatDuration(Math.max(...entries.map(e => 
 calculateDurationInMonths(e.start_date, e.end_date, e.is_current)
 )))}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Shortest Role:</span>
 <span className="font-medium">
 {formatDuration(Math.min(...entries.map(e => 
 calculateDurationInMonths(e.start_date, e.end_date, e.is_current)
 )))}
 </span>
 </div>
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center gap-sm mb-md">
 <MapPin className="h-icon-sm w-icon-sm" />
 <h3 className="text-lg font-semibold">Location Insights</h3>
 </div>
 
 <div className="space-y-sm">
 {Object.entries(analytics.locationDistribution)
 .sort(([, a], [, b]) => b - a)
 .slice(0, 4)
 .map(([location, count]) => (
 <div key={location} className="flex justify-between text-sm">
 <span className="text-muted-foreground">{location}:</span>
 <span className="font-medium">{count}</span>
 </div>
 ))}
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center gap-sm mb-md">
 <Award className="h-icon-sm w-icon-sm" />
 <h3 className="text-lg font-semibold">Achievement Insights</h3>
 </div>
 
 <div className="space-y-sm text-sm">
 <div className="flex justify-between">
 <span className="text-muted-foreground">Total Achievements:</span>
 <span className="font-medium">
 {entries.reduce((sum, entry) => sum + entry.achievements.length, 0)}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Unique Skills:</span>
 <span className="font-medium">{analytics.topSkills.length}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Organizations:</span>
 <span className="font-medium">{Object.keys(analytics.topOrganizations).length}</span>
 </div>
 </div>
 </Card>
 </div>
 </div>
 );
}
