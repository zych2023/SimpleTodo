import { ipcMain, shell, dialog, Notification } from 'electron'
import ExcelJS from 'exceljs'
import { getWallpaperPath } from './wallpaper'
import { setIgnoreMouseEvents, hideWindow, applyWindowPinMode } from './windowPinMode'
import { getNowDateTimeForFileName } from './utils'
import store from './store'

export function registerIpcHandlers(): void {
  ipcMain.handle('setIgnoreMouseEvents', (_e, ignore: boolean) => setIgnoreMouseEvents(ignore))
  ipcMain.handle('hideWindow', () => { hideWindow() })
  ipcMain.handle('setWindowPinMode', (_e, mode: 'top' | 'desktop') => {
    applyWindowPinMode(mode)
    return mode
  })
  ipcMain.handle('getWallpaperPath', () => getWallpaperPath())
  ipcMain.handle('store:get', (_e, key: string) => store.get(key as never))
  ipcMain.handle('store:set', (_e, key: string, value: unknown) => store.set(key as never, value as never))
  ipcMain.handle('exportData', async () => {
    try {
      await exportData()
    } catch (err) {
      dialog.showErrorBox('导出失败', String(err))
    }
  })
}

async function exportData(): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'SimpleTodo'

  const sheet1 = workbook.addWorksheet('todo list')
  sheet1.addRow(['内容', '建立时间'])
  for (const item of store.get('todoList')) {
    sheet1.addRow([item.content, item.todo_datetime])
  }

  const sheet2 = workbook.addWorksheet('done list')
  sheet2.addRow(['内容', '建立时间', '完成时间'])
  const doneList = [...store.get('doneList')].sort((a, b) => b.done_date.localeCompare(a.done_date))
  for (const item of doneList) {
    sheet2.addRow([item.content, item.todo_datetime, item.done_datetime])
  }

  const result = await dialog.showSaveDialog({
    title: '数据导出',
    defaultPath: `/${getNowDateTimeForFileName()}.xlsx`
  })

  if (result.canceled || !result.filePath) return

  await workbook.xlsx.writeFile(result.filePath)

  if (Notification.isSupported()) {
    const n = new Notification({
      title: '导出完成',
      body: `数据已导出到：${result.filePath}`
    })
    n.on('click', () => shell.openExternal(result.filePath))
    n.show()
  }
}
