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
} from '@ghxstship/ui'
import { Skeleton } from '@ghxstship/ui/components/atomic/Skeleton'
import { Stack, HStack, Grid } from '@ghxstship/ui/components/layouts'
import {
  Package,
  DollarSign,
  UserCheck,
  Wrench,
  Activity,
  MapPin,
  AlertTriangle,
  Plus,
} from 'lucide-react'

import { useAssetsOverview } from '../hooks/useAssetsOverview'

const quickActions = [
  { id: 'add', icon: Package, label: 'Add Asset', href: '/assets/inventory/create' },
  { id: 'advance', icon: DollarSign, label: 'Create Advance', href: '/assets/advancing/create' },
  { id: 'assignment', icon: UserCheck, label: 'New Assignment', href: '/assets/assignments/create' },
  { id: 'maintenance', icon: Wrench, label: 'Schedule Maintenance', href: '/assets/maintenance/create' },
]

const activityIconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  asset: Package,
  asset_assignment: UserCheck,
  asset_maintenance: Wrench,
  asset_tracking: MapPin,
}

const statusToneMap: Record<string, { bg: string; text: string }> = {
  available: { bg: 'bg-success/10', text: 'text-success' },
  in_use: { bg: 'bg-info/10', text: 'text-info' },
  under_maintenance: { bg: 'bg-warning/10', text: 'text-warning' },
  maintenance: { bg: 'bg-warning/10', text: 'text-warning' },
  damaged: { bg: 'bg-destructive/10', text: 'text-destructive' },
  missing: { bg: 'bg-muted/20', text: 'text-muted-foreground' },
}

export default function OverviewClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const { stats, activity, loading, refreshing, error, refresh } = useAssetsOverview({ orgId })

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  const metricCards = useMemo(
    () => [
      {
        id: 'totalAssets',
        label: 'Total Assets',
        value: stats?.totalAssets ?? 0,
        icon: Package,
        tone: 'accent',
      },
      {
        id: 'totalValue',
        label: 'Total Value',
        value: stats ? formatCurrency(stats.totalValue) : '$0.00',
        icon: DollarSign,
        tone: 'success',
      },
      {
        id: 'activeAssignments',
        label: 'Active Assignments',
        value: stats?.activeAssignments ?? 0,
        icon: UserCheck,
        tone: 'accent',
      },
      {
        id: 'pendingMaintenance',
        label: 'Pending Maintenance',
        value: stats?.pendingMaintenance ?? 0,
        icon: Wrench,
        tone: 'warning',
      },
    ],
    [stats],
  )

  const statusBreakdown = useMemo(
    () => [
      {
        id: 'available',
        label: 'Available',
        count: stats?.availableAssets ?? 0,
        total: stats?.totalAssets ?? 0,
        tone: statusToneMap.available,
      },
      {
        id: 'in_use',
        label: 'In Use',
        count: stats?.inUseAssets ?? 0,
        total: stats?.totalAssets ?? 0,
        tone: statusToneMap.in_use,
      },
      {
        id: 'maintenance',
        label: 'Under Maintenance',
        count: stats?.maintenanceAssets ?? 0,
        total: stats?.totalAssets ?? 0,
        tone: statusToneMap.under_maintenance,
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
          <CardDescription>We couldn’t load asset insights. Try again in a moment.</CardDescription>
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
          <h1 className="text-heading-3 font-anton uppercase text-foreground">Assets Overview</h1>
          <p className="text-body-sm text-muted-foreground">
            Monitor inventory health, assignment coverage, and maintenance demand.
          </p>
        </Stack>
        <Button variant={refreshing ? 'outline' : 'default'} disabled={refreshing} onClick={refresh}>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      </HStack>

      <Grid cols={1} responsive={{ md: 2, lg: 4 }} spacing="md">
        {metricCards.map((metric) => {
          const tone = statusToneMap[metric.tone as keyof typeof statusToneMap] ?? {
            bg: 'bg-muted/20',
            text: 'text-muted-foreground',
          }
          return (
            <Card key={metric.id}>
              <CardContent>
                <HStack spacing="md" align="center">
                  <div className={`${tone.bg} p-sm rounded-lg`}>
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

      <Grid cols={1} responsive={{ lg: 2 }} spacing="lg">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Asset Status Breakdown</CardTitle>
            <CardDescription>Distribution of assets across availability and maintenance states.</CardDescription>
          </CardHeader>
          <CardContent>
            <Stack spacing="sm">
              {statusBreakdown.map((status) => {
                const percentage = status.total > 0 ? Math.round((status.count / status.total) * 100) : 0
                const tone = status.tone
                return (
                  <HStack key={status.id} justify="between" align="center">
                    <HStack spacing="sm" align="center">
                      <span className={`h-2 w-2 rounded-full ${tone.bg}`} />
                      <span className="text-sm font-medium text-foreground">{status.label}</span>
                    </HStack>
                    <HStack spacing="sm" align="center">
                      <span className="text-sm text-muted-foreground">{status.count}</span>
                      <Badge variant="outline" className={`${tone.bg} ${tone.text}`}>
                        {percentage}%
                      </Badge>
                    </HStack>
                  </HStack>
                )
              })}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Quick Actions</CardTitle>
            <CardDescription>Accelerate common asset workflows.</CardDescription>
          </CardHeader>
          <CardContent>
            <Grid cols={2} spacing="sm">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-auto flex flex-col items-center gap-sm p-md"
                  onClick={() => router.push(action.href)}
                >
                  <action.icon className="h-icon-md w-icon-md" />
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                </Button>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Recent Activity</CardTitle>
          <CardDescription>Latest updates across inventory, assignments, and maintenance.</CardDescription>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <Stack spacing="sm" align="center" className="py-xl text-center">
              <Activity className="h-icon-2xl w-icon-2xl text-muted-foreground/40" />
              <span className="text-sm text-muted-foreground">No recent asset activity yet</span>
            </Stack>
          ) : (
            <Stack spacing="sm">
              {activity.map((entry) => {
                const Icon = activityIconMap[entry.entity_type] ?? Activity
                const tone = statusToneMap[entry.metadata?.status as string]?.text ?? 'text-muted-foreground'
                return (
                  <HStack
                    key={entry.id}
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
                        <span className="text-sm font-medium text-foreground">
                          {entry.action.replace('_', ' ')} {entry.entity_type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.occurred_at).toLocaleString()}
                        </span>
                      </Stack>
                    </HStack>
                    {entry.metadata?.status && (
                      <Badge variant="outline" className={`capitalize ${tone}`}>
                        {String(entry.metadata.status).replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </HStack>
                )
              })}
            </Stack>
          )}
        </CardContent>
      </Card>

      {stats?.pendingMaintenance && stats.pendingMaintenance > 0 && (
        <Card className="border-warning/30 bg-warning/10">
          <CardContent>
            <HStack spacing="sm" align="center">
              <AlertTriangle className="h-icon-md w-icon-md text-warning" />
              <Stack spacing="xs">
                <span className="text-sm font-semibold text-warning">Maintenance Attention Needed</span>
                <span className="text-sm text-warning/80">
                  {stats.pendingMaintenance} asset
                  {stats.pendingMaintenance === 1 ? ' requires' : 's require'} servicing in the next 30 days.
                </span>
              </Stack>
              <Button variant="outline" className="ml-auto" onClick={() => router.push('/assets/maintenance')}>
                View Maintenance
              </Button>
            </HStack>
          </CardContent>
        </Card>
      )}

      {/* Asset Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <Card className="p-lg">
          <h3 className="text-body text-heading-4 mb-md">Asset Status Breakdown</h3>
          <div className="stack-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor('available') }}></div>
                <span className="text-body-sm form-label">Available</span>
              </div>
              <div className="flex items-center gap-sm">
                <span className="text-body-sm color-muted">{stats.availableAssets}</span>
                <Badge variant={getStatusVariant('available')}>
                  {stats.totalAssets > 0 ? Math.round((stats.availableAssets / stats.totalAssets) * 100) : 0}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor('in_use') }}></div>
                <span className="text-body-sm form-label">In Use</span>
              </div>
              <div className="flex items-center gap-sm">
                <span className="text-body-sm color-muted">{stats.inUseAssets}</span>
                <Badge variant={getStatusVariant('in_use')}>
                  {stats.totalAssets > 0 ? Math.round((stats.inUseAssets / stats.totalAssets) * 100) : 0}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor('under_maintenance') }}></div>
                <span className="text-body-sm form-label">Under Maintenance</span>
              </div>
              <div className="flex items-center gap-sm">
                <span className="text-body-sm color-muted">{stats.maintenanceAssets}</span>
                <Badge variant={getStatusVariant('under_maintenance')}>
                  {stats.totalAssets > 0 ? Math.round((stats.maintenanceAssets / stats.totalAssets) * 100) : 0}%
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-lg">
          <h3 className="text-body text-heading-4 mb-md">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-sm">
            <Button variant="outline" className="h-auto p-md flex flex-col items-center gap-sm">
              <Package className="h-icon-md w-icon-md" />
              <span className="text-body-sm">Add Asset</span>
            </Button>
            <Button variant="outline" className="h-auto p-md flex flex-col items-center gap-sm">
              <TrendingUp className="h-icon-md w-icon-md" />
              <span className="text-body-sm">Create Advance</span>
            </Button>
            <Button variant="outline" className="h-auto p-md flex flex-col items-center gap-sm">
              <UserCheck className="h-icon-md w-icon-md" />
              <span className="text-body-sm">New Assignment</span>
            </Button>
            <Button variant="outline" className="h-auto p-md flex flex-col items-center gap-sm">
              <Wrench className="h-icon-md w-icon-md" />
              <span className="text-body-sm">Schedule Maintenance</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-lg">
        <div className="flex items-center justify-between mb-md">
          <h3 className="text-body text-heading-4">Recent Activity</h3>
          <Button>
            <Activity className="h-icon-xs w-icon-xs mr-sm" />
            View All
          </Button>
        </div>
        
        <div className="stack-sm">
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-sm p-sm bg-secondary/50 rounded-lg">
                <div className="p-sm bg-background rounded-lg">
                  {getActivityIcon(activity.entity_type)}
                </div>
                <div className="flex-1">
                  <p className="text-body-sm form-label">
                    {activity.action === 'create' ? 'Created' : 
                     activity.action === 'update' ? 'Updated' : 
                     activity.action === 'delete' ? 'Deleted' : activity.action} {' '}
                    {activity.entity_type.replace('_', ' ')}
                  </p>
                  <p className="text-body-sm color-muted">
                    {new Date(activity.occurred_at).toLocaleString()}
                  </p>
                </div>
                {activity.metadata?.status && (
                  <Badge variant={getStatusVariant(activity.metadata.status)}>
                    {activity.metadata.status}
                  </Badge>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-xl color-muted">
              <Activity className="h-icon-2xl w-icon-2xl mx-auto mb-sm opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </Card>

      {/* Alerts & Notifications */}
      {stats.pendingMaintenance > 0 && (
        <Card className="p-lg border-warning/20 bg-warning/5">
          <div className="flex items-center gap-sm">
            <AlertTriangle className="h-icon-md w-icon-md color-warning" />
            <div>
              <h4 className="text-heading-4 color-warning">Maintenance Required</h4>
              <p className="text-body-sm color-warning/80">
                {stats.pendingMaintenance} asset{stats.pendingMaintenance !== 1 ? 's' : ''} require{stats.pendingMaintenance === 1 ? 's' : ''} maintenance attention
              </p>
            </div>
            <Button className="ml-auto">
              View Details
            </Button>
          </div>
        </Card>
      )}
    </Stack>
  );
}
