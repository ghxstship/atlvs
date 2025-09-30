'use client';

import { Package2, Wrench, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Calendar, BarChart3, PieChart, Activity } from "lucide-react";
import { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import type { CatalogItem, CatalogStats, CatalogAnalytics } from '../types';
import { formatCurrency, formatDate } from '../types';

interface CatalogDashboardViewProps {
 items: CatalogItem[];
 loading?: boolean;
 stats?: CatalogStats;
 analytics?: CatalogAnalytics;
 onItemClick?: (item: CatalogItem) => void;
}

export default function CatalogDashboardView({
 items,
 loading = false,
 stats,
 analytics,
 onItemClick,
}: CatalogDashboardViewProps) {
 const [recentItems, setRecentItems] = useState<CatalogItem[]>([]);
 const [topCategories, setTopCategories] = useState<Array<{ category: string; count: number; value: number }>([]);
 const [topSuppliers, setTopSuppliers] = useState<Array<{ supplier: string; count: number; value: number }>([]);

 useEffect(() => {
 // Get recent items (last 10)
 const recent = [...items]
 .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
 .slice(0, 10);
 setRecentItems(recent);

 // Calculate top categories
 const categoryMap = new Map<string, { count: number; value: number }>();
 items.forEach(item => {
 if (item.category) {
 const existing = categoryMap.get(item.category) || { count: 0, value: 0 };
 categoryMap.set(item.category, {
 count: existing.count + 1,
 value: existing.value + (item.price || item.rate || 0),
 });
 }
 });
 const categories = Array.from(categoryMap.entries())
 .map(([category, data]) => ({ category, ...data }))
 .sort((a, b) => b.count - a.count)
 .slice(0, 5);
 setTopCategories(categories);

 // Calculate top suppliers
 const supplierMap = new Map<string, { count: number; value: number }>();
 items.forEach(item => {
 if (item.supplier) {
 const existing = supplierMap.get(item.supplier) || { count: 0, value: 0 };
 supplierMap.set(item.supplier, {
 count: existing.count + 1,
 value: existing.value + (item.price || item.rate || 0),
 });
 }
 });
 const suppliers = Array.from(supplierMap.entries())
 .map(([supplier, data]) => ({ supplier, ...data }))
 .sort((a, b) => b.count - a.count)
 .slice(0, 5);
 setTopSuppliers(suppliers);
 }, [items]);

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

 const defaultStats: CatalogStats = {
 totalItems: items.length,
 totalProducts: items.filter(item => item.type === 'product').length,
 totalServices: items.filter(item => item.type === 'service').length,
 activeItems: items.filter(item => item.status === 'active').length,
 inactiveItems: items.filter(item => item.status === 'inactive').length,
 discontinuedItems: items.filter(item => item.status === 'discontinued').length,
 categoriesCount: new Set(items.map(item => item.category).filter(Boolean)).size,
 suppliersCount: new Set(items.map(item => item.supplier).filter(Boolean)).size,
 averagePrice: items.length > 0 
 ? items.reduce((sum, item) => sum + (item.price || item.rate || 0), 0) / items.length 
 : 0,
 totalValue: items.reduce((sum, item) => sum + (item.price || item.rate || 0), 0),
 recentlyAdded: items.filter(item => {
 const weekAgo = new Date();
 weekAgo.setDate(weekAgo.getDate() - 7);
 return new Date(item.created_at) > weekAgo;
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
 <p className="text-sm text-muted-foreground">Total Items</p>
 <p className="text-2xl font-bold">{currentStats.totalItems}</p>
 <p className="text-xs text-muted-foreground">
 {currentStats.totalProducts} products, {currentStats.totalServices} services
 </p>
 </div>
 <div className="p-sm bg-primary/10 rounded-lg">
 <Package2 className="h-6 w-6 text-primary" />
 </div>
 </div>
 </Card>

 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Total Value</p>
 <p className="text-2xl font-bold">
 {formatCurrency(currentStats.totalValue)}
 </p>
 <p className="text-xs text-muted-foreground">
 Avg: {formatCurrency(currentStats.averagePrice)}
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
 <p className="text-sm text-muted-foreground">Active Items</p>
 <p className="text-2xl font-bold">{currentStats.activeItems}</p>
 <p className="text-xs text-muted-foreground">
 {Math.round((currentStats.activeItems / currentStats.totalItems) * 100)}% of total
 </p>
 </div>
 <div className="p-sm bg-success/10 rounded-lg">
 <TrendingUp className="h-6 w-6 text-success" />
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
 <div className="p-sm bg-warning/10 rounded-lg">
 <Calendar className="h-6 w-6 text-warning" />
 </div>
 </div>
 </Card>
 </div>

 {/* Status breakdown */}
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
 <span className="text-sm font-medium">{currentStats.activeItems}</span>
 <Badge variant="success" className="text-xs">
 {Math.round((currentStats.activeItems / currentStats.totalItems) * 100)}%
 </Badge>
 </div>
 </div>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <div className="w-3 h-3 bg-warning rounded-full"></div>
 <span className="text-sm">Inactive</span>
 </div>
 <div className="flex items-center gap-sm">
 <span className="text-sm font-medium">{currentStats.inactiveItems}</span>
 <Badge variant="warning" className="text-xs">
 {Math.round((currentStats.inactiveItems / currentStats.totalItems) * 100)}%
 </Badge>
 </div>
 </div>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <div className="w-3 h-3 bg-destructive rounded-full"></div>
 <span className="text-sm">Discontinued</span>
 </div>
 <div className="flex items-center gap-sm">
 <span className="text-sm font-medium">{currentStats.discontinuedItems}</span>
 <Badge variant="destructive" className="text-xs">
 {Math.round((currentStats.discontinuedItems / currentStats.totalItems) * 100)}%
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
 <span className="text-xs text-muted-foreground">
 {formatCurrency(category.value)}
 </span>
 </div>
 </div>
 ))
 )}
 </div>
 </Card>

 <Card className="p-md">
 <h3 className="font-medium mb-md flex items-center gap-sm">
 <Users className="h-4 w-4" />
 Top Suppliers
 </h3>
 <div className="space-y-sm">
 {topSuppliers.length === 0 ? (
 <p className="text-sm text-muted-foreground">No suppliers assigned</p>
 ) : (
 topSuppliers.map((supplier, index) => (
 <div key={supplier.supplier} className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <span className="text-xs font-medium text-muted-foreground">
 #{index + 1}
 </span>
 <span className="text-sm truncate">{supplier.supplier}</span>
 </div>
 <div className="flex items-center gap-sm">
 <span className="text-sm font-medium">{supplier.count}</span>
 <span className="text-xs text-muted-foreground">
 {formatCurrency(supplier.value)}
 </span>
 </div>
 </div>
 ))
 )}
 </div>
 </Card>
 </div>

 {/* Recent items */}
 <Card className="p-md">
 <div className="flex items-center justify-between mb-md">
 <h3 className="font-medium flex items-center gap-sm">
 <Calendar className="h-4 w-4" />
 Recent Items
 </h3>
 <Button variant="outline" size="sm">
 View All
 </Button>
 </div>
 
 {recentItems.length === 0 ? (
 <p className="text-sm text-muted-foreground text-center py-lg">
 No items found
 </p>
 ) : (
 <div className="space-y-sm">
 {recentItems.map((item) => {
 const TypeIcon = item.type === 'product' ? Package2 : Wrench;
 
 return (
 <div
 key={item.id}
 className="flex items-center gap-md p-sm rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
 onClick={() => onItemClick?.(item)}
 >
 <TypeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-sm">
 <span className="font-medium truncate">{item.name}</span>
 <span className={`px-sm py-xs rounded-full text-xs font-medium ${
 item.type === 'product' 
 ? 'bg-primary/10 text-primary' 
 : 'bg-success/10 text-success'
 }`}>
 {item.type}
 </span>
 <Badge variant={item.status === 'active' ? 'success' : item.status === 'inactive' ? 'warning' : 'destructive'}>
 {item.status}
 </Badge>
 </div>
 <div className="flex items-center gap-md text-xs text-muted-foreground">
 {item.category && <span>Category: {item.category}</span>}
 {item.supplier && <span>Supplier: {item.supplier}</span>}
 <span>Created: {formatDate(item.created_at)}</span>
 </div>
 </div>
 <div className="text-right">
 <div className="font-medium">
 {formatCurrency(item.price || item.rate || 0, item.currency)}
 </div>
 {item.type === 'service' && item.unit && (
 <div className="text-xs text-muted-foreground">
 per {item.unit}
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </Card>
 </div>
 );
}
