const DEFAULT_RGB = { r: 56, g: 76, b: 96 }
let timer: ReturnType<typeof setInterval> | null = null

function toFileUrl(filePath: string): string {
  if (!filePath || /^file:\/\//i.test(filePath)) return filePath
  const p = filePath.replace(/\\/g, '/')
  return encodeURI(`file:///${/^[a-zA-Z]:\//.test(p) ? '' : '//'}${p}`)
}

function getImageAverageColor(imagePath: string): Promise<{ r: number; g: number; b: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const size = 48
      canvas.width = canvas.height = size
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, size, size)
      const pixels = ctx.getImageData(0, 0, size, size).data
      let r = 0, g = 0, b = 0, n = 0
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] < 120) continue
        const br = (pixels[i] * 299 + pixels[i + 1] * 587 + pixels[i + 2] * 114) / 1000
        if (br < 18 || br > 242) continue
        r += pixels[i]; g += pixels[i + 1]; b += pixels[i + 2]; n++
      }
      resolve(n ? { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) } : DEFAULT_RGB)
    }
    img.onerror = () => reject(new Error('load failed'))
    img.src = `${toFileUrl(imagePath)}?t=${Date.now()}`
  })
}

function applyVars(rgb: { r: number; g: number; b: number }): void {
  const root = document.documentElement
  root.style.setProperty('--acrylic-tint-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`)
  const light = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 > 155
  const v = (name: string, val: string) => root.style.setProperty(name, val)
  v('--wallpaper-text-primary', light ? '#111827' : '#f8fafc')
  v('--wallpaper-text-secondary', light ? '#334155' : '#e2e8f0')
  v('--wallpaper-text-muted', light ? 'rgba(51,65,85,0.62)' : 'rgba(226,232,240,0.54)')
  v('--wallpaper-text-hover', light ? 'rgba(15,23,42,0.85)' : 'rgba(248,250,252,0.84)')
  v('--wallpaper-selection-bg', light ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.22)')
  v('--wallpaper-scroll-thumb', light ? 'rgba(30,41,59,0.28)' : 'rgba(241,245,249,0.26)')
  v('--wallpaper-group-title', light ? 'rgba(51,65,85,0.7)' : 'rgba(226,232,240,0.72)')
  v('--app-border-color', light ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.24)')
}

function clearVars(): void {
  const root = document.documentElement
  ;['--acrylic-tint-rgb', '--wallpaper-text-primary', '--wallpaper-text-secondary',
    '--wallpaper-text-muted', '--wallpaper-text-hover', '--wallpaper-selection-bg',
    '--wallpaper-scroll-thumb', '--wallpaper-group-title', '--app-border-color'
  ].forEach((v) => root.style.removeProperty(v))
}

async function refresh(): Promise<void> {
  const path = await window.electronAPI.getWallpaperPath()
  if (!path) { applyVars(DEFAULT_RGB); return }
  try { applyVars(await getImageAverageColor(path)) } catch { applyVars(DEFAULT_RGB) }
}

export function useWallpaper() {
  function onThemeChange(mode: string): void {
    if (mode === 'wallpaper') {
      if (!timer) timer = setInterval(refresh, 30000)
      refresh()
    } else {
      if (timer) { clearInterval(timer); timer = null }
      clearVars()
    }
  }

  return { onThemeChange }
}
