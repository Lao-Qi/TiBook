"use strict"
/**
 * 服务器接口请求的方法集合
 *
 * 通过node的child_process中的fork单独开启一个子进程，再通过ipc通信进行请求
 *
 * 这样可以把部分资源转移到子进程，但是请求的过程会变得比较繁琐
 * 因为不管是主进程告诉子进程要发送请求，还是子进程把请求结构进行返回，都是比较繁琐的
 */
const { type } = require("os")
const { publicEncrypt } = require("crypto")
const { createReadStream } = require("fs")
const {
    win32: { parse }
} = require("path")
const {
    default: { create }
} = require("axios")

const headers = {
    token: process.TIBOOK?.USER_CONFIG?.user_data?.token ?? ""
}

const axios = create({
    baseURL: "http://localhost:8080",
    timeout: 4000,
    // 跨域请求需要携带凭证(cookie)
    withCredentials: true,
    headers
})

// 拦截请求，将token修改为最新的token
axios.interceptors.request.use(config => {
    config.headers = headers
    return config
})

/**
 * type msg: {
 *   operate: string // 要请求的方法的名称
 *   argv: string[] // 要传递的参数
 * }
 *
 * 主进程通过发送要请求的方法名来请求服务器
 *
 * 这里接收renderProcessMark(渲染进程的标注)是为了判断是那个进程要执行的操作
 */
process.onLoadMsg(({ operate, args = [], renderMark }) => {
    if (!ServerRequestMethodAllMap[operate]) {
        throw Error(`接口请求函数不存在: (${operate})`)
    }
    ServerRequestMethodAllMap[operate](...args)
        .then(result => {
            process.loadSend({
                type: "request",
                result,
                operate,
                state: 0,
                renderMark
            })
        })
        .catch(result => {
            process.loadSend({
                type: "request",
                result,
                operate,
                state: 1,
                renderMark
            })
        })
})

/**
 * 服务器接口请求方法集合
 *
 */
const ServerRequestMethodAllMap = {
    /**
     * @example 获取服务器公钥
     * @returns { Promise<string>}
     */
    GetPublicKey() {
        return new Promise((res, rej) => {
            axios
                .get("/api/publicKey")
                .then(result => res(result.data.code === 200 ? Buffer.from(result.data.publicKey, "base64").toString() : result.data))
                .catch(err => rej(err.message))
        })
    },

    /**
     * @example 注册用户
     * @param { String } name
     * @param { String } account
     * @param { String } paw
     * @returns { Promise<Object> }
     */
    RegisterUser(name, account, paw) {
        return new Promise((res, rej) => {
            this.GetPublicKey()
                .then(publicKey => {
                    const ping = publicEncrypt(publicKey, Buffer.from(paw)).toString("base64")
                    axios
                        .post("/api/user/register", {
                            name,
                            account,
                            type: type(),
                            ping
                        })
                        .then(result => res(result.data))
                        .catch(err => rej(err.message))
                })
                // 上一个方法内部已经处理好了它的报错信息，这里不需要再处理
                .catch(rej)
        })
    },

    /**
     * @example 用户登录
     * @param { String } account
     * @param { String } paw
     * @returns { Promise<Object | Boolean >}
     */
    LoginUser(account, paw) {
        return new Promise((res, rej) => {
            this.GetPublicKey()
                .then(publicKey => {
                    const ping = publicEncrypt(publicKey, Buffer.from(paw)).toString("base64")
                    axios
                        .post(`/api/user/login`, { account, ping })
                        .then(result => {
                            if (result.data.code) {
                                headers.token = result.data.data.token
                            }
                            res(result.data)
                        })
                        .catch(err => rej(err.message))
                })
                .catch(rej)
        })
    },

    /**
     * @emample 未过期的token的登用户
     */
    TokenLoginUser() {
        return new Promise((res, rej) => {
            axios
                .post("/api/user/tokenLogin")
                .then(result => {
                    if (result.data.code) {
                        headers.token = result.data.data.token
                    }
                    res(result.data)
                })
                .catch(err => rej(err.message))
        })
    },

    /**
     * @emample 获取本地token中的用户信息
     */
    FindTokenUser() {
        return new Promise((res, rej) => {
            axios
                .get("/api/search/findTokenUser")
                .then(result => res(result.data))
                .catch(err => rej(err.message))
        })
    },

    /**
     * @emample 获取本地token中的用户详细信息
     * @returns {Promise<Object | String>}
     */
    FindTokenUserInfo() {
        return new Promise((res, rej) => {
            axios
                .get("/api/search/findTokenUserInfo")
                .then(result => res(result.data))
                .catch(err => rej(err.message))
        })
    },

    /**
     * @emample 更新用户的详细文件数据
     * @param {any} info
     * @returns {Promise<Object | string>}
     */
    UpdateUserTextInfo(info) {
        return new Promise((res, rej) => {
            axios
                .post("/api/user/updateUserTextInfo", { from: { ...info } })
                .then(result => res(result.data))
                .catch(err => rej(err.message))
        })
    },

    /**
     * @emample 修改用户的账号
     * @param {string} naccount
     * @returns {Promise<Object | string>}
     */
    UpdateUserAccount(naccount) {
        return new Promise((res, rej) => {
            axios
                .post("/api/user/updateAvatar", { naccount })
                .then(result => {
                    if (result.data.post) {
                        headers.token = result.data.ntoken
                    }
                    res(result.data)
                })
                .catch(err => rej(err.message))
        })
    },

    /**
     * @emample 修改用户的名称
     * @param {string} nname
     * @returns {Promise<Object | string>}
     */
    UpdateUserName(nname) {
        return new Promise((res, rej) => {
            axios
                .post("/api/user/updateName", { nname })
                .then(result => {
                    if (result.data.post) {
                        headers.token = result.data.ntoken
                    }
                    res(result.data)
                })
                .catch(err => rej(err.message))
        })
    },

    /**
     * @emample 修改头像
     * @returns {Promise<Object | Boolean>}
     */
    UploadAvatar(path) {
        return new Promise(async (res, rej) => {
            StreamPostFile(path, "hex", "/api/user/uploadAvatar")
                .then(result => {
                    if (result.post) {
                        headers.token = result.ntoken
                    }
                    res(result.data)
                })
                .catch(err => rej(err.message))
        })
    },

    /**
     * 上传用户的个性背景图片
     * @param {string} path
     * @returns {Promise<Object | Boolean>}
     */
    UploadPPictures(path) {
        return new Promise((res, rej) => {
            StreamPostFile(path, "hex", "/api/user/uploadPPictures")
                .then(result => res(result.data))
                .catch(err => rej(err.message))
        })
    },

    /**
     * @example 查询当前登录用户的好友列表
     * @returns { Promise<Object | Boolean> }
     */
    FindUserFriends() {
        return new Promise((res, rej) => {
            axios
                .get("/api/search/FriendsList")
                .then(result => res(result.data))
                .catch(err => rej(err.message))
        })
    },

    /**
     * @example 获取用户的详细信息
     * @param {string} account
     * @returns {Promise<Object | Boolean>}
     */
    SearchUserInfo(account) {
        return new Promise((res, rej) => {
            axios
                .get("/api/search/userinfo", { params: { account } })
                .then(result => res(result.data))
                .catch(err => rej(err.message))
        })
    },

    /**
     * 通过账号数组查询用户基本信息
     * @param {Array} accounts
     * @returns {Promise<Object | Boolean>}
     */
    FindUsers(accounts) {
        return new Promise((res, rej) => {
            axios
                .post("/api/search/findUsers", {
                    accounts
                })
                .then(result => res(result.data))
                .catch(err => rej(err.message))
        })
    },

    /**
     * @example 添加好友
     * @param { String } account
     * @returns { Promise<Object | Boolean }
     */
    AddFriend(account) {
        return new Promise((res, rej) => {
            axios
                .post("/api/user/addFriend", { account })
                .then(result => res(result.data))
                .catch(err => rej(err.message))
        })
    },

    /**
     * @example 通过账号查询用户
     * @param { String } account
     * @returns { Promise<Object | Boolean>}
     */
    SearchUser(account) {
        return new Promise((res, rej) => {
            axios
                .get("/api/search/user", { params: { account } })
                .then(result => res(result.data))
                .catch(err => rej(err.message))
        })
    },

    /**
     * @example 模糊查询用户
     * @param { String } key
     * @returns { Promise<Object | Boolean>}
     */
    SearchUsers(key) {
        return new Promise((res, rej) => {
            axios
                .get("/api/search/users", { params: { key } })
                .then(result => res(result.data))
                .catch(err => rej(err.message))
        })
    },

    /**
     * @example 验证本地token是否过期
     * @param { String } token
     * @returns { Promise<Object | {}>}
     */
    VerifyTokenIsOut() {
        return new Promise((res, rej) => {
            axios
                .get("/api/verifyToken")
                .then(result => res(result.data))
                .catch(err => rej(err.message))
        })
    }
}

/**
 * 流式传输文件
 * @param {string} filePath
 * @param {string} path
 */
function StreamPostFile(filePath, encode, path) {
    return new Promise((res, rej) => {
        const fileInfo = parse(filePath)
        // 创建文件的读取流
        const fileStream = createReadStream(filePath, { encoding: encode })
        let schedule = 0
        // 先暂停读取
        fileStream.pause()
        // 文件被打开
        fileStream.on("open", () => {
            // 告诉服务器，服务器将创建一个写入流
            axios
                .post(path, {
                    type: "open",
                    encode,
                    ext: fileInfo.ext,
                    name: fileInfo.name
                })
                .then(result => {
                    // 创建成功，开始读取数据
                    console.log(result.data, "open")
                    if (result.data.post) {
                        fileStream.resume()
                        // 把文件上传的状态发送到前端
                        process.loadSend({
                            type: "tool-passive",
                            event: "server-tool-file-start-upload",
                            state: 0,
                            content: "文件开始上传"
                        })
                    } else {
                        // 创建失败，关闭读取流，返回失败的请求消息
                        fileStream.close(err => console.error(err))
                        res(result)
                    }
                })
                .catch(rej)
        })

        // 服务器创建成功会开始读取数据，触发data事件
        fileStream.on("data", data => {
            axios
                .post(path, { type: "data", data })
                .then(result => {
                    console.log(result.data, "data")
                    process.loadSend({
                        type: "tool-passive",
                        event: "server-tool-file-uploading",
                        state: 0,
                        content: {
                            data: result.data,
                            schedule: ++schedule
                        }
                    })
                })
                .catch(err => {
                    fileStream.close()
                    rej(err)
                })
        })

        fileStream.on("end", () => {
            axios
                .post(path, { type: "end" })
                .then(result => {
                    console.log(result.data, "end")
                    fileStream.close()
                    res(result)
                })
                .catch(err => {
                    rej(err)
                    console.error(err.message)
                })
        })

        fileStream.on("error", err => {
            axios.post(path, { type: "error" })
            fileStream.close(err => console.error(err))
            rej(err)
        })
    })
}
