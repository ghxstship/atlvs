/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DetailTemplate } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { Building, Mail, Phone, MapPin, Star, Package, DollarSign } from 'lucide-react';

export const metadata = {
  title: 'Vendor Details - GHXSTSHIP',
  description: 'View detailed vendor information and performance metrics.',
};

interface VendorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function VendorDetailPage({ params }: VendorDetailPageProps) {
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

  // Get vendor record
  const { data: vendor, error: vendorError } = await supabase
    .from('procurement_vendors')
    .select(`
      *,
      orders:procurement_orders(
        id,
        order_number,
        total_amount,
        status,
        order_date
      ),
      catalog_items:procurement_catalog(
        id,
        name,
        category,
        unit_price
      )
    `)
    .eq('id', id)
    .eq('organization_id', orgId)
    .single();

  if (vendorError || !vendor) {
    return (
      <DetailTemplate
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Procurement', href: '/procurement' },
          { label: 'Vendors', href: '/procurement/vendors' },
          { label: 'Not Found' }
        ]}
        title="Vendor Not Found"
        tabs={[{
          id: 'error',
          label: 'Error',
          content: (
            <div className="text-center py-8">
              <p className="text-muted-foreground">The requested vendor could not be found.</p>
            </div>
          )
        }]}
      />
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Procurement', href: '/procurement' },
    { label: 'Vendors', href: '/procurement/vendors' },
    { label: (vendor as any).name }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive',
      pending: 'outline'
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
        <div className="grid gap-6 md:grid-cols-2">
          {/* Vendor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Vendor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{(vendor as any).name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {(vendor as any).description || 'No description provided'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                {getStatusBadge((vendor as any).status)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Category</span>
                <Badge variant="outline">
                  {(vendor as any).category?.toUpperCase() || 'GENERAL'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">
                    {(vendor as any).rating || 0}/5
                  </span>
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
                <span>{(vendor as any).contact_email || 'No email provided'}</span>
              </div>

              {(vendor as any).contact_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{(vendor as any).contact_phone}</span>
                </div>
              )}

              {(vendor as any).address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{(vendor as any).address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Orders</span>
                <span className="text-sm font-semibold">
                  {(vendor as any).orders?.length || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Spent</span>
                <span className="text-sm font-semibold">
                  {formatCurrency(
                    (vendor as any).orders?.reduce((sum: number, order: unknown) =>
                      sum + (order.total_amount || 0), 0) || 0
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Order Value</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(
                    ((vendor as any).orders?.length || 0) > 0
                      ? ((vendor as any).orders?.reduce((sum: number, order: unknown) =>
                          sum + (order.total_amount || 0), 0) || 0) / (vendor as any).orders.length
                      : 0
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(vendor as any).orders && (vendor as any).orders.length > 0 ? (
                <div className="space-y-3">
                  {(vendor as any).orders
                    .sort((a: unknown, b: unknown) => new Date(b.order_date || 0).getTime() - new Date(a.order_date || 0).getTime())
                    .slice(0, 3)
                    .map((order: unknown) => (
                      <div key={order.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">
                            Order {(order.order_number || order.id).slice(-8)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.order_date ? new Date(order.order_date).toLocaleDateString() : 'No date'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatCurrency(order.total_amount || 0)}</p>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4 text-sm">
                  No orders yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'catalog',
      label: 'Catalog',
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Vendor Catalog</CardTitle>
          </CardHeader>
          <CardContent>
            {(vendor as any).catalog_items && (vendor as any).catalog_items.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(vendor as any).catalog_items.map((item: unknown) => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Category: {item.category}
                    </p>
                    <p className="text-sm font-semibold mt-2">
                      {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No catalog items available
              </p>
            )}
          </CardContent>
        </Card>
      )
    }
  ];

  return (
    <DetailTemplate
      breadcrumbs={breadcrumbs}
      title={(vendor as any).name}
      subtitle={`${(vendor as any).category?.toUpperCase()} • ${getStatusBadge((vendor as any).status)}`}
      tabs={tabs}
      backHref="/procurement/vendors"
    />
  );
}
