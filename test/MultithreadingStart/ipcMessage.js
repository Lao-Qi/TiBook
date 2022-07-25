/**
 * 创建一个net服务器，用于ipc通信
 */
const { createServer } = require("net")
const server = createServer().listen("ipcMessage", () => {
    console.log("ipc通信服务器启动")
})

/**
 * 事件存储表
 * {
 *   "事件": {
 *        "[pid]": "向指定进程绑定",
 *        "cb(message)": "事件触发的回调函数"
 *     }
 * }
 */
const eventMap = {}

/**
 *
 */
server.on("connection", socket => {
    socket.setEncoding("utf-8")
    socket.on("data", data => {
        const { pid, event, message } = JSON.parse(data)
    })
})

function emit(event, cb, pid) {
    eventMap[event] = {
        pid: pid,
        cb: cb
    }
}

module.exports = { emit }
