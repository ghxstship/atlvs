import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useMarketplaceOverview } from '../../../app/(app)/(shell)/marketplace/hooks/useMarketplaceOverview'

// Mock fetch globally
const fetchMock = vi.fn()
global.fetch = fetchMock

describe('useMarketplaceOverview', () => {
  const mockOrgId = 'org-123'

  const mockApiResponses = {
    listings: {
      data: [
        { id: 'listing-1', title: 'Test Listing 1' },
        { id: 'listing-2', title: 'Test Listing 2' },
      ]
    },
    vendors: {
      data: [
        { id: 'vendor-1', name: 'Vendor 1' },
        { id: 'vendor-2', name: 'Vendor 2' },
      ]
    },
    projects: {
      data: [
        { id: 'project-1', name: 'Project 1' },
      ]
    },
    proposals: {
      data: [
        { id: 'proposal-1', title: 'Proposal 1' },
        { id: 'proposal-2', title: 'Proposal 2' },
        { id: 'proposal-3', title: 'Proposal 3' },
      ]
    },
    activity: {
      data: [
        {
          id: 'activity-1',
          type: 'listing_created',
          title: 'New Listing',
          description: 'A new listing was created',
          timestamp: '2024-01-01T12:00:00Z',
          user: 'user-1',
          status: 'active'
        },
        {
          id: 'activity-2',
          type: 'contract_signed',
          title: 'Contract Signed',
          description: 'A contract was signed',
          timestamp: '2024-01-01T11:00:00Z',
          user: 'user-2',
          status: 'completed'
        }
      ]
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    fetchMock.mockImplementation((url: string) => {
      const headers = { 'x-organization-id': mockOrgId }

      if (url === '/api/v1/marketplace/listings') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponses.listings)
        } as Response)
      }

      if (url === '/api/v1/marketplace/vendors') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponses.vendors)
        } as Response)
      }

      if (url === '/api/v1/marketplace/projects') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponses.projects)
        } as Response)
      }

      if (url === '/api/v1/marketplace/proposals') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponses.proposals)
        } as Response)
      }

      if (url === '/api/v1/marketplace/activity') {
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

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useMarketplaceOverview({ orgId: mockOrgId }))

    expect(result.current.loading).toBe(true)
    expect(result.current.refreshing).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.metrics).toEqual([])
    expect(result.current.activity).toEqual([])
  })

  it('should load marketplace data successfully', async () => {
    const { result } = renderHook(() => useMarketplaceOverview({ orgId: mockOrgId }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe(null)
    expect(result.current.metrics).toHaveLength(4)
    expect(result.current.metrics[0]).toEqual({
      id: 'totalListings',
      label: 'Total Listings',
      value: 2, // Based on mock data
      change: 12,
      trend: 'up'
    })
    expect(result.current.metrics[1]).toEqual({
      id: 'activeVendors',
      label: 'Active Vendors',
      value: 2, // Based on mock data
      change: 8,
      trend: 'up'
    })
    expect(result.current.metrics[2]).toEqual({
      id: 'activeProjects',
      label: 'Active Projects',
      value: 1, // Based on mock data
      change: 15,
      trend: 'up'
    })
    expect(result.current.metrics[3]).toEqual({
      id: 'responses',
      label: 'Total Responses',
      value: 3, // Based on mock data
      change: -3,
      trend: 'down'
    })

    expect(result.current.activity).toHaveLength(2)
    expect(result.current.activity[0].id).toBe('activity-1')
    expect(result.current.activity[1].id).toBe('activity-2')
  })

  it('should handle API errors gracefully', async () => {
    fetchMock.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useMarketplaceOverview({ orgId: mockOrgId }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to load marketplace overview')
    expect(result.current.metrics).toEqual([])
    expect(result.current.activity).toEqual([])
  })

  it('should handle partial API failures', async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url === '/api/v1/marketplace/listings') {
        return Promise.resolve({
          ok: false,
          status: 500
        } as Response)
      }

      if (url === '/api/v1/marketplace/vendors') {
        return Promise.resolve({
          ok: false,
          status: 500
        } as Response)
      }

      // Other endpoints succeed
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] })
      } as Response)
    })

    const { result } = renderHook(() => useMarketplaceOverview({ orgId: mockOrgId }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe(null)
    expect(result.current.metrics).toHaveLength(4)
    expect(result.current.metrics[0].value).toBe(0) // No listings data
    expect(result.current.metrics[1].value).toBe(0) // No vendors data
  })

  it('should refresh data when refresh is called', async () => {
    const { result } = renderHook(() => useMarketplaceOverview({ orgId: mockOrgId }))

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Call refresh
    await result.current.refresh()

    expect(fetchMock).toHaveBeenCalledTimes(10) // 5 calls initial + 5 calls refresh
  })

  it('should show refreshing state during refresh', async () => {
    const { result } = renderHook(() => useMarketplaceOverview({ orgId: mockOrgId }))

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
    renderHook(() => useMarketplaceOverview({ orgId: mockOrgId }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/v1/marketplace/listings', {
        headers: { 'x-organization-id': mockOrgId }
      })
      expect(fetchMock).toHaveBeenCalledWith('/api/v1/marketplace/vendors', {
        headers: { 'x-organization-id': mockOrgId }
      })
      expect(fetchMock).toHaveBeenCalledWith('/api/v1/marketplace/projects', {
        headers: { 'x-organization-id': mockOrgId }
      })
      expect(fetchMock).toHaveBeenCalledWith('/api/v1/marketplace/proposals', {
        headers: { 'x-organization-id': mockOrgId }
      })
      expect(fetchMock).toHaveBeenCalledWith('/api/v1/marketplace/activity', {
        headers: { 'x-organization-id': mockOrgId }
      })
    })
  })

  it('should limit activity to 10 items', async () => {
    // Mock more activity items
    const manyActivities = {
      data: Array.from({ length: 15 }, (_, i) => ({
        id: `activity-${i + 1}`,
        type: 'listing_created' as const,
        title: `Activity ${i + 1}`,
        description: `Description ${i + 1}`,
        timestamp: '2024-01-01T12:00:00Z',
        user: `user-${i + 1}`,
        status: 'active' as const
      }))
    }

    fetchMock.mockImplementation((url: string) => {
      if (url === '/api/v1/marketplace/activity') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(manyActivities)
        } as Response)
      }

      // Return empty data for other endpoints
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] })
      } as Response)
    })

    const { result } = renderHook(() => useMarketplaceOverview({ orgId: mockOrgId }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.activity).toHaveLength(10)
  })
})
