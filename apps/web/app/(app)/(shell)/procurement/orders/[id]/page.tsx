/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DetailTemplate } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { ShoppingCart, Truck, DollarSign, Calendar, User, Package } from 'lucide-react';

export const metadata = {
  title: 'Order Details - GHXSTSHIP',
  description: 'View detailed procurement order information and status.',
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
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

  // Get order record
  const { data: order, error: orderError } = await supabase
    .from('procurement_orders')
    .select(`
      *,
      vendor:procurement_vendors(name, contact_email),
      items:procurement_order_items(
        id,
        quantity,
        unit_price,
        total_price,
        catalog_item:procurement_catalog(name, description, category)
      )
    `)
    .eq('id', id)
    .eq('organization_id', orgId)
    .single();

  if (orderError || !order) {
    return (
      <DetailTemplate
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Procurement', href: '/procurement' },
          { label: 'Orders', href: '/procurement/orders' },
          { label: 'Not Found' }
        ]}
        title="Order Not Found"
        tabs={[{
          id: 'error',
          label: 'Error',
          content: (
            <div className="text-center py-xl">
              <p className="text-muted-foreground">The requested order could not be found.</p>
            </div>
          )
        }]}
      />
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Procurement', href: '/procurement' },
    { label: 'Orders', href: '/procurement/orders' },
    { label: `Order ${(order as any).order_number || (order as any).id}` }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      submitted: 'default',
      approved: 'default',
      ordered: 'default',
      received: 'default',
      cancelled: 'destructive',
      rejected: 'destructive'
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
          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <ShoppingCart className="h-icon-sm w-icon-sm" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Order Number</span>
                <span className="text-sm font-mono">
                  {(order as any).order_number || (order as any).id}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                {getStatusBadge((order as any).status)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Amount</span>
                <span className="text-sm font-semibold">
                  {formatCurrency((order as any).total_amount || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Order Date</span>
                <span className="text-sm text-muted-foreground">
                  {(order as any).order_date ? new Date((order as any).order_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <Truck className="h-icon-sm w-icon-sm" />
                Vendor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-sm">
              <div>
                <p className="font-medium">{(order as any).vendor?.name || 'No vendor assigned'}</p>
                {(order as any).vendor?.contact_email && (
                  <p className="text-sm text-muted-foreground">
                    {(order as any).vendor.contact_email}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <Package className="h-icon-sm w-icon-sm" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(order as any).items && (order as any).items.length > 0 ? (
                <div className="space-y-sm">
                  {(order as any).items.map((item: unknown) => (
                    <div key={item.id} className="flex items-center justify-between p-sm border rounded">
                      <div className="flex-1">
                        <p className="font-medium">{item.catalog_item?.name || 'Unknown Item'}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.catalog_item?.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-md mt-1">
                          <span className="text-xs">Qty: {item.quantity}</span>
                          <span className="text-xs">Unit: {formatCurrency(item.unit_price)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.total_price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-md">
                  No items in this order
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'tracking',
      label: 'Tracking',
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Shipping & Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-xl">
              Tracking information coming soon...
            </p>
          </CardContent>
        </Card>
      )
    }
  ];

  return (
    <DetailTemplate
      breadcrumbs={breadcrumbs}
      title={`Order ${(order as any).order_number || (order as any).id}`}
      subtitle={`Status: ${(order as any).status} • Total: ${formatCurrency((order as any).total_amount || 0)}`}
      tabs={tabs}
      backHref="/procurement/orders"
    />
  );
}
