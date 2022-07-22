"use strict"
const { join } = require("path")
const { app, ipcMain } = require("electron")
const Store = require("electron-store")

// 配置页面资源加载环境
process.env.LoadPath = process.env?.IS_DEV ? "http://127.0.0.1:3000" : `file:///${join(__dirname, "../dist/index.html")}`
let currentWin = null,
    currentWinName = null

// 不使用硬件加速渲染软件，会导致软件有残影
app.disableHardwareAcceleration()

app.once("ready", async () => {
    const UserStore = new Store({ accessPropertiesByDotNotation: false })
    // token存在
    if (UserStore.get("token")) {
        currentWin = require("./windows/mainWin")()
        currentWinName = "main"
        currentWin.on("maximize", () => currentWin.webContents.send("window-maximize"))
        currentWin.on("unmaximize", () => currentWin.webContents.send("window-unmaximize"))
    } else {
        currentWin = await require("./windows/loginWin")()
        currentWinName = "login"
        currentWin.on("maximize", () => currentWin.webContents.send("window-maximize"))
        currentWin.on("unmaximize", () => currentWin.webContents.send("window-unmaximize"))

        ipcMain.on("login-complete-open-mainWin", () => {
            currentWin.close()
            currentWin = null
            currentWin = require("./windows/mainWin")()
            currentWinName = "main"
            currentWin.on("maximize", () => currentWin.webContents.send("window-maximize"))
            currentWin.on("unmaximize", () => currentWin.webContents.send("window-unmaximize"))
        })
    }

    ipcMain.handle("get-current-page", () => currentWinName)
    ipcMain.on("window-minimize", () => currentWin.minimize())
    ipcMain.on("window-maximize", () => (currentWin.isMaximized() ? currentWin.unmaximize() : currentWin.maximize()))
    ipcMain.on("window-destroy", () => {
        currentWin.destroy()
        currentWin = null
    })
})
