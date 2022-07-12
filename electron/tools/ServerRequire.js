// CommonJS类型的接口请求
"use strict"
const axios = require("./axios")
const Store = require("electron-store")
const { type } = require("os")
const { publicEncrypt } = require("crypto")
const UserStore = new Store()
// 获取本地存储中的token;
const localToken = UserStore.get("token")

/**
 * @example 获取服务器公钥
 * @returns { Promise<String | Boolean >}
 */
async function GetPublicKey() {
    const res = await axios.get("/api/publicKey")
    return res.status === 200 && res.data.code === 200 ? Buffer.from(res.data.publicKey, "base64").toString() : false
}

/**
 * @example 注册用户
 * @param { String } name
 * @param { String } account
 * @param { String } paw
 * @returns { Promise<Object> }
 */
function RegisterUser(name, account, paw) {
    return new Promise((res, rej) => {
        GetPublicKey()
            .then(publicKey => {
                const ping = publicEncrypt(publicKey, Buffer.from(paw)).toString("base64")
                axios
                    .post("/api/user/register", {
                        name,
                        account,
                        type: type(),
                        ping,
                    })
                    .then(registerData => {
                        res(registerData)
                    })
                    .catch(err => rej(err))
            })
            .catch(err => rej(err))
    })
}

/**
 * @example 用户登录
 * @param { String } account
 * @param { String } paw
 * @returns { Promise<Object | Boolean >}
 */
function LoginUser(account, paw) {
    return new Promise((res, rej) => {
        GetPublicKey()
            .then(publicKey => {
                const ping = publicEncrypt(publicKey, Buffer.from(paw)).toString("base64")
                axios
                    .post(`/api/user/login`, { account, ping })
                    .then(resData => res(resData))
                    .catch(err => rej(err))
            })
            .catch(err => rej(err))
    })
}

/**
 * @example 查询当前登录用户的好友列表
 * @returns { Promise<Object | Boolean> }
 */
function FindUserFriendsList() {
    return new Promise((res, rej) => {
        axios
            .get("/api/search/FriendsList", {
                // token用户的身份认证
                headers: { token: localToken },
            })
            .then(res)
            .catch(rej)
    })
}

/**
 * @example 添加好友
 * @param { String } account
 * @returns { Promise<Object | Boolean }
 */
function AddFriend(account) {
    return new Promise((res, rej) => {
        axios
            .post(
                "/api/user/addFriend",
                { account },
                {
                    headers: { token: localToken },
                }
            )
            .then(res)
            .catch(rej)
    })
}

/**
 * @example 通过账号查询用户
 * @param { String } account
 * @returns { Promise<Object | Boolean>}
 */
function SearchUser(account) {
    return new Promise((res, rej) => {
        axios
            .get("/api/search/searchUser", {
                params: { account },
            })
            .then(res)
            .catch(rej)
    })
}

/**
 * @example 模糊查询用户
 * @param { String } key
 * @returns { Promise<Object | Boolean>}
 */
function SearchUsers(key) {
    return new Promise((res, rej) => {
        axios.get("/api/search/SearchUsers", { params: { key } }).then(res).catch(rej)
    })
}

/**
 * @example 验证本地token是否过期
 * @param { String } token
 * @returns { Promise<Object | {}>}
 */
function VerifyTokenIsOut(token) {
    return new Promise((res, rej) => {
        axios.post("/api/verifyToken", { token }).then(res).catch(rej)
    })
}

module.exports = {
    RegisterUser,
    LoginUser,
    AddFriend,
    SearchUser,
    SearchUsers,
    VerifyTokenIsOut,
}
