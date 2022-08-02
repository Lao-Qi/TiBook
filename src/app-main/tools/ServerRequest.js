/**
 * 服务器接口请求的方法集合
 *
 * 通过node的child_process中的fork单独开启一个子进程，再通过ipc通信进行请求
 *
 * 这样可以把部分资源转移到子进程，但是请求的过程会变得比较繁琐
 * 因为不管是主进程告诉子进程要发送请求，还是子进程把请求结构进行返回，都是比较繁琐的
 */
"use strict"
const {
    default: { create }
} = require("axios")
const { type } = require("os")
const { publicEncrypt } = require("crypto")

const axios = create({
    baseURL: "http://localhost:8080",
    timeout: 4000,
    // 跨域请求需要携带凭证(cookie)
    withCredentials: true
})

/**
 * type msg: {
 *   request: string // 要请求的方法的名称
 *   argv: string[] // 要传递的参数
 * }
 *
 * 主进程通过发送要请求的方法名来请求服务器
 */
process.on("message", ({ request, args = [], renderProcessMark }) => {
    if (!ServerRequestMethodAllMap[request]) {
        throw Error(`接口请求函数不存在: (${request})`)
    }
    ServerRequestMethodAllMap[request](...args)
        .then(result => {
            process.send({
                result,
                request,
                state: 0,
                renderProcessMark
            })
        })
        .catch(result => {
            process.send({
                result,
                request,
                state: 1,
                renderProcessMark
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
     * @returns { Promise<any>}
     */
    GetPublicKey() {
        return new Promise((res, rej) => {
            axios
                .get("/api/publicKey")
                .then(result => {
                    res(Buffer.from(result.data.publicKey, "base64").toString())
                })
                .catch(err => {
                    rej(err.message)
                })
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
                        .then(result => {
                            res(result.data)
                        })
                        .catch(err => {
                            rej(err.message)
                        })
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
                        .post(`/api/user/login`, {
                            account,
                            ping
                        })
                        .then(result => {
                            res(result.data)
                        })
                        .catch(err => {
                            rej(err.message)
                        })
                })
                .catch(rej)
        })
    },

    /**
     * @example 查询当前登录用户的好友列表
     * @returns { Promise<Object | Boolean> }
     */
    FindUserFriendsList() {
        return new Promise((res, rej) => {
            axios
                .get("/api/search/FriendsList", {
                    // token用户的身份认证
                    headers: {
                        token: process.env["TIBOOK_USER_CONFIG"]["token"]
                    }
                })
                .then(result => {
                    res(result.data)
                })
                .catch(err => {
                    rej(err.message)
                })
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
                .post(
                    "/api/user/addFriend",
                    {
                        account
                    },
                    {
                        headers: {
                            token: process.env["TIBOOK_USER_CONFIG"]["token"]
                        }
                    }
                )
                .then(result => {
                    res(result.data)
                })
                .catch(err => {
                    rej(err.message)
                })
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
                .get("/api/search/searchUser", {
                    params: { account }
                })
                .then(result => {
                    res(result.data)
                })
                .catch(err => {
                    rej(err.message)
                })
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
                .get("/api/search/SearchUsers", { params: { key } })
                .then(result => {
                    res(result.data)
                })
                .catch(err => {
                    rej(err.message)
                })
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
                .post("/api/verifyToken", {
                    token: process.env["TIBOOK_USER_CONFIG"]["token"]
                })
                .then(result => {
                    res(result.data)
                })
                .catch(err => {
                    rej(err.message)
                })
        })
    }
}
