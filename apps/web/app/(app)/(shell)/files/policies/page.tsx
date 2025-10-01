import PoliciesClient from './PoliciesClient';

export const dynamic = 'force-dynamic';


export const metadata = { 
 title: 'Resources · Policies',
 description: 'Manage company policies and governance documents'
};

export default function ResourcesPoliciesPage() {
 return <PoliciesClient />;
}
