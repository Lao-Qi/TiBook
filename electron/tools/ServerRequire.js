// CommonJS类型的接口请求
"use strict"
const axios = require("./axios")
const Store = require("electron-store")
const { type } = require("os")
const { publicEncrypt } = require("crypto")
const UserStore = new Store()
// 获取本地存储中的token;
const localToken = UserStore.get("token")

// 获取服务端公钥
async function GetPublicKey() {
    const res = await axios.get("/api/publicKey")
    return res.status === 200 && res.data.code === 200
        ? Buffer.from(res.data.publicKey, "base64").toString()
        : false
}

// 注册用户
async function RegisterUser(name, account, paw) {
    const publicKey = await GetPublicKey()
    if (publicKey.status !== 200) {
        return publicKey.status
    } else {
        const ping = publicEncrypt(publicKey, Buffer.from(paw)).toString(
            "base64"
        )
        const res = await axios.post("/api/user/register", {
            name,
            account,
            type: type(),
            ping,
        })
        return res.status === 200 ? res.data : false
    }
}

// 登录用户生成token
async function LoginUser(account, paw) {
    const publicKey = await GetPublicKey()
    if (!publicKey) {
        return publicKey
    } else {
        const ping = publicEncrypt(publicKey, Buffer.from(paw)).toString(
            "base64"
        )
        const res = await axios.post(`/api/user/login`, { account, ping })
        return res.status === 200 ? res.data : false
    }
}

// 查询当前用户的好友列表
async function FindUserFriendsList() {
    const res = await axios.get("/api/search/FriendsList", {
        // token用户的身份认证
        headers: { token: localToken },
    })
    return res.status === 200 ? res.data : false
}

// 添加好友
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

// 通过账号查询用户
async function SearchUser(account) {
    const res = await axios.get("/api/search/searchUser", {
        params: { account },
    })
    return res.status === 200 ? res.data : false
}

// 查询用户
async function SearchUsers(key) {
    const res = await axios.get("/api/search/SearchUsers", { params: { key } })
    return res.status === 200 ? res.data : false
}

module.exports = {
    RegisterUser,
    LoginUser,
    AddFriend,
    SearchUser,
    SearchUsers,
}
