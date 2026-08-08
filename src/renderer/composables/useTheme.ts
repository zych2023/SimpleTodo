import { ref, onMounted, onBeforeUnmount } from 'vue'

const THEME_MODES = ['system', 'light', 'dark', 'wallpaper'] as const
type ThemeMode = (typeof THEME_MODES)[number]
const STORAGE_KEY = 'xhznl_theme_mode'

export function useTheme() {
  const themeMode = ref<ThemeMode>('system')
  let mediaQuery: MediaQueryList | null = null

  function applyTheme(): void {
    const root = document.documentElement
    const resolved =
      themeMode.value === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : themeMode.value
    root.setAttribute('data-theme', resolved)
    root.setAttribute('data-theme-mode', themeMode.value)
  }

  function switchThemeMode(): void {
    const i = THEME_MODES.indexOf(themeMode.value)
    themeMode.value = THEME_MODES[(i + 1) % THEME_MODES.length]
    localStorage.setItem(STORAGE_KEY, themeMode.value)
    applyTheme()
  }

  function onColorSchemeChange(): void {
    if (themeMode.value === 'system') applyTheme()
  }

  onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && THEME_MODES.includes(saved as ThemeMode)) {
      themeMode.value = saved as ThemeMode
    }
    applyTheme()
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', onColorSchemeChange)
  })

  onBeforeUnmount(() => {
    mediaQuery?.removeEventListener('change', onColorSchemeChange)
  })

  return { themeMode, switchThemeMode }
}
