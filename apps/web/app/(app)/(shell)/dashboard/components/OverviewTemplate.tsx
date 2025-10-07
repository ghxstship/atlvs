'use client'

import React, { useState } from 'react'
import {
  Filter,
  Download,
  Settings,
  RefreshCw,
  Grid3X3,
  List,
  BarChart3,
} from 'lucide-react'
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

import EnhancedMetricWidget from '../widgets/EnhancedMetricWidget'
import EnhancedChartWidget from '../widgets/EnhancedChartWidget'
import EnhancedActivityWidget from '../widgets/EnhancedActivityWidget'
import { useDashboardOverview } from '../hooks/useDashboardOverview'
import type {
  ModuleOverviewConfig,
  DashboardWidget,
  DataSource,
} from '../types'

interface OverviewTemplateProps {
  orgId: string
  userId: string
  userEmail: string
  module: DataSource
  config: ModuleOverviewConfig
  customWidgets?: DashboardWidget[]
  onNavigate?: (path: string) => void
}

type ViewMode = 'grid' | 'list' | 'compact'

export default function OverviewTemplate({
  orgId,
  userId,
  userEmail: _userEmail,
  module,
  config,
  customWidgets = [],
  onNavigate,
}: OverviewTemplateProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const {
    metrics,
    activities,
    widgets,
    loading,
    refreshing,
    error,
    refresh,
  } = useDashboardOverview({ orgId, module, initialWidgets: customWidgets })

  const metricGridConfig = React.useMemo(() => {
    switch (viewMode) {
      case 'list':
        return { cols: 1 as const }
      case 'compact':
        return { cols: 2 as const, responsive: { md: 4, lg: 6 } as const }
      default:
        return { cols: 1 as const, responsive: { md: 2, lg: 4 } as const }
    }
  }, [viewMode])

  if (loading) {
    return (
      <Stack spacing="lg">
        <HStack justify="between" align="center">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-10 w-32" />
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
          <CardDescription>Something went wrong while loading dashboard insights.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={refresh}>Retry</Button>
        </CardContent>
      </Card>
    )
  }

  const renderMetrics = () => (
    <Grid {...metricGridConfig} spacing="md">
      {metrics.map((metric) => (
        <EnhancedMetricWidget
          key={metric.id}
          widget={{
            id: metric.id,
            dashboard_id: '',
            type: 'metric',
            title: metric.label,
            config: {
              value: metric.value,
              format: metric.format,
              change: metric.change,
              change_type: metric.change_type,
              target: metric.target,
              status: metric.status,
            },
            position: { x: 0, y: 0, w: 1, h: 1 },
            refresh_interval: '5_minutes',
            is_visible: true,
            organization_id: orgId,
            created_by: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }}
          metric={metric}
          isLoading={loading}
        />
      ))}
    </Grid>
  )

  const renderCustomWidgets = () => {
    if (widgets.length === 0) return null

    return (
      <Stack spacing="md">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Custom Widgets</CardTitle>
          <CardDescription>Additional widgets tailored to this dashboard.</CardDescription>
        </CardHeader>
        <Grid cols={viewMode === 'grid' ? 1 : 1} responsive={viewMode === 'grid' ? { lg: 2 } : undefined} spacing="md">
          {widgets.map((widget) => {
            switch (widget.type) {
              case 'metric':
              case 'kpi_card':
                return <EnhancedMetricWidget key={widget.id} widget={widget} isLoading={loading} />
              case 'bar_chart':
              case 'line_chart':
              case 'pie_chart':
                return <EnhancedChartWidget key={widget.id} widget={widget} isLoading={loading} />
              case 'activity_feed':
                return (
                  <EnhancedActivityWidget
                    key={widget.id}
                    widget={widget}
                    activities={activities}
                    isLoading={loading}
                  />
                )
              default:
                return null
            }
          })}
        </Grid>
      </Stack>
    )
  }

  return (
    <Stack spacing="xl">
      <HStack justify="between" align="center">
        <HStack spacing="md" align="center">
          <div className={`p-sm rounded-lg bg-${config.color}-100/40`}> {config.icon}</div>
          <Stack spacing="xs">
            <h1 className="text-heading-2 font-anton uppercase text-foreground">{config.display_name}</h1>
            <p className="text-muted-foreground max-w-xl">{config.description}</p>
          </Stack>
        </HStack>
        <HStack spacing="sm" align="center">
          <HStack spacing="xs" className="bg-muted rounded-lg p-xs">
            <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}>
              <Grid3X3 className="h-icon-xs w-icon-xs" />
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')}>
              <List className="h-icon-xs w-icon-xs" />
            </Button>
            <Button
              variant={viewMode === 'compact' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('compact')}
            >
              <BarChart3 className="h-icon-xs w-icon-xs" />
            </Button>
          </HStack>
          <Button variant="ghost" size="sm" onClick={() => setShowFilters((prev) => !prev)}>
            <Filter className="h-icon-xs w-icon-xs" />
          </Button>
          <Button variant="ghost" size="sm" onClick={refresh} disabled={refreshing}>
            <RefreshCw className={`h-icon-xs w-icon-xs ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-icon-xs w-icon-xs" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-icon-xs w-icon-xs" />
          </Button>
        </HStack>
      </HStack>

      {showFilters && (
        <Card>
          <CardContent>
            <HStack spacing="md" align="center">
              <span className="text-sm font-medium text-foreground">Filters</span>
              <HStack spacing="sm" align="center">
                <Badge variant="secondary">Last 30 days</Badge>
                <Badge variant="secondary">All statuses</Badge>
                <Button variant="ghost" size="sm" className="text-xs">
                  Clear all
                </Button>
              </HStack>
            </HStack>
          </CardContent>
        </Card>
      )}

      <Stack spacing="md">
        <HStack justify="between" align="center">
          <h2 className="text-lg font-semibold text-foreground">Key Metrics</h2>
          <Badge variant="outline" className="text-xs">
            {metrics.length} metrics
          </Badge>
        </HStack>
        {renderMetrics()}
      </Stack>

      {config.quick_actions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Quick Actions</CardTitle>
            <CardDescription>Jump into commonly used dashboard workflows.</CardDescription>
          </CardHeader>
          <CardContent>
            <Grid cols={2} responsive={{ md: 4 }} spacing="sm">
              {config.quick_actions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start"
                  onClick={() => action.href && onNavigate?.(action.href)}
                >
                  <HStack spacing="sm" align="center">
                    <span className="text-lg">{action.icon}</span>
                    <span className="text-sm font-medium text-foreground">{action.label}</span>
                  </HStack>
                </Button>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {renderCustomWidgets()}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Recent Activity</CardTitle>
          <CardDescription>Latest changes across dashboards and analytics.</CardDescription>
        </CardHeader>
        <CardContent>
          <EnhancedActivityWidget
            widget={{
              id: 'activity-feed',
              dashboard_id: '',
              type: 'activity_feed',
              title: 'Recent Activity',
              config: { limit: 10 },
              position: { x: 0, y: 0, w: 1, h: 1 },
              refresh_interval: '1_minute',
              is_visible: true,
              organization_id: orgId,
              created_by: userId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }}
            activities={activities}
            isLoading={loading}
            onViewAll={() => onNavigate?.(`/${module}/activity`)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <HStack justify="between" align="center" className="text-xs text-muted-foreground">
            <span>Last updated {new Date().toLocaleTimeString()}</span>
            <span>
              {metrics.length} metrics • {activities.length} activities • {widgets.length} widgets
            </span>
          </HStack>
        </CardContent>
      </Card>
    </Stack>
  )
}
