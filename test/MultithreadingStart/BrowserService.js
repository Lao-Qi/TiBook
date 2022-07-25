const { BrowserWindow } = require("electron")
const { writeFileSync } = require("fs")
const { join } = require("path")

class BrowserServiceProcess {
    winProcess
    config

    /**
     * @param {String} filePath 线程要加载的入口文件(绝对路径)
     * @param {String} pid 线程的id
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
         * 更新线程要加载的模板内容
         */
        updateBrowserServiceTemplateHTMLFile(templateHtmlFilePath, filePath)

        this.winProcess.loadURL(`file:///${templateHtmlFilePath}`)
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

    openDevTools = () => {
        this.winProcess.webContents.openDevTools({
            mode: "detach"
        })
    }
}

function updateBrowserServiceTemplateHTMLFile(templateHtmlFilePath, filePath) {
    const newTemplateHTMLText = `<!DOCTYPE html>
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

module.exports = { BrowserServiceProcess }
