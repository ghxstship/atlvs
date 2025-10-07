/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DetailTemplate } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { MessageSquare, Star, ThumbsUp } from 'lucide-react';

export const dynamic = 'force-dynamic';


export const metadata = {
  title: 'Feedback Details - GHXSTSHIP',
  description: 'View detailed procurement feedback and reviews.',
};

interface FeedbackDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function FeedbackDetailPage({ params }: FeedbackDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { session }, error: authError } = await (supabase.auth.getSession() as any);

  if (authError || !session) {
    redirect('/auth/signin');
  }

  // Get user profile and organization membership
  const { data: profile } = await supabase
    .from('users')
    .select(`
      *,
      memberships!inner(
        organization_id,
        role,
        status,
        organization:organizations(
          id,
          name,
          slug
        )
      )
    `)
    .eq('auth_id', (session as any).user.id)
    .single();

  if (!profile || !(profile as any).memberships?.[0]) {
    redirect('/auth/onboarding');
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Procurement', href: '/procurement' },
    { label: 'Feedback', href: '/procurement/feedback' },
    { label: `Feedback ${id}` }
  ];

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="grid gap-lg md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <MessageSquare className="h-icon-sm w-icon-sm" />
                Vendor Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-xl">
                Vendor performance feedback, ratings, and reviews.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <Star className="h-icon-sm w-icon-sm" />
                Quality Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-xl">
                Product quality, delivery timeliness, and service ratings.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'reviews',
      label: 'Reviews',
      content: (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-xs">
              <ThumbsUp className="h-icon-sm w-icon-sm" />
              Detailed Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-xl">
              Comprehensive vendor and product reviews with detailed feedback.
            </p>
          </CardContent>
        </Card>
      )
    }
  ];

  return (
    <DetailTemplate
      breadcrumbs={breadcrumbs}
      title={`Procurement Feedback ${id}`}
      subtitle="Vendor feedback, reviews, and quality assessments"
      tabs={tabs}
      backHref="/procurement/feedback"
    />
  );
}
