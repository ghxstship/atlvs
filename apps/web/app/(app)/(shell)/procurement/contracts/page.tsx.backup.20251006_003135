import { Metadata } from 'next';
import ContractsClient from './ContractsClient';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = {
 title: 'Procurement Contracts | GHXSTSHIP',
 description: 'Contract management and lifecycle tracking for procurement',
};

interface ContractsPageProps {
 searchParams: { [key: string]: string | string[] | undefined };
}

export default function ContractsPage({ searchParams }: ContractsPageProps) {
 const orgId = searchParams.orgId as string;

 return (
 <div className="container mx-auto p-lg">
 <div className="mb-6">
 <h1 className="text-3xl font-bold text-foreground mb-2">Procurement Contracts</h1>
 <p className="text-muted-foreground">
 Manage contract lifecycle from negotiation to renewal
 </p>
 </div>
 
 <ContractsClient orgId={orgId} />
 </div>
 );
}
