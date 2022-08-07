"use strict"
/**
 * 连接本地数据库
 *
 * 该软件涉及到的所有本地数据存储
 
 *
 * 所有的本地会再app触发ready事件后触发
 * 且该库只会再主进程中被调用
 *
 * nedb并不是这个软件的最优数据存储解决方法，可能到后面会使用其他技术来实现更快和占用内存更少且支持跟大数据量
 */
const { accessSync, writeFileSync } = require("fs")
const { join } = require("path")
const NeDB = require("nedb")

const DBFilesName = {
    USER_MESSAGE: null,
    USER_CHATLIST: null
}

for (const [key, _] of Object.entries(DBFilesName)) {
    const filePath = join(process["TIBOOK"]["APP_LOCATION"], `${key}.db`)

    /**
     * 验证文件是否存在
     */
    try {
        accessSync(filePath)
    } catch {
        writeFileSync(filePath, "")
    }

    /**
     * 生成存储库
     */
    DBFilesName[key] = new NeDB({
        filename: filePath,
        corruptAlertThreshold: process.env["IS_DEV"] ? 1 : 0,
        autoload: true
    })
}

module.exports = DBFilesName
