const { BrowserWindow } = require("electron")
const { writeFileSync } = require("fs")
const { join } = require("path")

/**
 * 服务进程
 *
 * 直接new的服务进程不会被添加到进程集合中
 */
class BrowserServiceProcess {
    kernel

    /**
     * @param {String} URL 进程要加载的入口文件(绝对路径) type is window ? URL is HtmlFile : URL is JSFile
     * @param {String} mark 进程的id
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
            this.kernel.loadURL(URL)
            this.kernel.once("ready-to-show", () => this.kernel.show())
        } else {
            const templateHtmlFilePath = join(__dirname, "./BrowserService-template.html")
            /**
             * 更新进程要加载的模板内容
             */
            updateBrowserServiceTemplateHTMLFile(templateHtmlFilePath, URL, mark)
            this.kernel.loadURL(templateHtmlFilePath)
        }
        this.kernel.webContents.send("process-config-info", {
            mark,
            URL
        })
    }

    /**
     * 关闭这个进程
     */
    close = () => {
        this.kernel.close()
    }

    /**
     * 打开开发者工具
     */
    openDevTools = () => {
        this.kernel.webContents.openDevTools({
            mode: "detach"
        })
    }

    /**
     * 重启服务进程
     */
    reload = () => {
        this.kernel.webContents.reloadIgnoringCache()
    }

    get webContents() {
        return this.kernel.webContents
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
            contextIsolation: false,
            spellcheck: false,
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
