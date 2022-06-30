"use strict"
const { BrowserWindow, ipcMain } = require("electron")
const io = require("socket.io-client")
const Store = require("electron-store")
const { AddFriend, SearchUsers, SearchUser } = require("../tools/ServerRequire")
const {
    insertMessage,
    findHistoryAccountMessage,
    getLocalMessageCard,
    updateOrInsertMessageCard,
    insertFriend,
    findLocalFriends,
    findLocalFriend,
} = require("../tools/LocalOperation")

// 本地软件配置存储
const UserStore = new Store({ accessPropertiesByDotNotation: false })
const UserInfo = UserStore.get("info")

module.exports = function createMainWin() {
    const mainWin = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 600,
        minHeight: 400,
        show: false,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false, // 支持不同协议的资源
        },
    })
    mainWin.loadURL("http://127.0.0.1:3000/#/login")
    mainWin.once("ready-to-show", () => mainWin.show())
    // 用户当前所处房间
    let room = UserStore.get("room")

    // 涉及到api服务器的事件
    // 获取好友列表
    ipcMain.handle("user-friendList", async () => {
        return await findLocalFriends()
    })
    // 搜索匹配用户
    ipcMain.handle("search-users", async (event, KeyWorld) => {
        const searchData = await SearchUsers(KeyWorld)
        return searchData.List ?? []
    })
    // 获取用户详细信息
    ipcMain.handle("get-user-info", async (event, account) => {
        const UserInfoData = await SearchUser(account)
        return UserInfoData.user ?? UserInfoData
    })
    // 添加好友
    ipcMain.on("add-friend", async (event, account) => {
        const addFriendData = await AddFriend(account)
        if (addFriendData.code === 200) {
            // 本地存储中添加好友
            insertFriend(addFriendData.friend)
        }
        // 服务端添加成功
        mainWin.webContents.send("add-friend-return", addFriendData)
    })

    // 连接聊天功能服务器
    const socket = io.connect("http://127.0.0.1:6001", {
        auth: {
            token: UserStore.get("token"),
        },
        timeout: 4000,
    })

    // 与服务器连接成功
    socket.on("connect", () => {
        mainWin.webContents.send("connect")

        // 可被页面触发套接字的事件
        // 往当前房间发送消息事件
        ipcMain.on("send message", (event, content) => {
            socket.emit("send message", content)
        })
        // 加入用户房间事件
        ipcMain.on("join room", (event, UserRoomAccount) => {
            socket.emit("join room", UserRoomAccount)
        })
    })

    // 服务器连接错误触发(可能是网络错误，服务器错误，客户端配置错误)
    socket.on("connect_error", () => {
        mainWin.webContents.send("connect_error")
    })

    // 服务器断开连接
    socket.on("disconnect", () => {
        // 窗口还存在，向页面发送套接字关闭事件
        if (!mainWin.isDestroyed()) {
            mainWin.webContents.send("socket disconnect")
        }
    })

    // 有用户发来消息
    socket.on("message", async (msg) => {
        // 本地存储该条消息
        insertMessage(msg, msg.from === room)
        // 要更新的好友账号如果是我自己，则修改接收方在本地的消息卡片
        const insertMessageCardAccount =
            UserInfo.account === msg.from ? msg.to : msg.from
        // 更新本地好友消息卡片
        updateOrInsertMessageCard(insertMessageCardAccount, msg).then((doc) => {
            mainWin.webContents.send("new messageCard", doc)
            mainWin.webContents.send(
                `new messageCard ${insertMessageCardAccount}`,
                doc
            )
            mainWin.webContents.send("message", msg)
        })
    })

    // 用户加入其他房间后服务端响应完成
    socket.on("join room res", ({ code, account }) => {
        // 页面可对加入房间的成功和失败做对应的处理
        if (code === 200) {
            // 加入成功则修改本地的(房间号)
            room = account
            UserStore.set("room", account)
        }
    })

    // 有关本地存储的事件
    // 获取当前房间的历史聊天记录
    ipcMain.handle(
        "get account history message",
        async (event, account) => await findHistoryAccountMessage(account)
    )
    // 获取本地存储的消息卡片列表
    ipcMain.handle(
        "get local message card list",
        async () => await getLocalMessageCard()
    )
    // 获取本地存储的用户信息
    ipcMain.handle("get user info", async () => UserStore.get("info"))
    // 获取上次所处房间
    ipcMain.handle("get room", async () => room)
    // 获取本地存储的好友信息
    ipcMain.handle(
        "get local friend info",
        async (event, account) => await findLocalFriend(account)
    )

    // 前端联系人页面(点击发送消息按钮)跳转聊天窗口页面
    // 添加聊天卡片
    ipcMain.on("go chat win", async (event, account) => {
        const latelyMessage = (await findHistoryAccountMessage(account)).at(-1)
        updateOrInsertMessageCard(account, latelyMessage).then(() => {
            UserStore.set("room", account)
            mainWin.webContents.send("is go chat win")
        })
    })

    // 窗口控件事件
    // 窗口在后台渲染完成触发

    ipcMain.on("mainWin-destroy", () => socket.disconnect())

    return mainWin
}
