/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DetailTemplate } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Avatar } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { User, Mail, Phone, MapPin, Calendar, Briefcase } from 'lucide-react';

export const metadata = {
  title: 'Profile Details - GHXSTSHIP',
  description: 'View detailed user profile information and activity.',
};

interface ProfileDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfileDetailPage({ params }: ProfileDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { session }, error: authError } = await (supabase.auth.getSession() as any);

  if (authError || !session) {
    redirect('/auth/signin');
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
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
    .eq('auth_id', id)
    .single();

  if (profileError || !profile) {
    return (
      <DetailTemplate
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Profile', href: '/profile' },
          { label: 'Not Found' }
        ]}
        title="Profile Not Found"
        tabs={[{
          id: 'error',
          label: 'Error',
          content: (
            <div className="text-center py-8">
              <p className="text-muted-foreground">The requested profile could not be found.</p>
            </div>
          )
        }]}
      />
    );
  }

  const membership = (profile as any).memberships?.[0];
  const organization = membership?.organization;

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile', href: '/profile' },
    { label: `${(profile as any).first_name} ${(profile as any).last_name}` }
  ];

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {(profile as any).first_name?.[0]}{(profile as any).last_name?.[0]}
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {(profile as any).first_name} {(profile as any).last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {(profile as any).title || 'No title set'}
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    {membership?.role || 'Member'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{(profile as any).email}</span>
              </div>
              {(profile as any).phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{(profile as any).phone}</span>
                </div>
              )}
              {(profile as any).location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{(profile as any).location}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Organization Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Organization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{organization?.name || 'No organization'}</p>
                <p className="text-sm text-muted-foreground">
                  Role: {membership?.role || 'Member'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {membership?.status || 'Active'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {(profile as any).created_at ? new Date((profile as any).created_at).toLocaleDateString() : 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>Last updated: {(profile as any).updated_at ? new Date((profile as any).updated_at).toLocaleDateString() : 'Unknown'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'activity',
      label: 'Activity',
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Activity tracking coming soon...
            </p>
          </CardContent>
        </Card>
      )
    }
  ];

  return (
    <DetailTemplate
      breadcrumbs={breadcrumbs}
      title={`${(profile as any).first_name} ${(profile as any).last_name}`}
      subtitle={`${(profile as any).title || 'Team Member'} • ${membership?.role || 'Member'}`}
      tabs={tabs}
      backHref="/profile"
    />
  );
}
