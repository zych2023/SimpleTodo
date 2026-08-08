import { BrowserWindow, screen, powerMonitor } from 'electron'
import { setDesktopOwner, clearDesktopOwner } from './desktopPin'

type PinMode = 'top' | 'desktop'

let win: BrowserWindow | null = null
let windowPinMode: PinMode = 'top'
let ownerSet = false
let desktopSystemEventBound = false

function hasLiveWindow(): boolean {
  return !!win && !win.isDestroyed()
}

function getHwndHex(): string {
  if (!win) return ''
  const buf = win.getNativeWindowHandle() as Buffer
  return buf.readBigUInt64LE(0).toString(16)
}

function isWindowOutOfVisibleArea(): boolean {
  if (!hasLiveWindow() || !win) return false
  const bounds = win.getBounds()
  const displays = screen.getAllDisplays()
  return !displays.some((display) => {
    const area = display.workArea
    return (
      bounds.x < area.x + area.width &&
      bounds.x + bounds.width > area.x &&
      bounds.y < area.y + area.height &&
      bounds.y + bounds.height > area.y
    )
  })
}

function setPosition(): void {
  if (!win) return
  const size = screen.getPrimaryDisplay().workAreaSize
  const winSize = win.getSize()
  win.setPosition(size.width - winSize[0] - 30, 30)
}

function recoverWindowToVisibleArea(): void {
  if (!hasLiveWindow()) return
  if (!isWindowOutOfVisibleArea()) return
  setPosition()
}

// ---- Public API ----

export async function applyWindowPinMode(mode: PinMode): Promise<void> {
  if (!hasLiveWindow() || !win) return

  windowPinMode = mode

  if (mode === 'top') {
    if (ownerSet) {
      await clearDesktopOwner(getHwndHex())
      ownerSet = false
    }
    win.setAlwaysOnTop(true, 'screen-saver')
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  } else {
    win.setAlwaysOnTop(false)
    win.setVisibleOnAllWorkspaces(false)
    const ok = await setDesktopOwner(getHwndHex())
    ownerSet = ok
  }
}

export function bindDesktopSystemEvents(): void {
  if (desktopSystemEventBound || process.platform !== 'win32') return

  const recover = (): void => {
    if (!hasLiveWindow()) return
    setTimeout(() => {
      if (!hasLiveWindow()) return
      recoverWindowToVisibleArea()
      applyWindowPinMode(windowPinMode)
    }, 200)
  }

  screen.on('display-added', recover)
  screen.on('display-removed', recover)
  screen.on('display-metrics-changed', recover)
  powerMonitor.on('resume', recover)
  powerMonitor.on('unlock-screen', recover)

  desktopSystemEventBound = true
}

export function initWindowPinMode(browserWindow: BrowserWindow): void {
  win = browserWindow
  applyWindowPinMode(windowPinMode)
}

export async function hideWindow(): Promise<void> {
  if (!win) return
  if (ownerSet) {
    await clearDesktopOwner(getHwndHex())
    ownerSet = false
  }
  win.hide()
}

export function setIgnoreMouseEvents(ignore: boolean): void {
  if (!win) return
  if (ignore) {
    win.setIgnoreMouseEvents(true, { forward: true })
  } else {
    win.setIgnoreMouseEvents(false)
  }
}
