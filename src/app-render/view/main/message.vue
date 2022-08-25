<script setup>
import { ref, watch } from "vue"
import { useRoute } from "vue-router"
import moment from "moment"
import ChatWin from "../../components/chat-win.vue"
import Notification from "../../components/notification-popup"

const TIBOOK = window.TIBOOK
const route = useRoute()
const joinAccount = route.params.joinAccount

/** 消息列表 */
const chatList = ref([])
/** 要显示聊天窗的用户 */
const currentChatUser = ref(null)

/**
 * 展示过程: 获取本地的聊天用户列表 -> 通过服务器接口获取用户的完整信息 -> 渲染聊天列表
 *      ?-> 有需要显示的用户聊天窗 -> 再已经获取的聊天列表中找到用户的数据，打开聊天窗
 *      ?聊天列表中不存在-> 向服务器接口获取用户的基本数据，向插入本地聊天用户 -> 打开聊天窗口
 *
 * 过程中有一步失败，这过程就会中断，并向用户展示提示弹窗
 */
/** 1 获取本地聊天用户列表 */
TIBOOK.localOperation("GetChatList", async (chatUsers, state) => {
    if (!!state) {
        Notification({
            type: "error",
            title: "消息页状态",
            content: "聊天列表获取失败"
        })
        return
    }

    /** 2 查询并和并用户的基本信息和消息信息 */
    if (chatUsers.length) {
        try {
            await GetChatUsersBasicInfo(chatUsers)
        } catch (UsersResult) {
            Notification({
                type: UsersResult.code,
                title: "消息页状态",
                content: "聊天列表用户信息获取失败"
            })
        }
    }

    /** 3 在内存中渲染聊天列表 */
    chatList.value = chatUsers

    /** 4 有需要显示的用户聊天窗 */
    if (!joinAccount) {
        return
    }

    /** 5 再已经获取的聊天列表中找到用户的数据，打开聊天窗 */
    const chatUser = chatUsers.find(chatUser => chatUser.account === joinAccount)

    /** 5.5 聊天列表存在，打开聊天窗 */
    if (chatUser) {
        currentChatUser.value = chatUser
        return
    }

    /** 6 向服务器接口获取用户的基本数据，向插入本地聊天用户 */
    TIBOOK.serverRequest("SearchUser", joinAccount, searchResult => {
        if (searchResult.code !== 200) {
            Notification({
                type: searchResult.code,
                title: "消息页状态",
                content: `窗口切换失败：${searchResult.msg}`
            })
            return
        }

        TIBOOK.localOperation("InsterChatUser", joinAccount, (result, state) => {
            if (!!state) {
                Notification({
                    type: "error",
                    title: "消息页状态",
                    content: `窗口切换失败：本地用户列表更新失败`
                })
                return
            }

            chatList.value.unshift({
                ...searchResult.data,
                message: {
                    ...result
                }
            })

            currentChatUser.value = result.data
        })
    })
})

// 解析消息的时间
function paresMessageDate(date) {
    const contarasMessageDate = new Date(date)
    const messageDate = new Date(date)
    const contrastDate = new Date()
    const DateToDay = new Date()
    contrastDate.setSeconds(0)
    contarasMessageDate.setSeconds(0)

    if (contarasMessageDate.getTime() === contrastDate.getTime()) {
        return DateToDay.getSeconds() - messageDate.getSeconds() + "秒前"
    }

    contrastDate.setMinutes(0)
    contarasMessageDate.setMinutes(0)
    // 一个小时内的 (03:20:00 \ 03:30:00) 转换成 (03:00:00.getTime() \ 03:00:00.getTime())
    if (contarasMessageDate.getTime() === contrastDate.getTime()) {
        return messageDate.getMinutes() - DateToDay.getMinutes() + "分钟前"
    }

    contrastDate.setHours(0)
    contarasMessageDate.setHours(0)

    // 一天内的 (01 05:30:00 \ 01 06：44:00) 转换成 (01 00:00:00.getTime() \ 01 00:00:00.getTime())
    if (contarasMessageDate.getTime() >= contrastDate.getTime()) {
        return messageDate.getHours() - DateToDay.getHours() + "小时前"
    }

    // 昨天 (02 00:00:00.getTime() - 01 00:00:00.getTime() === 一天的时间戳)
    if (contrastDate.getTime() - messageDate.getTime() === 86400000) {
        return "昨天"
    }

    return moment(date).format("YYYY/MM/DD")
}

// 切换聊天窗
function toggleChatWindow(chatUser) {
    currentChatUser.value = chatUser
}

/** 解析出的用户的账号，向服务器请求用户的基本信息 */
function GetChatUsersBasicInfo(chatUsers) {
    const usersAccount = chatUsers.map(chatUser => chatUser.account)
    return new Promise((res, rej) => {
        TIBOOK.serverRequest("FindUsers", usersAccount, UsersResult => {
            console.log(UsersResult)
            if (UsersResult.code !== 200) {
                rej(UsersResult)
                return
            }

            const usersBasicInfo = {}
            /** 合并成完整的信息 */
            for (const [_, userBasicInfo] of Object.entries(UsersResult.data)) {
                usersBasicInfo[userBasicInfo.account] = userBasicInfo
            }
            for (const [_, chatUser] of Object.entries(chatUsers)) {
                Object.assign(chatUser, usersBasicInfo[chatUser.account])
            }

            res(chatUsers)
        })
    })
}

watch(
    currentChatUser,
    ncurrentChatUser => {
        console.log(ncurrentChatUser)
        if (ncurrentChatUser) {
            TIBOOK.socketCommunicate("ToggleRecipient", ncurrentChatUser.account, result => {
                console.log(result)
            })
        }
    },
    {
        immediate: true
    }
)
</script>

<template>
    <div class="message-view-container">
        <div class="chat-list-container view-element-container">
            <template v-if="chatList.length">
                <div
                    v-for="chatUser in chatList"
                    :key="chatUser.account"
                    class="chat-element-container"
                    :class="{ 'user-in-chat': currentChatUser?.account === chatUser.account }"
                    @click="toggleChatWindow(chatUser)"
                >
                    <div class="user-avatar">
                        <img :src="chatUser.avatar" :alt="chatUser.name" />
                    </div>
                    <div class="user-name">{{ chatUser.name }}</div>
                    <div class="chat-recent-message-date">{{ paresMessageDate(chatUser.message.date ?? Date.now()) }}</div>
                    <div class="chat-recent-message-content">{{ chatUser.message.content ?? "" }}</div>
                    <div class="message-unread"></div>
                    <div class="unreal-tooltip"></div>
                </div>
            </template>
            <template v-else>
                <div class="">快去寻找你的朋友，分享这个你的世界吧</div>
            </template>
        </div>
        <template v-if="currentChatUser">
            <chat-win :chat-user="currentChatUser"></chat-win>
        </template>
    </div>
</template>

<style lang="less" scoped>
.message-view-container {
    display: flex;
    width: 100%;
    height: 100%;

    .chat-list-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 240px;
        height: 100%;
        margin-right: 10px;
        padding: 6px;

        .chat-element-container {
            position: relative;
            width: 100%;
            height: 60px;
            padding: 2px 5px;
            margin-bottom: 6px;
            border-radius: 10px;
            background-color: var(--input-box-background-color);
            transition: var(--all-transition);
            overflow: hidden;

            .user-avatar {
                position: absolute;
                top: 50%;
                left: 5px;
                width: 47px;
                height: 47px;
                transform: translateY(-50%);
                user-select: none;
            }

            .user-name {
                position: absolute;
                top: 5px;
                left: 65px;
                font-size: 16px;
                width: max-content;
                height: max-content;
                user-select: none;
            }

            .chat-recent-message-content {
                position: absolute;
                bottom: 5px;
                left: 65px;
                font-size: 14px;
                color: rgba(0, 0, 0, 0.5);
            }

            .chat-recent-message-date {
                position: absolute;
                right: 6px;
                top: 6px;
                font-size: 13px;
                color: #aaa;
                user-select: none;
            }

            .message-unread {
                position: absolute;
                height: max-content;
                right: 6px;
                bottom: 5px;
                padding-inline: 5px;
                font-size: 13px;
                color: #fff;
                border-radius: 40px;
                background-color: #fd6969;
                transition: var(--all-transition);
                user-select: none;
            }

            .unreal-tooltip {
                position: absolute;
                left: 0;
                bottom: -10px;
                width: 100%;
                height: 3px;
                border-radius: 10px;
                background-color: var(--cue--line-color);
                opacity: 0.4;
                transition: var(--all-transition);
            }

            &:hover {
                border-radius: 10px 10px 0 0;

                .unreal-tooltip {
                    bottom: 0;
                }
            }
        }

        .user-in-chat {
            border-radius: 10px 10px 0 0;

            .unreal-tooltip {
                bottom: 0;
                opacity: 1;
            }
        }
    }
}
</style>
