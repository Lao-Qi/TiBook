"use strict"
/**
 * 这个库是用来开启一个运行只有node原生代码的进程
 *
 * 比如可以在其他进程中运行网络请求的部分
 */

const { fork } = require("child_process")
const { join } = require("path")

/**
 * 只能运行原生代码的进程
 */
class ForkNodeProcess {
    /**
     * @param {String} URL 进程入口文件
     * @param {String} mark 进程标记
     */
    #subprocess
    pid

    constructor(URL, mark) {
        this.#subprocess = fork(URL, {
            cwd: join(URL, "../"),
            env: {
                ...process.env,
                ...parseProcessAPPENV()
            }
        })

        this.pid = this.#subprocess.pid
        this.mark = mark
        this.type = "Node"
    }

    kill() {
        this.#subprocess.kill()
    }

    /**
     * 当子进程触发消息事件调用回调
     * @param {(message: any) => void} onMessageCB
     */
    onmessage(onMessageCB) {
        this.#subprocess.on("message", onMessageCB)
    }

    send(message) {
        this.#subprocess.send(message)
    }
}

function parseProcessAPPENV() {
    const obj = {}
    for (const [key, value] of Object.entries(process.TIBOOK)) {
        obj[`TIBOOK_${key}`] = value.constructor === Object ? JSON.stringify(value) : value
    }
    return obj
}

module.exports = { ForkNodeProcess }
