'use client';


import { FileText, Download, Upload, Users, TrendingUp, Clock, Star, FolderOpen, Plus, Search, Filter, BarChart } from "lucide-react";
import React from 'react';
import { Card } from '@ghxstship/ui';
import { Button } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';

export default function ResourcesOverviewClient() {
 const stats = [
 { label: 'Total Resources', value: '1,234', icon: FileText, trend: '+12%' },
 { label: 'Downloads', value: '45.6K', icon: Download, trend: '+23%' },
 { label: 'Active Users', value: '892', icon: Users, trend: '+8%' },
 { label: 'Avg. Rating', value: '4.8', icon: Star, trend: '+0.2' },
 ];

 const recentResources = [
 { id: 1, title: 'Q4 Sales Report', type: 'Document', downloads: 234, rating: 4.9, updated: '2 hours ago' },
 { id: 2, title: 'Product Training Video', type: 'Video', downloads: 567, rating: 4.7, updated: '5 hours ago' },
 { id: 3, title: 'API Documentation', type: 'Guide', downloads: 892, rating: 4.8, updated: '1 day ago' },
 { id: 4, title: 'Brand Guidelines', type: 'Template', downloads: 345, rating: 4.6, updated: '2 days ago' },
 ];

 const categories = [
 { name: 'Documents', count: 456, color: 'bg-accent' },
 { name: 'Videos', count: 234, color: 'bg-secondary' },
 { name: 'Templates', count: 189, color: 'bg-success' },
 { name: 'Guides', count: 145, color: 'bg-warning' },
 { name: 'Training', count: 98, color: 'bg-destructive' },
 { name: 'Other', count: 112, color: 'bg-secondary-foreground' },
 ];

 return (
 <div className="stack-lg">
 {/* Header */}
 <div className="flex justify-between items-center">
 <div>
 <h1 className="text-heading-2 text-heading-3 color-foreground">Resources Overview</h1>
 <p className="color-muted mt-xs">Manage and track your organization's resources</p>
 </div>
 <div className="flex gap-sm">
 <Button variant="outline">
 <Upload className="w-4 h-4 mr-sm" />
 Upload Resource
 </Button>
 <Button>
 <Plus className="w-4 h-4 mr-sm" />
 Create New
 </Button>
 </div>
 </div>

 {/* Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
 {stats.map((stat, index) => (
 <Card key={index} className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">{stat.label}</p>
 <p className="text-heading-3 color-foreground mt-xs">{stat.value}</p>
 <p className="text-body-sm color-success mt-sm">{stat.trend}</p>
 </div>
 <div className="p-sm bg-secondary/50 rounded-lg">
 <stat.icon className="w-6 h-6 color-muted" />
 </div>
 </div>
 </Card>
 ))}
 </div>

 {/* Main Content Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
 {/* Recent Resources */}
 <div className="lg:col-span-2">
 <Card className="p-lg">
 <div className="flex justify-between items-center mb-md">
 <h2 className="text-body text-heading-4 color-foreground">Recent Resources</h2>
 <Button>View All</Button>
 </div>
 <div className="stack-md">
 {recentResources.map((resource: unknown) => (
 <div key={resource.id} className="flex items-center justify-between p-md border rounded-lg hover:bg-secondary/50">
 <div className="flex items-center gap-md">
 <div className="p-sm bg-secondary/50 rounded">
 <FileText className="w-5 h-5 color-muted" />
 </div>
 <div>
 <h3 className="form-label color-foreground">{resource.title}</h3>
 <div className="flex items-center gap-md mt-xs">
 <Badge variant="outline">{resource.type}</Badge>
 <span className="text-body-sm color-muted">{resource.downloads} downloads</span>
 <div className="flex items-center gap-xs">
 <Star className="w-3 h-3 color-warning fill-current" />
 <span className="text-body-sm color-muted">{resource.rating}</span>
 </div>
 </div>
 </div>
 </div>
 <div className="text-body-sm color-muted">
 {resource.updated}
 </div>
 </div>
 ))}
 </div>
 </Card>
 </div>

 {/* Categories */}
 <div>
 <Card className="p-lg">
 <h2 className="text-body text-heading-4 color-foreground mb-md">Categories</h2>
 <div className="stack-sm">
 {categories.map((category, index) => (
 <div key={index} className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <div className={`w-3 h-3 rounded-full ${category.color}`} />
 <span className="text-body-sm color-foreground">{category.name}</span>
 </div>
 <span className="text-body-sm form-label color-foreground">{category.count}</span>
 </div>
 ))}
 </div>
 <Button variant="outline" className="w-full mt-md">
 <FolderOpen className="w-4 h-4 mr-sm" />
 Manage Categories
 </Button>
 </Card>

 {/* Quick Actions */}
 <Card className="p-lg mt-md">
 <h2 className="text-body text-heading-4 color-foreground mb-md">Quick Actions</h2>
 <div className="stack-sm">
 <Button variant="outline" className="w-full justify-start">
 <Search className="w-4 h-4 mr-sm" />
 Search Resources
 </Button>
 <Button variant="outline" className="w-full justify-start">
 <Filter className="w-4 h-4 mr-sm" />
 Advanced Filters
 </Button>
 <Button variant="outline" className="w-full justify-start">
 <BarChart className="w-4 h-4 mr-sm" />
 View Analytics
 </Button>
 <Button variant="outline" className="w-full justify-start">
 <Clock className="w-4 h-4 mr-sm" />
 Recent Activity
 </Button>
 </div>
 </Card>
 </div>
 </div>

 {/* Activity Timeline */}
 <Card className="p-lg">
 <h2 className="text-body text-heading-4 color-foreground mb-md">Recent Activity</h2>
 <div className="stack-md">
 <div className="flex gap-md">
 <div className="w-2 h-2 bg-accent rounded-full mt-sm" />
 <div className="flex-1">
 <p className="text-body-sm color-foreground">New training video uploaded by Sarah Chen</p>
 <p className="text-body-sm color-muted">10 minutes ago</p>
 </div>
 </div>
 <div className="flex gap-md">
 <div className="w-2 h-2 bg-success rounded-full mt-sm" />
 <div className="flex-1">
 <p className="text-body-sm color-foreground">API documentation updated to v2.0</p>
 <p className="text-body-sm color-muted">1 hour ago</p>
 </div>
 </div>
 <div className="flex gap-md">
 <div className="w-2 h-2 bg-secondary rounded-full mt-sm" />
 <div className="flex-1">
 <p className="text-body-sm color-foreground">Q4 reports downloaded 50 times</p>
 <p className="text-body-sm color-muted">3 hours ago</p>
 </div>
 </div>
 </div>
 </Card>
 </div>
 );
}
