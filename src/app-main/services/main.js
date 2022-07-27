/**
 * 服务的启动方式为require直接进入
 *
 * 如果有其他服务需要经过上面的服务的返回值来执行的话也可以
 * 服务的关闭操作得从进程集合中关闭
 *
 * 该文件运行于服务进程，而服务进程的底层是electron的渲染进程
 *
 * 加载的服务的文件都运行于该进程，除非服务中又开启了其他的服务，或者服务开启的服务开启的服务...
 */
const { ipcRenderer } = require("electron")
const { join, dirname } = require("path")

/**
 * 重新确定__dirname的位置
 */
// __dirname = join(dirname(dirname(__dirname)), "./services")

/**
 * 服务进程启动的时候直接启动的服务
 */
loadService("./ServerSocketCommunication/index.js")
loadService("./ServerSocketCommunication/index.js")

/**
 * 通过事件触发运行的服务
 */
ipcRenderer.on("run-ProcessVisualization", () => {
    console.log("run-ProcessVisualization")
    loadService("./ProcessVisualization/index.js")
})

/**
 * 加载服务
 * @param {String} filePath
 *
 * require直接导入服务，node的运行机制会将服务文件隐藏起来
 * 这样就导致到服务想重启却无法运行的bug
 *
 * 所以需要删除require.cache下的服务入口文件绝对地址
 */
function loadService(filePath) {
    const modulePath = join(dirname(dirname(__dirname)), "./services", filePath)
    /**
     * 确定所有导入的服务到导入一次就执行一次
     */
    require(modulePath)
    delete require.cache[modulePath]
}
