import { useState, useEffect } from 'react'
import { getPlatform, getStorage, type Platform } from './index'

/**
 * Hook to get current platform
 */
export function usePlatform(): Platform {
  return getPlatform()
}

/**
 * Hook for platform-specific storage
 */
export function useStorage<T = any>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)
  const [loading, setLoading] = useState(true)
  const storage = getStorage()

  useEffect(() => {
    async function loadValue() {
      try {
        const stored = await storage.getItem(key)
        if (stored !== null) {
          setValue(JSON.parse(stored))
        }
      } catch (error) {
        console.error('Error loading from storage:', error)
      } finally {
        setLoading(false)
      }
    }

    loadValue()
  }, [key])

  const updateValue = async (newValue: T) => {
    try {
      setValue(newValue)
      await storage.setItem(key, JSON.stringify(newValue))
    } catch (error) {
      console.error('Error saving to storage:', error)
    }
  }

  const removeValue = async () => {
    try {
      setValue(initialValue)
      await storage.removeItem(key)
    } catch (error) {
      console.error('Error removing from storage:', error)
    }
  }

  return {
    value,
    loading,
    setValue: updateValue,
    removeValue,
  }
}

/**
 * Hook to detect online/offline status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const platform = getPlatform()

    if (platform === 'web' || platform === 'desktop') {
      setIsOnline(navigator.onLine)

      const handleOnline = () => setIsOnline(true)
      const handleOffline = () => setIsOnline(false)

      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }

    if (platform === 'mobile') {
      // Use NetInfo for React Native
      import('@react-native-community/netinfo').then(({ default: NetInfo }) => {
        const unsubscribe = NetInfo.addEventListener(state => {
          setIsOnline(state.isConnected ?? false)
        })

        return () => unsubscribe()
      })
    }
  }, [])

  return isOnline
}

/**
 * Hook for responsive breakpoints
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const platform = getPlatform()

    if (platform === 'mobile') {
      setBreakpoint('mobile')
      return
    }

    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width < 768) {
        setBreakpoint('mobile')
      } else if (width < 1024) {
        setBreakpoint('tablet')
      } else {
        setBreakpoint('desktop')
      }
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)

    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}
