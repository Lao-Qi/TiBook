"use strict"
/**
 * 应用的服务进程，用于提供一些窗口或隐藏式窗口的功能
 */
const serivesProcessConfig = require("../../servicesProcessFile.config")
const { BrowserWindow, ipcMain } = require("electron")
const { writeFileSync } = require("fs")
const { join } = require("path")

/**
 * 以Mark作为索引来存储服务进程的集合
 * {
 *  Mark: process: ServiceProcess实例对象
 * }
 */
const AllServiceProcess = {}
const EventStartSerives = {}

ipcMain.on("start-service-process", (_, mark) => {
    if (!mark || EventStartSerives[mark]) {
        throw TypeError(`${mark}标识的服务进程不存在`)
    }

    ServiceProcess.CreateSerivceProcess(EventStartSerives[mark])
})

ipcMain.on("operation-service-window", (_, mark, operation, ...args) => {
    console.log(mark, operation)
    ServiceProcess.AllServiceProcess[mark][operation](...args)
})

ipcMain.on("render-send-event", (_, mark, event, ...args) => {
    const listenerMap = ServiceProcess.AllServiceProcess[mark]?.listenerMap[event]
    if (listenerMap) {
        for (const [_, listener] of Object.entries(listenerMap)) {
            listener(...args)
        }
    }
})

/**
 * 服务进程
 * 其底层原理是调用了electron的BrowserWindow开启一个隐藏的渲染进程
 */
class ServiceProcess {
    kernel
    webContents
    listenerMap

    /**
     * @param {String} URL 进程要加载的入口文件(绝对路径) type is window ? URL is `file:///${HtmlFile}` || http://... : URL is JSFilePath
     * @param {String} mark 进程的标记
     * @param {String} ProcessType 要创建的进程的格式 window | default
     * @param {any} winConfig 如果ProcessType的配置为window，则需要配置窗口的属性
     */
    constructor(URL, mark, ProcessType = "default", winConfig) {
        winConfig = initConfig(ProcessType, winConfig)
        this.loadURL = URL

        /**
         * 创建一个BrowserWindow，相当于创建了一个新的服务进程
         */
        this.kernel = new BrowserWindow({ ...winConfig })

        if (ProcessType === "window") {
            this.kernel.once("ready-to-show", () => this.kernel.show())
        } else {
            const templateHtmlFilePath = join(__dirname, "./service-process-template.html")
            /**
             * 更新进程要加载的模板内容
             */
            updateServiceProcessTemplateHTMLFile(templateHtmlFilePath, URL, mark)
            this.loadURL = `file:///${templateHtmlFilePath}`
        }

        // 如果ProcessType是window的话，加载是需要带上协议类型的，如果加载的是default那么就不需要协议，只需要地址就可以
        // 通过资源地址后面追加参数，一种主进程在渲染进程开始加载的时候就可转递参的一种方式，且是同步的
        this.kernel.loadURL(`${this.loadURL}?Mark=${mark}`)
        this.mark = mark
        this.webContents = this.kernel.webContents
        this.listenerMap = {}
    }

    /** 关闭这个进程 */
    close() {
        this.kernel.close()
        delete AllServiceProcess[this.mark]
    }

    /** 打开开发者工具 */
    openDevTools() {
        this.webContents.openDevTools({ mode: "detach" })
    }

    /** 重启服务进程 */
    reload() {
        this.webContents.reloadIgnoringCache()
    }

    /** 和服务进程通讯 */
    send() {
        this.webContents.send(...arguments)
    }

    /**
     * 监听该服务进程触发的事件
     * @param {string} event
     * @param {Function} listener
     */
    on(event, listener) {
        this.listenerMap[event] ??= []
        this.listenerMap[event].push(listener)
    }

    static get AllServiceProcess() {
        return AllServiceProcess
    }

    /**
     * 获取对应进程的占用信息
     * @param {string} mark
     * @returns {BrowserWindow}
     */
    static GetServiceProcess(mark) {
        return AllServiceProcess[mark]
    }

    /** 关闭所有的服务进程，包括主窗口 */
    static CloseAllServiceProcess() {
        for (const [_, ServiceProcess] of Object.entries(AllServiceProcess)) {
            ServiceProcess.close()
            delete AllServiceProcess[ServiceProcess.mark]
        }
    }

    /** 创建服务进程 */
    static CreateSerivceProcess(serviceConfig) {
        serviceConfig.startMethod = serviceConfig?.startMethod ? serviceConfig.startMethod : "auto"

        if (serviceConfig.startMethod === "event") {
            EventStartSerives[serviceConfig.mark] = serviceConfig
            return
        }

        AllServiceProcess[serviceConfig.mark] = new ServiceProcess(serviceConfig.path, serviceConfig.mark, serviceConfig.processType, serviceConfig?.window)
        serviceConfig?.configService(AllServiceProcess[serviceConfig.mark])
    }
}

/**
 * 初始化窗口配置
 * @param {String} ProcessType
 * @param {{}} winConfig
 * @returns {{}}
 */
function initConfig(ProcessType, winConfig) {
    const defaultConfig = {
        width: 0,
        height: 0,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            contextIsolation: false,
            spellcheck: false,
            webSecurity: true,
            allowRunningInsecureContent: true,
            preload: join(__dirname, "./servicePreload.js")
        }
    }

    if (ProcessType === "window") {
        defaultConfig.width = 600
        defaultConfig.height = 400
        Object.assign(defaultConfig, winConfig)
    }

    return defaultConfig
}

/**
 * 修改进程要加载的模板，主要是修改进程加载入口文件的路径
 * @param {String} templateHtmlFilePath 进程的html模板文件路径
 * @param {String} URL 要被进程加载的入口文件路径
 */
function updateServiceProcessTemplateHTMLFile(templateHtmlFilePath, URL, mark) {
    const newTemplateHTMLText = `
    <!DOCTYPE html>
    <html lang="zh-cn">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${mark}</title>
        <script src="file:///${URL}" id="service_window_load_file"></script>
    </head>
    <body>
    </body>
    </html>
    `
    writeFileSync(templateHtmlFilePath, newTemplateHTMLText)
}

if (serivesProcessConfig.length) {
    for (const [_, serviceConfig] of Object.entries(serivesProcessConfig)) {
        ServiceProcess.CreateSerivceProcess(serviceConfig)
    }
}

module.exports = ServiceProcess
