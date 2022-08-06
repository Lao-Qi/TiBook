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
const { join } = require("path")
const { BrowserServiceProcess } = require("./lib/BorwserService/index")
const { ForkNodeProcess } = require("./lib/NodeForekProcess/index")

/**
 * 服务进程会被所有的服务入口和窗口所使用，这俩个是属于主进程中主动创建的，分布于多个方法中，因此声明在了顶部
 */
// 服务进程实例对象集合
const ProcessAllMap = {}
// 以进程id为索引的服务进程实例对象集合
const ProcessAllPIDCorrespondMarkMap = {}

startBasicEventBinding() // 基础事件
startServiceProcessManage() // 服务进程管理
startMainWinService() // 窗口
startToolsProcess() // 工具进程
startServicesProcess() // 服务进程

/**
 *
 *
 * 要和渲染进程传递基本数据的ipc事件绑定
 */
async function startBasicEventBinding() {
    // 获取主进程的对软件配置的环境变量
    ipcMain.handle("get-env-of-app", () => JSON.stringify(process["TIBOOK"]))
    ipcMain.handle("getProcessAllPIDCorrespondMarkMap", () => ProcessAllPIDCorrespondMarkMap)

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
}

/**
 * 把软件的窗口也用服务进程来启动，但是是在主进程中单独的使用BrowserServiceProcess这个类来启动
 *
 * 这样可以把主窗口和其他的服务隔离开来，又可以顺带把主窗口的数据携带进进程集合表中
 */
async function startMainWinService() {
    const mainWinService = new BrowserServiceProcess(process.TIBOOK["MAIN_PAGR_URL"], "app_main_win", "window", {
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
 * 启动进程集合和进程操作集合操作服务
 */
async function startServiceProcessManage() {
    ProcessAllPIDCorrespondMarkMap[process.pid] = {
        mark: "main",
        loadFilePath: process.e,
        ppid: process.ppid,
        type: process.type
    }

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
    const ToolsProcess = {}

    const ServerRequestProcess = startServerRequireTools() // 服务端接口请求工具
    ToolsProcess[ServerRequestProcess[1]] = ServerRequestProcess[0]

    const LocalOperationProcess = startLocalOperationTools() // 本地数据操作工具
    ToolsProcess[LocalOperationProcess[1]] = LocalOperationProcess[0]

    const SocketProcess = startSocketCommunication() // 套接字通讯工具
    ToolsProcess[SocketProcess[1]] = SocketProcess[0]

    /**
     * 返回全部工具进程的CPU和内存使用信息
     */
    ipcMain.handle("get-tools-process-metric", async () => {
        const toolsProcessMetric = {}
        for (const [mark, process] of Object.entries(ToolsProcess)) {
            // src\app-main\lib\NodeForekProcess\index.js GetProcessMetric
            toolsProcessMetric[mark] = await process.GetProcessMetric()
        }

        return toolsProcessMetric
    })
}

/**
 * 服务端接口请求工具
 */
function startServerRequireTools() {
    /**
     * fork一个进程来运行工具文件
     */
    const ServerRequestProcess = new ForkNodeProcess(join(__dirname, "./tools/ServerRequest.js"), "ServerRequest")

    ipcMain.on("server-request-send", (_, renderProcessMark, request, ...args) => {
        console.log(renderProcessMark, request)
        ServerRequestProcess.send({
            request, // 请求的方法名
            args, // 传递的参数
            renderProcessMark // 渲染进程为此绑定的事件
        })
    })

    ServerRequestProcess.onmessage(({ result, request, state, renderProcessMark }) => {
        ProcessAllMap[renderProcessMark].send("server-request-retrun", request, state, result)
    })

    return [ServerRequestProcess, "ServerRequest"]
}

/**
 * 本地数据操作工具
 */
function startLocalOperationTools() {
    const LocalOperationProcess = new ForkNodeProcess(join(__dirname, "./tools/LocalOperation.js"), "LocalOperation")

    ipcMain.on("local-operation-send", (_, renderProcessMark, request, ...args) => {
        LocalOperationProcess.send({
            request, // 请求的方法名
            args, // 传递的参数
            renderProcessMark // 要发送该请求的渲染进程标记
        })
    })

    LocalOperationProcess.onmessage(({ result, request, state, renderProcessMark }) => {
        // 通过渲染进程标记发送数据
        ProcessAllMap[renderProcessMark].send("local-operation-return", request, result, state)
    })

    return [LocalOperationProcess, "LocalOperation"]
}

/**
 * 套接字通讯工具
 */
function startSocketCommunication() {
    /**
     * 有绑定socket事件的渲染进程标记列表
     *
     * 当有渲染进程使用预加载脚本中的onSockt来绑定事件的时候，那个进程的标记就会添加到对应的事件中，再触发那个事件的时候会使用对应的进程实对象进行发送
     *
     * {
     *  event: [RenderMark, RenderMark]
     * }
     */
    const RenderWithBoundSocketEvents = {}

    const SocketProcess = new ForkNodeProcess(join(__dirname, "./tools/SocketCommunicate.js"), "SocketCommunicate")

    ipcMain.on("socket-communicate-send", (_, renderProcessMark, request, ...args) => {
        SocketProcess.send({
            request,
            args,
            renderProcessMark
        })
    })

    ipcMain.on("render-listener-socket-event", (_, RenderMark, event) => {
        RenderWithBoundSocketEvents[event] ??= []
        RenderWithBoundSocketEvents[event].push(RenderMark)
    })

    SocketProcess.onmessage(msg => {
        // 消息的类型为服务端请求
        if (msg.type === "request") {
            const { request, result, state, renderProcessMark } = msg
            ProcessAllMap[renderProcessMark].send("socket-communicate-return", request, result, state)
        } else {
            // 消息的类型为服务端或socket主动触发事件后的参数
            const { event, state, content } = msg
            // 有监听此事件的渲染进程 Listener This Event Renderer Process s Mark
            const LTERPSM = RenderWithBoundSocketEvents[event]
            if (LTERPSM) {
                for (let i = 0; i < LTERPSM.length; i++) {
                    ProcessAllMap[LTERPSM[i]]?.send(event, content, state)
                }
            }
        }
    })

    return [SocketProcess, "SocketCommunicate"]
}

/**
 * 启动服务进程
 */
async function startServicesProcess() {
    /**
     * 所有服务的入口文件也使用BrowserServiceProcess这个类来单独的引用
     * 目的也是隔离
     */
    ProcessAllMap["services"] = new BrowserServiceProcess(join(__dirname, "./services/main.js"), "services")
    ProcessAllMap["services"].openDevTools()
    // 触发打开进程可视化服务
    // ProcessAllMap["services"].webContents.send("load-service", "ProcessVisualization")
}
