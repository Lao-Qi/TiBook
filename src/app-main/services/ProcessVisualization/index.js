/**
 * 进程可视化服务
 *
 * 但加载该服务的时候创建一个进程可视化管理的窗口
 *
 */

const { ipcRenderer } = require("electron")
const { join } = require("path")

ipcRenderer.send("createServiceWindow", join(__dirname, "./render/index.html"), "PVW", {
    width: 800,
    height: 400,
    minWidth: 800,
    minHeight: 400,
    useContentSize: true
})
