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
 * @returns { Promise<Object | Boolean >}
 */
async function RegisterUser(name, account, paw) {
    const publicKey = await GetPublicKey()
    if (publicKey.status !== 200) {
        return publicKey.status
    } else {
        const ping = publicEncrypt(publicKey, Buffer.from(paw)).toString("base64")
        const res = await axios.post("/api/user/register", {
            name,
            account,
            type: type(),
            ping,
        })
        return res.status === 200 ? res.data : false
    }
}

/**
 * @example 用户登录
 * @param { String } account
 * @param { String } paw
 * @returns { Promise<Object | Boolean >}
 */
async function LoginUser(account, paw) {
    const publicKey = await GetPublicKey()
    if (!publicKey) {
        return {
            code: 404,
            msg: "网络请求失败，请检查本地网络连接状态",
        }
    } else {
        const ping = publicEncrypt(publicKey, Buffer.from(paw)).toString("base64")
        const res = await axios.post(`/api/user/login`, { account, ping })
        return res.status === 200 ? res.data : false
    }
}

/**
 * @example 查询当前登录用户的好友列表
 * @returns { Promise<Object | Boolean> }
 */
async function FindUserFriendsList() {
    const res = await axios.get("/api/search/FriendsList", {
        // token用户的身份认证
        headers: { token: localToken },
    })
    return res.status === 200 ? res.data : false
}

/**
 * @example 添加好友
 * @param { String } account
 * @returns { Promise<Object | Boolean }
 */
async function AddFriend(account) {
    const res = await axios.post(
        "/api/user/addFriend",
        { account },
        {
            headers: { token: localToken },
        }
    )
    return res.status === 200 ? res.data : false
}

/**
 * @example 通过账号查询用户
 * @param { String } account
 * @returns { Promise<Object | Boolean>}
 */
async function SearchUser(account) {
    const res = await axios.get("/api/search/searchUser", {
        params: { account },
    })
    return res.status === 200 ? res.data : false
}

/**
 * @example 模糊查询用户
 * @param { String } key
 * @returns { Promise<Object | Boolean>}
 */
async function SearchUsers(key) {
    const res = await axios.get("/api/search/SearchUsers", { params: { key } })
    return res.status === 200 ? res.data : false
}

/**
 * @example 验证本地token是否过期
 * @param { String } token
 * @returns { Promise<Object | {}>}
 */
async function VerifyTokenIsOut(token) {
    const res = await axios.post("/api/verifyToken", { token })
    return res.status === 200 ? res.data : { code: 404, data: false, msg: "网络错误" }
}

module.exports = {
    RegisterUser,
    LoginUser,
    AddFriend,
    SearchUser,
    SearchUsers,
    VerifyTokenIsOut,
}
