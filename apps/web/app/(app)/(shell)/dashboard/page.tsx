'use client';

import React from 'react';
import DashboardClient from './DashboardClient';

interface DashboardPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  // Extract org info from searchParams or context
  const orgId = (searchParams.orgId as string) || 'default-org';

  return <DashboardClient orgId={orgId} />;
}
