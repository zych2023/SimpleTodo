import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import windowStateKeeper from 'electron-window-state'
import { initWindowPinMode } from './windowPinMode'

let win: BrowserWindow | null = null

export function getWindow(): BrowserWindow | null {
  return win
}

export async function createWindow(): Promise<BrowserWindow> {
  const mainWindowState = windowStateKeeper({
    defaultWidth: 320,
    defaultHeight: 290
  })

  win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 320,
    minHeight: 290,
    ...(process.platform === 'win32' ? {} : { type: 'toolbar' }),
    frame: false,
    title: 'SimpleTodo',
    minimizable: false,
    maximizable: false,
    skipTaskbar: true,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  mainWindowState.manage(win)

  // Block Windows native right-click menu
  if (process.platform === 'win32') {
    win.hookWindowMessage(278, () => {
      if (!win) return
      win.setEnabled(false)
      setTimeout(() => {
        if (win && !win.isDestroyed()) win.setEnabled(true)
      }, 100)
      return true
    })
  }

  win.on('closed', () => {
    win = null
  })

  initWindowPinMode(win)

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    await loadWithRetry(process.env['ELECTRON_RENDERER_URL'])
  } else {
    await win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

async function loadWithRetry(url: string, retries = 8): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      if (!win || win.isDestroyed()) return
      await win.loadURL(url)
      return
    } catch {
      if (i < retries - 1) await new Promise((r) => setTimeout(r, 800))
    }
  }
}
