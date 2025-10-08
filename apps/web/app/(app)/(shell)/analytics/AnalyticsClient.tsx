'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import OverviewTemplate from '../dashboard/components/OverviewTemplate';
import { getModuleConfig } from '../dashboard/lib/module-configs';

interface AnalyticsClientProps {
  orgId: string;
  userId: string;
  userEmail: string;
}

export default function AnalyticsClient({ orgId, userId, userEmail }: AnalyticsClientProps) {
  const router = useRouter();
  const config = getModuleConfig('analytics');

  const handleNavigate = useCallback((path: string) => {
    router.push(path);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return (
    <OverviewTemplate
      orgId={orgId}
      userId={userId}
      userEmail={userEmail}
      module="analytics"
      config={config}
      onNavigate={handleNavigate}
    />
  );
}
