"use strict"

const { readFileSync, writeFileSync } = require("fs")
const { join } = require("path")
// const builder = require("electron-builder")

/**
 * 先打包渲染资源后打包主资源，顺序不能颠倒
 * 渲染资源打包后资源存放于dist下面，直接存放，没有多包一层目录
 * 
 * 主资源打包后生成main.js文件，存放于dist下面，作为软件的入口文件
 * 
 * 所有软件运行时得用到的包都被会打包到文件里面，所有不需要node_module文件夹
 * 且打包后的文件内部有做了代码的压缩，所以体积也会小很多
 * 
 * 唯一导入就electron，但是在打包后的软件中electron已经内置，所有不需要
 */
// 打包渲染资源
require("./app-render-build")
// 打包主资源
require("./app-main-build")

/**
 * 在打包好了的dist文件夹内部中添加package.json文件，其中的信息来自跟目录下的app.deploy.json
 * 
 * dist将作为软件最终的资源被打包进electron应用的app.asar中
 */
try {
    const APP_DEPLOY = JSON.parse(readFileSync(join(__dirname, "../app.deploy.json")))
    // 配置打包好的资源的入口文件
    APP_DEPLOY["main"] = "main.js"
    writeFileSync(join(__dirname, "./dist/package.json"), JSON.stringify(APP_DEPLOY))
}catch(err) {
    throw err
}

/**
 * 通过electron-builder打包应用
 */

// builder
//     .build({
//         config: {
//             productName: "题书", // 软件名称
//             appId: "com.tibook.app", // 软件id
//             copyright: "Copyright © 2022 - present WangLaoQi(https://github.com/Lao-Qi)", // 软件版权
//             files: ["../render-dist/**/*", "../electron-dist/**/*"], // 软件打包资源文件
//             directories: {
//                 output: "electron_dist", // 软件打包后输出的文件夹
//             },
//             dmg: {
//                 // dmg macOS系统上的安装包格式
//                 window: {
//                     // 安装包窗口
//                     x: 100,
//                     y: 100,
//                     width: 500,
//                     height: 300,
//                 },
//             },
//             // nsis windows系统上的一个打包配置程序，支持打包出exe可执行文件
//             nsis: {
//                 oneClick: false, // 是否一键安装
//                 installerIcon: "/dist/icon-256x256.ico", // 软件图标
//                 installerHeaderIcon: "/dist/icon-256x256.ico", // 安装程序的标题图标
//                 uninstallerIcon: "/dist/icon-uninstall-256x256.ico", // 卸载软件程序的图标
//                 uninstallDisplayName: "卸载题书", // 卸载软件程序名称
//                 allowElevation: true, // 让用户不需要使用管理员模式启动软件
//                 createDesktopShortcut: true, // 创建软件快捷打开方式
//                 createStartMenuShortcut: true, // 创建菜单快捷打开方式
//                 allowToChangeInstallationDirectory: true, // 允许用户更改软件的安装位置
//             },
//             win: {
//                 // windows系统配置
//                 icon: "/dist/icon-64x64.ico", // 软件图标
//                 target: [
//                     {
//                         target: "nsis", // 软件打包配置程序 类型打包额驱动
//                         arch: "ia32", // 将软件打包成32位程序
//                     },
//                 ],
//             },
//             mac: {
//                 // macOS系统配置
//                 icon: "/dist/icons-64x64.icns", // 软件图标
//                 target: "dmg", // 打包驱动
//             },
//             linux: {
//                 // linux系统配置
//                 icon: "/dist/icon-64x64.ico", // 软件图标
//                 target: "deb", // 打包驱动
//             },
//         },
//     })
//     .then(() => {
//         console.log("项目打包成功")
//     })
//     .catch(err => {
//         console.log("项目打包失败")
//         console.error(err)
//     })
