const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("process", {
    APP_ENV: parseArrayValues(process.argv)
})

/**
 * 解析数组数据
 *                      {
 * ["key", "value"] ->    key: "value"
 *                      }
 * @param {[]} ary
 */
function parseArrayValues(ary) {
    const obj = {}
    for (let i = 0; i < ary.length; i += 2) {
        obj[i] = obj[i + 1]
    }
    return obj
}
