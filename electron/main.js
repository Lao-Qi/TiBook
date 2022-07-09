"use strict"
const { join } = require("path")
const { app, ipcMain } = require("electron")
const Store = require("electron-store")

// 配置页面资源加载环境
process.env.LoadPath = process.env?.IS_DEV ? "http://127.0.0.1:3000" : `file:///${join(__dirname, "./dist/index.html")}`

const createLoginWin = require("./windows/loginWin")
const createMainWin = require("./windows/mainWin")
const { VerifyTokenIsOut } = require("./tools/ServerRequire")

let loginWin = null, // 登录窗口
    mainWin = null, // 主窗口
    currentWin = null, // 当前窗口
    currentWinName = null // 当前窗口的名称

app.whenReady().then(async () => {
    const UserStore = new Store({ accessPropertiesByDotNotation: false })
    const token = UserStore.get("token")
    // token存在且没过期
    if (token && VerifyTokenIsOut(token)) {
        mainWin = createMainWin()
        currentWin = mainWin
        currentWinName = "main"
        mainWin.on("maximize", () => currentWin.webContents.send("window-maximize"))
        mainWin.on("unmaximize", () => currentWin.webContents.send("window-unmaximize"))
    } else {
        loginWin = await createLoginWin()
        currentWin = loginWin
        currentWinName = "login"
        loginWin.on("maximize", () => currentWin.webContents.send("window-maximize"))
        loginWin.on("unmaximize", () => currentWin.webContents.send("window-unmaximize"))

        ipcMain.on("login-complete-open-mainWin", () => {
            loginWin.close()
            mainWin = createMainWin()
            currentWin = mainWin
            currentWinName = "main"
            mainWin.on("maximize", () => currentWin.webContents.send("window-maximize"))
            mainWin.on("unmaximize", () => currentWin.webContents.send("window-unmaximize"))
        })
    }

    ipcMain.on("window-minimize", () => currentWin.minimize())
    ipcMain.on("window-maximize", () => (currentWin.isMaximized() ? currentWin.unmaximize() : currentWin.maximize()))
    ipcMain.on("window-destroy", () => currentWin.destroy())
    ipcMain.handle("get-current-page", () => currentWinName)
})
