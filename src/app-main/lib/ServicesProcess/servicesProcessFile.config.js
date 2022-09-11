const { join } = require("path")
// 该文件会在主进程中被引入，所以可以调用electron的api
// const { ipcMain, BrowserWindow } = require("electron")

module.exports = [
    {
        // 进程可视化
        path: join(__dirname, "../../services/ProcessVisualization/index.html"), // 进程的入口文件
        // 进程标识
        mark: "PVW",
        // 进程类型 window[窗口类型] | default[默认类型 隐藏式类型]
        processType: "window",
        // 窗口配置 BrowserWindow(window) 当processType为window时需要配置此参数
        window: {
            width: 800,
            height: 400,
            minWidth: 800,
            minHeight: 400
        },
        // 启动方式 auto[启动启动] | event[启动触发]
        startMethod: "event"
        /**
         * 配置服务进程实例对象的事件绑定
         */
        // configService(service) {
        //     ipcMain.on()
        // }
    }
]
