"use strict"
/**
 * 这个库是用来开启一个运行只有node原生代码的进程
 *
 * 比如可以在其他进程中运行网络请求的部分
 */
;(function () {
    const toolsProcessConfig = require("../../toolsProcessFile.config.js")
    if (!(toolsProcessConfig && toolsProcessConfig.length)) {
        return
    }

    const { fork } = require("child_process")
    const { join } = require("path")

    const { AllServiceProcess } = require("../ServicesProcess/index.js")
    const { ipcMain } = require("electron")

    /**
     * 存储所有开启的工具进程
     * {
     *  mark: ToolProcess
     * }
     */
    const AllToolProcess = {}
    const EventStartTools = {}

    // 启动事件启动类型的工具进程
    ipcMain.on("start-event-type-tool", (_, mark) => ToolProcess.CreateToolProcess(EventStartTools[mark]))
    ipcMain.handle("get-tools-process-config", () => ToolProcess.ToolsProcessConfig)

    /** 提供一个Node环境给工具使用的进程 */
    class ToolProcess {
        #onMessageCB
        #child
        #preloadMsgCBS
        pid
        mark
        type

        /**
         * @param {String} URL 进程入口文件
         * @param {String} mark 进程标记
         */
        constructor(URL, mark) {
            const child = fork(join(__dirname, "./toolPreload.js"), {
                cwd: join(URL, "../"),
                env: {
                    ...process.env,
                    TIBOOK: JSON.stringify(process.TIBOOK)
                }
            })

            /** URL为要加载的资源入口文件，是一个绝对地址，type: load-resource表示加载的资源 */
            child.send({ type: "load-resource", URL })

            /**
             * 预加载环境发送过来的消息就调用预加载对应处理函数
             *
             * 加载环境发送过来的消息就直接调用主进程有给onmessage方法传递的回调
             */
            child.on("message", msg => {
                switch (msg.env) {
                    case "preload":
                        this.#preloadMsgCBS[msg.type] && this.#preloadMsgCBS[msg.type](msg.content)
                        break
                    case "load":
                        this.#onMessageCB && this.#onMessageCB(msg.content)
                        break
                }
            })

            this.pid = child.pid
            this.mark = mark
            this.#child = child
            this.path = URL
        }

        /** 关闭进程 */
        kill() {
            this.#child.kill()
        }

        /**
         * 当子进程触发消息事件调用回调
         * @param {(message: any) => void} onMessageCB
         */
        onmessage(onMsgCB) {
            this.#onMessageCB = onMsgCB
        }

        /** 向工具进程发送消息 */
        send(message) {
            this.#child.send({
                type: "send-load",
                content: message
            })
        }

        /**
         * 获取进程的使用信息
         * @returns {Promise<any>}
         */
        GetProcessMetric() {
            return new Promise(res => {
                this.#preloadMsgCBS["process_metric"] = content => {
                    res(...content)
                }
                this.#child.send({ type: "use_info" })
            })
        }

        /** 工具进程集合 */
        static get AllToolProcess() {
            return AllToolProcess
        }

        /** 所有工具进程的配置 */
        static get ToolsProcessConfig() {
            return toolsProcessConfig
        }

        /** 关闭所有工具进程 */
        static CloseAllToolProcess() {
            for (const [mark, ToolProcess] of Object.entries(AllToolProcess)) {
                ToolProcess.kill()
                delete AllToolProcess[mark]
            }
        }

        /** 获取所有工具进程的资源占用 */
        static async GetAllToolProcessMetric() {
            const obj = {}
            for (const [mark, vlaue] of Object.entries(AllToolProcess)) {
                obj[mark] = await vlaue.GetProcessMetric()
            }
        }

        /** 创建新的工具进程 */
        static CreateToolProcess(toolConfig) {
            console.log(toolConfig)
            if (toolConfig.startMethod && toolConfig.startMethod === "event") {
                EventStartTools[toolConfig.mark] = toolConfig
                return
            }

            const toolProcess = new ToolProcess(toolConfig.path, toolConfig.mark)
            AllToolProcess[toolConfig.mark] = toolProcess
            const RenderlistenerProactiveEvents = {}

            ipcMain.on(toolConfig.sendOperateEvent, (_, renderMark, operate, ...args) => {
                toolProcess.send({ operate, renderMark, args })
            })

            ipcMain.on(toolConfig.listenerProactiveEvent, (_, renderMark, event) => {
                RenderlistenerProactiveEvents[event] ??= []
                RenderlistenerProactiveEvents[event].push(renderMark)
            })

            toolProcess.onmessage(msg => {
                if (msg.type === "request") {
                    const { renderMark, operate, result, state } = msg
                    AllServiceProcess[renderMark].send(toolConfig.operationResultReturnEvent, operate, result, state)
                } else {
                    const { event, state, content } = msg
                    // 有监听此事件的渲染进程 Listener This Event Renderers
                    const LTER = RenderlistenerProactiveEvents[event]
                    if (LTER?.length) {
                        for (let i = 0; i < LTER.length; i++) {
                            AllServiceProcess[LTER[i]].send(toolConfig.proactiveSendEvent, event, content, state)
                        }
                    }
                }
            })
        }
    }

    if (toolsProcessConfig.length) {
        for (const [_, toolConfig] of Object.entries(toolsProcessConfig)) {
            ToolProcess.CreateToolProcess(toolConfig)
        }
    }

    module.exports = ToolProcess
})()
