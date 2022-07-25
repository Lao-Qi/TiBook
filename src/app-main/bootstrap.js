/**
 * 软件的启动页
 *
 * 用来启动窗口和启动其他服务
 *
 * 这个文件在app前置内容加载好后开始运行
 */

const { BrowserWindow, ipcMain } = require("electron")
const { createBrowserService } = require("./lib/ProcessManagement/BrowserService")
const { join } = require("path")

/**
 * 启动窗口，加载软件页面的整体ui框架
 *
 * 俩个启动函数都是异步启动(应该可以加快吧...)
 *
 * windows文件夹里的窗口已经不想拿来用来，准备重构
 */
startWindow()

/**
 * 启动服务线程
 */
startServices()

async function startWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 600,
        minHeight: 450,
        show: false,
        frame: false,
        useContentSize: true,
        webPreferences: {
            // 安全的沙盒模式是需要的
            sandbox: true,
            // 需要使用node的api，嗯...最少得可以导入electron的渲染进程工具
            nodeIntegration: true,
            contextIsolation: true
        }
    })

    // 加载app文件就配置好了的地址
    win.loadURL(process.env["TIBOOK_APP_PAGR_URL"])
    win.once("ready-to-show", () => win.show())

    // 当窗口关闭清除相关事件
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
     * 创建一个服务进程，并加载服务
     */
    createBrowserService(join(__dirname, "./services-entrance.js"), "services")
}
