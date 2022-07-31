const { ipcRenderer } = require("electron")

/**
 * 获取主进程上的软件特有的环境变量，绑定到渲染进程的process上
 */
ipcRenderer.invoke("get-env-of-app").then(tibookEnv => {
    tibookEnv = JSON.parse(tibookEnv)
    window.process["TIBOOK"] = new Proxy(tibookEnv, {
        get() {
            return Reflect.get(...arguments)
        },
        set() {
            throw Error("从主进程上获取到的软件环境变量不可更改")
        }
    })
})

/**
 * 实例对象时会发出的事件，主要获取实例进程对象时的数据
 *
 * 再通过异步的方式发送会主进程，并附带上俩个只能在渲染进程上的process对象上才能获取到pid和ppid属性
 */
ipcRenderer.on("process-config-info", (_, { mark, URL }) => {
    ipcRenderer.send("new-browser-service-info", {
        mark,
        pid: process.pid,
        ppid: process.ppid,
        type: process.type,
        URL
    })
})
