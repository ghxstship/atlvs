import { Metadata } from 'next';
import { ContractsClient } from './ContractsClient';
import { Filter, X } from 'lucide-react';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = {
 title: 'Contracts | GHXSTSHIP',
 description: 'Unified contract management system for all organizational agreements',
};

interface ContractsPageProps {
 searchParams: {
 entity?: string;
 id?: string;
 type?: string;
 status?: string;
 view?: 'grid' | 'list' | 'kanban' | 'calendar' | 'timeline';
 };
}

export default function ContractsPage({ searchParams }: ContractsPageProps) {
 return (
 <div className="container mx-auto p-md">
 <div className="space-y-md">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-display-sm font-bold text-foreground">
 Contracts
 </h1>
 <p className="text-body-md text-muted-foreground mt-xs">
 Unified contract management for all organizational agreements
 </p>
 </div>
 </div>
 
 <ContractsClient 
 initialFilters={{
 contract_type: searchParams.type as unknown,
 contract_status: searchParams.status as unknown,
 related_entity_type: searchParams.entity as unknown,
 related_entity_id: searchParams.id
 }}
 defaultView={searchParams.view || 'grid'}
 />
 </div>
 </div>
 );
}
