const { BrowserWindow, ipcMain } = require("electron")
const { writeFileSync } = require("fs")
const { join } = require("path")

/**
 * 服务进程
 *
 * 其底层原理是调用了electron的BrowserWindow开启一个隐藏的渲染进程
 */
class BrowserServiceProcess {
    kernel
    webContents

    /**
     * @param {String} URL 进程要加载的入口文件(绝对路径) type is window ? URL is `file:///${HtmlFile}` || http://... : URL is JSFilePath
     * @param {String} mark 进程的标记
     * @param {String} ProcessType 要创建的进程的格式 window | default
     * @param {any} winConfig 如果ProcessType的配置为window，则需要配置窗口的属性
     */
    constructor(URL, mark, ProcessType = "default", winConfig) {
        winConfig = initConfig(ProcessType, winConfig)
        winConfig["title"] = `mark: ${mark}`

        /**
         * 创建一个BrowserWindow，相当于创建了一个新的进程
         */
        this.kernel = new BrowserWindow({ ...winConfig })

        if (ProcessType === "window") {
            this.kernel.once("ready-to-show", () => this.kernel.show())
        } else {
            const templateHtmlFilePath = join(__dirname, "./BrowserService-template.html")
            /**
             * 更新进程要加载的模板内容
             */
            updateBrowserServiceTemplateHTMLFile(templateHtmlFilePath, URL, mark)
            URL = `file:///${templateHtmlFilePath}`
        }

        /**
         * 临时加上进程的信息，这些信息会在预加载脚本中被调用并加载到渲染进程
         */
        process.TIBOOK["CURRENT_SERVICE_PROCESS_CONFIG"] = {
            MARK: mark,
            URL
        }

        // this.kernel.webContents.send("get-process-config-info", {
        //     MARK: mark,
        //     URL
        // })

        // 如果ProcessType是window的话，加载是需要带上协议类型的，如果加载的是default那么就不需要协议，只需要地址就可以
        this.kernel.loadURL(URL)
        this.webContents = this.kernel.webContents
    }

    /**
     * 关闭这个进程
     */
    close() {
        this.kernel.close()
    }

    /**
     * 打开开发者工具
     */
    openDevTools() {
        this.kernel.webContents.openDevTools({
            mode: "detach"
        })
    }

    /**
     * 重启服务进程
     */
    reload() {
        this.kernel.webContents.reloadIgnoringCache()
    }

    send() {
        this.kernel.webContents.send(...arguments)
    }
}

/**
 * 初始化窗口配置
 * @param {String} ProcessType
 * @param {{}} winConfig
 * @returns {{}}
 */
const initConfig = (ProcessType, winConfig) => {
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
            preload: join(__dirname, "./preload.js")
        }
    }

    return ProcessType === "window" ? Object.assign(defaultConfig, winConfig) : defaultConfig
}

/**
 * 修改进程要加载的模板，主要是修改进程加载入口文件的路径
 * @param {String} templateHtmlFilePath 进程的html模板文件路径
 * @param {String} URL 要被进程加载的入口文件路径
 */
function updateBrowserServiceTemplateHTMLFile(templateHtmlFilePath, URL, mark) {
    const newTemplateHTMLText = `
        <!DOCTYPE html>
        <html lang="zh-cn">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${mark}</title>
            <script src="file:///${URL}"></script>
        </head>
        <body>
        </body>
        </html>
    `
    writeFileSync(templateHtmlFilePath, newTemplateHTMLText)
}

module.exports = { BrowserServiceProcess }
