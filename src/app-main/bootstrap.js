"use strict"
/**
 * 软件的启动文件
 *
 * 用来启动窗口和启动其他服务
 *
 * 这个文件在app前置内容加载好后开始运行(运行于主进程)
 *
 * 整个启动过程: 基础事件 -> 服务进程管理 -> 打开窗口 -> 工具进程 -> 服务进程
 *
 * 所有的进程类型：electron的主进程 && 基于electron渲染进程的服务进程 && 基于Node的工具进程
 */

const { app, ipcMain } = require("electron")
/**
 * 服务进程会被所有的服务入口和窗口所使用，这俩个是属于主进程中主动创建的，分布于多个方法中，因此声明在了顶部
 */

const { CloseAllToolProcess } = require("./lib/ToolsProcess/index")
const { CloseAllServiceProcess, CreateSerivceProcess } = require("./lib/ServicesProcess/index")

startBasicEventBinding() // 基础事件
// startMainWinService() // 窗口

/**
 *
 *
 * 要和渲染进程传递基本数据的ipc事件绑定
 */
async function startBasicEventBinding() {
    // 获取主进程的对软件配置的环境变量
    ipcMain.handle("get-env-of-app", () => JSON.stringify(process["TIBOOK"]))
    ipcMain.on("update-user-config-file", (_, key, value) => (process["TIBOOK"]["USER_CONFIG"][key] = value))
    /**
     * https://www.electronjs.org/zh/docs/latest/api/app#appgetappmetrics
     * app.getAppMetrics获取到的进程包含了主进程，渲染用的CPU，内置的工具，所有渲染进程(包括ServerProcess进程)
     */
    ipcMain.handle("get-app-metrics", async () => app.getAppMetrics())
    // 返回全部工具进程的CPU和内存使用信息
    ipcMain.handle("get-tools-process-metric", async () => GetAllToolProcessMetric())
}

/**
 * 把软件的窗口也用服务进程来启动，但是是在主进程中单独的使用ServiceProcess这个类来启动
 *
 * 这样可以把主窗口和其他的服务隔离开来，又可以顺带把主窗口的数据携带进进程集合表中
 */
// async function startMainWinService() {
//     // ipcMain.emit("")
//     // CreateSerivceProcess({
//     //     path: process.TIBOOK["MAIN_PAGR_URL"],
//     //     mark: "appMainWin",
//     //     processType: "window",
//     //     window: {
//     //         width: 800,
//     //         height: 600,
//     //         minWidth: 600,
//     //         minHeight: 450,
//     //         frame: false
//     //     },
//     //     startMethod: "auto",
//     //     configService(serivce) {
//     //         serivce.openDevTools()
//     //         serivce.kernel.on("unmaximize", () => serivce.send("window-unmaximize"))
//     //         serivce.kernel.on("maximize", () => serivce.send("window-maximize"))
//     //         serivce.kernel.on("focus", () => serivce.send("window-focus"))
//     //         serivce.kernel.on("blur", () => serivce.send("window-blur"))
//     //         ipcMain.on("window-minimize", () => serivce.kernel.minimize())
//     //         ipcMain.on("window-close", () => serivce.kernel.close())
//     //         ipcMain.on("window-maximize", () => (serivce.kernel.isMaximized() ? serivce.kernel.unmaximize() : serivce.kernel.maximize()))
//     //         serivce.kernel.once("close", () => {
//     //             // CloseAllServiceProcess()
//     //             // CloseAllToolProcess()
//     //         })
//     //     }
//     // })
// }
