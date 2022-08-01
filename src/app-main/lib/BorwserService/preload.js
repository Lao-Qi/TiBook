const { ipcRenderer } = require("electron")

/**
 * 获取主进程上的软件特有的环境变量，绑定到渲染进程的process上
 */
ipcRenderer.invoke("get-env-of-app").then(tibookEnv => {
    tibookEnv = JSON.parse(tibookEnv)

    ipcRenderer.send("new-browser-service-info", {
        mark: tibookEnv.CURRENT_SERVICE_PROCESS_CONFIG.MARK,
        URL: tibookEnv.CURRENT_SERVICE_PROCESS_CONFIG.URL,
        pid: process.pid,
        ppid: process.ppid,
        type: process.type
    })

    /**
     * 配置软件独有的环境变量
     */
    window.process.TIBOOK = new Proxy(tibookEnv, {
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

// ipcRenderer.on("get-process-config-info", (_, { mark, URL }) => {
//     process.TIBOOK["mark"] = mark
//     process.TIBOOK["URL"] = URL

//     ipcRenderer.send("new-browser-service-info", {
//         mark,
//         URL,
//         pid: process.pid,
//         ppid: process.ppid,
//         type: process.type
//     })
// })
