import { execFile } from 'child_process'

export function getWallpaperPath(): Promise<string> {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') {
      resolve('')
      return
    }

    execFile(
      'reg',
      ['query', 'HKCU\\Control Panel\\Desktop', '/v', 'WallPaper'],
      { encoding: 'utf8' },
      (error, stdout) => {
        if (error) {
          resolve('')
          return
        }

        const match = stdout.match(/WallPaper\s+REG_SZ\s+(.+)/i)
        resolve(match ? match[1].trim() : '')
      }
    )
  })
}
