"use strict"
/**
 * 这个库是用来开启一个运行只有node原生代码的进程
 *
 * 比如可以在其他进程中运行网络请求的部分
 */

const { fork } = require("child_process")
const { join } = require("path")

const preloadMsgCBS = {}

/**
 * 只能运行原生代码的进程
 */
class ForkNodeProcess {
    /**
     * @param {String} URL 进程入口文件
     * @param {String} mark 进程标记
     */
    #child
    #onMessageCB
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
                    preloadMsgCBS[msg.type] && preloadMsgCBS[msg.type](msg.content)
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
            preloadMsgCBS["process_metric"] = content => {
                res(...content)
            }
            this.#child.send({ type: "use_info" })
        })
    }
}

module.exports = { ForkNodeProcess }
