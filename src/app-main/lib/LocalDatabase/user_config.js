"use strict"
/**
 * 这是一个用来获取本地用户配置文件信息的文件
 *
 * 因为涉及本地数据操作，所以也放到了这里
 */
const { readFileSync, accessSync, constants, writeFile } = require("fs")
const { join } = require("path")

const user_config_file_path = join(process.TIBOOK["APP_LOCATION"], "./USER_CONFIG.json")
let USER_CONFIG = {}

try {
    accessSync(user_config_file_path, constants.R_OK | constants.W_OK)
} catch (err) {
    // 有点**的写法
    try {
        /**
         * 这里原本是用异步io来操作，但是会导致下面的文件读入报错
         */
        writeFileSync(user_config_file_path, "{}")
    } catch (err) {
        throw err
    }
}

try {
    USER_CONFIG = JSON.parse(readFileSync(user_config_file_path))
} catch (err) {
    console.error(err)
}

process.TIBOOK["USER_CONFIG"] = new Proxy(USER_CONFIG, {
    get: Reflect.get,
    set(target, key, value, receiver) {
        const b = Reflect.set(target, key, value, receiver)
        if (b) {
            // 异步更新配置文件
            writeFile(user_config_file_path, JSON.stringify(USER_CONFIG), err => {
                if (err) console.error(err)
            })
        }
        return b
    }
})
