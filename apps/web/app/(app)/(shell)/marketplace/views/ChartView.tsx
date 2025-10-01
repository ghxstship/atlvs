import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';
import { marketplaceService } from '../lib/marketplace-service';
import type { MarketplaceStats } from '../types';

interface ChartViewProps {
  orgId: string;
}

export default function ChartView({ orgId }: ChartViewProps) {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['marketplace-stats', orgId],
    queryFn: () => marketplaceService.getStats(orgId),
    refetchInterval: 30000,
  });

  const chartData = useMemo(() => {
    if (!stats) return null;

    return {
      typeDistribution: [
        { name: 'Offers', value: stats.activeOffers, color: 'hsl(var(--color-primary))' },
        { name: 'Requests', value: stats.activeRequests, color: 'hsl(var(--color-success))' },
        { name: 'Exchanges', value: stats.activeExchanges, color: 'hsl(var(--color-purple))' },
      ],
      statusData: [
        { name: 'Active', value: stats.activeOffers + stats.activeRequests + stats.activeExchanges, color: 'hsl(var(--color-success))' },
        { name: 'Draft', value: 0, color: 'hsl(var(--color-muted))' }, // Would need to calculate from listings
        { name: 'Archived', value: 0, color: 'hsl(var(--color-destructive))' },
      ],
    };
  }, [stats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-icon-md bg-muted rounded w-component-xl" />
            </CardHeader>
            <CardContent>
              <div className="h-component-xl bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-xsxl">
        <BarChart3 className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Unable to load charts</h3>
        <p className="text-muted-foreground">
          Failed to load marketplace statistics
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <BarChart3 className="h-icon-xs w-icon-xs text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.featuredListings} featured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Activity className="h-icon-xs w-icon-xs text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.activeOffers + stats.activeRequests + stats.activeExchanges}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <TrendingUp className="h-icon-xs w-icon-xs text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalResponses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.averageResponseRate.toFixed(1)}% avg rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <PieChart className="h-icon-xs w-icon-xs text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVendors}</div>
            <p className="text-xs text-muted-foreground">
              Verified vendors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        {/* Type Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Listing Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-md">
              {chartData?.typeDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-xs">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className="text-sm text-muted-foreground">{item.value}</span>
                    <div className="w-component-md h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          backgroundColor: item.color,
                          width: `${(item.value / Math.max(...chartData.typeDistribution.map(d => d.value), 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Listing Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-xs">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Active</span>
                </div>
                <span className="text-lg font-bold">
                  {stats.activeOffers + stats.activeRequests + stats.activeExchanges}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-xs">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium">Featured</span>
                </div>
                <span className="text-lg font-bold">{stats.featuredListings}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-xs">
                  <div className="w-3 h-3 rounded-full bg-gray-500" />
                  <span className="text-sm font-medium">Total</span>
                </div>
                <span className="text-lg font-bold">{stats.totalListings}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Rate Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-md">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Average Response Rate</span>
                  <span>{stats.averageResponseRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(stats.averageResponseRate, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalResponses}</div>
                  <div className="text-xs text-muted-foreground">Total Responses</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.totalVendors}</div>
                  <div className="text-xs text-muted-foreground">Active Vendors</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Market Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-sm">
              <div className="flex items-center justify-between p-sm bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Most Popular Type</span>
                <Badge variant="secondary">
                  {stats.activeOffers >= stats.activeRequests && stats.activeOffers >= stats.activeExchanges ? 'Offers' :
                   stats.activeRequests >= stats.activeExchanges ? 'Requests' : 'Exchanges'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-sm bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Engagement Rate</span>
                <Badge variant={stats.averageResponseRate > 20 ? 'default' : 'secondary'}>
                  {stats.averageResponseRate > 20 ? 'High' : 'Normal'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-sm bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Last Updated</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(stats.lastUpdated).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
