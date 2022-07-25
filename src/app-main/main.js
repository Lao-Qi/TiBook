"use strict"
const { join } = require("path")
const { app, protocol } = require("electron")

// let currentWin = null,
//     currentWinName = null

// 不使用硬件加速渲染软件，会导致软件有残影
app.disableHardwareAcceleration()

// 注册一个用来获取本地资源的协议
protocol.registerSchemesAsPrivileged([
    {
        scheme: "tibook-file",
        privileges: {
            secure: true,
            standard: true,
            supportFetchAPI: true,
            corsEnabled: true,
            allowServiceWorkers: true
        }
    }
])

// 配置页面资源加载环境
process.env["TIBOOK_MAIN_PAGR_URL"] = process.env?.IS_DEV ? "http://127.0.0.1:3000" : `file:///${join(__dirname, "../dist/index.html")}`

app.once("ready", () => {
    require("./bootstrap")
})

// async function onReady() {
//     currentWin = await require("./windows/loginWin")()
//     currentWinName = "login"
//     currentWin.on("maximize", () => currentWin.webContents.send("window-maximize"))
//     currentWin.on("unmaximize", () => currentWin.webContents.send("window-unmaximize"))

//     ipcMain.on("login-complete-open-mainWin", () => {
//         currentWin.close()
//         currentWin = null
//         currentWin = require("./windows/mainWin")()
//         currentWinName = "main"
//         currentWin.on("maximize", () => currentWin.webContents.send("window-maximize"))
//         currentWin.on("unmaximize", () => currentWin.webContents.send("window-unmaximize"))
//     })

//     ipcMain.handle("get-current-page", () => currentWinName)
//     ipcMain.on("window-minimize", () => currentWin.minimize())
//     ipcMain.on("window-maximize", () => (currentWin.isMaximized() ? currentWin.unmaximize() : currentWin.maximize()))
//     ipcMain.on("window-destroy", () => {
//         currentWin.destroy()
//         currentWin = null
//     })
// }
