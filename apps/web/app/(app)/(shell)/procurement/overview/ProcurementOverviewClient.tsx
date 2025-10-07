'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
} from '@ghxstship/ui'
import { Skeleton } from '@ghxstship/ui/components/atomic/Skeleton'
import { Stack, HStack, Grid } from '@ghxstship/ui/components/layouts'
import {
  ShoppingCart,
  Package,
  Wrench,
  Building,
  Tag,
  CheckCircle,
  Clock,
  DollarSign,
  ArrowRight,
} from 'lucide-react'

import { useProcurementOverview } from '../hooks/useProcurementOverview'

const quickActions = [
  { id: 'order', icon: ShoppingCart, label: 'Create Order', href: '/procurement/orders' },
  { id: 'product', icon: Package, label: 'Add Product', href: '/procurement/products' },
  { id: 'service', icon: Wrench, label: 'Add Service', href: '/procurement/services' },
  { id: 'vendor', icon: Building, label: 'Add Vendor', href: '/procurement/vendors' },
]

export default function ProcurementOverviewClient({ orgId }: { orgId: string }) {
  const t = useTranslations('procurement.overview')
  const router = useRouter()
  const { stats, recentOrders, loading, refreshing, error, refresh } = useProcurementOverview({ orgId })

  const formatCurrency = (amount: number, currency: string = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)

  const metricCards = useMemo(
    () => [
      {
        id: 'totalOrders',
        label: 'Total Orders',
        value: stats?.totalOrders ?? 0,
        icon: ShoppingCart,
        tone: 'accent',
      },
      {
        id: 'pendingOrders',
        label: 'Pending Orders',
        value: stats?.pendingOrders ?? 0,
        icon: Clock,
        tone: 'warning',
      },
      {
        id: 'completedOrders',
        label: 'Completed Orders',
        value: stats?.completedOrders ?? 0,
        icon: CheckCircle,
        tone: 'success',
      },
      {
        id: 'totalSpent',
        label: 'Total Spent',
        value: stats ? formatCurrency(stats.totalSpent, stats.currency) : '$0.00',
        icon: DollarSign,
        tone: 'secondary',
      },
    ],
    [stats],
  )

  const catalogCards = useMemo(
    () => [
      {
        id: 'products',
        label: 'Products',
        helper: 'Active products',
        value: stats?.totalProducts ?? 0,
        href: '/procurement/products',
        icon: Package,
        tone: 'accent',
      },
      {
        id: 'services',
        label: 'Services',
        helper: 'Available services',
        value: stats?.totalServices ?? 0,
        href: '/procurement/services',
        icon: Wrench,
        tone: 'success',
      },
      {
        id: 'vendors',
        label: 'Vendors',
        helper: 'Trusted vendors',
        value: stats?.totalVendors ?? 0,
        href: '/procurement/vendors',
        icon: Building,
        tone: 'warning',
      },
      {
        id: 'categories',
        label: 'Categories',
        helper: 'Catalog categories',
        value: stats?.totalCategories ?? 0,
        href: '/procurement/categories',
        icon: Tag,
        tone: 'secondary',
      },
    ],
    [stats],
  )

  if (loading) {
    return (
      <Stack spacing="lg">
        <HStack justify="between" align="center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-28" />
        </HStack>
        <Grid cols={1} responsive={{ md: 2, lg: 4 }} spacing="md">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-sm">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Stack>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-destructive">{error}</CardTitle>
          <CardDescription>{t('loadErrorDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={refresh}>{t('retry')}</Button>
        </CardContent>
      </Card>
    )
  }

  const toneStyles: Record<string, { bg: string; text: string }> = {
    accent: { bg: 'bg-accent/10', text: 'text-accent' },
    warning: { bg: 'bg-warning/10', text: 'text-warning' },
    success: { bg: 'bg-success/10', text: 'text-success' },
    secondary: { bg: 'bg-secondary/10', text: 'text-secondary' },
  }

  const statusToneMap: Record<string, { bg: string; text: string }> = {
    draft: { bg: 'bg-muted/20', text: 'text-muted-foreground' },
    pending: { bg: 'bg-warning/10', text: 'text-warning' },
    approved: { bg: 'bg-success/10', text: 'text-success' },
    delivered: { bg: 'bg-success/10', text: 'text-success' },
    completed: { bg: 'bg-success/10', text: 'text-success' },
    cancelled: { bg: 'bg-destructive/10', text: 'text-destructive' },
  }

  const renderStatusBadge = (status: string) => {
    const normalized = status?.toLowerCase() ?? 'unknown'
    const tone = statusToneMap[normalized] ?? { bg: 'bg-muted/20', text: 'text-muted-foreground' }
    return (
      <Badge variant="outline" className={`capitalize ${tone.bg} ${tone.text}`}>
        {normalized.replace(/_/g, ' ')}
      </Badge>
    )
  }

  return (
    <Stack spacing="lg">
      <HStack justify="between" align="center">
        <Stack spacing="xs">
          <h1 className="text-heading-3 font-anton uppercase text-foreground">Procurement Overview</h1>
          <p className="text-body-sm text-muted-foreground">
            Unified view of your procurement pipeline, vendors, and catalog health.
          </p>
        </Stack>
        <Button variant={refreshing ? 'outline' : 'default'} disabled={refreshing} onClick={refresh}>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      </HStack>

      <Grid cols={1} responsive={{ md: 2, lg: 4 }} spacing="md">
        {metricCards.map((metric) => {
          const tone = toneStyles[metric.tone] ?? toneStyles.accent
          return (
            <Card key={metric.id}>
              <CardContent>
                <HStack spacing="md" align="center">
                  <div className={`p-sm rounded-lg ${tone.bg}`}>
                    <metric.icon className={`h-icon-md w-icon-md ${tone.text}`} />
                  </div>
                  <Stack spacing="xs">
                    <span className="text-sm text-muted-foreground">{metric.label}</span>
                    <span className="text-heading-3 font-semibold text-foreground">{metric.value}</span>
                  </Stack>
                </HStack>
              </CardContent>
            </Card>
          )
        })}
      </Grid>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Catalog Overview</CardTitle>
          <CardDescription>Snapshot of products, services, vendors, and categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <Grid cols={1} responsive={{ md: 2, lg: 4 }} spacing="md">
            {catalogCards.map((item) => {
              const tone = toneStyles[item.tone] ?? toneStyles.accent
              return (
                <Card key={item.id} className="border-border">
                  <CardContent>
                    <HStack justify="between" align="center" className="mb-md">
                      <HStack spacing="sm" align="center">
                        <item.icon className={`h-icon-sm w-icon-sm ${tone.text}`} />
                        <span className="text-sm font-medium text-foreground">{item.label}</span>
                      </HStack>
                      <Button variant="ghost" size="sm" onClick={() => router.push(item.href)}>
                        <ArrowRight className="h-icon-xs w-icon-xs" />
                      </Button>
                    </HStack>
                    <Stack spacing="xs">
                      <span className="text-heading-3 font-semibold text-foreground">{item.value}</span>
                      <span className="text-sm text-muted-foreground">{item.helper}</span>
                    </Stack>
                  </CardContent>
                </Card>
              )
            })}
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-foreground">{t('recentOrders.title')}</CardTitle>
          <CardDescription>{t('recentOrders.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <Stack spacing="sm" align="center" className="py-xl text-center">
              <ShoppingCart className="h-icon-2xl w-icon-2xl text-muted-foreground/40" />
              <span className="text-sm text-muted-foreground">{t('recentOrders.empty')}</span>
              <Button onClick={() => router.push('/procurement/orders')} className="mt-sm">
                {t('recentOrders.cta')}
              </Button>
            </Stack>
          ) : (
            <Stack spacing="sm">
              {recentOrders.map((order) => (
                <HStack
                  key={order.id}
                  justify="between"
                  align="center"
                  className="rounded-lg border border-border bg-card/60 p-md"
                >
                  <Stack spacing="xs">
                    <span className="text-sm font-medium text-foreground">{order.order_number}</span>
                    <span className="text-sm text-muted-foreground">{order.vendor_name}</span>
                  </Stack>
                  <HStack spacing="md" align="center">
                    <Stack spacing="xs" align="end">
                      <span className="text-sm font-medium text-foreground">
                        {formatCurrency(order.total_amount, order.currency ?? 'USD')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </Stack>
                    {renderStatusBadge(order.status)}
                  </HStack>
                </HStack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-foreground">{t('quickActions.title')}</CardTitle>
          <CardDescription>{t('quickActions.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Grid cols={1} responsive={{ md: 2, lg: 4 }} spacing="md">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="justify-start"
                onClick={() => router.push(action.href)}
              >
                <HStack spacing="sm" align="center">
                  <action.icon className="h-icon-xs w-icon-xs" />
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                </HStack>
              </Button>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  )
}
