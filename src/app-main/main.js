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
    process.TIBOOK["MAIN_PAGR_URL"] = `file:///${join(__dirname, "../app-render/index.html")}`
    process.TIBOOK["PUBLIC_PATH"] = join(__dirname, "./dist/public")
}

app.once("ready", () => {
    // https://www.electronjs.org/zh/docs/latest/api/menu#menusetapplicationmenumenu
    Menu.setApplicationMenu(null)

    process.TIBOOK["APP_LOCATION"] = join(app.getPath("appData"), "./tibook")
    process.TIBOOK["APP_INFO"] = {
        version: app.getVersion(),
        name: "tibook",
        ch_Name: "题书"
    }

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
