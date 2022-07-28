const { BrowserWindow } = require("electron")
const { writeFileSync } = require("fs")
const { join } = require("path")

/**
 * 服务进程
 *
 * 直接new的服务进程不会被添加到进程集合中
 */
class BrowserServiceProcess {
    winProcess
    processType
    resourcesPath
    OSPID
    filePath
    PID
    PPID

    /**
     * @param {String} filePath 进程要加载的入口文件(绝对路径) type is window ? filePath is HtmlFile : filePath is JSFile
     * @param {String} pid 进程的id
     * @param {String} ProcessType 要创建的进程的格式 window | default
     * @param {any} winConfig 如果ProcessType的配置为window，则需要配置窗口的属性
     */
    constructor(filePath, pid, ProcessType = "default", winConfig) {
        winConfig = initConfig(ProcessType, winConfig)
        winConfig["title"] = `pid: ${pid}`

        /**
         * 创建一个BrowserWindow，相当于创建了一个新的进程
         */
        this.winProcess = new BrowserWindow({ ...winConfig })

        if (ProcessType === "window") {
            this.winProcess.loadFile(filePath)
            this.winProcess.once("ready-to-show", () => this.winProcess.show())
            this.Mark = "render"
        } else {
            const templateHtmlFilePath = join(__dirname, "./BrowserService-template.html")
            /**
             * 更新进程要加载的模板内容
             */
            updateBrowserServiceTemplateHTMLFile(templateHtmlFilePath, filePath, pid)
            this.winProcess.loadFile(templateHtmlFilePath)
            this.Mark = "service"
        }

        this.processType = process.type
        // 真正的在系统中生成的pid
        this.OSPID = process.pid
        this.PID = pid
        this.PPID = process.ppid
        // 加载资源的路径
        this.filePath = filePath
    }

    /**
     * 关闭这个进程
     */
    close = () => {
        this.winProcess.close()
    }

    /**
     * 打开开发者工具
     */
    openDevTools = () => {
        this.winProcess.webContents.openDevTools({
            mode: "detach"
        })
    }

    /**
     * 重启服务进程
     */
    reload = () => {
        this.winProcess.webContents.reloadIgnoringCache()
    }

    /**
     * 生成一个v8的堆快照信息文件
     * https://www.electronjs.org/zh/docs/latest/api/process#processtakeheapsnapshotfilepath
     * @param {String} filePath 要存储信息的文件地址
     * @returns { Boolean } 是否成功
     */
    takeHeapSnapshot(filePath) {
        return process.takeHeapSnapshot(filePath)
    }

    /**
     * 获取该服务进程的堆信息对象
     */
    get HeapStatistics() {
        return process.getHeapStatistics()
    }

    /**
     * 返回该服务器进程的内存信息对象
     */
    get processMemory() {
        return process.memoryUsage.rss()
    }

    get webContents() {
        return this.winProcess.webContents
    }

    get cpuUsage() {
        return process.cpuUsage()
    }
}

/**
 * 初始化窗口配置
 * @param {String} pid
 * @param {String} ProcessType
 * @returns {any}
 */
const initConfig = (ProcessType, winConfig) => {
    const defaultConfig = {
        width: 0,
        height: 0,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            // 将主进程app环境变量发送到窗口的预加载脚本中
            additionalArguments: parseObjectKeyAndValue(process.env["TIBOOK"]),
            preload: join(__dirname, "./preload.js")
        }
    }

    if (ProcessType == "window") {
        defaultConfig.webPreferences.spellcheck = false
        return Object.assign(defaultConfig, winConfig)
    } else {
        return defaultConfig
    }
}

/**
 * 解析对象数据
 * {
 *   key: "value" -> ["key", "value"]
 * }
 * @param {{}} obj
 */
function parseObjectKeyAndValue(obj) {
    const ary = []
    for (const [key, value] of Object.entries(obj)) {
        ary.push(key, value)
    }
    return ary
}

/**
 * 修改进程要加载的模板，主要是修改进程加载入口文件的路径
 * @param {String} templateHtmlFilePath 进程的html模板文件路径
 * @param {String} filePath 要被进程加载的入口文件路径
 */
function updateBrowserServiceTemplateHTMLFile(templateHtmlFilePath, filePath, pid) {
    const newTemplateHTMLText = `
        <!DOCTYPE html>
        <html lang="zh-cn">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${pid}</title>
            <script src="file:///${filePath}"></script>
        </head>
        <body>
        </body>
        </html>
    `
    writeFileSync(templateHtmlFilePath, newTemplateHTMLText)
}

module.exports = { BrowserServiceProcess }
