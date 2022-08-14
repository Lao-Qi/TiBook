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
const { io } = require("socket.io-client")
const USER_DATA = process["TIBOOK"]["USER_CONFIG"]["user_data"]

const socket = io("ws://127.0.0.1:6001", {
    auth: {
        // E:\工程文件\项目\tibook\src\app-main\lib\LocalDatabase\user_config.js
        token: USER_DATA["token"]
    },
    timeout: 4000,
    autoConnect: true
})

/**
 * 用存储socket还没连接上就发送过来的要求
 * 这些存储起来的要求会在socket触发connect事件后执行
 */
const SendMethods = []
const requestMethodAllMap = {
    /**
     * 切换房间的方法(用户切换聊天窗)
     * @param {String} tuc 要切换的用户账号 Toggle User Account
     */
    async ToggleRoom(tuc) {
        socket.emit("toggle-room", tuc)
        return await listenerMethodReturns("toggle-room-return", "ToggleRoom")
    },

    /**
     * 用户发送消息
     *
     * from 谁发的
     * to 给谁的
     * content 内容是什么
     * @param {{ from: string, to: string, content: string}}
     */
    async SendMessage({ from, to, content }) {
        socket.emit("send-message", {
            from,
            to,
            content,
            date: Date.now()
        })
        /**
         * 该事件与被动的receive-message事件不同，该事件是为了验证该条消息发送出去的状态
         */
        return await listenerMethodReturns("send-message-return", "SendMessage")
    },

    /**
     * 添加好友
     * @param {string} friendAccount 要添加的好友的账号
     * @returns {any}
     */
    async AddFriend(friendAccount) {
        socket.emit("add-friend", { account: friendAccount })
        return await listenerMethodReturns("add-friend-return", "AddFriend")
    }
}

/**
 * 监听服务器返回事件
 * @param {string} event 服务器要触发的返回事件
 * @param {string} method // 使用的方法名
 * @returns {Promise<Error | {}>}
 */
function listenerMethodReturns(event, method) {
    return new Promise((res, rej) => {
        /**
         * 3秒后Promise没有调用res即事件没有触发，判定为超时
         * 如果触发了则删除定时器，判断为成功
         */
        const time = setTimeout(() => {
            rej({
                code: 404,
                data: {},
                msg: `请求超时，请求的方法：${method}`
            })
        }, 3000)
        socket.once(event, result => {
            clearTimeout(time)
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

process.onLoadMsg(msg => {
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
        type: "proactive",
        event: "socket-connect",
        state: 0,
        content: ""
    })

    for (let i = 0; i < SendMethods.length; i++) {
        runSendRequest(SendMethods[i])
    }
})

/**
 * 接收服务端发送过来的消息，包括用户发送出去的和其他用户发送过来的
 */
socket.on("receive-message", msg => {
    process.loadSend({
        type: "proactive",
        event: "socket-receive-message",
        state: 0,
        content: msg
    })
})

socket.on("add-friend", msg => {
    process.loadSend({
        type: "proactive",
        event: "sockey-add-friend",
        state: 0,
        content: msg
    })
})

socket.on("connect_error", err => {
    process.loadSend({
        type: "proactive",
        event: "socket-connect_error",
        state: 1,
        content: err
    })
})

socket.on("disconnect", reason => {
    process.loadSend({
        type: "proactive",
        event: "socket-disconnect",
        state: 0,
        content: reason
    })
})
