"use strict"
const { app, ipcMain } = require("electron")
const createLoginWin = require("./windows/loginWin")
const createMainWin = require("./windows/mainWin")

let loginWin = null, // 登录窗口
    mainWin = null, // 主窗口
    currentWin = null // 当前页面上的窗口

app.whenReady().then(async () => {
    loginWin = await createLoginWin()
    currentWin = loginWin

    ipcMain.on("login-complete-open-mainWin", () => {
        loginWin.close()
        mainWin = createMainWin()
        currentWin = mainWin
    })

    ipcMain.on("window-minimize", () => currentWin.minimize())
    ipcMain.on("window-maximize", () => {
        currentWin.isMaximized() ? currentWin.unmaximize() : currentWin.maximize()
    })
    ipcMain.on("window-destroy", () => currentWin.destroy())
    currentWin.on("maximize", () => currentWin.webContents.send("window-maximize"))
    currentWin.on("unmaximize", () => currentWin.webContents.send("window-unmaximize"))
})
