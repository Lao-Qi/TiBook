"use strict"
/**
 * 这个库是用来开启一个运行只有node原生代码的进程
 *
 * 比如可以在其他进程中运行网络请求的部分
 */

const { fork } = require("child_process")
const { join } = require("path")

/**
 * 存储所有开启的工具进程
 * {
 *  mark: ToolProcess
 * }
 */
const AllToolProcess = {}

/**
 * 提供一个Node环境给工具使用的进程
 */
class ToolProcess {
    /**
     * @param {String} URL 进程入口文件
     * @param {String} mark 进程标记
     */

    #onMessageCB
    #child
    #preloadMsgCBS
    pid
    mark
    type

    constructor(URL, mark) {
        const child = fork(join(__dirname, "./preload.js"), {
            cwd: join(URL, "../"),
            env: {
                ...process.env,
                TIBOOK: JSON.stringify(process.TIBOOK)
            }
        })

        child.send({ type: "load", URL })

        child.on("message", msg => {
            switch (msg.env) {
                case "preload":
                    this.#preloadMsgCBS[msg.type] && this.#preloadMsgCBS[msg.type](msg.content)
                    break
                case "load":
                    this.#onMessageCB && this.#onMessageCB(...msg.content)
                    break
            }
        })

        this.pid = child.pid
        this.mark = mark
        this.type = "Node Tool"
        this.#child = child

        AllToolProcess[mark] = { URL, process: child }
    }

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
}

/**
 * 创建一个工具进程
 * @param {string} URL
 * @param {string} mark
 * @returns {ToolProcess}
 */
function CreateToolProcess(URL, mark) {
    AllToolProcess[mark] = new ToolProcess(URL, mark)
    return AllToolProcess[mark]
}

/**
 * 关闭所有的工具进程
 */
function CloseAllToolProcess() {
    for (const [_, ToolProcess] of Object.entries(AllToolProcess)) {
        ToolProcess.kill()
    }
}

/**
 * 获取所有工具进程的占用数据
 */
async function GetAllToolProcessMetric() {
    const obj = {}
    for (const [mark, vlaue] of Object.entries(AllToolProcess)) {
        obj[mark] = await vlaue.GetProcessMetric()
    }
}

module.exports = { CreateToolProcess, CloseAllToolProcess, GetAllToolProcessMetric, AllToolProcess }
