'use client';

import { BarChart3, TrendingUp, Users, Square, Building, MapPin, DollarSign, Calendar, Shield } from "lucide-react";
import { useMemo } from 'react';
import {
 Badge,
 Card,
 CardContent,
 CardHeader,
 CardTitle,
 Progress,
} from '@ghxstship/ui';

import { STATUS_COLORS, ACCESS_LEVEL_COLORS, KIND_COLORS } from '@ghxstship/config/tokens/chart-colors';
import type { ProgrammingSpace, SpaceAnalytics } from '../types';

interface ProgrammingSpacesAnalyticsViewProps {
 spaces: ProgrammingSpace[];
 loading: boolean;
}

export default function ProgrammingSpacesAnalyticsView({
 spaces,
 loading,
}: ProgrammingSpacesAnalyticsViewProps) {
 const analytics = useMemo((): SpaceAnalytics => {
 const totalSpaces = spaces.length;
 const availableSpaces = spaces.filter(s => s.status === 'available').length;
 const occupiedSpaces = spaces.filter(s => s.status === 'occupied').length;
 const reservedSpaces = spaces.filter(s => s.status === 'reserved').length;
 const maintenanceSpaces = spaces.filter(s => s.status === 'maintenance').length;

 const spacesWithCapacity = spaces.filter(s => s.capacity && s.capacity > 0);
 const averageCapacity = spacesWithCapacity.length > 0
 ? spacesWithCapacity.reduce((sum, s) => sum + (s.capacity || 0), 0) / spacesWithCapacity.length
 : 0;
 const totalCapacity = spaces.reduce((sum, s) => sum + (s.capacity || 0), 0);

 // Calculate utilization rate (occupied + reserved / total)
 const utilizationRate = totalSpaces > 0 
 ? ((occupiedSpaces + reservedSpaces) / totalSpaces) * 100 
 : 0;

 // Group by kind
 const spacesByKind = spaces.reduce((acc, space) => {
 const existing = acc.find(item => item.kind === space.kind);
 if (existing) {
 existing.count++;
 } else {
 acc.push({ kind: space.kind, count: 1 });
 }
 return acc;
 }, [] as Array<{ kind: unknown; count: number }>);

 // Group by status
 const spacesByStatus = spaces.reduce((acc, space) => {
 const existing = acc.find(item => item.status === space.status);
 if (existing) {
 existing.count++;
 } else {
 acc.push({ status: space.status, count: 1 });
 }
 return acc;
 }, [] as Array<{ status: unknown; count: number }>);

 // Group by access level
 const spacesByAccessLevel = spaces.reduce((acc, space) => {
 const existing = acc.find(item => item.access_level === space.access_level);
 if (existing) {
 existing.count++;
 } else {
 acc.push({ access_level: space.access_level, count: 1 });
 }
 return acc;
 }, [] as Array<{ access_level: unknown; count: number }>);

 // Group by building
 const spacesByBuilding = spaces
 .filter(s => s.building)
 .reduce((acc, space) => {
 const building = space.building!;
 const existing = acc.find(item => item.building === building);
 if (existing) {
 existing.count++;
 } else {
 acc.push({ building, count: 1 });
 }
 return acc;
 }, [] as Array<{ building: string; count: number }>)
 .sort((a, b) => b.count - a.count);

 // Group by floor
 const spacesByFloor = spaces
 .filter(s => s.floor)
 .reduce((acc, space) => {
 const floor = space.floor!;
 const existing = acc.find(item => item.floor === floor);
 if (existing) {
 existing.count++;
 } else {
 acc.push({ floor, count: 1 });
 }
 return acc;
 }, [] as Array<{ floor: string; count: number }>)
 .sort((a, b) => a.floor.localeCompare(b.floor));

 // Mock booking trends (would come from actual booking data)
 const bookingTrends = Array.from({ length: 7 }, (_, i) => {
 const date = new Date();
 date.setDate(date.getDate() - (6 - i));
 return {
 date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
 bookings: Math.floor(Math.random() * totalSpaces * 0.7),
 utilization: Math.floor(Math.random() * 80 + 20),
 };
 });

 // Popular spaces (mock data - would come from booking analytics)
 const popularSpaces = spaces
 .slice(0, 5)
 .map(space => ({
 space: space.name,
 bookings: Math.floor(Math.random() * 50 + 10),
 utilization: Math.floor(Math.random() * 80 + 20),
 }))
 .sort((a, b) => b.bookings - a.bookings);

 // Revenue by space (mock data)
 const revenueBySpace = spaces
 .filter(s => s.hourly_rate || s.daily_rate)
 .slice(0, 5)
 .map(space => ({
 space: space.name,
 revenue: Math.floor(Math.random() * 5000 + 1000),
 }))
 .sort((a, b) => b.revenue - a.revenue);

 return {
 totalSpaces,
 availableSpaces,
 occupiedSpaces,
 reservedSpaces,
 maintenanceSpaces,
 averageCapacity,
 totalCapacity,
 utilizationRate,
 spacesByKind: spacesByKind.sort((a, b) => b.count - a.count),
 spacesByStatus: spacesByStatus.sort((a, b) => b.count - a.count),
 spacesByAccessLevel: spacesByAccessLevel.sort((a, b) => b.count - a.count),
 spacesByBuilding,
 spacesByFloor,
 bookingTrends,
 popularSpaces,
 revenueBySpace,
 };
 }, [spaces]);

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

 if (spaces.length === 0) {
 return (
 <Card className="p-xl">
 <div className="text-center">
 <BarChart3 className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-4" />
 <h3 className="text-lg font-semibold">No data to analyze</h3>
 <p className="text-muted-foreground">
 Create some spaces to see analytics and insights.
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
 <CardTitle className="text-sm font-medium">Total Spaces</CardTitle>
 <Building className="h-icon-xs w-icon-xs text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{analytics.totalSpaces}</div>
 <p className="text-xs text-muted-foreground">
 Across all buildings and floors
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
 <TrendingUp className="h-icon-xs w-icon-xs text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{analytics.utilizationRate.toFixed(1)}%</div>
 <Progress value={analytics.utilizationRate} className="mt-2" />
 <p className="text-xs text-muted-foreground mt-1">
 {analytics.occupiedSpaces + analytics.reservedSpaces} of {analytics.totalSpaces} in use
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
 <Users className="h-icon-xs w-icon-xs text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{analytics.totalCapacity}</div>
 <p className="text-xs text-muted-foreground">
 Avg. {analytics.averageCapacity.toFixed(0)} per space
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Available Spaces</CardTitle>
 <Square className="h-icon-xs w-icon-xs text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{analytics.availableSpaces}</div>
 <p className="text-xs text-muted-foreground">
 Ready for booking
 </p>
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
 {analytics.spacesByStatus.map((item) => {
 const percentage = (item.count / analytics.totalSpaces) * 100;
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

 {/* Space Types */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <Building className="h-icon-sm w-icon-sm" />
 Space Types
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 {analytics.spacesByKind.map((item) => {
 const percentage = (item.count / analytics.totalSpaces) * 100;
 return (
 <div key={item.kind} className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <div 
 className="w-3 h-3 rounded-full"
 style={{ backgroundColor: KIND_COLORS[item.kind] }}
 />
 <span className="text-sm capitalize">
 {item.kind.replace('_', ' ')}
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

 {/* Access Level Distribution */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <Shield className="h-icon-sm w-icon-sm" />
 Access Levels
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 {analytics.spacesByAccessLevel.map((item) => {
 const percentage = (item.count / analytics.totalSpaces) * 100;
 return (
 <div key={item.access_level} className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <div 
 className="w-3 h-3 rounded-full"
 style={{ backgroundColor: ACCESS_LEVEL_COLORS[item.access_level] }}
 />
 <span className="text-sm capitalize">
 {item.access_level.replace('_', ' ')}
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

 {/* Buildings */}
 {analytics.spacesByBuilding.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <MapPin className="h-icon-sm w-icon-sm" />
 Spaces by Building
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 {analytics.spacesByBuilding.map((item, index) => (
 <div key={item.building} className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <Badge variant="outline" className="text-xs">
 #{index + 1}
 </Badge>
 <span className="text-sm">{item.building}</span>
 </div>
 <span className="text-sm font-medium">{item.count}</span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 )}
 </div>

 {/* Booking Trends */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <Calendar className="h-icon-sm w-icon-sm" />
 Weekly Booking Trends
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-md">
 {analytics.bookingTrends.map((item) => (
 <div key={item.date} className="space-y-xs">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium">{item.date}</span>
 <div className="flex items-center gap-md text-sm">
 <span>{item.bookings} bookings</span>
 <span className="text-muted-foreground">
 {item.utilization}% utilization
 </span>
 </div>
 </div>
 <Progress value={item.utilization} className="h-2" />
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Popular Spaces and Revenue */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
 {/* Popular Spaces */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <TrendingUp className="h-icon-sm w-icon-sm" />
 Most Popular Spaces
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 {analytics.popularSpaces.map((item, index) => (
 <div key={item.space} className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <Badge variant="outline" className="text-xs">
 #{index + 1}
 </Badge>
 <span className="text-sm truncate">{item.space}</span>
 </div>
 <div className="flex items-center gap-xs text-sm">
 <span>{item.bookings} bookings</span>
 <span className="text-muted-foreground">
 ({item.utilization}%)
 </span>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Revenue by Space */}
 {analytics.revenueBySpace.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-xs">
 <DollarSign className="h-icon-sm w-icon-sm" />
 Top Revenue Spaces
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 {analytics.revenueBySpace.map((item, index) => (
 <div key={item.space} className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <Badge variant="outline" className="text-xs">
 #{index + 1}
 </Badge>
 <span className="text-sm truncate">{item.space}</span>
 </div>
 <span className="text-sm font-medium">${item.revenue.toLocaleString()}</span>
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
