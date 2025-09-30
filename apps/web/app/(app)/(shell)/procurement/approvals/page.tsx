import { Metadata } from 'next';
import ApprovalsClient from './ApprovalsClient';

export const metadata: Metadata = {
 title: 'Procurement Approvals | GHXSTSHIP',
 description: 'Manage procurement approval workflows and policies',
};

export default function ApprovalsPage() {
 return <ApprovalsClient />;
}
