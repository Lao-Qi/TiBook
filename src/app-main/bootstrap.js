"use strict"
/**
 * 软件的启动页
 *
 * 用来启动窗口和启动其他服务
 *
 * 这个文件在app前置内容加载好后开始运行(运行于主进程)
 */

const { ipcMain } = require("electron")
const { BrowserServiceProcess } = require("./lib/BorwserService/index")
const { join } = require("path")
const { cpus } = require("os")

/**
 * 启动窗口，加载软件页面的整体ui框架
 *
 * 俩个启动函数都是异步启动(应该可以加快吧...)
 *
 * windows文件夹里的窗口已经不想拿来用来，准备重构
 */
// startWindow()

/**
 * 启动进程存储
 */
const ProcessAllMap = {}
startProcessManage()

/**
 * 启动服务线程
 */
startServices()

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

async function startServices() {
    /**
     * 创建一个服务进程，并加载服务
     *
     * ServiceProcess: 加载服务的进程
     */
    ProcessAllMap["services"] = new BrowserServiceProcess(join(__dirname, "./services/main.js"), "services")
    ProcessAllMap["services"].openDevTools()
    // 触发打开进程可视化服务
    ProcessAllMap["services"].webContents.send("run-ProcessVisualization")
}

/**
 * 进程管理方法
 */
async function startProcessManage() {
    // 添加服务进程事件
    ipcMain.on("createBrowserService", (_, filePath, pid) => {
        ProcessAllMap[pid] = new BrowserServiceProcess(filePath, pid)
    })

    // 添加服务窗口进程事件
    ipcMain.on("createServiceWindow", (_, filePath, pid, winConfig) => {
        ProcessAllMap[pid] = new BrowserServiceProcess(filePath, pid, "window", winConfig)
        ProcessAllMap[pid].openDevTools()
    })

    /**
     * 因为进程之间传递不了JS函数，所以我们把进程解析信息的部分写到主进程，
     * 再把解析好的可克隆的数据发送到渲染进程
     */
    ipcMain.handle("getProcessAllInfo", async () => Object.values(ProcessAllMap).map(parseProcessData))
    /**
     * 返回特定的进程信息
     */
    ipcMain.handle("getProcessInfo", async (_, pid) => parseProcessData(ProcessAllMap[pid]))
    /**
     * 通过发送进程的pid和进程实例对象上的属性名称来操作进程
     *
     * 如果属性名对应的格式是函数，则发送执行后的返回值
     */
    ipcMain.handle("operateProcess", async (_, pid, operate) => {
        const value = ProcessAllMap[pid][operate]
        return typeof value === "function" ? value() : value
    })
}

/**
 * 解析出线程数据，接着渲染到页面
 * @param {any} process 线程的实例对象
 */
function parseProcessData(process) {
    const processInfo = {}
    // 这些属性是有在进程实例的时候就挂载好了的
    // tibook\src\app-main\lib\BorwserService\index.js
    processInfo["URL"] = process.filePath
    processInfo["PID"] = process.PID
    processInfo["OSPID"] = process.OSPID
    processInfo["Mark"] = process.Mark
    // 做一下单位转换
    processInfo["Memory"] = convertMemoryUnits(process.processMemory)
    processInfo["CPU"] = getProcessCPUUtilization(process.cpuUsage)
    return processInfo
}

/**
 * 内存单位账户 b -> mb
 * @param {String} memory
 * @returns {String}
 */
function convertMemoryUnits(memory) {
    return String(memory / 1000000).slice(0, 5)
}

/**
 * 通过process.cpuUsage获取进程运行占用的百分比
 * @param {String} cpuInfo
 * @returns {String}
 */
function getProcessCPUUtilization(cpuInfo) {
    /**
     * 按原本程序设计，是要获取运行该服务进程的内核的user运行时间
     * 再除以该服务进程的user运行时间，解出运行占比
     *
     * 但是node貌似没有获取运行对应进程的内核位置，所以这里用了愚蠢至极的方法
     * 找到系统中运行占用最高的内核，把它当作运行该服务进程的内核来计算占比
     *
     * 虽然可以命令行或调用其他语言的方式来获取，但是过于麻烦，暂时不考虑
     */
    let cpuUserModRunTime = 0
    const cpusInfo = cpus()
    for (let i = 0; i < cpusInfo.length; i++) {
        if (cpuUserModRunTime < cpusInfo[i].times.user) {
            cpuUserModRunTime = cpusInfo[i].times.user
        }
    }

    return String(100 / (cpuUserModRunTime / cpuInfo.user)).slice(0, 5)
}
