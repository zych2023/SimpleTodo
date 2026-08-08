import { ref, computed } from 'vue'

const ACTIONS = ['top', 'desktop'] as const
type Action = (typeof ACTIONS)[number]
const STORAGE_KEY = 'xhznl_window_control_index'

const ICONS: Record<Action, string> = { top: 'icon-select', desktop: 'icon-back' }
const TITLES: Record<Action, string> = {
  top: '置顶模式：始终悬浮在最上层',
  desktop: '桌面模式：普通窗口层级，随桌面显示不被隐藏'
}

export function useWindowControl() {
  const stored = localStorage.getItem(STORAGE_KEY)
  const index = ref(stored ? Number(stored) : 0)
  if (index.value < 0 || index.value >= ACTIONS.length) index.value = 0

  const windowControlIcon = computed(() => ICONS[ACTIONS[index.value]])
  const windowControlTitle = computed(() => `窗口操作：${TITLES[ACTIONS[index.value]]}（点击执行并切换）`)

  // Sync initial mode with backend
  if (!stored) {
    window.electronAPI.setWindowPinMode('top')
    localStorage.setItem(STORAGE_KEY, '0')
  }

  async function cycleWindowControl(): Promise<void> {
    const action = ACTIONS[index.value]
    if (action === 'top') await window.electronAPI.setWindowPinMode('top')
    else await window.electronAPI.setWindowPinMode('desktop')

    index.value = (index.value + 1) % ACTIONS.length
    localStorage.setItem(STORAGE_KEY, String(index.value))
  }

  return { windowControlIcon, windowControlTitle, cycleWindowControl }
}
