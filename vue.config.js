// vue.config.js

module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: "simpletodo",
        productName: "SimpleTodo",
        artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
        copyright: "Copyright © 2020 xhznl",
        directories: {
          buildResources: "./public",
          output: "release"
        },
        electronDownload: {
          mirror: "https://npmmirror.com/mirrors/electron/"
        },
        win: {
          icon: "./public/logo.ico",
          executableName: "SimpleTodo",
          target: [
            {
              target: "nsis",
              arch: ["x64"]
            }
          ]
        },
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true,
          uninstallDisplayName: "SimpleTodo",
          shortcutName: "SimpleTodo"
        },
        dmg: {
          contents: [
            {
              x: 410,
              y: 150,
              type: "link",
              path: "/Applications"
            },
            {
              x: 130,
              y: 150,
              type: "file"
            }
          ]
        },
        mac: {
          icon: "./public/logo.icns",
          hardenedRuntime: true,
          gatekeeperAssess: false,
          entitlements: "./public/entitlements.mac.plist",
          entitlementsInherit: "./public/entitlements.mac.plist",
          target: {
            target: "default",
            arch: "universal"
          }
        },
        publish: ["github"]
        // releaseInfo: {
        //   releaseName: "",
        //   releaseNotes: "",
        //   releaseDate: "",
        // },
      },
      nodeIntegration: true
    }
  },
  configureWebpack: {
    externals: {}
  }
};
