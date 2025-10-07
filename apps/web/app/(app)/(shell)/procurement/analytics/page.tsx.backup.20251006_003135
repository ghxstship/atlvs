import { Metadata } from 'next';
import AnalyticsClient from './AnalyticsClient';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = {
 title: 'Procurement Analytics | GHXSTSHIP',
 description: 'Advanced procurement analytics and insights dashboard',
};

interface AnalyticsPageProps {
 searchParams: { [key: string]: string | string[] | undefined };
}

export default function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
 const orgId = searchParams.orgId as string;

 return (
 <div className="container mx-auto p-lg">
 <div className="mb-6">
 <h1 className="text-3xl font-bold text-foreground mb-2">Procurement Analytics</h1>
 <p className="text-muted-foreground">
 Advanced insights and analytics for procurement performance optimization
 </p>
 </div>
 
 <AnalyticsClient orgId={orgId} />
 </div>
 );
}
