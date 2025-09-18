'use client';

import React from 'react';
import { Card } from '@ghxstship/ui';

interface MonitoringDashboardProps {
  organizationId: string;
  refreshInterval?: number;
}

export function MonitoringDashboard({ 
  organizationId, 
  refreshInterval = 30000 
}: MonitoringDashboardProps) {
  return (
    <div className="p-xl">
      <Card>
        <div className="p-lg">
          <h2 className="text-2xl font-bold mb-4">Enterprise Monitoring</h2>
          <p className="text-muted-foreground">
            Enterprise monitoring dashboard will be available in a future release.
          </p>
        </div>
      </Card>
    </div>
  );
}
