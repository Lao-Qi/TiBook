"use strict"
/**
 * Socket通讯工具，用来与服务器进行socket连接
 *
 * socket连接超时为4秒，4秒连接不上后会自动连接
 *
 * socket的每一个方法服务器都会对应发送返回结果，返回结果的时间超过3秒即为超时
 * 服务器的返回事件名都是发送过去的方法名加上-return
 *
 * 3秒，如果用户网络差的话可能永远也用不了这个软件
 */
const { readFile } = require("fs/promises")
const { win32: path } = require("path")
const { io } = require("socket.io-client")
const { uid } = require("uid/secure")

const USER_DATA = process["TIBOOK"]["USER_CONFIG"]["user_data"]
const timeout = 3000 // 所有请求的超时时间

const socket = io("ws://127.0.0.1:6001", {
    auth: {
        // E:\工程文件\项目\tibook\src\app-main\lib\LocalDatabase\user_config.js
        token: USER_DATA["token"]
    },
    timeout,
    autoConnect: true
})

process.onLoadMsg(msg => {
    // 请求过来的时候检查socket有没有连接，如果没有则将请求占时存储到SendMethods中
    if (!socket.connected) {
        SendMethods.push(msg)
    } else if (!requestMethodAllMap[msg.request]) {
        throw Error(`请求的方法不存在：{${msg.request}}`)
    } else {
        runSendRequest(msg)
    }
})

socket.on("connect", () => {
    process.loadSend({
        type: "socket-passive",
        event: "socket-connect",
        state: 0,
        content: ""
    })

    // socket连接成功后，运行占存的请求
    while (SendMethods.length) {
        runSendRequest(SendMethods.shift())
    }
})

socket.on("connect_error", err => {
    process.loadSend({
        type: "socket-passive",
        event: "socket-connect_error",
        state: 1,
        content: err
    })
})

socket.on("disconnect", reason => {
    process.loadSend({
        type: "socket-passive",
        event: "socket-disconnect",
        state: 0,
        content: reason
    })
})

/**
 * 用存储socket还没连接上就发送过来的要求
 * 这些存储起来的要求会在socket触发connect事件后执行
 */
const SendMethods = []
const requestMethodAllMap = {
    /**
     * 切换消息接收者
     * @param {String} tuc 要切换的用户账号 Toggle User Account
     */
    async ToggleRecipient(tuc) {
        socket.emit("client-toggle-recipient", tuc)
        return await listenerMethodReturns("client-toggle-recipient-return", "ToggleRoom")
    },

    /**
     * 发送消息
     * @param {{ content: string }} 发送的文字内容
     */
    async SendTextMessage({ content }) {
        const mid = uid(20)
        const messageInfo = {
            mid,
            type: "text",
            content,
            date: Date.now()
        }
        socket.emit("client-send-message", messageInfo)
        console.log(messageInfo)

        /** 该事件与被动的receive-message事件不同，该事件是为了验证该条消息发送出去的状态 */
        return await listenerMethodReturns(`client-send-message-return-${mid}`, "SendMessage")
    },

    /**
     * 发送图片
     * @param {string} url 图片路径，绝对路径
     * @param {string} ext 图片的编码
     */
    async SendImageMessage(url) {
        try {
            const imageData = await readFile(path.normalize(url), "binary")
            const uid = uid(20)
            socket.emit("client-send-message", {
                uid,
                type: "image",
                content: imageData,
                img_attribute: {
                    name: path.basename(url),
                    extname: path.extname(url),
                    encode: "binary"
                },
                date: Date.now()
            })
            return await listenerMethodReturns(`client-send-message-return-${uid}`, "SendImageMessage")
        } catch (err) {
            console.error(err)
        }
    },

    /**
     * 添加好友
     * @param {string} friendAccount 要添加的好友的账号
     * @returns {any}
     */
    async AddFriend(friendAccount) {
        socket.emit("clinet-add-friend", { account: friendAccount })
        return await listenerMethodReturns("client-add-friend-return", "AddFriend")
    }
}

/**
 * 监听服务器返回事件
 * @param {string} event 服务器要触发的返回事件
 * @param {string} method // 使用的方法名
 * @returns {Promise<{}>}
 */
function listenerMethodReturns(event, method) {
    return new Promise(res => {
        /**
         * 3秒后Promise没有调用res即事件没有触发，判定为超时
         * 如果触发了则删除定时器，判断为成功
         */
        const RequestTiming = setTimeout(() => {
            res({
                code: 404,
                msg: `请求超时，请求的方法：${method}`
            })
        }, timeout)
        socket.once(event, result => {
            clearTimeout(RequestTiming)
            res(result)
        })
    })
}

function runSendRequest({ request, args, renderProcessMark }) {
    requestMethodAllMap[request](...args)
        .then(result => {
            process.loadSend({
                type: "request",
                request,
                state: 0,
                renderProcessMark,
                content: result
            })
        })
        .catch(result => {
            process.loadSend({
                type: "request",
                request,
                state: 1,
                renderProcessMark,
                content: result
            })
        })
}

/**
 * 接收服务端发送过来的所有类型的消息，包括用户发送出去的和其他用户发送过来的
 */
socket.on("receive-message", msg => {
    process.loadSend({
        type: "socket-passive",
        event: "socket-receive-message",
        state: 0,
        content: msg
    })
})

socket.on("add-friend-message", msg => {
    process.loadSend({
        type: "socket-passive",
        event: "socket-add-friend-message",
        state: 0,
        content: msg
    })
})
