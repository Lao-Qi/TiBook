"use strict"
const { app, ipcMain } = require("electron")
const Store = require("electron-store")
const createLoginWin = require("./windows/loginWin")
const createMainWin = require("./windows/mainWin")
const { VerifyTokenIsOut } = require("./tools/ServerRequire")

let loginWin = null, // 登录窗口
    mainWin = null, // 主窗口
    currentWin = null // 当前页面上的窗口

// let currentWinName = null

app.whenReady().then(async () => {
    const UserStore = new Store({ accessPropertiesByDotNotation: false })
    const token = UserStore.get("token")
    // token存在且没过期
    if (token && VerifyTokenIsOut(token)) {
        mainWin = createMainWin()
        currentWin = mainWin
        mainWin.on("maximize", () => currentWin.webContents.send("window-maximize"))
        mainWin.on("unmaximize", () => currentWin.webContents.send("window-unmaximize"))
    } else {
        loginWin = await createLoginWin()
        currentWin = loginWin
        // currentWinName = "loginWin"
        loginWin.on("maximize", () => currentWin.webContents.send("window-maximize"))
        loginWin.on("unmaximize", () => currentWin.webContents.send("window-unmaximize"))

        ipcMain.on("login-complete-open-mainWin", () => {
            loginWin.close()
            mainWin = createMainWin()
            currentWin = mainWin
            // currentWinName = "mainWin"
            mainWin.on("maximize", () => currentWin.webContents.send("window-maximize"))
            mainWin.on("unmaximize", () => currentWin.webContents.send("window-unmaximize"))
        })
    }

    ipcMain.on("window-minimize", () => currentWin.minimize())
    ipcMain.on("window-maximize", () => (currentWin.isMaximized() ? currentWin.unmaximize() : currentWin.maximize()))
    ipcMain.on("window-destroy", () => currentWin.destroy())
})
