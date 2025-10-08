'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Skeleton
} from '@ghxstship/ui'
import { Skeleton } from '@ghxstship/ui/components/atomic/Skeleton'
import { Stack, HStack, Grid } from '@ghxstship/ui/components/layouts'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  MessageSquare,
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react'

import { useMarketplaceOverview } from '../hooks/useMarketplaceOverview'

const quickActions = [
  { id: 'create-listing', icon: Plus, label: 'Create Listing', href: '/marketplace/listings/create' },
  { id: 'post-project', icon: Briefcase, label: 'Post Project', href: '/marketplace/projects/create' },
  { id: 'browse-vendors', icon: Users, label: 'Browse Vendors', href: '/marketplace/vendors' },
  { id: 'view-reviews', icon: MessageSquare, label: 'View Reviews', href: '/marketplace/reviews' },
]

const metricIconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  totalListings: Briefcase,
  activeVendors: Users,
  activeProjects: LayoutDashboard,
  responses: MessageSquare
}

const trendToneMap: Record<'up' | 'down' | 'neutral', { badge: 'success' | 'destructive' | 'secondary'; iconClass: string }> = {
  up: { badge: 'success', iconClass: 'text-success' },
  down: { badge: 'destructive', iconClass: 'text-destructive' },
  neutral: { badge: 'secondary', iconClass: 'text-muted-foreground' }
}

const activityIconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  listing_created: Briefcase,
  proposal_submitted: MessageSquare,
  contract_signed: LayoutDashboard,
  payment_received: DollarSign
}

const activityStatusTone: Record<string, { variant: 'outline' | 'secondary'; textClass: string }> = {
  active: { variant: 'outline', textClass: 'text-success' },
  pending: { variant: 'outline', textClass: 'text-warning' },
  completed: { variant: 'outline', textClass: 'text-muted-foreground' }
}

export default function OverviewClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const { metrics, activity, loading, refreshing, error, refresh } = useMarketplaceOverview({ orgId })

  const metricCards = useMemo(
    () =>
      metrics.map((metric) => {
        const Icon = metricIconMap[metric.id] ?? Activity
        const TrendIcon = metric.trend === 'up' ? ArrowUpRight : metric.trend === 'down' ? ArrowDownRight : Activity
        const tone = trendToneMap[metric.trend] ?? trendToneMap.neutral
        return { ...metric, Icon, TrendIcon, tone }
      }),
    [metrics],
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
          <CardDescription>We couldn’t load marketplace insights. Try refreshing.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={refresh}>Retry</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Stack spacing="lg">
      <HStack justify="between" align="center">
        <Stack spacing="xs">
          <h1 className="text-heading-3 font-anton uppercase text-foreground">Marketplace Overview</h1>
          <p className="text-body-sm text-muted-foreground">
            Monitor listings, vendor engagement, and marketplace performance in one view.
          </p>
        </Stack>
        <Button variant={refreshing ? 'outline' : 'default'} disabled={refreshing} onClick={refresh}>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      </HStack>

      <Grid cols={1} responsive={{ md: 2, lg: 4 }} spacing="md">
        {metricCards.map((metric) => (
          <Card key={metric.id}>
            <CardContent>
              <HStack justify="between" align="center">
                <metric.Icon className={`h-icon-sm w-icon-sm ${metric.tone.iconClass}`} />
                <Badge variant={metric.tone.badge} className="flex items-center gap-xs text-xs px-sm">
                  <metric.TrendIcon className="h-3 w-3" />
                  {metric.change > 0 ? `+${metric.change}%` : `${metric.change}%`}
                </Badge>
              </HStack>
              <Stack spacing="xs" className="mt-md">
                <span className="text-heading-3 font-semibold text-foreground">{metric.value}</span>
                <span className="text-sm text-muted-foreground">{metric.label}</span>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Grid>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Quick Actions</CardTitle>
          <CardDescription>Jump into common marketplace workflows.</CardDescription>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Recent Activity</CardTitle>
          <CardDescription>Latest movement across listings, proposals, contracts, and payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Stack spacing="sm">
            {activity.length === 0 ? (
              <Stack spacing="sm" align="center" className="py-xl text-muted-foreground">
                <Activity className="h-icon-2xl w-icon-2xl" />
                <span className="text-sm">No recent marketplace activity</span>
              </Stack>
            ) : (
              activity.map((item) => {
                const Icon = activityIconMap[item.type] ?? Activity
                const tone = activityStatusTone[item.status] ?? { variant: 'outline', textClass: 'text-muted-foreground' }

                return (
                  <HStack
                    key={item.id}
                    spacing="sm"
                    justify="between"
                    align="center"
                    className="rounded-lg border border-border bg-card/60 p-md"
                  >
                    <HStack spacing="sm" align="center">
                      <div className="p-sm rounded-lg bg-muted/20">
                        <Icon className="h-icon-xs w-icon-xs" />
                      </div>
                      <Stack spacing="xs">
                        <span className="text-sm font-medium text-foreground">{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </Stack>
                    </HStack>
                    <HStack spacing="md" align="center">
                      <Stack spacing="xs" align="end">
                        <span className="text-xs text-muted-foreground">{item.user}</span>
                        <span className="text-xs text-muted-foreground/80">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </Stack>
                      <Badge variant={tone.variant} className={`capitalize ${tone.textClass}`}>
                        {item.status}
                      </Badge>
                    </HStack>
                  </HStack>
                )
              })
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
