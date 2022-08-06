"use strict"
/**
 * 操作本地数据的工具方法集合文件
 *
 * 这个文件会被child_process进行fork开启，然后由消息来决定运行哪个方法
 *
 * 这里接收renderProcessMark(渲染进程的标注)是为了判断是那个进程要执行的操作
 */
const { USER_CHATLIST, USER_MESSAGE } = require("../lib/LocalDatabase/index")

/**
 * onLoadMsg传递一个回调函数，用来监听发送给该工具的消息
 */
process.onLoadMsg(({ request, args, renderProcessMark }) => {
    if (!LocalOperationMethodAllMap[request]) {
        throw Error(`本地操作函数不存在: (${request})`)
    }
    LocalOperationMethodAllMap[request](...args)
        .then(result => {
            process.loadSend({
                result,
                request,
                state: 0,
                renderProcessMark
            })
        })
        .catch(result => {
            process.loadSend({
                result,
                request,
                state: 1,
                renderProcessMark
            })
        })
})

const LocalOperationMethodAllMap = {
    /**
     * @example 向本地存储中插入新的消息
     * @param { Object } msg
     * @returns {Promise<{} | string>}
     */
    InsertMessage(msg) {
        return new Promise((res, rej) => {
            USER_MESSAGE.insert({ ...msg }, (err, newDoc) => {
                err ? rej(err) : res(newDoc)
            })
        })
    },

    /**
     * @example 查找对应账户的消息记录
     * @param {String} account
     * @returns {Promise<[{}] | string>}
     */
    FindCorrespondAccountMessage(account) {
        return new Promise((res, rej) => {
            // 查询我发给他的 或 他发给我的
            USER_MESSAGE.find(
                {
                    $or: [{ from: account }, { to: account }]
                },
                (err, docs) => {
                    // 如果存在就按时间进行排序
                    err ? rej(err) : res(docs ? docs.sort((a, b) => a.date - b.date) : [])
                }
            )
        })
    },

    /**
     * @example 删除某条消息记录
     * @param {String} id
     * @returns {Promise<number | string>}
     */
    RemoveMessage(id) {
        return new Promise((res, rej) => {
            USER_MESSAGE.remove(
                {
                    _id: id
                },
                {},
                (err, numRemoved) => {
                    err ? rej(err) : res(numRemoved)
                }
            )
        })
    },

    /**
     * @example 获取本地存储的消息卡片列表
     * @returns {Promise<[] | string>}
     */
    GetChatList() {
        return new Promise((res, rej) => {
            USER_CHATLIST.find({}, (err, docs) => {
                err ? rej(err) : res(docs)
            })
        })
    },

    /**
     * @example 添加消息卡片
     * @returns {Promise<{} | string>}
     */
    InsterChatCard({ account, avatar, uname, msg: { date, content, _id: mid } }) {
        return new Promise((res, rej) => {
            USER_CHATLIST.insert(
                {
                    account,
                    avatar,
                    uname,
                    msg: {
                        date,
                        content,
                        mid
                    }
                },
                (err, newDoc) => {
                    err ? rej(err) : res(newDoc)
                }
            )
        })
    },

    /**
     * @example 修改卡片
     * @returns {Promise<{} | string>}
     */
    UpdateChatCard(account, { date, content, _id: mid }) {
        return new Promise((res, rej) => {
            USER_CHATLIST.update(
                {
                    account
                },
                {
                    $set: {
                        msg: {
                            date,
                            content,
                            mid
                        }
                    }
                },
                {
                    upsert: true
                },
                (err, numReplaced, upsert) => {
                    err
                        ? rej(err)
                        : res({
                              numReplaced,
                              upsert
                          })
                }
            )
        })
    }
}
