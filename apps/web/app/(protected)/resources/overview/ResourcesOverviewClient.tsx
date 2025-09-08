'use client';

import React from 'react';
import { Card } from '@ghxstship/ui';
import { Button } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { 
  FileText, Download, Upload, Users, 
  TrendingUp, Clock, Star, FolderOpen,
  Plus, Search, Filter, BarChart
} from 'lucide-react';

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
    { name: 'Documents', count: 456, color: 'bg-blue-500' },
    { name: 'Videos', count: 234, color: 'bg-purple-500' },
    { name: 'Templates', count: 189, color: 'bg-green-500' },
    { name: 'Guides', count: 145, color: 'bg-yellow-500' },
    { name: 'Training', count: 98, color: 'bg-red-500' },
    { name: 'Other', count: 112, color: 'bg-gray-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resources Overview</h1>
          <p className="text-gray-600 mt-1">Manage and track your organization's resources</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Upload Resource
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-green-600 mt-2">{stat.trend}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <stat.icon className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Resources */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Resources</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              {recentResources.map((resource) => (
                <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{resource.title}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge variant="outline">{resource.type}</Badge>
                        <span className="text-sm text-gray-500">{resource.downloads} downloads</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-500">{resource.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {resource.updated}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Categories */}
        <div>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
            <div className="space-y-3">
              {categories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${category.color}`} />
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{category.count}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <FolderOpen className="w-4 h-4 mr-2" />
              Manage Categories
            </Button>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 mt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Search className="w-4 h-4 mr-2" />
                Search Resources
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="w-4 h-4 mr-2" />
                Recent Activity
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Activity Timeline */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
            <div className="flex-1">
              <p className="text-sm text-gray-900">New training video uploaded by Sarah Chen</p>
              <p className="text-xs text-gray-500">10 minutes ago</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
            <div className="flex-1">
              <p className="text-sm text-gray-900">API documentation updated to v2.0</p>
              <p className="text-xs text-gray-500">1 hour ago</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
            <div className="flex-1">
              <p className="text-sm text-gray-900">Q4 reports downloaded 50 times</p>
              <p className="text-xs text-gray-500">3 hours ago</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
