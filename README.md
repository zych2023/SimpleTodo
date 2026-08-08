[English](README_EN.md) | [中文](README.md)

---

# SimpleTodo

轻量级 Windows 桌面待办清单应用，基于 Electron + Vue 3 构建。

基于 [xhznl-todo-list](https://github.com/xiajingren/xhznl-todo-list) 二次开发与增强。

## 功能特性

- **待办管理**：点击空白处添加待办，双击完成，单击编辑，长按拖拽排序。
- **完成归档**：已完成事项按日期分组展示，支持恢复和删除。
- **窗口模式**：两种窗口行为——
  - **置顶模式**：窗口悬浮在所有应用之上（screen-saver 级别）。
  - **桌面模式**：窗口处于普通层级，像桌面图标一样停留在桌面上。通过 Win32 属主窗口技术（owner-window）避免被 Show Desktop 或 Win+D 隐藏，无需强制置顶。
- **主题切换**：浅色、深色、壁纸亚克力三种主题，基于 CSS backdrop-filter 实现。
- **自定义座右铭**：标题栏可编辑个人谏言。
- **数据导出**：支持导出待办和已完成清单为 Excel (.xlsx) 格式。
- **本地存储**：所有数据通过 IndexedDB 和 electron-store 本地保存，无需联网。
- **系统托盘**：支持最小化到托盘，支持开机自启。
- **窗口状态记忆**：位置、大小、模式跨重启保持。
- **烟花特效**：完成待办时的庆祝粒子效果。

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Electron 33 + Vue 3 (Composition API) |
| 语言 | TypeScript |
| 构建 | electron-vite |
| 样式 | SCSS + CSS 自定义属性 |
| 存储 | electron-store (主进程), IndexedDB (渲染进程) |
| 桌面集成 | PowerShell 调用 Win32 API (属主窗口嵌入) |

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务（热重载）
npm run dev

# 类型检查
npm run typecheck

# 代码检查
npm run lint
```

## 构建

```bash
# 构建 Windows 安装包 (NSIS, x64)
npm run electron:build:win
```

安装包输出到 `release/` 目录。

> [!TIP]
> 首次启动后应用会自动注册开机自启。可在系统托盘菜单中切换此设置。

## 使用说明

1. 从 [Releases](https://github.com/zych2023/SimpleTodo/releases) 页面下载安装包。
2. 安装并启动，窗口将显示在主屏幕右上角。
3. 使用工具栏按钮切换置顶/桌面模式、主题、导出数据、锁定窗口位置。
4. 右键系统托盘图标可设置开机启动等选项。

## 更新日志

### v1.0.0 (2026-08)

- 从 Vue CLI 迁移至 electron-vite，全面 TypeScript 化。
- 窗口模式从三种简化为两种：置顶和桌面。
- 桌面模式通过 Win32 属主窗口嵌入，实现在桌面上不被 Show Desktop / Win+D 隐藏。
- 移除第三方主题依赖，改用 CSS 自定义属性实现主题。
- 优化窗口初始化：默认为置顶模式，即时启动。
- 修复托盘登录项设置的类型错误。
- 清理冗余钩子和遗留代码路径。

## 致谢

- 原作者：[xiajingren](https://github.com/xiajingren) ([xhznl-todo-list](https://github.com/xiajingren/xhznl-todo-list))
- 维护者：[zych2023](https://github.com/zych2023)

## 许可

> [!NOTE]
> 本项目仅供个人学习和非商业用途。许可详情请参阅原始项目。

