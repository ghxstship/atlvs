import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useResourcesOverview } from '../../../app/(app)/(shell)/resources/hooks/useResourcesOverview'

// Mock fetch globally
const fetchMock = vi.fn()
global.fetch = fetchMock

describe('useResourcesOverview', () => {
  const mockOrgId = 'org-456'

  const mockApiResponses = {
    metrics: {
      data: [
        { id: 'resources', label: 'Total Resources', value: 1500, change: 25, trend: 'up', icon: 'FileText' },
        { id: 'downloads', label: 'Downloads', value: 75000, change: 15, trend: 'up', icon: 'Download' },
        { id: 'activeUsers', label: 'Active Users', value: 1200, change: -5, trend: 'down', icon: 'Users' },
        { id: 'rating', label: 'Avg. Rating', value: 4.6, change: 0.1, trend: 'neutral', icon: 'Star' },
      ]
    },
    recent: {
      data: [
        { id: 'resource-1', title: 'Advanced Analytics Guide', type: 'Guide', downloads: 500, rating: 4.9, updatedAt: '2024-01-01T12:00:00Z' },
        { id: 'resource-2', title: 'Product Demo Video', type: 'Video', downloads: 1200, rating: 4.7, updatedAt: '2024-01-01T10:00:00Z' },
      ]
    },
    categories: {
      data: [
        { id: 'guides', name: 'Guides', count: 200, tone: 'accent' },
        { id: 'videos', name: 'Videos', count: 150, tone: 'success' },
        { id: 'templates', name: 'Templates', count: 300, tone: 'warning' },
      ]
    },
    activity: {
      data: [
        { id: 'activity-1', description: 'New guide uploaded', timestamp: '2024-01-01T12:00:00Z', tone: 'accent' },
        { id: 'activity-2', description: 'Video reached 1000 downloads', timestamp: '2024-01-01T11:00:00Z', tone: 'success' },
        { id: 'activity-3', description: 'Template updated', timestamp: '2024-01-01T10:00:00Z', tone: 'info' },
      ]
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    fetchMock.mockImplementation((url: string) => {
      if (url === '/api/v1/resources/metrics') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponses.metrics)
        } as Response)
      }

      if (url === '/api/v1/resources/recent') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponses.recent)
        } as Response)
      }

      if (url === '/api/v1/resources/categories') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponses.categories)
        } as Response)
      }

      if (url === '/api/v1/resources/activity') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponses.activity)
        } as Response)
      }

      return Promise.reject(new Error(`Unexpected URL: ${url}`))
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with loading state and default metrics', () => {
    const { result } = renderHook(() => useResourcesOverview({ orgId: mockOrgId }))

    expect(result.current.loading).toBe(true)
    expect(result.current.refreshing).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.metrics).toEqual([
      { id: 'resources', label: 'Total Resources', value: 0, change: 0, trend: 'neutral', icon: 'FileText' },
      { id: 'downloads', label: 'Downloads', value: 0, change: 0, trend: 'neutral', icon: 'Download' },
      { id: 'activeUsers', label: 'Active Users', value: 0, change: 0, trend: 'neutral', icon: 'Users' },
      { id: 'rating', label: 'Avg. Rating', value: 0, change: 0, trend: 'neutral', icon: 'Star' },
    ])
    expect(result.current.recentResources).toEqual([])
    expect(result.current.categories).toEqual([])
    expect(result.current.activities).toEqual([])
  })

  it('should load resources data successfully', async () => {
    const { result } = renderHook(() => useResourcesOverview({ orgId: mockOrgId }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe(null)
    expect(result.current.metrics).toEqual(mockApiResponses.metrics.data)
    expect(result.current.recentResources).toEqual(mockApiResponses.recent.data)
    expect(result.current.categories).toEqual(mockApiResponses.categories.data)
    expect(result.current.activities).toEqual(mockApiResponses.activity.data)
  })

  it('should use fallback data when API returns null', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null)
    } as Response)

    const { result } = renderHook(() => useResourcesOverview({ orgId: mockOrgId }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe(null)
    expect(result.current.metrics).toHaveLength(4)
    expect(result.current.metrics[0].value).toBe(1234) // Fallback value
    expect(result.current.recentResources).toHaveLength(4) // Fallback resources
    expect(result.current.categories).toHaveLength(6) // Fallback categories
    expect(result.current.activities).toHaveLength(3) // Fallback activities
  })

  it('should handle API errors gracefully', async () => {
    fetchMock.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useResourcesOverview({ orgId: mockOrgId }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to load resources overview')
    expect(result.current.metrics).toEqual([
      { id: 'resources', label: 'Total Resources', value: 0, change: 0, trend: 'neutral', icon: 'FileText' },
      { id: 'downloads', label: 'Downloads', value: 0, change: 0, trend: 'neutral', icon: 'Download' },
      { id: 'activeUsers', label: 'Active Users', value: 0, change: 0, trend: 'neutral', icon: 'Users' },
      { id: 'rating', label: 'Avg. Rating', value: 0, change: 0, trend: 'neutral', icon: 'Star' },
    ])
    expect(result.current.recentResources).toEqual([])
    expect(result.current.categories).toEqual([])
    expect(result.current.activities).toEqual([])
  })

  it('should handle malformed JSON responses', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new Error('Invalid JSON'))
    } as Response)

    const { result } = renderHook(() => useResourcesOverview({ orgId: mockOrgId }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe(null) // Error is handled gracefully with fallbacks
    expect(result.current.metrics).toHaveLength(4) // Fallback data is used
  })

  it('should handle non-ok responses', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500
    } as Response)

    const { result } = renderHook(() => useResourcesOverview({ orgId: mockOrgId }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe(null) // Non-ok responses return null, triggering fallbacks
    expect(result.current.metrics).toHaveLength(4) // Fallback data is used
  })

  it('should refresh data when refresh is called', async () => {
    const { result } = renderHook(() => useResourcesOverview({ orgId: mockOrgId }))

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Call refresh
    await result.current.refresh()

    expect(fetchMock).toHaveBeenCalledTimes(8) // 4 calls initial + 4 calls refresh
  })

  it('should show refreshing state during refresh', async () => {
    const { result } = renderHook(() => useResourcesOverview({ orgId: mockOrgId }))

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Start refresh
    const refreshPromise = result.current.refresh()

    // Should show refreshing state
    await waitFor(() => {
      expect(result.current.refreshing).toBe(true)
    })

    // Wait for refresh to complete
    await refreshPromise

    expect(result.current.refreshing).toBe(false)
  })

  it('should make API calls with correct organization header', async () => {
    renderHook(() => useResourcesOverview({ orgId: mockOrgId }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/v1/resources/metrics', {
        headers: { 'x-organization-id': mockOrgId }
      })
      expect(fetchMock).toHaveBeenCalledWith('/api/v1/resources/recent', {
        headers: { 'x-organization-id': mockOrgId }
      })
      expect(fetchMock).toHaveBeenCalledWith('/api/v1/resources/categories', {
        headers: { 'x-organization-id': mockOrgId }
      })
      expect(fetchMock).toHaveBeenCalledWith('/api/v1/resources/activity', {
        headers: { 'x-organization-id': mockOrgId }
      })
    })
  })

  it('should reload data when orgId changes', async () => {
    const { result, rerender } = renderHook(
      ({ orgId }) => useResourcesOverview({ orgId }),
      { initialProps: { orgId: mockOrgId } }
    )

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Change orgId
    rerender({ orgId: 'new-org-789' })

    // Should trigger reload
    expect(fetchMock).toHaveBeenCalledTimes(8) // 4 initial + 4 for new org
  })
})
