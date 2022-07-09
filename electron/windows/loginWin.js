"use strict"
const { BrowserWindow, ipcMain } = require("electron")
const Store = require("electron-store")
const { RegisterUser, LoginUser } = require("../tools/ServerRequire")

/**
 * @example 创建注册页窗口
 * @returns { Promise<BrowserWindow }
 */
module.exports = async function createLoginWin() {
    const loginWin = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 600,
        minHeight: 400,
        show: false,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false, // 支持不同协议的资源
        },
    })

    loginWin.loadURL(process.env.LoadPath)
    loginWin.once("ready-to-show", () => {
        loginWin.show()
        loginWin.webContents.send("window-show")
    })

    const UserStore = new Store({ accessPropertiesByDotNotation: false })

    ipcMain.on("register", async (event, name, account, pw) => {
        const registerData = await RegisterUser(name, account, pw)
        if (registerData.code === 200 && registerData.body.account === account) {
            UserStore.set("info", { name, account, avatar: "none" })
        }
        loginWin.webContents.send("register-return-message", registerData.code)
    })

    ipcMain.on("login", async (event, account, pw) => {
        const loginUserData = await LoginUser(account, pw)
        if (loginUserData.code === 200 && loginUserData.body.account === account) {
            UserStore.set("token", loginUserData.token)
        }
        loginWin.webContents.send("server-return-message", loginUserData.msg, loginUserData.code)
    })

    return loginWin
}
