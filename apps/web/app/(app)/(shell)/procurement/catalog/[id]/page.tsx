/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DetailTemplate } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { Package, DollarSign, Tag, TrendingUp, ShoppingCart, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';


export const metadata = {
  title: 'Catalog Item Details - GHXSTSHIP',
  description: 'View detailed catalog item information and procurement history.',
};

interface CatalogDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CatalogDetailPage({ params }: CatalogDetailPageProps) {
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

  // Get catalog item
  const { data: item, error: itemError } = await supabase
    .from('procurement_catalog')
    .select(`
      *,
      vendor:procurement_vendors(name, contact_email),
      orders:procurement_order_items(
        id,
        quantity,
        total_price,
        order:procurement_orders(
          id,
          order_number,
          order_date,
          status
        )
      )
    `)
    .eq('id', id)
    .eq('organization_id', orgId)
    .single();

  if (itemError || !item) {
    return (
      <DetailTemplate
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Procurement', href: '/procurement' },
          { label: 'Catalog', href: '/procurement/catalog' },
          { label: 'Not Found' }
        ]}
        title="Catalog Item Not Found"
        tabs={[{
          id: 'error',
          label: 'Error',
          content: (
            <div className="text-center py-xl">
              <p className="text-muted-foreground">The requested catalog item could not be found.</p>
            </div>
          )
        }]}
      />
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Procurement', href: '/procurement' },
    { label: 'Catalog', href: '/procurement/catalog' },
    { label: (item as any).name }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      discontinued: 'destructive'
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
          {/* Item Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <Package className="h-icon-sm w-icon-sm" />
                Item Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div>
                <h3 className="text-lg font-semibold">{(item as any).name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {(item as any).description || 'No description provided'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                {getStatusBadge((item as any).status)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Category</span>
                <Badge variant="outline">
                  {(item as any).category?.toUpperCase() || 'GENERAL'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Unit Price</span>
                <span className="text-sm font-semibold">
                  {formatCurrency((item as any).unit_price || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">SKU</span>
                <span className="text-sm font-mono">
                  {(item as any).sku || 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <Tag className="h-icon-sm w-icon-sm" />
                Vendor & Supplier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-sm">
              <div>
                <p className="font-medium">{(item as any).vendor?.name || 'No vendor assigned'}</p>
                {(item as any).vendor?.contact_email && (
                  <p className="text-sm text-muted-foreground">
                    {(item as any).vendor.contact_email}
                  </p>
                )}
              </div>

              {(item as any).supplier_part_number && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Supplier Part #</span>
                  <span className="text-sm font-mono">
                    {(item as any).supplier_part_number}
                  </span>
                </div>
              )}

              {(item as any).lead_time_days && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Lead Time</span>
                  <span className="text-sm text-muted-foreground">
                    {(item as any).lead_time_days} days
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Procurement Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <TrendingUp className="h-icon-sm w-icon-sm" />
                Procurement Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Orders</span>
                <span className="text-sm font-semibold">
                  {(item as any).orders?.length || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Quantity Ordered</span>
                <span className="text-sm text-muted-foreground">
                  {(item as any).orders?.reduce((sum: number, orderItem: unknown) =>
                    sum + (orderItem.quantity || 0), 0) || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Spent</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(
                    (item as any).orders?.reduce((sum: number, orderItem: unknown) =>
                      sum + (orderItem.total_price || 0), 0) || 0
                  )}
                </span>
              </div>

              {(item as any).minimum_order_quantity && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Min Order Qty</span>
                  <span className="text-sm text-muted-foreground">
                    {(item as any).minimum_order_quantity}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <AlertTriangle className="h-icon-sm w-icon-sm" />
                Stock & Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              {(item as any).current_stock !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Stock</span>
                  <span className="text-sm font-semibold">
                    {(item as any).current_stock}
                  </span>
                </div>
              )}

              {(item as any).reorder_point && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Reorder Point</span>
                  <span className="text-sm text-muted-foreground">
                    {(item as any).reorder_point}
                  </span>
                </div>
              )}

              {(item as any).maximum_stock && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Maximum Stock</span>
                  <span className="text-sm text-muted-foreground">
                    {(item as any).maximum_stock}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'orders',
      label: 'Order History',
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            {(item as any).orders && (item as any).orders.length > 0 ? (
              <div className="space-y-sm">
                {(item as any).orders
                  .sort((a: unknown, b: unknown) => new Date(b.order?.order_date || 0).getTime() - new Date(a.order?.order_date || 0).getTime())
                  .map((orderItem: unknown) => (
                    <div key={orderItem.id} className="flex items-center justify-between p-md border rounded">
                      <div className="flex items-center gap-sm">
                        <ShoppingCart className="h-icon-xs w-icon-xs text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            Order {(orderItem.order?.order_number || orderItem.order?.id)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {orderItem.order?.order_date ? new Date(orderItem.order.order_date).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Qty: {orderItem.quantity}</p>
                        <p className="text-sm font-semibold">{formatCurrency(orderItem.total_price || 0)}</p>
                        <Badge variant="outline" className="mt-1">
                          {orderItem.order?.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-xl">
                No orders found for this item
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
      title={(item as any).name}
      subtitle={`Category: ${(item as any).category} • Price: ${formatCurrency((item as any).unit_price || 0)}`}
      tabs={tabs}
      backHref="/procurement/catalog"
    />
  );
}
