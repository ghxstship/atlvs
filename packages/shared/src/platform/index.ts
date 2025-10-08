/**
 * Platform abstraction layer for code sharing between web, mobile, and desktop
 */

export type Platform = 'web' | 'mobile' | 'desktop'

export function getPlatform(): Platform {
  // Check for Electron
  if (typeof window !== 'undefined' && (window as any).electron) {
    return 'desktop'
  }

  // Check for React Native
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return 'mobile'
  }

  // Default to web
  return 'web'
}

export function isWeb(): boolean {
  return getPlatform() === 'web'
}

export function isMobile(): boolean {
  return getPlatform() === 'mobile'
}

export function isDesktop(): boolean {
  return getPlatform() === 'desktop'
}

// Platform-specific storage
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
  clear(): Promise<void>
}

class WebStorage implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(key)
  }

  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value)
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key)
  }

  async clear(): Promise<void> {
    localStorage.clear()
  }
}

class MobileStorage implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    // Use expo-secure-store or AsyncStorage
    const SecureStore = await import('expo-secure-store')
    return SecureStore.getItemAsync(key)
  }

  async setItem(key: string, value: string): Promise<void> {
    const SecureStore = await import('expo-secure-store')
    await SecureStore.setItemAsync(key, value)
  }

  async removeItem(key: string): Promise<void> {
    const SecureStore = await import('expo-secure-store')
    await SecureStore.deleteItemAsync(key)
  }

  async clear(): Promise<void> {
    // Implementation depends on storage solution
  }
}

class DesktopStorage implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    if (typeof window !== 'undefined' && window.electron) {
      return window.electron.store.get(key)
    }
    return null
  }

  async setItem(key: string, value: string): Promise<void> {
    if (typeof window !== 'undefined' && window.electron) {
      await window.electron.store.set(key, value)
    }
  }

  async removeItem(key: string): Promise<void> {
    if (typeof window !== 'undefined' && window.electron) {
      await window.electron.store.delete(key)
    }
  }

  async clear(): Promise<void> {
    // Implementation depends on electron-store
  }
}

export function getStorage(): StorageAdapter {
  const platform = getPlatform()

  switch (platform) {
    case 'web':
      return new WebStorage()
    case 'mobile':
      return new MobileStorage()
    case 'desktop':
      return new DesktopStorage()
  }
}

// Platform-specific notifications
export interface NotificationAdapter {
  requestPermission(): Promise<boolean>
  showNotification(title: string, body: string, data?: any): Promise<void>
  onNotificationReceived(callback: (data: any) => void): void
}

export function getNotifications(): NotificationAdapter {
  const platform = getPlatform()

  // Platform-specific implementations
  // ... (implementation details)

  throw new Error(`Notifications not implemented for platform: ${platform}`)
}

// Export shared utilities
export * from './hooks'
// export * from './utils' // TODO: Create utils module if needed
