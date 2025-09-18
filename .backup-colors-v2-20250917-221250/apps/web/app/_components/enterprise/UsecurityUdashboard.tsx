'use client';

import React from 'react';
import { Card } from '@ghxstship/ui';

interface SecurityDashboardProps {
  organizationId: string;
}

export function SecurityDashboard({ organizationId }: SecurityDashboardProps) {
  return (
    <div className="p-xl">
      <Card>
        <div className="p-lg">
          <h2 className="text-2xl font-bold mb-md">Enterprise Security</h2>
          <p className="text-muted-foreground">
            Enterprise security dashboard will be available in a future release.
          </p>
        </div>
      </Card>
    </div>
  );
}
