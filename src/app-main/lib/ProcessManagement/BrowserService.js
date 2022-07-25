const { BrowserWindow } = require("electron")
const { writeFileSync } = require("fs")
const { join } = require("path")
const { addServiceProcess } = require("./ProcessAll")

/**
 * 服务进程
 *
 * 直接new的服务进程不会被添加到进程集合中
 */
class BrowserServiceProcess {
    winProcess
    config
    processType
    resourcesPath

    /**
     * @param {String} filePath 进程要加载的入口文件(绝对路径)
     * @param {String} pid 进程的id
     */
    constructor(filePath, pid) {
        /**
         * 创建一个没有大小，没有ui，不会显示的窗口
         */
        this.winProcess = new BrowserWindow({
            width: 0,
            height: 0,
            show: false,
            title: `pid: ${pid}`,
            webPreferences: {
                nodeIntegration: true,
                nodeIntegrationInWorker: true,
                // 上下文要隔离，不然加载的入口文件中导入不了资源
                contextIsolation: false
            }
        })

        /**
         * 该进程的默认配置信息
         * {
         *   pid: 进程ID,
         *   hibernate: 是否处于休眠状态
         * }
         */
        this.config = {
            pid,
            hibernate: false
        }

        const templateHtmlFilePath = join(__dirname, "./BrowserService-template.html")

        /**
         * 更新进程要加载的模板内容
         */
        updateBrowserServiceTemplateHTMLFile(templateHtmlFilePath, filePath)

        this.winProcess.loadURL(`file:///${templateHtmlFilePath}`)
        this.processType = process.type
        this.resourcesPath = process.resourcesPath
    }

    /**
     * 关闭这个进程
     */
    close = () => {
        this.winProcess.close()
    }

    /**
     * 将进程设置为休眠状态(不会接收也不会发送消息，但内存不会清除)
     */
    hibernate = () => {
        this.config.hibernate = true
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
    Reload = () => {
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
    get ProcessMemoryInfo() {
        return process.getProcessMemoryInfo()
    }
}

/**
 * 修改进程要加载的模板，主要是修改进程加载入口文件的路径
 * @param {String} templateHtmlFilePath 进程的html模板文件路径
 * @param {String} filePath 要被进程加载的入口文件路径
 */
function updateBrowserServiceTemplateHTMLFile(templateHtmlFilePath, filePath) {
    const newTemplateHTMLText = `
    <!DOCTYPE html>
    <html lang="zh-cn">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <script src="file:///${filePath}"></script>
    </head>
    <body>
    </body>
    </html>`
    writeFileSync(templateHtmlFilePath, newTemplateHTMLText)
}

/**
 * 创建的进程会直接存储到进程集合中，而不会返回，如果要操作进程应该从进程集合中操纵
 *
 * @param {String} filePath
 * @param {String} pid
 */
function createBrowserService(filePath, pid) {
    /**
     * 进程的实例对象会直接存储，再进程集合通过pid查找
     */
    addServiceProcess(pid, new BrowserServiceProcess(filePath, pid))
}

module.exports = { createBrowserService, BrowserServiceProcess }
