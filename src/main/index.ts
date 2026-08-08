import { app, BrowserWindow } from 'electron'
import { createWindow, getWindow } from './window'
import { bindDesktopSystemEvents } from './windowPinMode'
import { createTray, setupAutoUpdater } from './tray'
import { createAppMenu } from './menu'
import { registerIpcHandlers } from './ipc'
import store from './store'

app.commandLine.appendSwitch('wm-window-animations-disabled')

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const win = getWindow()
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })
}

createAppMenu()

function init(): void {
  createWindow()
  bindDesktopSystemEvents()
  registerIpcHandlers()
  createTray(() => {
    const win = getWindow()
    if (win) win.show()
  })

  if (store.get('settings.firstRun')) {
    app.setLoginItemSettings({ openAtLogin: true })
    store.set('settings.firstRun', false)
  }

  setupAutoUpdater()
}

app.whenReady().then(() => {
  init()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) init()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

if (!app.isPackaged) {
  if (process.platform === 'win32') {
    process.on('message', (data) => { if (data === 'graceful-exit') app.quit() })
  } else {
    process.on('SIGTERM', () => app.quit())
  }
}
