<template>
  <div id="app" :class="{ unfocused: ignoreMouse }">
    <div class="mask"></div>
    <DragNav
      :app-name="appName"
      :custom-motto="customMotto"
      :motto-draft="mottoDraft"
      :is-editing-motto="isEditingMotto"
      @start-motto-edit="startMottoEdit"
      @confirm-motto-edit="confirmMottoEdit"
      @cancel-motto-edit="cancelMottoEdit"
      @reset-motto="resetMotto"
      @update:motto-draft="mottoDraft = $event"
    />
    <NavBar
      :theme-title="themeTitle"
      :window-control-icon="windowControlIcon"
      :window-control-title="windowControlTitle"
      :ignore-mouse="ignoreMouse"
      @export-data="handleExport"
      @cycle-window-control="cycleWindowControl"
      @switch-theme="handleSwitchTheme"
      @toggle-lock="toggleLock"
    />
    <div class="main scrollbar scrollbar-y">
      <router-view v-slot="{ Component }">
        <transition name="fade-transform" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DragNav from './components/DragNav.vue'
import NavBar from './components/NavBar.vue'
import { useTheme } from './composables/useTheme'
import { useWindowControl } from './composables/useWindowControl'
import { useMotto } from './composables/useMotto'
import { useWallpaper } from './composables/useWallpaper'

const appName = 'SimpleTodo'
const ignoreMouse = ref(false)

const { themeMode, switchThemeMode } = useTheme()
const { windowControlIcon, windowControlTitle, cycleWindowControl } = useWindowControl()
const { customMotto, mottoDraft, isEditingMotto, startMottoEdit, confirmMottoEdit, cancelMottoEdit, resetMotto } = useMotto()
const { onThemeChange } = useWallpaper()

const themeTitle = computed(() => {
  const map: Record<string, string> = { system: '跟随系统', light: '浅色', dark: '深色', wallpaper: '壁纸亚克力' }
  return `主题模式：${map[themeMode.value]}（点击切换）`
})

function handleSwitchTheme(): void {
  switchThemeMode()
  onThemeChange(themeMode.value)
}

function handleExport(): void {
  window.electronAPI.exportData()
}

function toggleLock(): void {
  ignoreMouse.value = !ignoreMouse.value
}
</script>

<style lang="scss" scoped>
#app {
  display: flex;
  flex-direction: column;
  position: absolute;
  inset: 4px;
  background-color: var(--app-bg);
  border: 1px solid var(--app-border-color);
  border-radius: 5px;
  backdrop-filter: blur(var(--app-blur)) saturate(var(--app-saturate));
  -webkit-backdrop-filter: blur(var(--app-blur)) saturate(var(--app-saturate));
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.24);

  .mask {
    display: none;
    position: absolute;
    z-index: 999;
    width: 100%;
    height: 100%;
  }

  .main {
    flex: 1;
    margin: 10px 0;
    overflow-y: auto;
    &:hover::-webkit-scrollbar-thumb {
      display: block;
    }
  }
}

#app.unfocused {
  opacity: 0.8;

  .drag-nav,
  .main {
    pointer-events: none;
  }

  .mask {
    display: block;
  }
}

</style>
