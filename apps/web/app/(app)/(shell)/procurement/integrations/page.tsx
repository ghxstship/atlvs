import { Metadata } from 'next';
import IntegrationsClient from './IntegrationsClient';

export const metadata: Metadata = {
 title: 'Procurement Integrations | GHXSTSHIP',
 description: 'Integration hub for connecting procurement with external systems',
};

interface IntegrationsPageProps {
 searchParams: { [key: string]: string | string[] | undefined };
}

export default function IntegrationsPage({ searchParams }: IntegrationsPageProps) {
 const orgId = searchParams.orgId as string;

 return (
 <div className="container mx-auto p-lg">
 <div className="mb-6">
 <h1 className="text-3xl font-bold text-foreground mb-2">Procurement Integrations</h1>
 <p className="text-muted-foreground">
 Connect procurement workflows with external systems and marketplaces
 </p>
 </div>
 
 <IntegrationsClient orgId={orgId} />
 </div>
 );
}
