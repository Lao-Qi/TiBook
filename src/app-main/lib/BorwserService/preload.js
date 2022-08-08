"use strict"
/**
 * 服务进程的预加载脚本，在这里会封装所有更后台相关的事件和方法
 * 会封装ipcRenderer的功能到window.process.TIBOOK对象上
 */
const { ipcRenderer } = require("electron")

/**
 * 给全局对象绑定一个操作请求后的回调函数的集合表
 * {
 *  // 内部数据结构
 *  request: [cb, cb, cb] // 用数组存储请求结束后的回调，如果这里直接赋值回调函数可能会导致连续请求不触发回调的结果
 * }
 *
 * 创建俩个集合表是为了避免再俩个操作方法中有相同名称的可能
 */
const ServerRequestCallbackMap = {}
const LocalOperationCallbackMap = {}
const SocketCommunicateCallbackMap = {}

// 配置软件独有的对象
window.TIBOOK = { ...ParseURLParameters() }
/**
 * 从主进程获取环境变量并挂载到软件独有对象上的env属性上
 */
ipcRenderer.invoke("get-env-of-app").then(tibookEnv => {
    tibookEnv = JSON.parse(tibookEnv)
    /**
     * 配置软件独有的环境变量
     */
    window.TIBOOK.env = new Proxy(tibookEnv, {
        get() {
            return Reflect.get(...arguments)
        },
        set(target, key) {
            if (target[key]) {
                throw Error("从主进程上获取到的软件环境变量不可更改")
            } else {
                return Reflect.set(...arguments)
            }
        }
    })
})

/**
 * 服务端接口请求工具封装
 * @param {string} request
 * @param  {...any} args
 */
window.TIBOOK.serverRequest = function (request, ...args) {
    RequestMessageSend("server-request-send", ServerRequestCallbackMap, request, ...args)
}

/**
 * 本地数据操作工具封装
 * @param {string} request
 * @param  {...any} args
 */
window.TIBOOK.localOperation = function (request, ...args) {
    RequestMessageSend("local-operation-send", LocalOperationCallbackMap, request, ...args)
}

/**
 * socket通讯工具封装
 * @param {string} request
 * @param  {...any} args
 */
window.TIBOOK.socketCommunicate = function (request, ...args) {
    RequestMessageSend("socket-communicate-send", SocketCommunicateCallbackMap, request, ...args)
}

/**
 * 对ipcRenderer进行一个小封装
 * @param {string} event
 * @param {Function} callback
 */
window.TIBOOK.onSocket = function (event, callback) {
    ipcRenderer.send("render-listener-socket-event", window.TIBOOK["Mark"], event)
    ipcRenderer.on(event, (_, ...args) => callback(...args))
}

window.TIBOOK.send = function (event, ...args) {
    ipcRenderer.send(event, ...args)
}

/**
 * ipcRenderer的进一步封装，如果参数的最后一位是个函数类型的数据，则将它视作本次invoke结果的回调函数
 * @param {string} event
 * @param  {...any} args
 * @returns {Promise<any>}
 */
window.TIBOOK.invoke = async function (event, ...args) {
    if (typeof args[args.length - 1] === "function") {
        const cb = args.shift()
        cb(await ipcRenderer.invoke(event, args))
    } else {
        return await ipcRenderer.invoke(event)
    }
}

window.TIBOOK.on = function (event, callback) {
    ipcRenderer.on(event, callback)
}
window.TIBOOK.once = function (event, callback) {
    ipcRenderer.once(event, callback)
}

/**
 * 三个工具的数据返回事件
 */
ipcRenderer.on("server-request-return", (_, request, result, state) => {
    /**
     * 调用对应操作函数的回调数组中的第一个回调
     * 并将下一个回调置为第一个
     */
    ServerRequestCallbackMap[request]?.shift()(result, state)
})

ipcRenderer.on("local-operation-return", (_, request, result, state) => {
    LocalOperationCallbackMap[request]?.shift()(result, state)
})

ipcRenderer.on("socket-communicate-return", (_, request, result, state) => {
    SocketCommunicateCallbackMap[request]?.shift()(result, state)
})

/**
 * 对工具的相同部分进行封装
 * @param {Function} requestCallbackMap
 * @param {string} request
 * @param  {...any} args
 */
function RequestMessageSend(event, requestCallbackMap, request, ...args) {
    /**
     * 如果数组最后一个参数是函数则把它视为请求接口后的回调函数
     */
    if (typeof args[args.length - 1] === "function") {
        /**
         * 异步的执行添加回调的操作，不去阻塞消息的发送
         */
        ;(async () => {
            /**
             * 将最后一位数据作为本次请求执行后的回调，数组中要剔除这个参数
             */
            const cb = args.pop()
            requestCallbackMap[request] ??= []
            requestCallbackMap[request].push(cb)
        })()
    }
    ipcRenderer.send(event, window.TIBOOK["Mark"], request, ...args)
}

/**
 * 解析资源地址中携带的参数，并转换成键值对
 * @returns {{}}
 */
function ParseURLParameters() {
    const obj = {}
    let URLParameters = window.location.search
    URLParameters.replace("?", "")
        .split("&")
        .forEach(value => {
            value = value.split("=")
            obj[value[0]] = value[1]
        })
    return obj
}
