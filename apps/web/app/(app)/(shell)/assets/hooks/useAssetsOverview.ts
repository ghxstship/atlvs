import { useState, useCallback, useEffect } from 'react'

interface AssetStats {
  totalAssets: number
  availableAssets: number
  inUseAssets: number
  maintenanceAssets: number
  totalValue: number
  activeAssignments: number
  pendingMaintenance: number
}

interface ActivityLog {
  id: string
  action: string
  entity_type: string
  occurred_at: string
  metadata?: Record<string, unknown>
}

interface UseAssetsOverviewOptions {
  orgId: string
}

interface UseAssetsOverviewResult {
  stats: AssetStats | null
  activity: ActivityLog[]
  loading: boolean
  refreshing: boolean
  error: string | null
  refresh: () => Promise<void>
}

const DEFAULT_STATS: AssetStats = {
  totalAssets: 0,
  availableAssets: 0,
  inUseAssets: 0,
  maintenanceAssets: 0,
  totalValue: 0,
  activeAssignments: 0,
  pendingMaintenance: 0
}

export function useAssetsOverview({ orgId }: UseAssetsOverviewOptions): UseAssetsOverviewResult {
  const [stats, setStats] = useState<AssetStats | null>(null)
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadOverview = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (mode === 'initial') {
        setLoading(true)
      } else {
        setRefreshing(true)
      }

      try {
        setError(null)

        const headers = { 'x-organization-id': orgId }
        const [assetsRes, assignmentsRes, maintenanceRes, activityRes] = await Promise.all([
          fetch('/api/v1/assets', { headers }),
          fetch('/api/v1/assets/assignments', { headers }),
          fetch('/api/v1/assets/maintenance', { headers }),
          fetch('/api/v1/assets/activity', { headers }),
        ])

        const safeJson = async (response: Response) => {
          if (!response.ok) return { data: [] }
          try {
            return await response.json()
          } catch (err) {
            console.error('Failed to parse assets overview response:', err)
            return { data: [] }
          }
        }

        const [assets, assignments, maintenance, activityLogs] = await Promise.all([
          safeJson(assetsRes),
          safeJson(assignmentsRes),
          safeJson(maintenanceRes),
          safeJson(activityRes),
        ])

        const assetsData = (assets.data ?? []) as Array<{ status: string; current_value?: number }>
        const assignmentData = assignments.data ?? []
        const maintenanceData = maintenance.data ?? []
        const activityData = (activityLogs.data ?? []) as ActivityLog[]

        const totalAssets = assetsData.length
        const availableAssets = assetsData.filter((asset) => asset.status === 'available').length
        const inUseAssets = assetsData.filter((asset) => asset.status === 'in_use').length
        const maintenanceAssets = assetsData.filter((asset) => asset.status === 'under_maintenance').length
        const totalValue = assetsData.reduce((sum, asset) => sum + Number(asset.current_value ?? 0), 0)

        setStats({
          totalAssets,
          availableAssets,
          inUseAssets,
          maintenanceAssets,
          totalValue,
          activeAssignments: assignmentData.length,
          pendingMaintenance: maintenanceData.length
        })

        setActivity(activityData.slice(0, 10))
      } catch (err) {
        console.error('Error loading assets overview:', err)
        setError('Failed to load assets overview')
        setStats(DEFAULT_STATS)
        setActivity([])
      } finally {
        if (mode === 'initial') {
          setLoading(false)
        } else {
          setRefreshing(false)
        }
      }
    },
    [orgId],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadOverview('initial')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadOverview])

  const refresh = useCallback(async () => {
    await loadOverview('refresh')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadOverview])

  return {
    stats,
    activity,
    loading,
    refreshing,
    error,
    refresh
  }
}
