"use strict"
/**
 * 给运行Node工具的进程实现一个类似BrowserWindow的预加载脚本功能
 *
 * 这个进程会被Node的child_process的fork方法进行创建
 * 创建好了之后会通过ipc进行发送要加载的文件，这边会使用require进行加载
 */

/**
 * msg.URL为要加载的资源入口文件，是一个绝对地址
 *
 * 封装一个loadSend供加载的工具文件内部使用
 */
process.loadSend = function (...args) {
    process.send({
        env: "load",
        content: args
    })
}

let loadonMessageCB = null
/**
 *
 * @param {Function} cb
 */
process.onLoadMsg = function (cb) {
    loadonMessageCB = cb
}

process.on("message", msg => {
    switch (msg.type) {
        case "load":
            require(msg.URL)
            break
        case "send-load":
            loadonMessageCB && loadonMessageCB(msg.content)
            break
        case "use_info":
            /**
             * 发送有关本进程的性能信息
             */
            process.send({
                env: "preload",
                /**
                 * 只有环境为preload才有type属性，为了表示预加载脚本中返回的content里头是什么
                 *
                 * type属性会在类中充当一个寻找对应回调的key，如果有进程想要获这个content那么就对传递一个回调
                 */
                type: "process_metric",
                content: [
                    {
                        cpu: process.cpuUsage(),
                        memory: process.memoryUsage.rss()
                    }
                ]
            })
    }
})
