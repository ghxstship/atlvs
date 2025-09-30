'use client';

import { TrendingUp, Target, Award, Users, BarChart3, PieChart, Calendar, Star } from "lucide-react";
import {
  Card,
  Badge,
} from '@ghxstship/ui';
import type { PerformanceStats, PerformanceAnalytics } from '../types';
import { REVIEW_TYPE_LABELS, REVIEW_STATUS_LABELS } from '../types';

interface PerformanceAnalyticsViewProps {
  stats: PerformanceStats;
  analytics: PerformanceAnalytics;
  loading?: boolean;
}

export default function PerformanceAnalyticsView({
  stats,
  analytics,
  loading = false,
}: PerformanceAnalyticsViewProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
              <p className="text-3xl font-bold">{stats.totalReviews}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600">
              {stats.completedReviews} completed
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
              <p className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(stats.averageRating)
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Promotion Rate</p>
              <p className="text-3xl font-bold">{(stats.promotionRate * 100).toFixed(0)}%</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Based on recommendations
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Goal Completion</p>
              <p className="text-3xl font-bold">
                {stats.goalCompletion.total > 0 
                  ? Math.round((stats.goalCompletion.completed / stats.goalCompletion.total) * 100)
                  : 0}%
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            {stats.goalCompletion.completed} of {stats.goalCompletion.total} goals
          </div>
        </Card>
      </div>

      {/* Performance Trends */}
      {analytics.performanceTrends.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Performance Trends</h3>
          </div>
          <div className="space-y-4">
            {analytics.performanceTrends.map((trend) => (
              <div key={trend.period} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">{trend.period}</div>
                  <div className="text-sm text-muted-foreground">
                    {trend.reviewCount} reviews • {trend.promotions} promotions
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {trend.averageRating.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">avg rating</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Review Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* By Type */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Reviews by Type</h3>
          </div>
          <div className="space-y-3">
            {stats.byType.map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="font-medium">{REVIEW_TYPE_LABELS[item.type]}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{item.count}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.averageRating.toFixed(1)} avg
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* By Status */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Reviews by Status</h3>
          </div>
          <div className="space-y-3">
            {stats.byStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{REVIEW_STATUS_LABELS[item.status]}</Badge>
                </div>
                <div className="font-semibold">{item.count}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Competency Breakdown */}
      {analytics.competencyBreakdown.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Award className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Competency Breakdown</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {analytics.competencyBreakdown.map((competency) => (
              <div key={competency.competency} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{competency.competency}</h4>
                  <div className="text-2xl font-bold text-primary">
                    {competency.averageRating.toFixed(1)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.round(competency.averageRating)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top Strengths & Development Areas */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Strengths */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Top Strengths</h3>
          </div>
          <div className="space-y-3">
            {stats.topStrengths.slice(0, 5).map((strength, index) => (
              <div key={strength.strength} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-600">
                    {index + 1}
                  </div>
                  <span className="font-medium">{strength.strength}</span>
                </div>
                <Badge variant="outline">{strength.frequency}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Development Areas */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Development Areas</h3>
          </div>
          <div className="space-y-3">
            {stats.developmentAreas.slice(0, 5).map((area, index) => (
              <div key={area.area} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600">
                    {index + 1}
                  </div>
                  <span className="font-medium">{area.area}</span>
                </div>
                <Badge variant="outline">{area.frequency}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Benchmark Comparison */}
      {analytics.benchmarkComparison && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Benchmark Comparison</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {analytics.benchmarkComparison.userRating.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Your Average</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-muted-foreground mb-2">
                {analytics.benchmarkComparison.organizationAverage.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Organization Average</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-muted-foreground mb-2">
                {analytics.benchmarkComparison.industryAverage.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Industry Average</div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <div className="text-2xl font-bold text-primary">
              {analytics.benchmarkComparison.percentile}th
            </div>
            <div className="text-sm text-muted-foreground">Percentile</div>
          </div>
        </Card>
      )}
    </div>
  );
}
