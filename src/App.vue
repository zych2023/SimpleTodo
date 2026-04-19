<template>
  <div id="app" :class="{ unfocused: ignoreMouse }">
    <div class="mask"></div>
    <div class="drag-nav">
      <b>{{ appName }}</b>
      <i
        v-if="!isEditingMotto"
        class="custom-motto"
        :title="mottoTitle"
        @dblclick="startMottoEdit"
        @contextmenu.prevent="resetMotto"
      >
        {{ customMotto }}
      </i>
      <input
        v-else
        ref="mottoInput"
        v-model="mottoDraft"
        class="custom-motto-input"
        type="text"
        maxlength="80"
        @blur="confirmMottoEdit"
        @keyup.enter="confirmMottoEdit"
        @keyup.esc="cancelMottoEdit"
      />
    </div>
    <div class="nav">
      <div class="link">
        <router-link draggable="false" to="/">Todo</router-link> |
        <router-link draggable="false" to="/done">Done</router-link>
      </div>
      <div class="tools">
        <transition-group name="fade" mode="out-in">
          <i class="iconfont icon-export" key="export" @click="exportData"></i>
          <i
            :class="['iconfont', windowControlIcon]"
            key="window-control"
            :title="windowControlTitle"
            @click="cycleWindowControl"
          ></i>
          <i
            class="theme-switch-icon"
            key="theme"
            :title="themeTitle"
            @click="switchThemeMode"
          ></i>

          <i
            :class="['iconfont', ignoreMouse ? 'icon-lock' : 'icon-unlock']"
            key="lock"
            @mouseenter="setIgnoreMouseEvents(false)"
            @mouseleave="setIgnoreMouseEvents(ignoreMouse)"
            @click="ignoreMouse = !ignoreMouse"
          ></i>
        </transition-group>
      </div>
    </div>
    <div class="main scrollbar scrollbar-y">
      <transition name="fade-transform" mode="out-in">
        <!-- <keep-alive> -->
        <router-view />
        <!-- </keep-alive> -->
      </transition>
    </div>
  </div>
</template>

<script>
import pkg from "../package.json";

import { ipcRenderer } from "electron";

const STORAGE_KEYS = {
  motto: "xhznl_custom_motto",
  windowControlIndex: "xhznl_window_control_index",
  themeMode: "xhznl_theme_mode"
};

const THEME_MODES = ["system", "light", "dark", "wallpaper"];
const WINDOW_CONTROL_ACTIONS = ["top", "desktop", "hide"];
const DEFAULT_MOTTO = "Powered by 小黑/zych2023";
const DEFAULT_WALLPAPER_RGB = { r: 56, g: 76, b: 96 };

export default {
  data() {
    return {
      appName: pkg.displayName || pkg.name,
      customMotto: DEFAULT_MOTTO,
      mottoDraft: DEFAULT_MOTTO,
      isEditingMotto: false,
      ignoreMouse: false,
      themeMode: "system",
      systemTheme: "dark",
      colorMediaQuery: null,
      wallpaperTimer: null,
      windowControlIndex: 0
    };
  },
  computed: {
    themeTitle() {
      const modeTextMap = {
        system: "跟随系统",
        light: "浅色",
        dark: "深色",
        wallpaper: "壁纸亚克力"
      };

      const currentMode = modeTextMap[this.themeMode] || "跟随系统";

      return `主题模式：${currentMode}（点击切换）`;
    },
    windowControlAction() {
      return WINDOW_CONTROL_ACTIONS[this.windowControlIndex] || "top";
    },
    windowControlIcon() {
      const actionIconMap = {
        top: "icon-select",
        desktop: "icon-back",
        hide: "icon-eye-close"
      };

      return actionIconMap[this.windowControlAction] || "icon-eye-close";
    },
    windowControlTitle() {
      const actionTextMap = {
        top: "永远固定在所有应用最上层",
        desktop: "固定在桌面上（类似桌面图标）",
        hide: "隐藏/最小化"
      };

      const actionText =
        actionTextMap[this.windowControlAction] || "隐藏/最小化";
      return `窗口操作：${actionText}（点击执行并切换下一项）`;
    },
    mottoTitle() {
      return "双击编辑，点击其他地方保存，右键恢复默认";
    }
  },
  methods: {
    setIgnoreMouseEvents(ignore) {
      ipcRenderer.invoke("setIgnoreMouseEvents", ignore);
    },
    exportData() {
      ipcRenderer.invoke("exportData");
    },
    hideWindow() {
      ipcRenderer.invoke("hideWindow");
    },
    loadMotto() {
      const savedMotto = localStorage.getItem(STORAGE_KEYS.motto);
      if (savedMotto && savedMotto.trim()) {
        this.customMotto = savedMotto;
      }
    },
    saveMotto() {
      localStorage.setItem(STORAGE_KEYS.motto, this.customMotto);
    },
    startMottoEdit() {
      this.mottoDraft = this.customMotto;
      this.isEditingMotto = true;

      this.$nextTick(() => {
        if (!this.$refs.mottoInput) return;
        this.$refs.mottoInput.focus();
        this.$refs.mottoInput.select();
      });
    },
    confirmMottoEdit() {
      if (!this.isEditingMotto) return;

      const value = this.mottoDraft.trim();
      this.customMotto = value || DEFAULT_MOTTO;
      this.isEditingMotto = false;
      this.mottoDraft = this.customMotto;
      this.saveMotto();
    },
    cancelMottoEdit() {
      this.isEditingMotto = false;
      this.mottoDraft = this.customMotto;
    },
    resetMotto() {
      this.customMotto = DEFAULT_MOTTO;
      this.mottoDraft = this.customMotto;
      this.isEditingMotto = false;
      this.saveMotto();
    },
    loadWindowControlIndex() {
      const saved = Number(
        localStorage.getItem(STORAGE_KEYS.windowControlIndex)
      );
      if (saved >= 0 && saved < WINDOW_CONTROL_ACTIONS.length) {
        this.windowControlIndex = saved;
      }
    },
    saveWindowControlIndex() {
      localStorage.setItem(
        STORAGE_KEYS.windowControlIndex,
        String(this.windowControlIndex)
      );
    },
    async cycleWindowControl() {
      const action = this.windowControlAction;

      if (action === "top") {
        await ipcRenderer.invoke("setWindowPinMode", "top");
      } else if (action === "desktop") {
        await ipcRenderer.invoke("setWindowPinMode", "desktop");
      } else {
        this.hideWindow();
      }

      this.windowControlIndex =
        (this.windowControlIndex + 1) % WINDOW_CONTROL_ACTIONS.length;
      this.saveWindowControlIndex();
    },
    getSystemTheme() {
      if (
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function"
      ) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }

      return "dark";
    },
    getResolvedTheme() {
      if (this.themeMode === "system") return this.systemTheme;
      if (this.themeMode === "wallpaper") return "wallpaper";
      return this.themeMode;
    },
    applyTheme() {
      const root = document.documentElement;
      const resolvedTheme = this.getResolvedTheme();

      root.setAttribute("data-theme", resolvedTheme);
      root.setAttribute("data-theme-mode", this.themeMode);

      if (this.themeMode === "wallpaper") {
        this.startWallpaperWatcher();
        this.refreshWallpaperTheme();
      } else {
        this.stopWallpaperWatcher();
        this.clearWallpaperThemeVars();
      }
    },
    loadThemeMode() {
      const saved = localStorage.getItem(STORAGE_KEYS.themeMode);
      if (THEME_MODES.includes(saved)) {
        this.themeMode = saved;
      }
    },
    saveThemeMode() {
      localStorage.setItem(STORAGE_KEYS.themeMode, this.themeMode);
    },
    switchThemeMode() {
      const currentIndex = THEME_MODES.indexOf(this.themeMode);
      this.themeMode = THEME_MODES[(currentIndex + 1) % THEME_MODES.length];
      this.saveThemeMode();
      this.applyTheme();
    },
    onColorSchemeChange() {
      this.systemTheme = this.getSystemTheme();
      if (this.themeMode === "system") {
        this.applyTheme();
      }
    },
    bindColorSchemeListener() {
      if (
        typeof window === "undefined" ||
        typeof window.matchMedia !== "function"
      ) {
        return;
      }

      this.colorMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      if (typeof this.colorMediaQuery.addEventListener === "function") {
        this.colorMediaQuery.addEventListener(
          "change",
          this.onColorSchemeChange
        );
      } else if (typeof this.colorMediaQuery.addListener === "function") {
        this.colorMediaQuery.addListener(this.onColorSchemeChange);
      }
    },
    unbindColorSchemeListener() {
      if (!this.colorMediaQuery) {
        return;
      }

      if (typeof this.colorMediaQuery.removeEventListener === "function") {
        this.colorMediaQuery.removeEventListener(
          "change",
          this.onColorSchemeChange
        );
      } else if (typeof this.colorMediaQuery.removeListener === "function") {
        this.colorMediaQuery.removeListener(this.onColorSchemeChange);
      }
    },
    toFileUrl(filePath) {
      if (!filePath) return "";
      if (/^file:\/\//i.test(filePath)) return filePath;

      const normalizedPath = filePath.replace(/\\/g, "/");
      if (/^[a-zA-Z]:\//.test(normalizedPath)) {
        return encodeURI(`file:///${normalizedPath}`);
      }

      return encodeURI(`file://${normalizedPath}`);
    },
    async getWallpaperPath() {
      try {
        const path = await ipcRenderer.invoke("getWallpaperPath");
        return typeof path === "string" ? path : "";
      } catch {
        return "";
      }
    },
    getImageAverageColor(imagePath) {
      return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => {
          const size = 48;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;

          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0, size, size);

          const pixels = context.getImageData(0, 0, size, size).data;
          let totalR = 0;
          let totalG = 0;
          let totalB = 0;
          let count = 0;

          for (let i = 0; i < pixels.length; i += 4) {
            const alpha = pixels[i + 3];
            if (alpha < 120) continue;

            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;

            // Skip near-black and near-white pixels to keep tint stable.
            if (brightness < 18 || brightness > 242) continue;

            totalR += r;
            totalG += g;
            totalB += b;
            count += 1;
          }

          if (!count) {
            resolve({ r: 56, g: 76, b: 96 });
            return;
          }

          resolve({
            r: Math.round(totalR / count),
            g: Math.round(totalG / count),
            b: Math.round(totalB / count)
          });
        };

        image.onerror = () => reject(new Error("load wallpaper failed"));
        image.src = `${this.toFileUrl(imagePath)}?t=${Date.now()}`;
      });
    },
    clearWallpaperThemeVars() {
      const root = document.documentElement;
      root.style.removeProperty("--acrylic-tint-rgb");
      root.style.removeProperty("--wallpaper-text-primary");
      root.style.removeProperty("--wallpaper-text-secondary");
      root.style.removeProperty("--wallpaper-text-muted");
      root.style.removeProperty("--wallpaper-text-hover");
      root.style.removeProperty("--wallpaper-selection-bg");
      root.style.removeProperty("--wallpaper-scroll-thumb");
      root.style.removeProperty("--wallpaper-group-title");
      root.style.removeProperty("--app-border-color");
    },
    applyWallpaperThemeVars(rgb) {
      const root = document.documentElement;
      root.style.setProperty(
        "--acrylic-tint-rgb",
        `${rgb.r}, ${rgb.g}, ${rgb.b}`
      );

      const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
      const isLight = brightness > 155;

      if (isLight) {
        root.style.setProperty("--wallpaper-text-primary", "#111827");
        root.style.setProperty("--wallpaper-text-secondary", "#334155");
        root.style.setProperty(
          "--wallpaper-text-muted",
          "rgba(51, 65, 85, 0.62)"
        );
        root.style.setProperty(
          "--wallpaper-text-hover",
          "rgba(15, 23, 42, 0.85)"
        );
        root.style.setProperty(
          "--wallpaper-selection-bg",
          "rgba(37, 99, 235, 0.2)"
        );
        root.style.setProperty(
          "--wallpaper-scroll-thumb",
          "rgba(30, 41, 59, 0.28)"
        );
        root.style.setProperty(
          "--wallpaper-group-title",
          "rgba(51, 65, 85, 0.7)"
        );
        root.style.setProperty(
          "--app-border-color",
          "rgba(255, 255, 255, 0.42)"
        );
      } else {
        root.style.setProperty("--wallpaper-text-primary", "#f8fafc");
        root.style.setProperty("--wallpaper-text-secondary", "#e2e8f0");
        root.style.setProperty(
          "--wallpaper-text-muted",
          "rgba(226, 232, 240, 0.54)"
        );
        root.style.setProperty(
          "--wallpaper-text-hover",
          "rgba(248, 250, 252, 0.84)"
        );
        root.style.setProperty(
          "--wallpaper-selection-bg",
          "rgba(255, 255, 255, 0.22)"
        );
        root.style.setProperty(
          "--wallpaper-scroll-thumb",
          "rgba(241, 245, 249, 0.26)"
        );
        root.style.setProperty(
          "--wallpaper-group-title",
          "rgba(226, 232, 240, 0.72)"
        );
        root.style.setProperty(
          "--app-border-color",
          "rgba(255, 255, 255, 0.24)"
        );
      }
    },
    async refreshWallpaperTheme() {
      if (this.themeMode !== "wallpaper") return;

      const currentWallpaperPath = await this.getWallpaperPath();
      if (!currentWallpaperPath) {
        this.applyWallpaperThemeVars(DEFAULT_WALLPAPER_RGB);
        return;
      }

      try {
        const rgb = await this.getImageAverageColor(currentWallpaperPath);
        this.applyWallpaperThemeVars(rgb);
      } catch {
        this.applyWallpaperThemeVars(DEFAULT_WALLPAPER_RGB);
      }
    },
    startWallpaperWatcher() {
      if (this.wallpaperTimer) return;

      this.wallpaperTimer = setInterval(() => {
        this.refreshWallpaperTheme();
      }, 30000);
    },
    stopWallpaperWatcher() {
      if (!this.wallpaperTimer) return;

      clearInterval(this.wallpaperTimer);
      this.wallpaperTimer = null;
    }
  },
  created() {
    this.loadMotto();
    this.loadWindowControlIndex();
    ipcRenderer.invoke("setWindowPinMode", "desktop");
    this.systemTheme = this.getSystemTheme();
    this.loadThemeMode();
    this.applyTheme();
    this.bindColorSchemeListener();
  },
  beforeDestroy() {
    this.unbindColorSchemeListener();
    this.stopWallpaperWatcher();
  }
};
</script>

<style lang="scss" scoped>
#app {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
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
  .drag-nav {
    -webkit-app-region: drag;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 20px;
    padding: 0 20px;
    box-sizing: border-box;
    font-size: 12px;
    b,
    i {
      color: var(--text-muted);
    }
    .custom-motto {
      -webkit-app-region: no-drag;
      cursor: pointer;
      transition: color 0.18s ease;
      &:hover {
        color: var(--text-hover);
      }
    }
    .custom-motto-input {
      -webkit-app-region: no-drag;
      width: 220px;
      height: 18px;
      padding: 0 6px;
      color: var(--text-secondary);
      border: 1px solid var(--app-border-color);
      border-radius: 3px;
      background: transparent;
      outline: none;
      font-size: 12px;
      line-height: 18px;
    }
  }
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
          content: "\263D";
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
  .main {
    flex: 1;
    margin: 10px 0;
    overflow-y: auto;
    &:hover::-webkit-scrollbar-thumb {
      display: block;
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
#app.unfocused {
  opacity: 0.8;
  .mask {
    display: block;
  }
  .tools {
    z-index: 1000;
  }
}
</style>
