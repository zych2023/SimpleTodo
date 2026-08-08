[English](README.md) | [中文](README_CN.md)

---

# SimpleTodo

A lightweight desktop todo list application for Windows, built with Electron + Vue 3.

Based on [xhznl-todo-list](https://github.com/xiajingren/xhznl-todo-list), redesigned and enhanced.

## Features

- **Todo Management**: Click the empty area to add a todo; double-click to mark as done; single-click to edit; drag to reorder.
- **Done Archive**: Completed items are grouped by date with options to restore or delete.
- **Window Pin Modes**: Two window behaviors:
  - **Top Mode**: Window floats above all other applications (screen-saver level).
  - **Desktop Mode**: Window sits at normal z-order like a desktop icon. Uses Win32 owner-window technique to resist being hidden by Show Desktop or Win+D, without requiring always-on-top.
- **Theme Switching**: Light, dark, and wallpaper-acrylic themes with CSS backdrop-filter effects.
- **Custom Motto**: Editable personal motto displayed in the title bar area.
- **Data Export**: Export todo and done lists to Excel (.xlsx) format.
- **Local Storage**: All data stored locally via IndexedDB and electron-store. No network required.
- **System Tray**: Minimizes to system tray; supports auto-start on login.
- **Window State Persistence**: Remembers window position, size, and mode across restarts.
- **Firework Effect**: Celebratory particle effect when completing a todo.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Electron 33 + Vue 3 (Composition API) |
| Language | TypeScript |
| Build | electron-vite |
| Styling | SCSS with CSS custom properties |
| Storage | electron-store (main), IndexedDB (renderer) |
| Desktop Integration | Win32 API via PowerShell (owner-window embedding) |

## Development

```bash
# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint
```

## Build

```bash
# Build Windows installer (NSIS, x64)
npm run electron:build:win
```

The installer will be output to the `release/` directory.

> [!TIP]
> On first launch, the app registers itself to auto-start on login. You can toggle this in the system tray menu.

## Usage

1. Download the installer from the [Releases](https://github.com/zych2023/SimpleTodo/releases) page.
2. Install and launch. The window will appear in the top-right corner of the primary display.
3. Use the toolbar buttons to switch between top/desktop pin modes, toggle themes, export data, and lock the window position.
4. Right-click the system tray icon for startup preferences and other options.

## Changelog

### v1.0.0 (2026-08)

- Migrated from Vue CLI to electron-vite with full TypeScript support.
- Simplified window pin modes from three to two: Top and Desktop.
- Desktop mode now uses Win32 owner-window embedding to stay on the desktop without being hidden by Show Desktop or Win+D.
- Removed third-party theme dependency; themes are now implemented with CSS custom properties.
- Improved window initialization: default to top mode with instant startup.
- Fixed type errors in tray login-item settings.
- Cleaned up redundant hooks and legacy code paths.

## Credits

- Original author: [xiajingren](https://github.com/xiajingren) ([xhznl-todo-list](https://github.com/xiajingren/xhznl-todo-list))
- Maintainer: [zych2023](https://github.com/zych2023)

## License

> [!NOTE]
> This project is for personal learning and non-commercial use. See the original project for license details.

