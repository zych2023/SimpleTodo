import { app, Menu } from 'electron'

export function createAppMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    ...(process.platform === 'darwin'
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const, label: '关于' },
              { type: 'separator' as const },
              { role: 'quit' as const, label: '退出' }
            ]
          }
        ]
      : [])
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
