import { useState, useCallback, useEffect } from 'react'

export type MarketplaceActivity = {
  id: string
  type: 'listing_created' | 'proposal_submitted' | 'contract_signed' | 'payment_received'
  title: string
  description: string
  timestamp: string
  user: string
  status: 'active' | 'pending' | 'completed'
}

export type MarketplaceMetric = {
  id: string
  label: string
  value: number
  change: number
  trend: 'up' | 'down' | 'neutral'
}

interface MarketplaceStats {
  totalListings: number
  featuredListings: number
  totalResponses: number
  activeOffers: number
  activeRequests: number
  activeExchanges: number
  totalVendors: number
  totalProjects: number
}

interface UseMarketplaceOverviewOptions {
  orgId: string
}

interface UseMarketplaceOverviewResult {
  metrics: MarketplaceMetric[]
  activity: MarketplaceActivity[]
  loading: boolean
  refreshing: boolean
  error: string | null
  refresh: () => Promise<void>
}

const DEFAULT_METRICS: MarketplaceMetric[] = []

export function useMarketplaceOverview({ orgId }: UseMarketplaceOverviewOptions): UseMarketplaceOverviewResult {
  const [metrics, setMetrics] = useState<MarketplaceMetric[]>(DEFAULT_METRICS)
  const [activity, setActivity] = useState<MarketplaceActivity[]>([])
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
        const [listingsRes, vendorRes, projectRes, proposalsRes, activityRes] = await Promise.all([
          fetch('/api/v1/marketplace/listings', { headers }),
          fetch('/api/v1/marketplace/vendors', { headers }),
          fetch('/api/v1/marketplace/projects', { headers }),
          fetch('/api/v1/marketplace/proposals', { headers }),
          fetch('/api/v1/marketplace/activity', { headers }),
        ])

        const safeJson = async (response: Response) => {
          if (!response.ok) return { data: [] }
          try {
            return await response.json()
          } catch (err) {
            console.error('Failed to parse marketplace response:', err)
            return { data: [] }
          }
        }

        const [listings, vendors, projects, proposals, activityLogs] = await Promise.all([
          safeJson(listingsRes),
          safeJson(vendorRes),
          safeJson(projectRes),
          safeJson(proposalsRes),
          safeJson(activityRes),
        ])

        const listingsData = listings.data ?? []
        const vendorsData = vendors.data ?? []
        const projectsData = projects.data ?? []
        const proposalsData = proposals.data ?? []
        const activityData = (activityLogs.data ?? []) as MarketplaceActivity[]

        const totalListings = listingsData.length
        const totalResponses = proposalsData.length
        const metricsSnapshot: MarketplaceMetric[] = [
          {
            id: 'totalListings',
            label: 'Total Listings',
            value: totalListings,
            change: 12,
            trend: 'up',
          },
          {
            id: 'activeVendors',
            label: 'Active Vendors',
            value: vendorsData.length,
            change: 8,
            trend: 'up',
          },
          {
            id: 'activeProjects',
            label: 'Active Projects',
            value: projectsData.length,
            change: 15,
            trend: 'up',
          },
          {
            id: 'responses',
            label: 'Total Responses',
            value: totalResponses,
            change: -3,
            trend: 'down',
          },
        ]

        setMetrics(metricsSnapshot)
        setActivity(activityData.slice(0, 10))
      } catch (err) {
        console.error('Error loading marketplace overview:', err)
        setError('Failed to load marketplace overview')
        setMetrics(DEFAULT_METRICS)
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

  useEffect(() => {
    loadOverview('initial')
  }, [loadOverview])

  const refresh = useCallback(async () => {
    await loadOverview('refresh')
  }, [loadOverview])

  return {
    metrics,
    activity,
    loading,
    refreshing,
    error,
    refresh,
  }
}
