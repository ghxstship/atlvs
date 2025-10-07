/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DetailTemplate } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { Code, Calendar, Users, MapPin, Clock, DollarSign } from 'lucide-react';

export const dynamic = 'force-dynamic';


export const metadata = {
  title: 'Event Details - GHXSTSHIP',
  description: 'View detailed programming event information and management.',
};

interface ProgrammingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProgrammingDetailPage({ params }: ProgrammingDetailPageProps) {
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

  const orgId = (profile as any).memberships[0].organization_id;

  // Get programming event
  const { data: event, error: eventError } = await supabase
    .from('programming_events')
    .select(`
      *,
      venue:programming_venues(name, address, capacity),
      lineup:programming_lineups(
        id,
        artist_name,
        start_time,
        end_time,
        performance_order
      )
    `)
    .eq('id', id)
    .eq('organization_id', orgId)
    .single();

  if (eventError || !event) {
    return (
      <DetailTemplate
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Programming', href: '/programming' },
          { label: 'Not Found' }
        ]}
        title="Event Not Found"
        tabs={[{
          id: 'error',
          label: 'Error',
          content: (
            <div className="text-center py-xl">
              <p className="text-muted-foreground">The requested event could not be found.</p>
            </div>
          )
        }]}
      />
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Programming', href: '/programming' },
    { label: (event as any).title }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      planned: 'outline',
      confirmed: 'default',
      live: 'default',
      completed: 'secondary',
      cancelled: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="grid gap-lg md:grid-cols-2">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <Code className="h-icon-sm w-icon-sm" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div>
                <h3 className="text-lg font-semibold">{(event as any).title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {(event as any).description || 'No description provided'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                {getStatusBadge((event as any).status)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Event Type</span>
                <Badge variant="outline">
                  {(event as any).event_type?.toUpperCase() || 'GENERAL'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Expected Attendance</span>
                <span className="text-sm text-muted-foreground">
                  {(event as any).expected_attendance || 0} people
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <Calendar className="h-icon-sm w-icon-sm" />
                Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Start Date</span>
                <span className="text-sm text-muted-foreground">
                  {(event as any).start_date ? new Date((event as any).start_date).toLocaleDateString() : 'TBD'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">End Date</span>
                <span className="text-sm text-muted-foreground">
                  {(event as any).end_date ? new Date((event as any).end_date).toLocaleDateString() : 'TBD'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Duration</span>
                <span className="text-sm text-muted-foreground">
                  {calculateDuration((event as any).start_date, (event as any).end_date)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Venue Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <MapPin className="h-icon-sm w-icon-sm" />
                Venue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-sm">
              <div>
                <p className="font-medium">{(event as any).venue?.name || 'Venue TBD'}</p>
                {(event as any).venue?.address && (
                  <p className="text-sm text-muted-foreground">
                    {(event as any).venue.address}
                  </p>
                )}
                {(event as any).venue?.capacity && (
                  <p className="text-sm text-muted-foreground">
                    Capacity: {(event as any).venue.capacity} people
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <DollarSign className="h-icon-sm w-icon-sm" />
                Budget & Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Budget</span>
                <span className="text-sm font-semibold">
                  {formatCurrency((event as any).budget || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Expected Revenue</span>
                <span className="text-sm font-semibold">
                  {formatCurrency((event as any).expected_revenue || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ticket Price</span>
                <span className="text-sm text-muted-foreground">
                  {(event as any).ticket_price ? formatCurrency((event as any).ticket_price) : 'Free'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Lineup */}
          {(event as any).lineup && (event as any).lineup.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-xs">
                  <Users className="h-icon-sm w-icon-sm" />
                  Event Lineup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-sm">
                  {(event as any).lineup
                    .sort((a: unknown, b: unknown) => (a.performance_order || 0) - (b.performance_order || 0))
                    .map((item: unknown) => (
                      <div key={item.id} className="flex items-center justify-between p-sm border rounded">
                        <div className="flex items-center gap-sm">
                          <Badge variant="outline">
                            #{item.performance_order || 'TBD'}
                          </Badge>
                          <div>
                            <p className="font-medium">{item.artist_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatTime(item.start_time)} - {formatTime(item.end_time)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )
    },
    {
      id: 'logistics',
      label: 'Logistics',
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Event Logistics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-xl">
              Logistics management coming soon...
            </p>
          </CardContent>
        </Card>
      )
    }
  ];

  return (
    <DetailTemplate
      breadcrumbs={breadcrumbs}
      title={(event as any).title}
      subtitle={`${(event as any).event_type?.toUpperCase()} • ${getStatusBadge((event as any).status)}`}
      tabs={tabs}
      backHref="/programming"
    />
  );
}

function calculateDuration(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return 'TBD';

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Same day';
  if (diffDays === 1) return '1 day';
  return `${diffDays} days`;
}

function formatTime(timeString: string): string {
  if (!timeString) return 'TBD';
  try {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return timeString;
  }
}
