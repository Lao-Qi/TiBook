"use strict"
const { join } = require("path")
const { app, protocol, Menu } = require("electron")

// 不使用硬件加速渲染软件，使用了会导致软件有残影
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

/**
 * 配置页面资源加载环境
 *
 * 在进程对象上挂载一个软件特有的属性来存储软件中特有的环境变量
 */
process.TIBOOK = {}

process.TIBOOK["ENTRY_FILE"] = __filename
if (process.env["IS_DEV"]) {
    process.TIBOOK["MAIN_PAGR_URL"] = "http://127.0.0.1:3000"
    process.TIBOOK["PUBLIC_PATH"] = join(__dirname, "../../public")
} else {
    process.TIBOOK["MAIN_PAGR_URL"] = `file:///${join(__dirname, "../dist/index.html")}`
    process.TIBOOK["PUBLIC_PATH"] = join(__dirname, "./dist/public")
}

app.once("ready", () => {
    // https://www.electronjs.org/zh/docs/latest/api/menu#menusetapplicationmenumenu
    Menu.setApplicationMenu(null)

    process.TIBOOK["APP_LOCATION"] = join(app.getPath("appData"), "./tibook")

    // 加载本地用户配置文件
    require("./lib/LocalDatabase/user_config")
    // 启动应用程序
    require("./bootstrap")
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
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
