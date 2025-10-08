import { useState, useCallback, useEffect, useMemo } from 'react'

import { DashboardService } from '../lib/dashboard-service'
import type {
  ActivityItem,
  DashboardWidget,
  DataSource,
  OverviewMetric
} from '../types'

export interface UseDashboardOverviewOptions {
  orgId: string
  module: DataSource
  initialWidgets?: DashboardWidget[]
}

export interface UseDashboardOverviewResult {
  metrics: OverviewMetric[]
  activities: ActivityItem[]
  widgets: DashboardWidget[]
  loading: boolean
  refreshing: boolean
  error: string | null
  refresh: () => Promise<void>
  setWidgets: React.Dispatch<React.SetStateAction<DashboardWidget[]>>
}

export function useDashboardOverview({
  orgId,
  module,
  initialWidgets = []
}: UseDashboardOverviewOptions): UseDashboardOverviewResult {
  const dashboardService = useMemo(() => new DashboardService(), [])
  const [metrics, setMetrics] = useState<OverviewMetric[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [widgets, setWidgets] = useState<DashboardWidget[]>(initialWidgets)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadOverviewData = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (mode === 'initial') {
        setLoading(true)
      } else {
        setRefreshing(true)
      }

      try {
        setError(null)

        const [metricsData, activitiesData] = await Promise.all([
          dashboardService.getOverviewMetrics(orgId, module),
          dashboardService.getRecentActivity(orgId, 10),
        ])

        setMetrics(metricsData)
        setActivities(
          activitiesData.filter((activity) => activity.type === module || module === 'analytics'),
        )
      } catch (err) {
        console.error('Failed to load dashboard overview:', err)
        setError('Failed to load dashboard overview data')
      } finally {
        if (mode === 'initial') {
          setLoading(false)
        } else {
          setRefreshing(false)
        }
      }
    },
    [dashboardService, module, orgId],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadOverviewData('initial')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadOverviewData])

  const refresh = useCallback(async () => {
    await loadOverviewData('refresh')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadOverviewData])

  return {
    metrics,
    activities,
    widgets,
    loading,
    refreshing,
    error,
    refresh,
    setWidgets
  }
}
