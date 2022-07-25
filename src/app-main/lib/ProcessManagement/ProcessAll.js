const { BrowserServiceProcess } = require("./BrowserService")
/**
 * 进程集合表
 *
 * {
 *  "进程id"：进程实例对象
 * }
 */
const ServiceProcessMap = {}

/**
 * 添加进程
 * @param {String} pid
 * @param {BrowserServiceProcess} serviceProcess
 */
function addServiceProcess(pid, serviceProcess) {
    ServiceProcessMap[pid] = serviceProcess
}

/**
 * 打开指定进程的开发者工具，用来调试
 * @param {String} pid
 */
function openProcessDevTools(pid) {
    ServiceProcessMap[pid].openDevTools()
}

/**
 * 给要导出的进程集合表做一下代理
 *
 * 不知道可不可以防止数据丢失
 */
const ProcessMap = new Proxy(ServiceProcessMap, {
    get() {
        return Reflect.get(...arguments)
    },
    set() {
        return Reflect.set(...arguments)
    }
})

module.exports = { addServiceProcess, openProcessDevTools, ProcessMap }
