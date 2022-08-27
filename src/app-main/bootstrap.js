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
const { CreateServiceProcess, AllServiceProcess, CloseAllServiceProcess } = require("./lib/BorwserService/index")
const { CreateToolProcess, GetAllToolProcessMetric, CloseAllToolProcess } = require("./lib/NodeForekProcess/index")

/**
 * 服务进程会被所有的服务入口和窗口所使用，这俩个是属于主进程中主动创建的，分布于多个方法中，因此声明在了顶部
 */

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
async function startMainWinService() {
    const mainWinService = CreateServiceProcess(process.TIBOOK["MAIN_PAGR_URL"], "appMainWin", "window", {
        width: 800,
        height: 600,
        minWidth: 600,
        minHeight: 450,
        frame: false,
        useContentSize: true
    })

    mainWinService.kernel.on("unmaximize", () => mainWinService.send("window-unmaximize"))
    mainWinService.kernel.on("maximize", () => mainWinService.send("window-maximize"))
    mainWinService.kernel.on("focus", () => mainWinService.send("window-focus"))
    mainWinService.kernel.on("blur", () => mainWinService.send("window-blur"))
    ipcMain.on("window-minimize", () => mainWinService.kernel.minimize())
    ipcMain.on("window-close", () => mainWinService.kernel.close())
    ipcMain.on("window-maximize", () => (mainWinService.kernel.isMaximized() ? mainWinService.kernel.unmaximize() : mainWinService.kernel.maximize()))

    // mainWinService.openDevTools()

    mainWinService.kernel.once("close", () => {
        CloseAllServiceProcess()
        CloseAllToolProcess()
    })
}

// 启动进程集合和进程操作集合操作服务
async function startServiceProcessManage() {
    // 添加服务进程事件
    ipcMain.on("create-service-process", (_, filePath, mark) => CreateServiceProcess(filePath, mark))

    // 添加服务窗口进程事件
    ipcMain.on("create-service-window", (_, filePath, mark, winConfig) => CreateServiceProcess(filePath, mark, "window", winConfig))
    // 操作服务进程事件
    ipcMain.on("operation-service-window", (_, mark, operation) => {
        AllServiceProcess[mark] && AllServiceProcess[mark][operation]()
    })
}

// 启动服务进程
async function startServicesProcess() {
    /**
     * 所有服务的入口文件也使用BrowserServiceProcess这个类来单独的引用
     * 目的也是隔离
     */
    const services = CreateServiceProcess(join(__dirname, "./services/main.js"), "services")
    // services.openDevTools()
    // 触发打开进程可视化服务
    // ProcessAllMap["services"].webContents.send("load-service", "ProcessVisualization")
}

// 启动工具进程，顾名思义就是只用来运行工具的进程
async function startToolsProcess() {
    startServerRequireTools()
    startLocalOperationTools()

    // 按需加载工具，再账户帮助页不需要socket通讯
    ipcMain.on("start-socket-communication", () => startSocketCommunication())
}

// 服务端接口请求工具
function startServerRequireTools() {
    /**
     * fork一个进程来运行工具文件
     */
    const ServerRequestProcess = CreateToolProcess(join(__dirname, "./tools/ServerRequest.js"), "ServerRequest")
    const RenderWithBoundServerEvents = {}

    ipcMain.on("server-request-send", (_, renderProcessMark, request, ...args) => {
        ServerRequestProcess.send({
            request, // 请求的方法名
            args, // 传递的参数
            renderProcessMark // 渲染进程为此绑定的事件
        })
    })

    ipcMain.on("render-listener-socket-event", (_, RenderMark, event) => {
        RenderWithBoundServerEvents[event] ??= []
        RenderWithBoundServerEvents[event].push(RenderMark)
    })

    ServerRequestProcess.onmessage(msg => {
        if (msg.type === "request") {
            const { renderProcessMark, request, result, state } = msg
            AllServiceProcess[renderProcessMark].send("server-request-return", request, result, state)
        } else {
            const { event, state, content } = msg
            // 有监听此事件的渲染进程 Listener This Event Renderer Process s Mark
            const LTERPSM = RenderWithBoundServerEvents[event]
            if (LTERPSM?.length) {
                for (let i = 0; i < LTERPSM.length; i++) {
                    AllServiceProcess[LTERPSM[i]].send("server-request-proactive-return", event, content, state)
                }
            }
        }
    })
}

// 本地数据操作工具
function startLocalOperationTools() {
    const LocalOperationProcess = CreateToolProcess(join(__dirname, "./tools/LocalOperation.js"), "LocalOperation")

    ipcMain.on("local-operation-send", (_, renderProcessMark, request, ...args) => {
        LocalOperationProcess.send({ request, args, renderProcessMark })
    })

    LocalOperationProcess.onmessage(({ result, request, state, renderProcessMark }) => {
        // 通过渲染进程标记发送数据
        AllServiceProcess[renderProcessMark].send("local-operation-return", request, result, state)
    })
}

// 套接字通讯工具
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
    const SocketProcess = CreateToolProcess(join(__dirname, "./tools/SocketCommunicate.js"), "SocketCommunicate")

    ipcMain.on("socket-communicate-send", (_, renderProcessMark, request, ...args) => {
        SocketProcess.send({ request, args, renderProcessMark })
    })

    ipcMain.on("render-listener-socket-event", (_, RenderMark, event) => {
        RenderWithBoundSocketEvents[event] ??= []
        RenderWithBoundSocketEvents[event].push(RenderMark)
    })

    SocketProcess.onmessage(msg => {
        // 消息的类型为服务端请求
        if (msg.type === "request") {
            const { request, content, state, renderProcessMark } = msg
            AllServiceProcess[renderProcessMark].send("socket-communicate-request-return", request, content, state)
        } else {
            // 消息的类型为服务端或socket主动触发事件后的参数
            const { event, state, content } = msg
            // 有监听此事件的渲染进程 Listener This Event Renderer Process s Mark
            const LTERPSM = RenderWithBoundSocketEvents[event]
            if (LTERPSM?.length) {
                for (let i = 0; i < LTERPSM.length; i++) {
                    AllServiceProcess[LTERPSM[i]].send("socket-communicate-proactive-return", event, content, state)
                }
            }
        }
    })
}
