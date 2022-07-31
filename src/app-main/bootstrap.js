"use strict"
/**
 * 软件的启动文件
 *
 * 用来启动窗口和启动其他服务
 *
 * 这个文件在app前置内容加载好后开始运行(运行于主进程)
 */

const { app, ipcMain } = require("electron")
const { BrowserServiceProcess } = require("./lib/BorwserService/index")
const { join, dirname } = require("path")

const ProcessAllMap = {}

startBasicEventBinding()
startProcessManage()
/**
 * 启动窗口，加载软件页面的整体ui框架
 *
 * 俩个启动函数都是异步启动(应该可以加快吧...)
 *
 * windows文件夹里的窗口已经不想拿来用来，准备重构
 */
// startWindow()
startServices()

/**
 * 要和渲染进程传递基本数据的ipc事件绑定
 */
async function startBasicEventBinding() {
    // 获取主进程的对软件配置的环境变量
    ipcMain.handle("get-env-of-app", () => JSON.stringify(process["TIBOOK"]))
}

// async function startWindow() {
//     const win = new BrowserWindow({
//         width: 800,
//         height: 600,
//         minWidth: 600,
//         minHeight: 450,
//         show: false,
//         frame: false,
//         useContentSize: true,
//         webPreferences: {
//             // 安全的沙盒模式是需要的
//             sandbox: true,
//             // 需要使用node的api，嗯...最少得可以导入electron的渲染进程工具
//             nodeIntegration: true,
//             contextIsolation: true
//         }
//     })

//     // 加载app文件就配置好了的地址
//     win.loadURL(process.env["TIBOOK_APP_PAGR_URL"])
//     win.once("ready-to-show", () => win.show())

//     // 当窗口关闭清除相关事件
//     win.once("close", () => {
//         ipcMain.removeAllListeners(["window-minimize", "window-maximize", "window-destroy"])
//     })

//     // 窗口事件转接到前端事件
//     win.on("enter-full-screen", () => win.webContents.send("window-enter-full-screen"))
//     win.on("leave-full-screen", () => win.webContents.send("window-leave-full-screen"))
//     win.on("enter-html-full-screen", () => win.webContents.send("window-enter-full-screen"))
//     win.on("leave-html-full-screen", () => win.webContents.send("window-leave-full-screen"))

//     // 绑定窗口的控件信息
//     ipcMain.on("window-minimize", () => win.minimize())
//     ipcMain.on("window-maximize", () => (win.isMaximized() ? win.unmaximize() : win.maximize()))
//     ipcMain.once("window-destroy", () => win.close())
// }

/**
 * 启动服务进程
 */
async function startServices() {
    /**
     * 创建一个服务进程，并加载服务
     *
     * ServiceProcess: 加载服务的进程
     */
    ProcessAllMap["services"] = new BrowserServiceProcess(join(__dirname, "./services/main.js"), "services")
    ProcessAllMap["services"].openDevTools()
    // 触发打开进程可视化服务
    ProcessAllMap["services"].webContents.send("load-service", "ProcessVisualization")
}

/**
 * 启动进程集合和进程操作集合操作服务
 */
async function startProcessManage() {
    // 以进程id为索引的进行信息表
    const ProcessAllPIDCorrespondMarkMap = {}

    ProcessAllPIDCorrespondMarkMap[process.pid] = {
        mark: "main",
        loadFilePath: process.e,
        ppid: process.ppid,
        type: process.type
    }

    // 添加服务进程事件
    ipcMain.on("createBrowserService", (_, filePath, mark) => {
        ProcessAllMap[mark] = new BrowserServiceProcess(filePath, mark)
    })

    // 添加服务窗口进程事件
    ipcMain.on("createServiceWindow", (_, filePath, mark, winConfig) => {
        ProcessAllMap[mark] = new BrowserServiceProcess(filePath, mark, "window", winConfig)
        ProcessAllMap[mark].openDevTools()
    })

    // https://www.electronjs.org/zh/docs/latest/api/app#appgetappmetrics
    ipcMain.handle("getAppMetrics", async () => app.getAppMetrics())
    /**
     * 将新创建的服务进程通过pid为key存储起来
     *
     * 这对在app.getAppMetrics()生成的性能信息数组中可以加快索引
     */
    ipcMain.on("new-browser-service-info", (_, { mark, pid, ppid, URL, type }) => {
        ProcessAllPIDCorrespondMarkMap[pid] = { mark, ppid, URL, type }
    })
    ipcMain.handle("getProcessAllPIDCorrespondMarkMap", () => ProcessAllPIDCorrespondMarkMap)

    /**
     * 通过发送进程的mark和进程实例对象上的属性名称来操作进程
     *
     * 如果属性名对应的格式是函数，则发送执行后的返回值
     */
    ipcMain.handle("operateProcess", async (_, mark, operate) => {
        const value = ProcessAllMap[mark][operate]
        return typeof value === "function" ? value() : value
    })
    ipcMain.on("operateProcessAllReload", () => {
        Object.values(ProcessAllMap).map(process => process.reload())
    })
}
