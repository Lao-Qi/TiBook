"use strict"
/**
 * 软件的启动文件
 *
 * 用来启动窗口和启动其他服务
 *
 * 这个文件在app前置内容加载好后开始运行(运行于主进程)
 */

const { app, ipcMain } = require("electron")
const { join } = require("path")
const { BrowserServiceProcess } = require("./lib/BorwserService/index")
const { ForkNodeProcess } = require("./lib/NodeForekProcess/index")

// 进程信息集合表
const ProcessAllMap = {}
// 以进程id为索引的进程信息表
const ProcessAllPIDCorrespondMarkMap = {}

startBasicEventBinding()
startProcessManage()
/**
 * 启动窗口，加载软件页面的整体ui框架
 *
 * windows文件夹里的窗口已经不想拿来用来，准备重构
 */
// startMainWinService()
startToolsProcess()
startServices()

/**
 * 要和渲染进程传递基本数据的ipc事件绑定
 */
async function startBasicEventBinding() {
    // 获取主进程的对软件配置的环境变量
    ipcMain.handle("get-env-of-app", () => JSON.stringify(process["TIBOOK"]))
    ipcMain.handle("getProcessAllPIDCorrespondMarkMap", () => ProcessAllPIDCorrespondMarkMap)
}

/**
 * 把软件的窗口也用服务进程来启动，但是是在主进程中单独的使用BrowserServiceProcess这个类来启动
 *
 * 这样可以把主窗口和其他的服务隔离开来，又可以顺带把主窗口的数据携带进进程集合表中
 */
async function startMainWinService() {
    const mainWinService = new BrowserServiceProcess(process.TIBOOK["APP_MAIN_PAGE"], "app_main_win", "window", {
        width: 800,
        height: 600,
        minWidth: 600,
        minHeight: 450,
        frame: false,
        useContentSize: true
    })

    ProcessAllMap["app_main_win"] = mainWinService
}

/**
 * 启动服务进程
 */
async function startServices() {
    /**
     * 所有服务的入口文件也使用BrowserServiceProcess这个类来单独的引用
     * 目的也是隔离
     */
    ProcessAllMap["services"] = new BrowserServiceProcess(join(__dirname, "./services/main.js"), "services")
    ProcessAllMap["services"].openDevTools()
    // 触发打开进程可视化服务
    // ProcessAllMap["services"].webContents.send("load-service", "ProcessVisualization")
}

/**
 * 启动进程集合和进程操作集合操作服务
 */
async function startProcessManage() {
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
    ipcMain.on("new-browser-service-info", (_, { mark, pid, ppid, URL, type }) => (ProcessAllPIDCorrespondMarkMap[pid] = { mark, ppid, URL, type }))
    /**
     * 通过ipc让进程使用方法
     */
    ipcMain.handle("operateProcess", async (_, mark, operate) => ProcessAllMap[mark][operate]())
    /**
     * 刷新所有进程
     */
    ipcMain.on("operateProcessAllReload", () => Object.values(ProcessAllMap).map(process => process.reload()))
}

/**
 * 启动工具进程，顾名思义就是只用来运行工具的进程
 */
async function startToolsProcess() {
    startServerRequireTools() // 服务端接口请求工具
    startLocalOperationTools() // 本地数据操作工具
    startSocketCommunication() // 套接字通讯工具
}

/**
 * 服务端接口请求工具
 */
async function startServerRequireTools() {
    /**
     * fork一个进程来运行工具文件
     */
    const ServerRequestProcess = new ForkNodeProcess(join(__dirname, "./tools/ServerRequest.js"), "ServerRequest")

    ipcMain.on("server-request-send", (_, renderProcessMark, request, ...args) => {
        ServerRequestProcess.send({
            request, // 请求的方法名
            args, // 传递的参数
            renderProcessMark // 渲染进程为此绑定的事件
        })
    })

    ServerRequestProcess.onmessage(({ result, request, state, renderProcessMark }) => {
        ProcessAllMap[renderProcessMark].send("server-request-retrun", request, state, result)
    })

    ProcessAllMap["ServerRequest"] = ServerRequestProcess
    ProcessAllPIDCorrespondMarkMap[ServerRequestProcess.pid] = ServerRequestProcess
}

/**
 * 本地数据操作工具
 */
async function startLocalOperationTools() {
    const LocalOperationProcess = new ForkNodeProcess(join(__dirname, "./tools/LocalOperation.js"), "LocalOperation")

    ipcMain.on("local-operation-send", (_, renderProcessMark, request, ...args) => {
        LocalOperationProcess.send({
            request, // 请求的方法名
            args, // 传递的参数
            renderProcessMark // 渲染进程为此绑定的事件
        })
    })

    LocalOperationProcess.onmessage(({ result, request, state, renderProcessMark }) => {
        ProcessAllMap[renderProcessMark].send("local-operation-return", request, result, state)
    })

    ProcessAllMap["LocalOperation"] = LocalOperationProcess
    ProcessAllPIDCorrespondMarkMap[LocalOperationProcess.pid] = LocalOperationProcess
}

/**
 * 套接字通讯工具
 */
async function startSocketCommunication() {
    const SocketProcess = new ForkNodeProcess(join(__dirname, "./tools/SocketCommunicate.js"), "SocketCommunicate")

    ipcMain.on("socket-communicate-send", (_, renderProcessMark, request, ...args) => {
        SocketProcess.send({
            request,
            args,
            renderProcessMark
        })
    })

    SocketProcess.onmessage(msg => {
        // 消息的类型为服务端请求
        if (msg.type === "request") {
            const { request, result, state, renderProcessMark } = msg
            ProcessAllMap[renderProcessMark].send("socket-communicate-return", request, result, state)
        } else {
            // 消息的类型为服务端或socket主动触发事件后的参数
            const { event, state, content } = msg
            ipcMain.emit(event, content, state)
        }
    })

    ProcessAllMap["SocketCommunicate"] = SocketProcess
    ProcessAllPIDCorrespondMarkMap[SocketProcess.pid] = SocketProcess
}
