'use client';

import React from 'react';
import { Card } from '@ghxstship/ui';
import { BarChart3, TrendingUp } from 'lucide-react';

export default function AnalyticsSlot() {
  return (
    <Card className="p-md">
      <h3 className="text-body form-label mb-md">Analytics</h3>
      <div className="space-y-sm">
        <div className="flex items-center justify-between">
          <span className="text-body-sm color-muted">Page Views</span>
          <div className="flex items-center gap-xs">
            <TrendingUp className="h-3 w-3 text-success" />
            <span className="text-body-sm form-label">45,230</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-body-sm color-muted">Visitors</span>
          <div className="flex items-center gap-xs">
            <BarChart3 className="h-3 w-3" />
            <span className="text-body-sm form-label">12,450</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-body-sm color-muted">Conversion</span>
          <span className="text-body-sm form-label">3.2%</span>
        </div>
      </div>
    </Card>
  );
}
