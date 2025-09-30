import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // Store
  store: {
    get: (key: string) => ipcRenderer.invoke('get-store-value', key),
    set: (key: string, value: any) => ipcRenderer.invoke('set-store-value', key, value),
    delete: (key: string) => ipcRenderer.invoke('delete-store-value', key),
  },

  // Auto-updater
  onUpdateAvailable: (callback: () => void) => {
    ipcRenderer.on('update-available', callback)
  },
  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on('update-downloaded', callback)
  },
  installUpdate: () => ipcRenderer.invoke('install-update'),
})

// Type definitions for TypeScript
export interface ElectronAPI {
  getAppVersion: () => Promise<string>
  store: {
    get: (key: string) => Promise<any>
    set: (key: string, value: any) => Promise<void>
    delete: (key: string) => Promise<void>
  }
  onUpdateAvailable: (callback: () => void) => void
  onUpdateDownloaded: (callback: () => void) => void
  installUpdate: () => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}
