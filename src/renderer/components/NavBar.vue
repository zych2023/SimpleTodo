<template>
  <div class="nav">
    <div class="link">
      <router-link draggable="false" to="/">Todo</router-link> |
      <router-link draggable="false" to="/done">Done</router-link>
    </div>
    <div
      class="tools"
      @mouseenter="$emit('mouseenterTools')"
      @mouseleave="$emit('mouseleaveTools')"
    >
      <i class="iconfont icon-export" title="导出数据" @click="$emit('exportData')"></i>
      <i
        :class="['iconfont', windowControlIcon]"
        :title="windowControlTitle"
        @click="$emit('cycleWindowControl')"
      ></i>
      <i
        class="theme-switch-icon"
        :title="themeTitle"
        @click="$emit('switchTheme')"
      ></i>
      <i
        :class="['iconfont', ignoreMouse ? 'icon-lock' : 'icon-unlock']"
        @click="$emit('toggleLock')"
      ></i>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  themeTitle: string
  windowControlIcon: string
  windowControlTitle: string
  ignoreMouse: boolean
}>()

defineEmits<{
  exportData: []
  cycleWindowControl: []
  switchTheme: []
  toggleLock: []
  mouseenterTools: []
  mouseleaveTools: []
}>()
</script>

<style lang="scss" scoped>
.nav {
  display: flex;
  justify-content: space-between;
  height: 26px;
  padding: 0 20px;
  color: var(--text-secondary);
  user-select: none;

  .link {
    a {
      font-weight: bold;
      color: var(--text-secondary);
      text-decoration: none;
      &.router-link-exact-active {
        font-size: 20px;
        color: var(--text-primary);
      }
      &:hover {
        color: var(--text-hover);
      }
    }
  }

  .tools {
    display: flex;
    z-index: 1000;

    i {
      font-size: 20px;
      line-height: 26px;
      padding: 0 5px;
      cursor: pointer;
    }

    .theme-switch-icon {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      color: var(--text-secondary);
      transform-origin: center;
      transition: transform 0.2s ease, color 0.18s ease, text-shadow 0.2s ease;

      &::before {
        content: '\263D';
        font-size: 18px;
        line-height: 1;
      }

      &:hover {
        color: var(--text-primary);
      }

      &:active {
        text-shadow: 0 0 12px rgba(255, 255, 255, 0.35);
        animation: theme-icon-pop 0.35s ease;
        transform: rotate(120deg) scale(0.95);
      }
    }
  }
}

@keyframes theme-icon-pop {
  0% {
    transform: rotate(0deg) scale(1);
  }
  35% {
    transform: rotate(-14deg) scale(1.22);
  }
  70% {
    transform: rotate(10deg) scale(1.08);
  }
  100% {
    transform: rotate(18deg) scale(1.15);
  }
}
</style>
