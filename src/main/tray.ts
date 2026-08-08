import { app, Tray, Menu, shell, dialog } from 'electron'
import { join } from 'path'
import { autoUpdater } from 'electron-updater'

let tray: Tray | null = null

const APP_NAME = 'SimpleTodo'
const APP_URL = 'https://github.com/zych2023/SimpleTodo'
const ORIGINAL_URL = 'https://github.com/xiajingren/xhznl-todo-list'

function getTrayIconPath(): string {
  const icon = process.platform === 'darwin' ? 'tray-mac@1x.png' : 'tray.png'
  return app.isPackaged
    ? join(process.resourcesPath, icon)
    : join(__dirname, '../../resources', icon)
}

function getOpenAtLogin(): boolean {
  const opts = app.isPackaged ? {} : { path: process.execPath, args: [join(process.argv[1])] }
  return app.getLoginItemSettings(opts).openAtLogin
}

function setOpenAtLogin(open: boolean): void {
  const opts: Electron.Settings = { openAtLogin: open }
  if (!app.isPackaged) {
    opts.openAsHidden = false
    opts.path = process.execPath
    opts.args = [join(process.argv[1])]
  }
  app.setLoginItemSettings(opts)
}

export function createTray(showWindow: () => void): void {
  tray = new Tray(getTrayIconPath())
  tray.setToolTip(APP_NAME)
  tray.on('click', showWindow)
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: '开机启动', type: 'checkbox', checked: getOpenAtLogin(), click: () => setOpenAtLogin(!getOpenAtLogin()) },
    { label: '项目地址', click: () => shell.openExternal(APP_URL) },
    { label: '问题反馈', click: () => shell.openExternal(`${APP_URL}/issues`) },
    { label: '关于', click: () => dialog.showMessageBox({ title: APP_NAME, message: `${APP_NAME} - a todo list application`, detail: `Version: ${app.getVersion()}\nOriginal: ${ORIGINAL_URL}\nAuthor: zych2023\nGitHub: ${APP_URL}` }) },
    { label: '退出', role: 'quit' }
  ]))
}

export function setupAutoUpdater(): void {
  if (app.isPackaged) autoUpdater.checkForUpdatesAndNotify()
}
