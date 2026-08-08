import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  setIgnoreMouseEvents: (ignore: boolean): Promise<void> =>
    ipcRenderer.invoke('setIgnoreMouseEvents', ignore),
  hideWindow: (): Promise<void> => ipcRenderer.invoke('hideWindow'),
  setWindowPinMode: (mode: 'top' | 'desktop'): Promise<string> =>
    ipcRenderer.invoke('setWindowPinMode', mode),
  exportData: (): Promise<void> => ipcRenderer.invoke('exportData'),
  getWallpaperPath: (): Promise<string> => ipcRenderer.invoke('getWallpaperPath'),
  storeGet: (key: string): Promise<unknown> => ipcRenderer.invoke('store:get', key),
  storeSet: (key: string, value: unknown): Promise<void> =>
    ipcRenderer.invoke('store:set', key, value)
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI
