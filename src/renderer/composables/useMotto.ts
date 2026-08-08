import { ref } from 'vue'

const STORAGE_KEY = 'xhznl_custom_motto'
const DEFAULT_MOTTO = 'Powered by 小黑/zych2023'

export function useMotto() {
  const customMotto = ref(DEFAULT_MOTTO)
  const mottoDraft = ref(DEFAULT_MOTTO)
  const isEditingMotto = ref(false)

  function loadMotto(): void {
    const savedMotto = localStorage.getItem(STORAGE_KEY)
    if (savedMotto && savedMotto.trim()) {
      customMotto.value = savedMotto
    }
  }

  function saveMotto(): void {
    localStorage.setItem(STORAGE_KEY, customMotto.value)
  }

  function startMottoEdit(): void {
    mottoDraft.value = customMotto.value
    isEditingMotto.value = true
  }

  function confirmMottoEdit(): void {
    if (!isEditingMotto.value) return
    const value = mottoDraft.value.trim()
    customMotto.value = value || DEFAULT_MOTTO
    isEditingMotto.value = false
    mottoDraft.value = customMotto.value
    saveMotto()
  }

  function cancelMottoEdit(): void {
    isEditingMotto.value = false
    mottoDraft.value = customMotto.value
  }

  function resetMotto(): void {
    customMotto.value = DEFAULT_MOTTO
    mottoDraft.value = DEFAULT_MOTTO
    isEditingMotto.value = false
    saveMotto()
  }

  loadMotto()

  return {
    customMotto,
    mottoDraft,
    isEditingMotto,
    startMottoEdit,
    confirmMottoEdit,
    cancelMottoEdit,
    resetMotto
  }
}
