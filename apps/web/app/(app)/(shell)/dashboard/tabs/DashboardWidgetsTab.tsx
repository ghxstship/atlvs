'use client';

import React from 'react';
import { BarChart3, Grid, Plus, Settings } from 'lucide-react';
import { Button, Card, CardBody, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';

interface DashboardWidgetsTabProps {
  dashboard?: unknown;
  widgetData?: Record<string, any>;
  user: unknown;
  orgId: string;
  userRole: string;
  isViewMode?: boolean;
  preferences?: unknown;
  tabData?: unknown;
  onTabDataChange?: (data: unknown) => void;
}

export default function DashboardWidgetsTab({
  dashboard,
  widgetData,
  user,
  orgId,
  userRole,
  isViewMode = false,
  preferences,
  tabData,
  onTabDataChange
}: DashboardWidgetsTabProps) {
  return (
    <div className="p-lg space-y-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Widget Management</h2>
          <p className="text-muted-foreground">
            Create, configure, and manage dashboard widgets
          </p>
        </div>

        <Button>
          <Plus className="h-icon-xs w-icon-xs mr-2" />
          Add Widget
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-xs">
              <BarChart3 className="h-icon-sm w-icon-sm" />
              Metric Widget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Display key metrics and KPIs
            </p>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chart Widget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Visualize data with various chart types
            </p>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Table Widget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Display data in tabular format
            </p>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
