"use strict"
const router = require("express").Router()
const account = require("./Route/User")
const search = require("./Route/Search")
const { publicKey } = require("./lib/keys.js")

// 设置下面所有接口的响应头
router.use((req, res, next) => {
    res.set("Content-Type", "application/json; charset=utf-8")
    next()
})
router.use("/user", account)
router.use("/search", search)

router.get("/publicKey", (req, res) => {
    // 发送服务端的公钥
    res.send({
        code: 200,
        publicKey: Buffer.from(publicKey).toString("base64"),
    })
})

module.exports = router
