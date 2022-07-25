/**
 * 进程可视化服务
 *
 * 但加载该服务的时候创建一个进程可视化管理的窗口
 */
const { BrowserWindow, Menu } = require("electron")
const { join } = require("path")

const ProcessManageWin = new BrowserWindow({
    width: 600,
    height: 400,
    minWidth: 300,
    minHeight: 150,
    show: false,
    useContentSize: true,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
    }
})

ProcessManageWin.loadFile(join(__dirname, "./WindowPage.html"))

ProcessManageWin.once("ready-to-show", ProcessManageWin.show())

// 关闭窗口工具栏
Menu.setApplicationMenu(null)
