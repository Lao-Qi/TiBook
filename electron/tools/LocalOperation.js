"use strict"
const path = require("path")
const Nedb = require("nedb")
const { app } = require("electron")
const { SearchUser } = require("./ServerRequire")

// 本地软件存储
const DB = {
    message: new Nedb({
        filename: path.join(app.getAppPath(), "./message.db"), // 文件路径
        autoload: true, // 自动连接
        corruptAlertThreshold: 1, // 数据缺失多少报错， 1表示不报错
    }),
    friends: new Nedb({
        filename: path.join(app.getAppPath(), "./friendList.db"),
        autoload: true,
        corruptAlertThreshold: 1,
    }),
    messageCards: new Nedb({
        filename: path.join(app.getAppPath(), "./messageCards.db"),
        autoload: true,
        corruptAlertThreshold: 1,
    }),
}

/**
 * @example 向本地存储中插入新的消息
 * @param { Object } msg
 * @param { Boolean } isRead
 */
function insertMessage(msg, isRead) {
    DB.message.insert({ ...msg, isRead })
}

/**
 * @example 查找对应账户的消息记录
 * @param { String } account
 * @returns { Promise<Array>}
 */
function findHistoryAccountMessage(account) {
    return new Promise(res => {
        // 查询我发给他的 或 他发给我的
        DB.message.find(
            {
                $or: [{ from: account }, { to: account }],
            },
            (err, docs) => {
                if (docs.length) {
                    // 按时间进行排序
                    docs.sort((a, b) => a.date - b.date)
                    res(docs)
                } else {
                    res([])
                }
            }
        )
    })
}

/**
 * @example 修改本地的消息卡片，如果消息卡片不存在则插入新的消息卡片
 * @param { String } insertMessageCardAccount
 * @param { Object } msg
 * @returns
 */
function updateOrInsertMessageCard(insertMessageCardAccount, msg) {
    return new Promise((res, rej) => {
        updateMessageCard(insertMessageCardAccount, msg)
            .then(doc => {
                res(doc)
            })
            .catch(() => {
                insertMessageCard(insertMessageCardAccount, msg)
                    .then(doc => {
                        res(doc)
                    })
                    .catch(rej)
            })
    })
}

/**
 * @example 修改本地的消息卡片
 * @param { String } insertMessageCardAccount
 * @param { String } msg
 * @returns
 */
function updateMessageCard(insertMessageCardAccount, { content, date }) {
    return new Promise((res, rej) => {
        // 更新该好友消息卡片的消息记录
        DB.messageCards.update(
            {
                // 如果这条消息是我发送出去的，则修改接收方在本地的消息卡片
                account: insertMessageCardAccount,
            },
            {
                $set: {
                    msg: {
                        content: content ?? "",
                        date: date ?? Date.now(),
                    },
                },
            },
            {
                multi: false,
                returnUpdatedDocs: true,
            },
            (err, ret, newDoc) => {
                // 查询得到并且修改成功
                ret === 1 ? res(newDoc) : rej({ content, date })
            }
        )
    })
}

/**
 * @example 向本地存储的消息卡片列表中存储新的消息卡片
 * @param { String } insertMessageCardAccount
 * @param { String } param1
 * @returns
 */
function insertMessageCard(insertMessageCardAccount, { content, date }) {
    return new Promise((res, rej) => {
        // 先查询本地好友列表查看有没有该条消息的来源用户
        DB.friends.findOne(
            {
                account: insertMessageCardAccount,
            },
            async (err, doc) => {
                // 查询不到用户
                if (!doc) {
                    // 本地查询不到则到服务器查询
                    const SearchUserDate = (await SearchUser(insertMessageCardAccount)).user
                    doc = {
                        name: SearchUserDate.name,
                        account: SearchUserDate.account,
                        avatar: SearchUserDate.avatar,
                    }
                }
                // 添加消息卡片
                DB.messageCards.insert(
                    {
                        ...doc,
                        msg: {
                            content,
                            date,
                        },
                    },
                    (err, doc) => {
                        err ? rej(err) : res(doc)
                    }
                )
            }
        )
    })
}

/**
 * @example 获取本地存储的消息卡片列表
 * @returns { Promise<[]> }
 */
function getLocalMessageCard() {
    return new Promise(res => {
        DB.messageCards.find({}, (err, docs) => {
            res(err ? [] : docs)
        })
    })
}

/**
 * @example 查找本地存储的好友列表
 * @returns { Promise<[]> }
 */
function findLocalFriends() {
    return new Promise((res, rej) => {
        DB.friends.find({}, (err, docs) => {
            err ? rej(err) : res(docs)
        })
    })
}

/**
 * @example 向本地好友列表插入新的好友记录
 * @param { Object } friend
 */
function insertFriend(friend) {
    DB.friends.insert(friend)
}

/**
 * @exampl 向本地好友列表中查找特点的好友记录
 * @param { String } account
 * @returns { Promise<[]> }
 */
function findLocalFriend(account) {
    return new Promise(res => {
        DB.friends.findOne({ account }, { AddTime: 1, _id: 0 }, (err, doc) => {
            res(err ? [] : doc)
        })
    })
}

module.exports = {
    insertMessage,
    findHistoryAccountMessage,
    getLocalMessageCard,
    updateOrInsertMessageCard,
    insertFriend,
    findLocalFriends,
    findLocalFriend,
}
