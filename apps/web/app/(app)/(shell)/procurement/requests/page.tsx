import { Metadata } from 'next';
import RequestsClient from './RequestsClient';

export const metadata: Metadata = {
 title: 'Procurement Requests | GHXSTSHIP',
 description: 'Manage procurement requests and purchase requisitions',
};

export default function RequestsPage() {
 return <RequestsClient />;
}
