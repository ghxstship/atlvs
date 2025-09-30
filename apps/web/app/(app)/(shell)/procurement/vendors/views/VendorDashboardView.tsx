'use client';

import { Building, Star, TrendingUp, TrendingDown, DollarSign, Users, Calendar, BarChart3, Activity, Award, MapPin } from "lucide-react";
import { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import type { Vendor, VendorStats, VendorAnalytics } from '../types';
import { formatCurrency, formatDate, getBusinessTypeColor } from '../types';

interface VendorDashboardViewProps {
 vendors: Vendor[];
 loading?: boolean;
 stats?: VendorStats;
 analytics?: VendorAnalytics;
 onVendorClick?: (vendor: Vendor) => void;
}

export default function VendorDashboardView({
 vendors,
 loading = false,
 stats,
 analytics,
 onVendorClick,
}: VendorDashboardViewProps) {
 const [recentVendors, setRecentVendors] = useState<Vendor[]>([]);
 const [topPerformers, setTopPerformers] = useState<Vendor[]>([]);
 const [topCategories, setTopCategories] = useState<Array<{ category: string; count: number; avgRate: number }>([]);

 useEffect(() => {
 // Get recent vendors (last 10)
 const recent = [...vendors]
 .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
 .slice(0, 10);
 setRecentVendors(recent);

 // Get top performers (by rating and projects)
 const performers = [...vendors]
 .filter(v => v.rating && v.total_projects)
 .sort((a, b) => {
 const scoreA = (a.rating || 0) * Math.log(1 + (a.total_projects || 0));
 const scoreB = (b.rating || 0) * Math.log(1 + (b.total_projects || 0));
 return scoreB - scoreA;
 })
 .slice(0, 5);
 setTopPerformers(performers);

 // Calculate top categories
 const categoryMap = new Map<string, { count: number; totalRate: number; vendors: number }>();
 vendors.forEach(vendor => {
 if (vendor.primary_category) {
 const existing = categoryMap.get(vendor.primary_category) || { count: 0, totalRate: 0, vendors: 0 };
 categoryMap.set(vendor.primary_category, {
 count: existing.count + 1,
 totalRate: existing.totalRate + (vendor.hourly_rate || 0),
 vendors: existing.vendors + (vendor.hourly_rate ? 1 : 0),
 });
 }
 });

 const categories = Array.from(categoryMap.entries())
 .map(([category, data]) => ({ 
 category, 
 count: data.count,
 avgRate: data.vendors > 0 ? data.totalRate / data.vendors : 0,
 }))
 .sort((a, b) => b.count - a.count)
 .slice(0, 5);
 setTopCategories(categories);
 }, [vendors]);

 if (loading) {
 return (
 <div className="space-y-lg">
 {/* Stats cards loading */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
 {Array.from({ length: 4 }).map((_, index) => (
 <Card key={index} className="p-md">
 <div className="animate-pulse">
 <div className="flex items-center justify-between mb-sm">
 <div className="h-4 bg-muted rounded w-20"></div>
 <div className="h-8 w-8 bg-muted rounded"></div>
 </div>
 <div className="h-8 bg-muted rounded w-16 mb-xs"></div>
 <div className="h-3 bg-muted rounded w-24"></div>
 </div>
 </Card>
 ))}
 </div>

 {/* Charts loading */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
 <Card className="p-md">
 <div className="animate-pulse">
 <div className="h-6 bg-muted rounded w-32 mb-md"></div>
 <div className="h-48 bg-muted rounded"></div>
 </div>
 </Card>
 <Card className="p-md">
 <div className="animate-pulse">
 <div className="h-6 bg-muted rounded w-32 mb-md"></div>
 <div className="h-48 bg-muted rounded"></div>
 </div>
 </Card>
 </div>
 </div>
 );
 }

 const defaultStats: VendorStats = {
 totalVendors: vendors.length,
 activeVendors: vendors.filter(v => v.status === 'active').length,
 inactiveVendors: vendors.filter(v => v.status === 'inactive').length,
 pendingVendors: vendors.filter(v => v.status === 'pending').length,
 suspendedVendors: vendors.filter(v => v.status === 'suspended').length,
 averageRating: vendors.length > 0 
 ? vendors.filter(v => v.rating).reduce((sum, v) => sum + (v.rating || 0), 0) / vendors.filter(v => v.rating).length 
 : 0,
 totalProjects: vendors.reduce((sum, v) => sum + (v.total_projects || 0), 0),
 totalReviews: vendors.reduce((sum, v) => sum + (v.total_reviews || 0), 0),
 categoriesCount: new Set(vendors.map(v => v.primary_category).filter(Boolean)).size,
 averageHourlyRate: vendors.length > 0 
 ? vendors.filter(v => v.hourly_rate).reduce((sum, v) => sum + (v.hourly_rate || 0), 0) / vendors.filter(v => v.hourly_rate).length 
 : 0,
 topCategories: [],
 recentlyAdded: vendors.filter(v => {
 const weekAgo = new Date();
 weekAgo.setDate(weekAgo.getDate() - 7);
 return new Date(v.created_at) > weekAgo;
 }).length,
 recentlyUpdated: 0,
 };

 const currentStats = stats || defaultStats;

 return (
 <div className="space-y-lg">
 {/* Key metrics */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Total Vendors</p>
 <p className="text-2xl font-bold">{currentStats.totalVendors}</p>
 <p className="text-xs text-muted-foreground">
 {currentStats.activeVendors} active
 </p>
 </div>
 <div className="p-sm bg-primary/10 rounded-lg">
 <Building className="h-6 w-6 text-primary" />
 </div>
 </div>
 </Card>

 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Avg. Rating</p>
 <p className="text-2xl font-bold">
 {currentStats.averageRating ? currentStats.averageRating.toFixed(1) : '0.0'}
 </p>
 <p className="text-xs text-muted-foreground">
 {currentStats.totalReviews} reviews
 </p>
 </div>
 <div className="p-sm bg-warning/10 rounded-lg">
 <Star className="h-6 w-6 text-warning" />
 </div>
 </div>
 </Card>

 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Avg. Rate</p>
 <p className="text-2xl font-bold">
 {currentStats.averageHourlyRate ? formatCurrency(currentStats.averageHourlyRate) : '$0'}
 </p>
 <p className="text-xs text-muted-foreground">
 per hour
 </p>
 </div>
 <div className="p-sm bg-success/10 rounded-lg">
 <DollarSign className="h-6 w-6 text-success" />
 </div>
 </div>
 </Card>

 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Recently Added</p>
 <p className="text-2xl font-bold">{currentStats.recentlyAdded}</p>
 <p className="text-xs text-muted-foreground">
 Last 7 days
 </p>
 </div>
 <div className="p-sm bg-info/10 rounded-lg">
 <Calendar className="h-6 w-6 text-info" />
 </div>
 </div>
 </Card>
 </div>

 {/* Status breakdown and analytics */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
 <Card className="p-md">
 <h3 className="font-medium mb-md flex items-center gap-sm">
 <Activity className="h-4 w-4" />
 Status Breakdown
 </h3>
 <div className="space-y-sm">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <div className="w-3 h-3 bg-success rounded-full"></div>
 <span className="text-sm">Active</span>
 </div>
 <div className="flex items-center gap-sm">
 <span className="text-sm font-medium">{currentStats.activeVendors}</span>
 <Badge variant="success" className="text-xs">
 {Math.round((currentStats.activeVendors / currentStats.totalVendors) * 100)}%
 </Badge>
 </div>
 </div>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <div className="w-3 h-3 bg-warning rounded-full"></div>
 <span className="text-sm">Pending</span>
 </div>
 <div className="flex items-center gap-sm">
 <span className="text-sm font-medium">{currentStats.pendingVendors}</span>
 <Badge variant="warning" className="text-xs">
 {Math.round((currentStats.pendingVendors / currentStats.totalVendors) * 100)}%
 </Badge>
 </div>
 </div>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <div className="w-3 h-3 bg-secondary rounded-full"></div>
 <span className="text-sm">Inactive</span>
 </div>
 <div className="flex items-center gap-sm">
 <span className="text-sm font-medium">{currentStats.inactiveVendors}</span>
 <Badge variant="secondary" className="text-xs">
 {Math.round((currentStats.inactiveVendors / currentStats.totalVendors) * 100)}%
 </Badge>
 </div>
 </div>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <div className="w-3 h-3 bg-destructive rounded-full"></div>
 <span className="text-sm">Suspended</span>
 </div>
 <div className="flex items-center gap-sm">
 <span className="text-sm font-medium">{currentStats.suspendedVendors}</span>
 <Badge variant="destructive" className="text-xs">
 {Math.round((currentStats.suspendedVendors / currentStats.totalVendors) * 100)}%
 </Badge>
 </div>
 </div>
 </div>
 </Card>

 <Card className="p-md">
 <h3 className="font-medium mb-md flex items-center gap-sm">
 <BarChart3 className="h-4 w-4" />
 Top Categories
 </h3>
 <div className="space-y-sm">
 {topCategories.length === 0 ? (
 <p className="text-sm text-muted-foreground">No categories assigned</p>
 ) : (
 topCategories.map((category, index) => (
 <div key={category.category} className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <span className="text-xs font-medium text-muted-foreground">
 #{index + 1}
 </span>
 <span className="text-sm truncate">{category.category}</span>
 </div>
 <div className="flex items-center gap-sm">
 <span className="text-sm font-medium">{category.count}</span>
 {category.avgRate > 0 && (
 <span className="text-xs text-muted-foreground">
 {formatCurrency(category.avgRate)}/hr
 </span>
 )}
 </div>
 </div>
 ))
 )}
 </div>
 </Card>

 <Card className="p-md">
 <h3 className="font-medium mb-md flex items-center gap-sm">
 <Award className="h-4 w-4" />
 Top Performers
 </h3>
 <div className="space-y-sm">
 {topPerformers.length === 0 ? (
 <p className="text-sm text-muted-foreground">No performance data</p>
 ) : (
 topPerformers.map((vendor, index) => (
 <div key={vendor.id} className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <span className="text-xs font-medium text-muted-foreground">
 #{index + 1}
 </span>
 <div className="min-w-0 flex-1">
 <span className="text-sm truncate block">{vendor.display_name}</span>
 <div className="flex items-center gap-xs">
 <Star className="h-3 w-3 text-warning fill-current" />
 <span className="text-xs text-muted-foreground">
 {vendor.rating?.toFixed(1)}
 </span>
 </div>
 </div>
 </div>
 <div className="text-right">
 <div className="text-sm font-medium">{vendor.total_projects}</div>
 <div className="text-xs text-muted-foreground">projects</div>
 </div>
 </div>
 ))
 )}
 </div>
 </Card>
 </div>

 {/* Recent vendors */}
 <Card className="p-md">
 <div className="flex items-center justify-between mb-md">
 <h3 className="font-medium flex items-center gap-sm">
 <Calendar className="h-4 w-4" />
 Recent Vendors
 </h3>
 <Button variant="outline" size="sm">
 View All
 </Button>
 </div>
 
 {recentVendors.length === 0 ? (
 <p className="text-sm text-muted-foreground text-center py-lg">
 No vendors found
 </p>
 ) : (
 <div className="space-y-sm">
 {recentVendors.map((vendor) => (
 <div
 key={vendor.id}
 className="flex items-center gap-md p-sm rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
 onClick={() => onVendorClick?.(vendor)}
 >
 <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-sm">
 <span className="font-medium truncate">{vendor.display_name}</span>
 <span className={`px-sm py-xs rounded-full text-xs font-medium ${getBusinessTypeColor(vendor.business_type)}`}>
 {vendor.business_type}
 </span>
 <Badge variant={vendor.status === 'active' ? 'success' : vendor.status === 'pending' ? 'warning' : 'secondary'}>
 {vendor.status}
 </Badge>
 </div>
 <div className="flex items-center gap-md text-xs text-muted-foreground">
 {vendor.primary_category && <span>Category: {vendor.primary_category}</span>}
 {vendor.email && <span>Email: {vendor.email}</span>}
 <span>Added: {formatDate(vendor.created_at)}</span>
 </div>
 </div>
 <div className="text-right">
 {vendor.hourly_rate && (
 <div className="font-medium">
 {formatCurrency(vendor.hourly_rate, vendor.currency)}/hr
 </div>
 )}
 {vendor.rating && (
 <div className="flex items-center gap-xs">
 <Star className="h-3 w-3 text-warning fill-current" />
 <span className="text-xs text-muted-foreground">
 {vendor.rating.toFixed(1)}
 </span>
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </Card>
 </div>
 );
}
