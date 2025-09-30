import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { Metadata } from 'next';
import FeedbackClient from './FeedbackClient';

export const metadata: Metadata = {
 title: 'Procurement Feedback | GHXSTSHIP',
 description: 'User feedback and reviews for procurement processes and vendors',
};

interface FeedbackPageProps {
 searchParams: { [key: string]: string | string[] | undefined };
}

export default function FeedbackPage({ searchParams }: FeedbackPageProps) {
 const orgId = searchParams.orgId as string;

 return (
 <div className="container mx-auto p-6">
 <div className="mb-6">
 <h1 className="text-3xl font-bold text-foreground mb-2">Procurement Feedback</h1>
 <p className="text-muted-foreground">
 Collect and analyze user feedback to improve procurement processes
 </p>
 </div>
 
 <FeedbackClient orgId={orgId} />
 </div>
 );
}
