import { useState, useCallback, useEffect } from 'react'

interface ProcurementStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalProducts: number
  totalServices: number
  totalVendors: number
  totalCategories: number
  totalSpent: number
  currency: string
}

interface RecentOrder {
  id: string
  order_number: string
  vendor_name: string
  total_amount: number
  currency: string
  status: string
  created_at: string
}

interface UseProcurementOverviewOptions {
  orgId: string
}

interface UseProcurementOverviewResult {
  stats: ProcurementStats | null
  recentOrders: RecentOrder[]
  loading: boolean
  refreshing: boolean
  error: string | null
  refresh: () => Promise<void>
}

const DEFAULT_STATS: ProcurementStats = {
  totalOrders: 0,
  pendingOrders: 0,
  completedOrders: 0,
  totalProducts: 0,
  totalServices: 0,
  totalVendors: 0,
  totalCategories: 0,
  totalSpent: 0,
  currency: 'USD'
}

export function useProcurementOverview({ orgId }: UseProcurementOverviewOptions): UseProcurementOverviewResult {
  const [stats, setStats] = useState<ProcurementStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
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

        const headers = { 'x-organization-id': orgId }
        const [ordersRes, productsRes, servicesRes, vendorsRes, categoriesRes] = await Promise.all([
          fetch('/api/v1/procurement/purchase-orders', { headers }),
          fetch('/api/v1/procurement/products', { headers }),
          fetch('/api/v1/procurement/services', { headers }),
          fetch('/api/v1/procurement/vendors', { headers }),
          fetch('/api/v1/procurement/categories', { headers }),
        ])

        const safeJson = async (response: Response) => {
          if (!response.ok) return { data: [] }
          try {
            return await response.json()
          } catch (err) {
            console.error('Failed to parse procurement overview response:', err)
            return { data: [] }
          }
        }

        const [orders, products, services, vendors, categories] = await Promise.all([
          safeJson(ordersRes),
          safeJson(productsRes),
          safeJson(servicesRes),
          safeJson(vendorsRes),
          safeJson(categoriesRes),
        ])

        const ordersData: RecentOrder[] = (orders.data ?? []) as RecentOrder[]
        const pendingOrders = ordersData.filter((order) => ['draft', 'pending', 'approved'].includes(order.status))
        const completedOrders = ordersData.filter((order) => ['delivered', 'completed'].includes(order.status))
        const totalSpent = ordersData.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0)

        setStats({
          totalOrders: ordersData.length,
          pendingOrders: pendingOrders.length,
          completedOrders: completedOrders.length,
          totalProducts: (products.data ?? []).length,
          totalServices: (services.data ?? []).length,
          totalVendors: (vendors.data ?? []).length,
          totalCategories: (categories.data ?? []).length,
          totalSpent,
          currency: (ordersData[0]?.currency as string) ?? 'USD'
        })

        setRecentOrders(ordersData.slice(0, 5))
      } catch (err) {
        console.error('Error loading procurement overview:', err)
        setError('Failed to load procurement overview')
        setStats(DEFAULT_STATS)
        setRecentOrders([])
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
    loadOverviewData('initial')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadOverviewData])

  const refresh = useCallback(async () => {
    await loadOverviewData('refresh')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadOverviewData])

  return {
    stats,
    recentOrders,
    loading,
    refreshing,
    error,
    refresh
  }
}
