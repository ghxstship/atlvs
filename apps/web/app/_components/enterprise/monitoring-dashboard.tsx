'use client';


import { Card, CardBody, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { Activity, TrendingUp, AlertCircle } from 'lucide-react';

export default function MonitoringDashboard() {
  return (
    <div className="stack-lg">
      <div className="grid gap-md md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-sm">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-icon-xs w-icon-xs text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold color-success">99.9%</div>
            <p className="text-xs text-muted-foreground">Uptime last 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-sm">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-icon-xs w-icon-xs text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245ms</div>
            <p className="text-xs text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-sm">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertCircle className="h-icon-xs w-icon-xs text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold color-warning">3</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
