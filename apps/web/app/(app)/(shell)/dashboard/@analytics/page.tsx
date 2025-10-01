import { Suspense } from 'react';
import { Card, Skeleton } from '@ghxstship/ui';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

async function getAnalyticsData() {
  // Fetch real-time analytics data
  // This runs in parallel with the main dashboard page
  return {
    revenue: { value: 125000, change: 12.5, trend: 'up' },
    users: { value: 2450, change: 8.3, trend: 'up' },
    conversion: { value: 3.2, change: -2.1, trend: 'down' },
  };
}

async function AnalyticsContent() {
  const data = await getAnalyticsData();

  return (
    <div className="space-y-md">
      <h3 className="text-heading-5 font-semibold">Real-time Analytics</h3>
      
      <Card className="p-md">
        <div className="flex items-center justify-between mb-sm">
          <span className="text-sm text-muted-foreground">Revenue</span>
          {data.revenue.trend === 'up' ? (
            <TrendingUp className="h-icon-xs w-icon-xs text-green-600" />
          ) : (
            <TrendingDown className="h-icon-xs w-icon-xs text-red-600" />
          )}
        </div>
        <div className="text-heading-4 font-bold">
          ${data.revenue.value.toLocaleString()}
        </div>
        <div className={`text-xs ${data.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {data.revenue.change > 0 ? '+' : ''}{data.revenue.change}% from last month
        </div>
      </Card>

      <Card className="p-md">
        <div className="flex items-center justify-between mb-sm">
          <span className="text-sm text-muted-foreground">Active Users</span>
          <Activity className="h-icon-xs w-icon-xs text-blue-600" />
        </div>
        <div className="text-heading-4 font-bold">
          {data.users.value.toLocaleString()}
        </div>
        <div className={`text-xs ${data.users.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {data.users.change > 0 ? '+' : ''}{data.users.change}% from last month
        </div>
      </Card>

      <Card className="p-md">
        <div className="flex items-center justify-between mb-sm">
          <span className="text-sm text-muted-foreground">Conversion Rate</span>
          {data.conversion.trend === 'up' ? (
            <TrendingUp className="h-icon-xs w-icon-xs text-green-600" />
          ) : (
            <TrendingDown className="h-icon-xs w-icon-xs text-red-600" />
          )}
        </div>
        <div className="text-heading-4 font-bold">
          {data.conversion.value}%
        </div>
        <div className={`text-xs ${data.conversion.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {data.conversion.change > 0 ? '+' : ''}{data.conversion.change}% from last month
        </div>
      </Card>
    </div>
  );
}

function AnalyticsLoading() {
  return (
    <div className="space-y-md">
      <Skeleton className="h-icon-md w-component-xl" />
      <Card className="p-md">
        <Skeleton className="h-icon-xs w-component-lg mb-sm" />
        <Skeleton className="h-icon-lg w-component-lg mb-xs" />
        <Skeleton className="h-3 w-component-xl" />
      </Card>
      <Card className="p-md">
        <Skeleton className="h-icon-xs w-component-lg mb-sm" />
        <Skeleton className="h-icon-lg w-component-lg mb-xs" />
        <Skeleton className="h-3 w-component-xl" />
      </Card>
      <Card className="p-md">
        <Skeleton className="h-icon-xs w-component-lg mb-sm" />
        <Skeleton className="h-icon-lg w-component-lg mb-xs" />
        <Skeleton className="h-3 w-component-xl" />
      </Card>
    </div>
  );
}

export default function AnalyticsSlot() {
  return (
    <Suspense fallback={<AnalyticsLoading />}>
      <AnalyticsContent />
    </Suspense>
  );
}
