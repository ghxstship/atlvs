'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import { ChevronLeft, ChevronRight, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import type { DataRecord } from '@ghxstship/ui';

interface BudgetCalendarViewProps {
  data: DataRecord[];
  isLoading?: boolean;
  onRecordClick?: (record: DataRecord) => void;
}

export default function BudgetCalendarView({ data, isLoading, onRecordClick }: BudgetCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getRecordsForDate = (date: Date) => {
    return data.filter(record => {
      // Budgets don't have specific dates, so we'll show all budgets
      // In a real implementation, you might show budgets by period start/end
      return true;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  // For budget calendar, we'll show budget status overview
  const getBudgetStatsForMonth = () => {
    const activeBudgets = data.filter(b => b.status === 'active').length;
    const exceededBudgets = data.filter(b => b.status === 'exceeded').length;
    const totalBudget = data.reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalSpent = data.reduce((sum, b) => sum + (b.spent || 0), 0);

    return {
      activeBudgets,
      exceededBudgets,
      totalBudget,
      totalSpent,
      utilizationRate: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
    };
  };

  const stats = getBudgetStatsForMonth();

  if (isLoading) {
    return (
      <Card className="p-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-lg"></div>
          <div className="grid grid-cols-7 gap-sm">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-lg">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-lg">
        <h2 className="text-xl font-semibold">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-sm">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Monthly Budget Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.activeBudgets}</div>
          <div className="text-sm text-gray-600">Active Budgets</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.exceededBudgets}</div>
          <div className="text-sm text-gray-600">Exceeded</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">${stats.totalBudget.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Budget</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.utilizationRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Utilization</div>
        </div>
      </div>

      {/* Budget List with Calendar Context */}
      <div className="space-y-sm">
        <h3 className="font-semibold">Budget Overview</h3>
        {data.slice(0, 10).map((record) => {
          const utilization = record.amount > 0 ? ((record.spent || 0) / record.amount) * 100 : 0;

          return (
            <Card
              key={record.id}
              className="p-md hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onRecordClick?.(record)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{record.name}</h4>
                  <p className="text-sm text-gray-600">{record.category}</p>
                </div>

                <div className="flex items-center gap-md">
                  <div className="text-right">
                    <div className="text-sm font-medium">${record.spent?.toLocaleString() || '0'} / ${record.amount?.toLocaleString() || '0'}</div>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-xs">
                      <div
                        className={`h-2 rounded-full ${
                          utilization > 100 ? 'bg-red-500' :
                          utilization > 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(utilization, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <Badge variant={
                    record.status === 'active' ? 'success' :
                    record.status === 'exceeded' ? 'destructive' : 'secondary'
                  }>
                    {record.status}
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}

        {data.length === 0 && (
          <div className="text-center py-xl text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-md opacity-50" />
            <h3 className="text-lg font-medium mb-sm">No budgets found</h3>
            <p>Get started by creating your first budget.</p>
          </div>
        )}

        {data.length > 10 && (
          <div className="text-center text-gray-600">
            And {data.length - 10} more budgets...
          </div>
        )}
      </div>
    </Card>
  );
}
