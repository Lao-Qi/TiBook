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
    loginWin.once("ready-to-show", () => loginWin.show())

    const UserStore = new Store({ accessPropertiesByDotNotation: false })

    /**
     * 注册事件
     * 流程: 发送注册的网络请求 -> 返回注册数据 -> (正确) -> 将返回的用户信息存储到本地 -> 向页面发送服务器返回事件，参数(服务器返回的消息和状态码)
     *                                       -> (失败) -> 向页面发送服务器返回的消息和状态码
     *                                       -> (请求发送失败) -> 向页面发送消息(可能为网络问题)
     */
    ipcMain.on("register", (event, name, account, pw) => {
        RegisterUser(name, account, pw)
            .then(registerUserData => {
                const data = registerUserData.data
                if (data.code === 200) {
                    UserStore.set("info", { ...data.body })
                }
                loginWin.webContents.send("server-return-message", data.msg, data.code)
            })
            .catch(err => {
                loginWin.webContents.send("server-return-message", "注册失败，可能是网络问题", 500)
                console.error(err)
            })
    })

    /**
     * 登录事件
     * 流程: 发送登录的网络请求 -> 返回登录数据 -> (正确) -> 将登录成功的token存储到本地 -> 向页面发送服务器返回事件，参数(服务器返回的消息和状态码)
     *                                       -> (失败) -> 向页面发送服务器返回的消息和状态码
     *                                       -> (请求发送失败) -> 向页面发送消息(可能为网络问题)
     */
    ipcMain.on("login", (event, account, pw) => {
        LoginUser(account, pw)
            .then(loginUserData => {
                if (loginUserData.code === 200 && loginUserData.body.account === account) {
                    UserStore.set("token", loginUserData.token)
                }
                loginWin.webContents.send("server-return-message", loginUserData.msg, loginUserData.code)
            })
            .catch(err => {
                loginWin.webContents.send("server-return-message", "注册失败，可能是网络问题", 500)
                console.error(err)
            })
    })

    return loginWin
}
