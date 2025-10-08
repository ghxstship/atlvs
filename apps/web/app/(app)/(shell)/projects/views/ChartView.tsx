'use client';

import React from 'react';
import { Card } from '@ghxstship/ui';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface ChartViewProps {
  data?: unknown[];
}

export default function ChartView({ data = [] }: ChartViewProps) {
  const projects = Array.isArray(data) ? data : [];
  
  // Calculate statistics
  const stats = {
    total: projects.length,
    active: projects.filter((p: any) => p.status === 'active').length,
    completed: projects.filter((p: any) => p.status === 'completed').length,
    planning: projects.filter((p: any) => p.status === 'planning').length,
    onHold: projects.filter((p: any) => p.status === 'on_hold').length
  };

  const statusData = [
    { label: 'Active', value: stats.active, color: 'bg-green-500' },
    { label: 'Planning', value: stats.planning, color: 'bg-blue-500' },
    { label: 'Completed', value: stats.completed, color: 'bg-gray-500' },
    { label: 'On Hold', value: stats.onHold, color: 'bg-yellow-500' }
  ];

  const maxValue = Math.max(...statusData.map(d => d.value), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <BarChart3 className="h-5 w-5" />
          Project Analytics
        </h3>
        <div className="text-sm text-muted-foreground">
          {stats.total} total projects
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Planning</p>
              <p className="text-2xl font-bold">{stats.planning}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-gray-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">On Hold</p>
              <p className="text-2xl font-bold">{stats.onHold}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Projects by Status</h4>
        <div className="space-y-4">
          {statusData.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground">{item.value}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} transition-all duration-300`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Completion Rate */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Completion Rate</h4>
        <div className="flex items-center justify-center">
          <div className="relative w-40 h-40">
            <svg className="transform -rotate-90 w-40 h-40">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-muted"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - (stats.completed / stats.total || 0))}`}
                className="text-green-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl font-bold">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </span>
              <span className="text-sm text-muted-foreground">Complete</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
