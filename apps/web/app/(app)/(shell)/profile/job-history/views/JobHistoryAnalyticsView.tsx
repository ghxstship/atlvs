'use client';

import { TrendingUp, Calendar, Award, Target, Clock, BarChart3, PieChart, Activity, Briefcase, Building, MapPin, DollarSign, Users } from "lucide-react";
import { useMemo } from 'react';
import {
 Card,
 Badge,
 Progress
} from '@ghxstship/ui';
import type { JobHistoryEntry, EmploymentType, CompanySize } from '../types';

interface JobHistoryAnalyticsViewProps {
 entries: JobHistoryEntry[];
 loading?: boolean;
}

interface AnalyticsData {
 totalPositions: number;
 employmentTypeDistribution: { [key: string]: number };
 skillsFrequency: { [key: string]: number };
 yearlyActivity: { [key: string]: number };
 averageTenure: number;
 currentPositions: number;
 totalExperience: number;
 topSkills: string[];
 topCompanies: { [key: string]: number };
 locationDistribution: { [key: string]: number };
 industryDistribution: { [key: string]: number };
 companySizeDistribution: { [key: string]: number };
 completionRate: number;
 growthTrend: 'up' | 'down' | 'stable';
 careerProgression: number;
}

const getEmploymentTypeColor = (type: EmploymentType) => {
 const colorMap = {
 full_time: 'blue',
 part_time: 'green',
 contract: 'purple',
 freelance: 'pink',
 internship: 'cyan',
 temporary: 'orange',
 consultant: 'yellow'
 };
 return colorMap[type] || 'gray';
};

const calculateTenureInMonths = (startDate: string, endDate?: string | null, isCurrent?: boolean) => {
 const start = new Date(startDate);
 const end = isCurrent ? new Date() : (endDate ? new Date(endDate) : new Date(startDate));
 
 const diffTime = Math.abs(end.getTime() - start.getTime());
 return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)); // Convert to months
};

export default function JobHistoryAnalyticsView({
 entries,
 loading = false
}: JobHistoryAnalyticsViewProps) {
 const analytics = useMemo((): AnalyticsData => {
 if (entries.length === 0) {
 return {
 totalPositions: 0,
 employmentTypeDistribution: {},
 skillsFrequency: {},
 yearlyActivity: {},
 averageTenure: 0,
 currentPositions: 0,
 totalExperience: 0,
 topSkills: [],
 topCompanies: {},
 locationDistribution: {},
 industryDistribution: {},
 companySizeDistribution: {},
 completionRate: 0,
 growthTrend: 'stable',
 careerProgression: 0
 };
 }

 // Employment type distribution
 const employmentTypeDistribution: { [key: string]: number } = {};
 entries.forEach((entry) => {
 employmentTypeDistribution[entry.employment_type] = (employmentTypeDistribution[entry.employment_type] || 0) + 1;
 });

 // Skills frequency
 const skillsFrequency: { [key: string]: number } = {};
 entries.forEach((entry) => {
 entry.skills_used.forEach((skill) => {
 skillsFrequency[skill] = (skillsFrequency[skill] || 0) + 1;
 });
 });

 // Yearly activity
 const yearlyActivity: { [key: string]: number } = {};
 entries.forEach((entry) => {
 const year = new Date(entry.start_date).getFullYear().toString();
 yearlyActivity[year] = (yearlyActivity[year] || 0) + 1;
 });

 // Tenure calculations
 const tenures = entries.map((entry) => 
 calculateTenureInMonths(entry.start_date, entry.end_date, entry.is_current)
 );
 const averageTenure = tenures.reduce((sum, tenure) => sum + tenure, 0) / tenures.length;
 const totalExperience = tenures.reduce((sum, tenure) => sum + tenure, 0);

 // Current positions
 const currentPositions = entries.filter((entry) => entry.is_current).length;

 // Top skills (most frequent)
 const topSkills = Object.entries(skillsFrequency)
 .sort(([, a], [, b]) => b - a)
 .slice(0, 10)
 .map(([skill]) => skill);

 // Top companies
 const topCompanies: { [key: string]: number } = {};
 entries.forEach((entry) => {
 topCompanies[entry.company_name] = (topCompanies[entry.company_name] || 0) + 1;
 });

 // Location distribution
 const locationDistribution: { [key: string]: number } = {};
 entries.forEach((entry) => {
 if (entry.location) {
 locationDistribution[entry.location] = (locationDistribution[entry.location] || 0) + 1;
 }
 });

 // Industry distribution
 const industryDistribution: { [key: string]: number } = {};
 entries.forEach((entry) => {
 if (entry.industry) {
 industryDistribution[entry.industry] = (industryDistribution[entry.industry] || 0) + 1;
 }
 });

 // Company size distribution
 const companySizeDistribution: { [key: string]: number } = {};
 entries.forEach((entry) => {
 if (entry.company_size) {
 companySizeDistribution[entry.company_size] = (companySizeDistribution[entry.company_size] || 0) + 1;
 }
 });

 // Completion rate (entries with description, skills, and achievements)
 const completeEntries = entries.filter((entry) => 
 entry.description && 
 entry.skills_used.length > 0 && 
 entry.responsibilities.length > 0
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

 // Career progression (based on company sizes and employment types)
 const progressionScore = entries.reduce((score, entry, index) => {
 let entryScore = 0;
 
 // Company size progression
 const sizeScores = { startup: 1, small: 2, medium: 3, large: 4, enterprise: 5 };
 if (entry.company_size) {
 entryScore += sizeScores[entry.company_size] * 10;
 }
 
 // Employment type progression
 const typeScores = { internship: 1, temporary: 2, part_time: 3, contract: 4, freelance: 5, consultant: 6, full_time: 7 };
 entryScore += typeScores[entry.employment_type] * 5;
 
 // Recency bonus (more recent positions weighted higher)
 const recencyBonus = (entries.length - index) * 2;
 entryScore += recencyBonus;
 
 return score + entryScore;
 }, 0);
 
 const careerProgression = Math.min(100, (progressionScore / (entries.length * 100)) * 100);

 return {
 totalPositions: entries.length,
 employmentTypeDistribution,
 skillsFrequency,
 yearlyActivity,
 averageTenure,
 currentPositions,
 totalExperience,
 topSkills,
 topCompanies,
 locationDistribution,
 industryDistribution,
 companySizeDistribution,
 completionRate,
 growthTrend,
 careerProgression
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
 Add some job history entries to see detailed analytics about your career journey, skills progression, and professional growth patterns.
 </p>
 </div>
 );
 }

 const formatTenure = (months: number) => {
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
 <p className="text-sm text-muted-foreground">Total Positions</p>
 <p className="text-2xl font-bold">{analytics.totalPositions}</p>
 </div>
 <Briefcase className="h-icon-lg w-icon-lg text-blue-500" />
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Current Roles</p>
 <p className="text-2xl font-bold">{analytics.currentPositions}</p>
 </div>
 <Clock className="h-icon-lg w-icon-lg text-green-500" />
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Total Experience</p>
 <p className="text-2xl font-bold">{formatTenure(analytics.totalExperience)}</p>
 </div>
 <Calendar className="h-icon-lg w-icon-lg text-purple-500" />
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Career Progression</p>
 <p className="text-2xl font-bold">{Math.round(analytics.careerProgression)}%</p>
 </div>
 <TrendingUp className="h-icon-lg w-icon-lg text-orange-500" />
 </div>
 </Card>
 </div>

 {/* Employment Type Distribution & Top Skills */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
 <Card className="p-lg">
 <div className="flex items-center gap-sm mb-lg">
 <PieChart className="h-icon-sm w-icon-sm" />
 <h3 className="text-lg font-semibold">Employment Type Distribution</h3>
 </div>
 
 <div className="space-y-md">
 {Object.entries(analytics.employmentTypeDistribution)
 .sort(([, a], [, b]) => b - a)
 .map(([type, count]) => {
 const percentage = (count / analytics.totalPositions) * 100;
 
 return (
 <div key={type} className="space-y-sm">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <div className={`w-3 h-3 rounded-full bg-${getEmploymentTypeColor(type as EmploymentType)}-500`} />
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

 <Card className="p-lg">
 <div className="flex items-center gap-sm mb-lg">
 <Award className="h-icon-sm w-icon-sm" />
 <h3 className="text-lg font-semibold">Top Skills</h3>
 </div>
 
 <div className="space-y-md">
 {analytics.topSkills.slice(0, 8).map((skill) => {
 const count = analytics.skillsFrequency[skill];
 const percentage = (count / analytics.totalPositions) * 100;
 
 return (
 <div key={skill} className="space-y-sm">
 <div className="flex items-center justify-between">
 <span className="font-medium">{skill}</span>
 <div className="text-sm text-muted-foreground">
 {count} position{count !== 1 ? 's' : ''}
 </div>
 </div>
 <Progress value={percentage} className="h-2" />
 </div>
 );
 })}
 </div>
 </Card>
 </div>

 {/* Career Timeline & Company Analysis */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
 <Card className="p-lg">
 <div className="flex items-center gap-sm mb-lg">
 <BarChart3 className="h-icon-sm w-icon-sm" />
 <h3 className="text-lg font-semibold">Career Timeline</h3>
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
 {count} position{count !== 1 ? 's' : ''}
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
 <h3 className="text-lg font-semibold">Company Analysis</h3>
 </div>
 
 <div className="space-y-md">
 {Object.entries(analytics.topCompanies)
 .sort(([, a], [, b]) => b - a)
 .slice(0, 6)
 .map(([company, count]) => {
 const maxCount = Math.max(...Object.values(analytics.topCompanies));
 const percentage = (count / maxCount) * 100;
 
 return (
 <div key={company} className="space-y-sm">
 <div className="flex items-center justify-between">
 <span className="font-medium">{company}</span>
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
 <h3 className="text-lg font-semibold">Tenure Insights</h3>
 </div>
 
 <div className="space-y-sm text-sm">
 <div className="flex justify-between">
 <span className="text-muted-foreground">Average Tenure:</span>
 <span className="font-medium">{formatTenure(Math.round(analytics.averageTenure))}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Longest Role:</span>
 <span className="font-medium">
 {formatTenure(Math.max(...entries.map(e => 
 calculateTenureInMonths(e.start_date, e.end_date, e.is_current)
 )))}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Shortest Role:</span>
 <span className="font-medium">
 {formatTenure(Math.min(...entries.map(e => 
 calculateTenureInMonths(e.start_date, e.end_date, e.is_current)
 )))}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Profile Completion:</span>
 <span className="font-medium">{Math.round(analytics.completionRate)}%</span>
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
 <Users className="h-icon-sm w-icon-sm" />
 <h3 className="text-lg font-semibold">Industry & Size</h3>
 </div>
 
 <div className="space-y-sm text-sm">
 <div>
 <span className="text-muted-foreground font-medium">Industries:</span>
 <div className="mt-xs space-y-xs">
 {Object.entries(analytics.industryDistribution)
 .sort(([, a], [, b]) => b - a)
 .slice(0, 3)
 .map(([industry, count]) => (
 <div key={industry} className="flex justify-between">
 <span className="text-muted-foreground">{industry}:</span>
 <span className="font-medium">{count}</span>
 </div>
 ))}
 </div>
 </div>
 
 <div className="pt-sm">
 <span className="text-muted-foreground font-medium">Company Sizes:</span>
 <div className="mt-xs space-y-xs">
 {Object.entries(analytics.companySizeDistribution)
 .sort(([, a], [, b]) => b - a)
 .slice(0, 3)
 .map(([size, count]) => (
 <div key={size} className="flex justify-between">
 <span className="text-muted-foreground capitalize">{size}:</span>
 <span className="font-medium">{count}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </Card>
 </div>
 </div>
 );
}
