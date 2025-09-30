'use client';

import { useRouter } from 'next/navigation';
import OverviewTemplate from '../components/OverviewTemplate';
import { getModuleConfig } from '../lib/module-configs';
import type { ModuleOverviewConfig } from '../types';

interface DashboardOverviewClientProps {
 orgId: string;
 userId: string;
 userEmail: string;
}

export default function DashboardOverviewClient({
 orgId,
 userId,
 userEmail
}: DashboardOverviewClientProps) {
 const router = useRouter();
 const config: ModuleOverviewConfig = getModuleConfig('dashboard');

 return (
 <OverviewTemplate
 orgId={orgId}
 userId={userId}
 userEmail={userEmail}
 module="dashboard"
 config={config}
 onNavigate={(path) => router.push(path)}
 />
 );
}
