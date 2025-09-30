/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DetailTemplate } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { Truck, MapPin, Package } from 'lucide-react';

export const metadata = {
  title: 'Tracking Details - GHXSTSHIP',
  description: 'View detailed shipment tracking information.',
};

interface TrackingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TrackingDetailPage({ params }: TrackingDetailPageProps) {
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

  // Get tracking record
  const { data: tracking, error: trackingError } = await supabase
    .from('procurement_tracking')
    .select(`
      *,
      order:procurement_orders(
        id,
        order_number,
        vendor:procurement_vendors(name)
      )
    `)
    .eq('id', id)
    .eq('organization_id', orgId)
    .single();

  if (trackingError || !tracking) {
    return (
      <DetailTemplate
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Procurement', href: '/procurement' },
          { label: 'Tracking', href: '/procurement/tracking' },
          { label: 'Not Found' }
        ]}
        title="Tracking Record Not Found"
        tabs={[{
          id: 'error',
          label: 'Error',
          content: (
            <div className="text-center py-8">
              <p className="text-muted-foreground">The requested tracking record could not be found.</p>
            </div>
          )
        }]}
      />
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Procurement', href: '/procurement' },
    { label: 'Tracking', href: '/procurement/tracking' },
    { label: `Tracking ${(tracking as any).tracking_number || (tracking as any).id}` }
  ];

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Tracking Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Tracking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tracking Number</span>
                <span className="text-sm font-mono">
                  {(tracking as any).tracking_number || (tracking as any).id}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Carrier</span>
                <span className="text-sm font-medium">
                  {(tracking as any).carrier || 'Unknown'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <span className="text-sm text-muted-foreground">
                  {(tracking as any).status || 'Unknown'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estimated Delivery</span>
                <span className="text-sm text-muted-foreground">
                  {(tracking as any).estimated_delivery ? new Date((tracking as any).estimated_delivery).toLocaleDateString() : 'TBD'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Associated Order */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Associated Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">
                  Order {(tracking as any).order?.order_number || (tracking as any).order?.id}
                </p>
                <p className="text-sm text-muted-foreground">
                  Vendor: {(tracking as any).order?.vendor?.name || 'Unknown'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">From</h4>
                  <p className="text-sm text-muted-foreground">
                    {(tracking as any).ship_from_address || 'Address not available'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">To</h4>
                  <p className="text-sm text-muted-foreground">
                    {(tracking as any).ship_to_address || 'Address not available'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'updates',
      label: 'Tracking Updates',
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Shipping Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Tracking updates will be displayed here when available.
            </p>
          </CardContent>
        </Card>
      )
    }
  ];

  return (
    <DetailTemplate
      breadcrumbs={breadcrumbs}
      title={`Tracking ${(tracking as any).tracking_number || (tracking as any).id}`}
      subtitle={`Carrier: ${(tracking as any).carrier || 'Unknown'} • Status: ${(tracking as any).status || 'Unknown'}`}
      tabs={tabs}
      backHref="/procurement/tracking"
    />
  );
}
