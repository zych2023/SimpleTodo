"use strict";

import {
  app,
  protocol,
  BrowserWindow,
  screen,
  ipcMain,
  powerMonitor
} from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
//import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
const isDevelopment = process.env.NODE_ENV !== "production";

import { initExtra, createTray, createAppMenu } from "@/utils/backgroundExtra";

import { autoUpdater } from "electron-updater";

import windowStateKeeper from "electron-window-state";

import pkg from "../package.json";

let win;
let manualHideRequested = false;
let windowPinMode = "desktop";
let desktopPinWatchdog = null;
let desktopSystemEventBound = false;

function hasLiveWindow() {
  return !!win && !win.isDestroyed();
}

function isWindowOutOfVisibleArea() {
  if (!hasLiveWindow()) return false;

  const bounds = win.getBounds();
  const displays = screen.getAllDisplays();

  return !displays.some(display => {
    const area = display.workArea;
    const overlapsHorizontally =
      bounds.x < area.x + area.width && bounds.x + bounds.width > area.x;
    const overlapsVertically =
      bounds.y < area.y + area.height && bounds.y + bounds.height > area.y;

    return overlapsHorizontally && overlapsVertically;
  });
}

function recoverWindowToVisibleArea() {
  if (!hasLiveWindow()) return;
  if (!isWindowOutOfVisibleArea()) return;

  setPosition();
}

function shouldKeepDesktopVisible() {
  return windowPinMode === "desktop" && !manualHideRequested;
}

function ensureDesktopPinnedVisible() {
  if (!shouldKeepDesktopVisible() || !hasLiveWindow()) return;

  const recover = () => {
    if (!shouldKeepDesktopVisible() || !hasLiveWindow()) return;

    recoverWindowToVisibleArea();
    if (win.isMinimized()) win.restore();
    if (!win.isVisible()) win.showInactive();
  };

  // Win + D may minimize/hide repeatedly in a short burst.
  recover();
  setTimeout(recover, 120);
  setTimeout(recover, 260);
}

function startDesktopPinWatchdog() {
  if (desktopPinWatchdog) return;

  desktopPinWatchdog = setInterval(() => {
    ensureDesktopPinnedVisible();
  }, 500);
}

function stopDesktopPinWatchdog() {
  if (!desktopPinWatchdog) return;

  clearInterval(desktopPinWatchdog);
  desktopPinWatchdog = null;
}

function bindDesktopSystemEvents() {
  if (desktopSystemEventBound || process.platform !== "win32") return;

  const recoverDesktopPinWindow = () => {
    if (!hasLiveWindow()) return;

    setTimeout(() => {
      if (!hasLiveWindow()) return;

      recoverWindowToVisibleArea();
      applyWindowPinMode(windowPinMode);
      ensureDesktopPinnedVisible();
    }, 120);
  };

  screen.on("display-added", recoverDesktopPinWindow);
  screen.on("display-removed", recoverDesktopPinWindow);
  screen.on("display-metrics-changed", recoverDesktopPinWindow);
  powerMonitor.on("resume", recoverDesktopPinWindow);
  powerMonitor.on("unlock-screen", recoverDesktopPinWindow);

  desktopSystemEventBound = true;
}

function applyWindowPinMode(mode) {
  if (!hasLiveWindow()) return;

  if (mode === "top") {
    win.setAlwaysOnTop(true, "screen-saver");
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    windowPinMode = "top";
    stopDesktopPinWatchdog();
    return;
  }

  win.setAlwaysOnTop(false);
  win.setVisibleOnAllWorkspaces(false);
  windowPinMode = "desktop";
  startDesktopPinWatchdog();
  ensureDesktopPinnedVisible();
}

if (app.requestSingleInstanceLock()) {
  app.on("second-instance", () => {
    if (win) {
      setPosition();
    }
  });
} else {
  app.quit();
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

createAppMenu();

async function createWindow() {
  // Load the previous state with fallback to defaults
  let mainWindowState = windowStateKeeper({
    defaultWidth: 320,
    defaultHeight: 290
  });

  // Create the browser window.
  win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 320,
    minHeight: 290,
    ...(process.platform === "win32" ? {} : { type: "toolbar" }),
    frame: false,
    //resizable: false,
    title: pkg.displayName || pkg.name,
    minimizable: false,
    maximizable: false,
    skipTaskbar: true,
    //closable: false,
    //show: false,
    transparent: true,
    backgroundColor: "#00000000",
    //alwaysOnTop: true,
    //useContentSize: true,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
    }
  });

  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  mainWindowState.manage(win);

  if (mainWindowState.x == undefined || mainWindowState.y == undefined)
    setPosition();

  applyWindowPinMode(windowPinMode);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
    autoUpdater.checkForUpdatesAndNotify();
  }

  // win.once("ready-to-show", () => {
  //   win.show();
  // });

  //屏蔽windows原生右键菜单
  if (process.platform === "win32") {
    //int WM_INITMENU = 0x116;
    //当一个下拉菜单或子菜单将要被激活时发送此消息，它允许程序在它显示前更改菜单，而不要改变全部
    win.hookWindowMessage(278, function() {
      win.setEnabled(false); //窗口禁用

      setTimeout(() => {
        win.setEnabled(true); //窗口启用
      }, 100); //延时太快会立刻启用，太慢会妨碍窗口其他操作，可自行测试最佳时间

      return true;
    });
  }

  win.on("closed", () => {
    win = null;
  });

  win.on("minimize", event => {
    event.preventDefault();
    win.restore();
    win.showInactive();
    ensureDesktopPinnedVisible();
  });

  win.on("hide", () => {
    if (manualHideRequested) return;

    setTimeout(() => {
      if (!win || win.isDestroyed() || win.isVisible()) return;
      win.showInactive();
      ensureDesktopPinnedVisible();
    }, 0);
  });

  win.on("show", () => {
    manualHideRequested = false;
  });
}

//闪烁问题
app.commandLine.appendSwitch("wm-window-animations-disabled");

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) init();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  // if (isDevelopment && !process.env.IS_TEST) {
  //   // Install Vue Devtools
  //   try {
  //     await installExtension(VUEJS_DEVTOOLS);
  //   } catch (e) {
  //     console.error("Vue Devtools failed to install:", e.toString());
  //   }
  // }

  init();
});

function init() {
  createWindow();
  bindDesktopSystemEvents();
  initExtra();
  createTray(showWindow);
  //createAppMenu();
}

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

function setPosition() {
  const size = screen.getPrimaryDisplay().workAreaSize;
  const winSize = win.getSize();
  win.setPosition(size.width - winSize[0] - 30, 30);
}

function showWindow() {
  //if (!win.isVisible())
  recoverWindowToVisibleArea();
  if (win.isMinimized()) win.restore();
  manualHideRequested = false;
  win.show();
  applyWindowPinMode(windowPinMode);
}

ipcMain.handle("setIgnoreMouseEvents", (event, ignore) => {
  if (ignore) win.setIgnoreMouseEvents(true, { forward: true });
  else win.setIgnoreMouseEvents(false);
});

ipcMain.handle("hideWindow", () => {
  manualHideRequested = true;
  stopDesktopPinWatchdog();
  win.hide();
});

ipcMain.handle("setWindowPinMode", (event, mode) => {
  applyWindowPinMode(mode);
  return windowPinMode;
});
