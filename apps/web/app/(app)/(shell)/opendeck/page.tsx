'use client';

import React from 'react';
import OpenDeckClient from './OpenDeckClient';

interface OpenDeckPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function OpenDeckPage({ searchParams }: OpenDeckPageProps) {
  const orgId = (searchParams.orgId as string) || 'default-org';

  return <OpenDeckClient orgId={orgId} />;
}
