"use strict"
const { app, ipcMain } = require("electron")
const createLoginWin = require("./windows/loginWin")
const createMainWin = require("./windows/mainWin")

let loginWin = null, // 登录窗口
    mainWin = null, // 主窗口
    currentWin = null // 当前页面上的窗口

// let currentWinName = null

app.whenReady().then(async () => {
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

    ipcMain.on("window-minimize", () => currentWin.minimize())
    ipcMain.on("window-maximize", () => (currentWin.isMaximized() ? currentWin.unmaximize() : currentWin.maximize()))
    ipcMain.on("window-destroy", () => currentWin.destroy())
})
