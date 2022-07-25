/**
 * 软件的启动页
 *
 * 用来启动窗口，启动其他服务
 *
 * 这个文件在app前置内容加载好后开始加载
 */

const { BrowserWindow, ipcMain } = require("electron")
const { BrowserServiceProcess } = require("./BrowserService")
const { join } = require("path")

/**
 * 第一步当然是启动窗口，加载软件页面的整体ui框架
 */
startMainWin()

/**
 * 启动服务线程
 */
startServices()

async function startMainWin() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            // 安全的沙盒模式是需要的
            sandbox: true,
            // 需要使用node的api，嗯...最少得可以导入electron的渲染进程工具
            nodeIntegration: true,
            contextIsolation: true
        }
    })

    // 加载入口文件就配置好了的地址
    win.loadURL(process.env["TIBOOK_APP_PAGR_URL"])
    win.once("ready-to-show", () => win.show())

    // 关闭就清楚相关事件
    win.once("close", () => {
        ipcMain.removeAllListeners(["window-minimize", "window-maximize", "window-destroy"])
    })

    // 窗口事件转接到前端事件
    win.on("enter-full-screen", () => win.webContents.send("window-enter-full-screen"))
    win.on("leave-full-screen", () => win.webContents.send("window-leave-full-screen"))
    win.on("enter-html-full-screen", () => win.webContents.send("window-enter-full-screen"))
    win.on("leave-html-full-screen", () => win.webContents.send("window-leave-full-screen"))

    // 绑定窗口的控件信息
    ipcMain.on("window-minimize", () => win.minimize())
    ipcMain.on("window-maximize", () => (win.isMaximized() ? win.unmaximize() : win.maximize()))
    ipcMain.once("window-destroy", () => win.close())
}

async function startServices() {
    /**
     * 加载socket服务
     */
    const serviceProcess = new BrowserServiceProcess(join(__dirname, "./services-entrance.js"), "services")
    serviceProcess.openDevTools()
}
