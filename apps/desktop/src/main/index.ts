import { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage } from 'electron'
import { autoUpdater } from 'electron-updater'
import * as path from 'path'
import Store from 'electron-store'

interface WindowState {
  x: number
  y: number
  width: number
  height: number
}

const store = new Store<{ windowState?: WindowState }>()
let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

// Auto-updater configuration
autoUpdater.checkForUpdatesAndNotify()

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 10, y: 10 },
  })

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // Window event handlers
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Restore window state
  const windowState = store.get('windowState')
  if (windowState) {
    mainWindow.setBounds(windowState)
  }

  // Save window state on close
  mainWindow.on('close', () => {
    if (mainWindow) {
      store.set('windowState', mainWindow.getBounds())
    }
  })
}

function createTray() {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, '../../assets/tray-icon.png')
  )
  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
        }
      },
    },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      },
    },
  ])

  tray.setToolTip('GHXSTSHIP')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    }
  })
}

// App lifecycle
app.whenReady().then(() => {
  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('get-store-value', (_, key: string) => {
  return store.get(key)
})

ipcMain.handle('set-store-value', (_, key: string, value: unknown) => {
  store.set(key, value)
})

ipcMain.handle('delete-store-value', (_, key: string) => {
  store.delete(key as 'windowState')
})

// Auto-updater events
autoUpdater.on('update-available', () => {
  mainWindow?.webContents.send('update-available')
})

autoUpdater.on('update-downloaded', () => {
  mainWindow?.webContents.send('update-downloaded')
})

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall()
})
