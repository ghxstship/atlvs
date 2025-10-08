'use client';

import React from 'react';
import MarketplaceClient from './MarketplaceClient';

interface MarketplacePageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const orgId = (searchParams.orgId as string) || 'default-org';

  return <MarketplaceClient orgId={orgId} />;
}
