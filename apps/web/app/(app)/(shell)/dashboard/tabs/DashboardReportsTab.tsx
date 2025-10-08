'use client';

import React from 'react';
import { Download, FileText, PieChart, Settings } from 'lucide-react';
import { Button, Card, CardBody, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';

interface DashboardReportsTabProps {
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

export default function DashboardReportsTab({
  dashboard,
  widgetData,
  user,
  orgId,
  userRole,
  isViewMode = false,
  preferences,
  tabData,
  onTabDataChange
}: DashboardReportsTabProps) {
  return (
    <div className="p-lg space-y-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports</h2>
          <p className="text-muted-foreground">
            Generate and schedule comprehensive reports
          </p>
        </div>

        <div className="flex gap-xs">
          <Button variant="outline">
            <Settings className="h-icon-xs w-icon-xs mr-2" />
            Settings
          </Button>
          <Button>
            <FileText className="h-icon-xs w-icon-xs mr-2" />
            New Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-xs">
              <PieChart className="h-icon-sm w-icon-sm" />
              Usage Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Comprehensive dashboard usage analytics
            </p>
            <Button variant="outline" className="w-full">
              <Download className="h-icon-xs w-icon-xs mr-2" />
              Generate
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Load times and performance metrics
            </p>
            <Button variant="outline" className="w-full">
              <Download className="h-icon-xs w-icon-xs mr-2" />
              Generate
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              User activity and engagement metrics
            </p>
            <Button variant="outline" className="w-full">
              <Download className="h-icon-xs w-icon-xs mr-2" />
              Generate
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
