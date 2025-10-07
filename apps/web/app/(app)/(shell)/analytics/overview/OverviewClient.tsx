'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@ghxstship/auth'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
} from '@ghxstship/ui'
import { Skeleton } from '@ghxstship/ui/components/atomic/Skeleton'
import { Stack, HStack, Grid } from '@ghxstship/ui/components/layouts'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Clock,
  DollarSign,
  Minus,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'

type ChangeType = 'increase' | 'decrease' | 'neutral'
type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>

interface AnalyticsMetric {
  id: string
  title: string
  value: string
  change: number
  changeType: ChangeType
  icon: IconComponent
  description: string
}

interface RecentActivity {
  id: string
  type: string
  description: string
  timestamp: string
  user: string
}

interface TopPerformer {
  id: string
  name: string
  category: string
  value: string
  change: number
}

interface OverviewClientProps {
  organizationId: string
  translations: Record<string, string>
}

const toNumber = (value: unknown): number => {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatCurrency = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 1,
  }).format(amount)

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

const useAnalyticsOverview = (supabase: SupabaseClient, organizationId: string) => {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([])

  const loadOverviewData = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (mode === 'initial') {
        setLoading(true)
      } else {
        setRefreshing(true)
      }

      try {
        setError(null)

        const [projectsData, peopleData, financeData, eventsData] = await Promise.all([
          supabase.from('projects').select('status').eq('organization_id', organizationId),
          supabase.from('people').select('id').eq('organization_id', organizationId),
          supabase
            .from('finance_transactions')
            .select('amount, type, currency')
            .eq('organization_id', organizationId),
          supabase.from('events').select('id').eq('organization_id', organizationId),
        ])

        const primaryCurrency =
          financeData.data?.find((tx) => tx.currency)?.currency ||
          'USD'

        const totalProjects = projectsData.data?.length ?? 0
        const activeProjects = projectsData.data?.filter((project) => project.status === 'active').length ?? 0
        const totalPeople = peopleData.data?.length ?? 0
        const totalRevenue = (financeData.data ?? [])
          .filter((tx) => tx.type === 'income')
          .reduce((sum, tx) => sum + toNumber(tx.amount), 0)
        const totalEvents = eventsData.data?.length ?? 0

        const calculatedMetrics: AnalyticsMetric[] = [
          {
            id: 'active-projects',
            title: 'Active Projects',
            value: activeProjects.toString(),
            change: 12.5,
            changeType: 'increase',
            icon: Target,
            description: `${totalProjects} total projects`,
          },
          {
            id: 'team-members',
            title: 'Team Members',
            value: totalPeople.toString(),
            change: 8.2,
            changeType: 'increase',
            icon: Users,
            description: 'Active team members',
          },
          {
            id: 'revenue',
            title: 'Revenue',
            value: formatCurrency(totalRevenue, primaryCurrency),
            change: 15.3,
            changeType: 'increase',
            icon: DollarSign,
            description: 'Total revenue this period',
          },
          {
            id: 'events',
            title: 'Events',
            value: totalEvents.toString(),
            change: -2.1,
            changeType: totalEvents > 0 ? 'decrease' : 'neutral',
            icon: Calendar,
            description: 'Scheduled events',
          },
        ]

        setMetrics(calculatedMetrics)

        const mockActivity: RecentActivity[] = [
          {
            id: '1',
            type: 'project_created',
            description: 'New project "Blackwater Reverb" created',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            user: 'Captain Jack Sparrow',
          },
          {
            id: '2',
            type: 'team_member_added',
            description: 'Elizabeth Swann joined the crew',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            user: 'Will Turner',
          },
          {
            id: '3',
            type: 'invoice_paid',
            description: 'Invoice #INV-001 marked as paid',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            user: 'Hector Barbossa',
          },
          {
            id: '4',
            type: 'event_scheduled',
            description: 'Main Deck Performance scheduled',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
            user: 'Joshamee Gibbs',
          },
        ]

        setRecentActivity(mockActivity)

        const mockPerformers: TopPerformer[] = [
          {
            id: '1',
            name: 'Blackwater Reverb',
            category: 'Project',
            value: '$75,000',
            change: 25.5,
          },
          {
            id: '2',
            name: 'Captain Jack Sparrow',
            category: 'Team Member',
            value: '98% Rating',
            change: 12.3,
          },
          {
            id: '3',
            name: 'Main Deck Takeover',
            category: 'Event',
            value: '500 Attendees',
            change: 18.7,
          },
        ]

        setTopPerformers(mockPerformers)
      } catch (err) {
        console.error('Error loading analytics overview:', err)
        setError('Failed to load analytics overview')
      } finally {
        if (mode === 'initial') {
          setLoading(false)
        } else {
          setRefreshing(false)
        }
      }
    },
    [supabase, organizationId],
  )

  useEffect(() => {
    loadOverviewData('initial')
  }, [loadOverviewData])

  return {
    loading,
    refreshing,
    error,
    metrics,
    recentActivity,
    topPerformers,
    refresh: () => loadOverviewData('refresh'),
  }
}

export default function OverviewClient({ organizationId, translations }: OverviewClientProps) {
  const supabase = useMemo(() => createBrowserClient(), []) as unknown as SupabaseClient
  const { loading, refreshing, error, metrics, recentActivity, topPerformers, refresh } = useAnalyticsOverview(
    supabase,
    organizationId,
  )

  if (loading) {
    return (
      <Stack spacing="lg">
        <Grid cols={1} responsive={{ md: 2, lg: 4 }} spacing="md">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-sm">
                <Skeleton className="h-icon-sm w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-20" />
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
          <CardDescription>Something went wrong while loading analytics.</CardDescription>
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
          <h1 className="text-heading-3 font-anton uppercase text-foreground">
            {translations.title ?? 'Analytics Overview'}
          </h1>
          <p className="text-body-sm text-muted-foreground">
            {translations.subtitle ?? 'Monitor performance across all analytics sources'}
          </p>
        </Stack>
        <Button onClick={refresh} variant={refreshing ? 'outline' : 'default'} disabled={refreshing}>
          <HStack spacing="xs" align="center">
            <BarChart3 className="h-icon-xs w-icon-xs" />
            <span>{refreshing ? 'Refreshing…' : translations.refresh ?? 'Refresh Data'}</span>
          </HStack>
        </Button>
      </HStack>

      <Grid cols={1} responsive={{ md: 2, lg: 4 }} spacing="md">
        {metrics.map((metric) => {
          const Icon = metric.icon
          const changeClass =
            metric.changeType === 'increase'
              ? 'text-success'
              : metric.changeType === 'decrease'
              ? 'text-destructive'
              : 'text-muted-foreground'

          return (
            <Card key={metric.id}>
              <CardContent>
                <Stack spacing="sm">
                  <HStack justify="between" align="center">
                    <HStack spacing="sm" align="center">
                      <Icon className="h-icon-sm w-icon-sm text-accent" />
                      <span className="text-sm text-muted-foreground">{metric.title}</span>
                    </HStack>
                    {metric.changeType === 'increase' && (
                      <ArrowUpRight className="h-icon-xs w-icon-xs text-success" />
                    )}
                    {metric.changeType === 'decrease' && (
                      <ArrowDownRight className="h-icon-xs w-icon-xs text-destructive" />
                    )}
                    {metric.changeType === 'neutral' && <Minus className="h-icon-xs w-icon-xs text-muted-foreground" />}
                  </HStack>
                  <Stack spacing="xs">
                    <span className="text-heading-3 font-semibold text-foreground">{metric.value}</span>
                    <HStack spacing="xs" align="center">
                      <span className={`text-sm font-medium ${changeClass}`}>
                        {metric.change > 0 ? '+' : ''}
                        {metric.change}%
                      </span>
                      <span className="text-sm text-muted-foreground">vs last period</span>
                    </HStack>
                    <span className="text-sm text-muted-foreground">{metric.description}</span>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          )
        })}
      </Grid>

      <Grid cols={1} responsive={{ lg: 2 }} spacing="lg">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-foreground">{translations.recentActivity ?? 'Recent Activity'}</CardTitle>
            <CardDescription>Latest cross-module analytics events</CardDescription>
          </CardHeader>
          <CardContent>
            <Stack spacing="md">
              {recentActivity.map((activity) => (
                <HStack key={activity.id} spacing="sm" align="start">
                  <Activity className="h-icon-xs w-icon-xs text-accent mt-1" />
                  <Stack spacing="xs" className="flex-1">
                    <span className="text-sm text-foreground">{activity.description}</span>
                    <HStack spacing="xs" align="center" className="text-xs text-muted-foreground">
                      <span>by {activity.user}</span>
                      <span>•</span>
                      <span>{formatTimestamp(activity.timestamp)}</span>
                    </HStack>
                  </Stack>
                </HStack>
              ))}
            </Stack>
            <Button variant="outline" className="mt-lg w-full">
              {translations.viewAllActivity ?? 'View All Activity'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-foreground">{translations.topPerformers ?? 'Top Performers'}</CardTitle>
            <CardDescription>High-impact projects, people, and events</CardDescription>
          </CardHeader>
          <CardContent>
            <Stack spacing="md">
              {topPerformers.map((performer, index) => (
                <HStack key={performer.id} justify="between" align="center">
                  <HStack spacing="sm" align="center">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <Stack spacing="xs">
                      <span className="text-sm font-medium text-foreground">{performer.name}</span>
                      <span className="text-xs text-muted-foreground">{performer.category}</span>
                    </Stack>
                  </HStack>
                  <Stack spacing="xs" align="end">
                    <span className="text-sm font-medium text-foreground">{performer.value}</span>
                    <span className="text-xs text-success">+{performer.change}%</span>
                  </Stack>
                </HStack>
              ))}
            </Stack>
            <Button variant="outline" className="mt-lg w-full">
              {translations.viewDetailedAnalytics ?? 'View Detailed Analytics'}
            </Button>
          </CardContent>
        </Card>
      </Grid>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-foreground">{translations.quickActions ?? 'Quick Actions'}</CardTitle>
          <CardDescription>Jump into common analytics workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <Grid cols={1} responsive={{ md: 3 }} spacing="md">
            <Button variant="outline" className="justify-start">
              <HStack spacing="sm" align="center">
                <BarChart3 className="h-icon-xs w-icon-xs" />
                <span>{translations.createDashboard ?? 'Create Dashboard'}</span>
              </HStack>
            </Button>
            <Button variant="outline" className="justify-start">
              <HStack spacing="sm" align="center">
                <TrendingUp className="h-icon-xs w-icon-xs" />
                <span>{translations.generateReport ?? 'Generate Report'}</span>
              </HStack>
            </Button>
            <Button variant="outline" className="justify-start">
              <HStack spacing="sm" align="center">
                <Clock className="h-icon-xs w-icon-xs" />
                <span>{translations.scheduleExport ?? 'Schedule Export'}</span>
              </HStack>
            </Button>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  )
}
