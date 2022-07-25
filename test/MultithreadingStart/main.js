/**
 * electron的入口文件
 * 用来设置一些app启动前的配置
 *
 * 但很明显，这里一点都没有
 */
const { app } = require("electron")
const { join } = require("path")

process.env["TIBOOK_APP_PAGR_URL"] = `file:///${join(__dirname, "./index.html")}`

app.disableHardwareAcceleration()

app.once("ready", async () => {
    // 直接跳转到软件的启动文件
    require("./bootstrap")
})
