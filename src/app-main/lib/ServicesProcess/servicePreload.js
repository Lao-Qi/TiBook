"use strict"
/**
 * 服务进程的预加载脚本，在这里会封装所有更后台相关的事件和方法
 * 会封装ipcRenderer的功能到window.process.TIBOOK对象上
 */
const { ipcRenderer } = require("electron")

/** 监听渲染进程的环境变量变化回调的集合表 */
const WatchRenderEnvKeySetterMap = {}

/** 配置软件独有的对象 */
window.TIBOOK = { ...ParseURLParameters() }

/**
 * 配置渲染进程的环境变量存储，类似pinia提供的公共存储空间
 * 不用pinia做管理主要是为了省！省空间，省内存，省占用
 */
window.TIBOOK.renderEnv = new Proxy(
    {},
    {
        get: Reflect.get,
        set(target, key, value) {
            // 循环执行有监听这个key的回调函数
            const CurrentKeyWatchSetter = WatchRenderEnvKeySetterMap[key]
            if (CurrentKeyWatchSetter?.length) {
                for (let i = 0; i < CurrentKeyWatchSetter.length; i++) {
                    CurrentKeyWatchSetter[i](value, target[key])
                }
            }
            return Reflect.set(...arguments)
        }
    }
)

/**
 * 添加这个key的监听回调函数
 * @param {string} key
 * @param {Function} callback
 */
window.TIBOOK.watchRenderEnv = function (key, callback) {
    WatchRenderEnvKeySetterMap[key] ??= []
    WatchRenderEnvKeySetterMap[key].push(callback)
}

/** 从主进程获取环境变量并挂载到软件独有对象上的env属性上 */
ipcRenderer.invoke("get-env-of-app").then(tibookEnv => {
    tibookEnv = JSON.parse(tibookEnv)
    const USER_CONFIG = tibookEnv["USER_CONFIG"]
    delete tibookEnv["USER_CONFIG"]

    /** 配置软件独有的环境变量 */
    window.TIBOOK.env = tibookEnv
    /** 单独给USER_CONFIG配置代理，当渲染进程修改配置对象的时候本地文件异步更新 */
    window.TIBOOK.env["USER_CONFIG"] = new Proxy(USER_CONFIG, {
        get: Reflect.get,
        set(_, key, value) {
            const b = Reflect.set(...arguments)
            b && ipcRenderer.send("update-user-config-file", key, value)
            return b
        }
    })
})

BindToolsOnTIBOOK()

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

window.TIBOOK.send = (event, ...args) => {
    ipcRenderer.send("render-send-event", window.TIBOOK["Mark"], event, ...args)
}

window.TIBOOK.on = (event, callback) => ipcRenderer.on(event, callback)
window.TIBOOK.once = (event, callback) => ipcRenderer.once(event, callback)

/** 绑定所有主进程工具到TIBOOK对象上 */
async function BindToolsOnTIBOOK() {
    const toolsProcessConfig = await ipcRenderer.invoke("get-tools-process-config")
    const ListenerToolEventMap = {}

    for (const [_, toolConfig] of Object.entries(toolsProcessConfig)) {
        const OperateCallbackMap = {}

        window.TIBOOK[toolConfig?.renderName ?? toolConfig.mark] = (operate, ...args) => {
            /** 如果数组最后一个参数是函数则把它视为请求接口后的回调函数 */
            if (typeof args[args.length - 1] === "function") {
                /** 将最后一位数据作为本次请求执行后的回调，数组中要剔除这个参数 */
                const cb = args.pop()
                OperateCallbackMap[operate] ??= []
                OperateCallbackMap[operate].push(cb)
            }
            ipcRenderer.send(toolConfig.sendOperateEvent, window.TIBOOK["Mark"], operate, ...args)
        }

        ipcRenderer.on(toolConfig.operationResultReturnEvent, (_, operate, result, state) => {
            OperateCallbackMap[operate].shift()(result, state)
        })

        ipcRenderer.on(toolConfig.proactiveSendEvent, (_, event, content, state) => {
            const listenerList = ListenerToolEventMap[toolConfig.mark][event]

            if (listenerList?.length) {
                for (let i = 0; i < listenerList.length; i++) {
                    listenerList[i](content, state)
                }
            }
        })
    }

    window.TIBOOK.addToolListener = function (toolMark, event, listerer) {
        ListenerToolEventMap[toolMark] ??= {}
        ListenerToolEventMap[toolMark][event] ??= []
        ListenerToolEventMap[toolMark][event].push(listerer)
    }
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
