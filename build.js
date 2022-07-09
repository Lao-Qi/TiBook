"use strict"
const builder = require("electron-builder")
builder
    .build({
        config: {
            productName: "题书", // 软件名称
            appId: "com.tibook.app", // 软件id
            copyright: "Copyright © 2022 - present WangLaoQi(https://github.com/Lao-Qi)", // 软件版权
            files: ["dist/**/*", "electron/**/*"], // 软件打包资源文件
            directories: {
                output: "electron_dist", // 软件打包后输出的文件夹
            },
            dmg: {
                // dmg macOS系统上的安装包格式
                window: {
                    // 安装包窗口
                    x: 100,
                    y: 100,
                    width: 500,
                    height: 300,
                },
            },
            // nsis windows系统上的一个打包配置程序，支持打包出exe可执行文件
            nsis: {
                oneClick: false, // 是否一键安装
                installerIcon: "/dist/icon-256x256.ico", // 软件图标
                installerHeaderIcon: "/dist/icon-256x256.ico", // 安装程序的标题图标
                uninstallerIcon: "/dist/icon-uninstall-256x256.ico", // 卸载软件程序的图标
                uninstallDisplayName: "卸载题书", // 卸载软件程序名称
                allowElevation: true, // 让用户不需要使用管理员模式启动软件
                createDesktopShortcut: true, // 创建软件快捷打开方式
                createStartMenuShortcut: true, // 创建菜单快捷打开方式
                allowToChangeInstallationDirectory: true, // 允许用户更改软件的安装位置
            },
            win: {
                // windows系统配置
                icon: "/dist/icon-64x64.ico", // 软件图标
                target: [
                    {
                        target: "nsis", // 软件打包配置程序 类型打包额驱动
                        arch: "ia32", // 将软件打包成32位程序
                    },
                ],
            },
            mac: {
                // macOS系统配置
                icon: "/dist/icons-64x64.icns", // 软件图标
                target: "dmg", // 打包驱动
            },
            linux: {
                // linux系统配置
                icon: "/dist/icon-64x64.ico", // 软件图标
                target: "deb", // 打包驱动
            },
        },
    })
    .then(() => {
        console.log("项目打包成功")
    })
    .catch(err => {
        console.log("项目打包失败")
        console.error(err)
    })

// "allowElevation": true,
// "installerIcon": "/dist/icon-256x256.ico",
// "uninstallerIcon": "/dist/icon-uninstall-256x256.ico",
// "installerHeaderIcon": "/dist/icon-256x256.ico",
// "createDesktopShortcut": true,
// "createStartMenuShortcut": true,
// "uninstallDisplayName": "卸载题书",
