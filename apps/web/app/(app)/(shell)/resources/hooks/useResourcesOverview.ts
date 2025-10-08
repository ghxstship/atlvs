import { useCallback, useEffect, useState } from 'react'

export type ResourceMetric = {
  id: string
  label: string
  value: number
  change: number
  trend: 'up' | 'down' | 'neutral'
  icon: string
}

export type ResourceItem = {
  id: string
  title: string
  type: string
  downloads: number
  rating: number
  updatedAt: string
}

export type ResourceCategory = {
  id: string
  name: string
  count: number
  tone: 'accent' | 'success' | 'warning' | 'destructive' | 'muted'
}

export type ResourceActivity = {
  id: string
  description: string
  timestamp: string
  tone: 'accent' | 'success' | 'info'
}

interface UseResourcesOverviewOptions {
  orgId: string
}

interface UseResourcesOverviewResult {
  metrics: ResourceMetric[]
  recentResources: ResourceItem[]
  categories: ResourceCategory[]
  activities: ResourceActivity[]
  loading: boolean
  refreshing: boolean
  error: string | null
  refresh: () => Promise<void>
}

const DEFAULT_METRICS: ResourceMetric[] = [
  { id: 'resources', label: 'Total Resources', value: 0, change: 0, trend: 'neutral', icon: 'FileText' },
  { id: 'downloads', label: 'Downloads', value: 0, change: 0, trend: 'neutral', icon: 'Download' },
  { id: 'activeUsers', label: 'Active Users', value: 0, change: 0, trend: 'neutral', icon: 'Users' },
  { id: 'rating', label: 'Avg. Rating', value: 0, change: 0, trend: 'neutral', icon: 'Star' },
]

const DEFAULT_RESOURCES: ResourceItem[] = []
const DEFAULT_CATEGORIES: ResourceCategory[] = []
const DEFAULT_ACTIVITIES: ResourceActivity[] = []

export function useResourcesOverview({ orgId }: UseResourcesOverviewOptions): UseResourcesOverviewResult {
  const [metrics, setMetrics] = useState<ResourceMetric[]>(DEFAULT_METRICS)
  const [recentResources, setRecentResources] = useState<ResourceItem[]>(DEFAULT_RESOURCES)
  const [categories, setCategories] = useState<ResourceCategory[]>(DEFAULT_CATEGORIES)
  const [activities, setActivities] = useState<ResourceActivity[]>(DEFAULT_ACTIVITIES)
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
        const [metricsRes, resourcesRes, categoriesRes, activityRes] = await Promise.all([
          fetch('/api/v1/resources/metrics', { headers }),
          fetch('/api/v1/resources/recent', { headers }),
          fetch('/api/v1/resources/categories', { headers }),
          fetch('/api/v1/resources/activity', { headers }),
        ])

        const safeJson = async (response: Response) => {
          if (!response.ok) return null
          try {
            return await response.json()
          } catch (err) {
            console.error('Failed to parse resources overview response:', err)
            return null
          }
        }

        const [metricsJson, resourcesJson, categoriesJson, activityJson] = await Promise.all([
          safeJson(metricsRes),
          safeJson(resourcesRes),
          safeJson(categoriesRes),
          safeJson(activityRes),
        ])

        const fallbackMetrics: ResourceMetric[] = [
          { id: 'resources', label: 'Total Resources', value: 1234, change: 12, trend: 'up', icon: 'FileText' },
          { id: 'downloads', label: 'Downloads', value: 45600, change: 23, trend: 'up', icon: 'Download' },
          { id: 'activeUsers', label: 'Active Users', value: 892, change: 8, trend: 'up', icon: 'Users' },
          { id: 'rating', label: 'Avg. Rating', value: 4.8, change: 0.2, trend: 'neutral', icon: 'Star' },
        ]

        const fallbackResources: ResourceItem[] = [
          { id: '1', title: 'Q4 Sales Report', type: 'Document', downloads: 234, rating: 4.9, updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
          { id: '2', title: 'Product Training Video', type: 'Video', downloads: 567, rating: 4.7, updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
          { id: '3', title: 'API Documentation', type: 'Guide', downloads: 892, rating: 4.8, updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
          { id: '4', title: 'Brand Guidelines', type: 'Template', downloads: 345, rating: 4.6, updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        ]

        const fallbackCategories: ResourceCategory[] = [
          { id: 'documents', name: 'Documents', count: 456, tone: 'accent' },
          { id: 'videos', name: 'Videos', count: 234, tone: 'muted' },
          { id: 'templates', name: 'Templates', count: 189, tone: 'success' },
          { id: 'guides', name: 'Guides', count: 145, tone: 'warning' },
          { id: 'training', name: 'Training', count: 98, tone: 'destructive' },
          { id: 'other', name: 'Other', count: 112, tone: 'muted' },
        ]

        const fallbackActivities: ResourceActivity[] = [
          { id: '1', description: 'New training video uploaded by Sarah Chen', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), tone: 'accent' },
          { id: '2', description: 'API documentation updated to v2.0', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), tone: 'success' },
          { id: '3', description: 'Q4 reports downloaded 50 times', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), tone: 'info' },
        ]

        setMetrics((metricsJson?.data as ResourceMetric[]) ?? fallbackMetrics)
        setRecentResources((resourcesJson?.data as ResourceItem[]) ?? fallbackResources)
        setCategories((categoriesJson?.data as ResourceCategory[]) ?? fallbackCategories)
        setActivities((activityJson?.data as ResourceActivity[]) ?? fallbackActivities)
      } catch (err) {
        console.error('Failed to load resources overview:', err)
        setError('Failed to load resources overview')
        setMetrics(DEFAULT_METRICS)
        setRecentResources(DEFAULT_RESOURCES)
        setCategories(DEFAULT_CATEGORIES)
        setActivities(DEFAULT_ACTIVITIES)
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

  return { metrics, recentResources, categories, activities, loading, refreshing, error, refresh }
}
