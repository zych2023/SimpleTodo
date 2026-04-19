# SimpleTodo

:sparkles:一个使用 electron + vue + electron-builder 开发的跨平台 todolist（便签）桌面应用

原作者：xiajingren  
原项目地址：https://github.com/xiajingren/xhznl-todo-list.git  
作者2：zych2023  
新项目地址：https://github.com/zych2023/SimpleTodo.git

## 相关技术

[electron 9.x](https://github.com/electron/electron)

[vue 2.x](https://github.com/vuejs/vue)

[vue-cli-plugin-electron-builder](https://github.com/nklayman/vue-cli-plugin-electron-builder)

[electron-builder](https://github.com/electron-userland/electron-builder)

[lowdb](https://github.com/typicode/lowdb)

[exceljs](https://github.com/exceljs/exceljs)

[dayjs](https://github.com/iamkun/dayjs)

[Vue.Draggable](https://github.com/SortableJS/Vue.Draggable)

......

## 功能预览

![todo list](/resources/1.png)

![done list](/resources/2.png)

![基本操作](/resources/3.gif)

![数据导出](/resources/4.gif)

![鼠标穿透](/resources/5.gif)

![macOS](/resources/6.png)

## 启动与打包（Windows）

1. 安装依赖（网络不稳定时建议使用镜像）

```powershell
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
npm run deps:install:mirror
```

2. 启动开发模式

```powershell
npm run electron:serve
```

3. 生成 Windows 可执行安装包（x64）

```powershell
npm run electron:build:win
```

4. 产物位置

打包后输出目录为 `release/`，常见产物：

- `release/SimpleTodo-<version>-win-x64.exe`（安装包）
- `release/win-unpacked/`（免安装目录）

下载 releases：https://github.com/zych2023/SimpleTodo/releases

## 规划

- [x] todo/done 基本功能
- [x] 本地数据库存储
- [x] 软件自动更新
- [x] 数据导出为 excel
- [x] 开机启动
- [x] 鼠标穿透
- [ ] 窗口贴边自动收起
- [ ] ......
