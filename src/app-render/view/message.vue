<template>
    <div id="info-page-box">
        <div class="sidebar-border"></div>
        <div id="message-list-box">
            <template v-if="MessageCardList.length">
                <message-card
                    v-for="messageCard in MessageCardList"
                    :key="messageCard._id"
                    :name="messageCard.name"
                    :account="messageCard.account"
                    :avatar="messageCard.avatar"
                    :message="messageCard.msg.content"
                    :date="messageCard.msg.date"
                    @click="openThisCardChatWin(messageCard)"
                    :class="{
                        'message-card': true,
                        'current-message-card': true
                    }"
                >
                </message-card>
            </template>
        </div>
        <div id="chat-wins-box">
            <template v-if="Object.keys(openChatWindow).length">
                <Suspense>
                    <chat-win :name="openChatWindow.name" :account="openChatWindow.account" :avatar="openChatWindow.avatar" :localUserInfo="localUserInfo"></chat-win>
                </Suspense>
            </template>
        </div>
    </div>
</template>

<script setup async>
import MessageCard from "../components/message-card.vue"
import ChatWin from "../components/chat-win.vue"
import { ref } from "vue"
const { ipcRenderer } = require("electron")

const MessageCardList = ref([])
const openChatWindow = ref({})
const localUserInfo = ref("")
let Room = ""

// 获取用户消息卡片列表
MessageCardList.value = await ipcRenderer.invoke("get local message card list")
// 获取用户上次所处房间
Room = await ipcRenderer.invoke("get room")
localUserInfo.value = await ipcRenderer.invoke("get local user info")

// 找到上次所处房间的消息卡片，并打开聊天窗口, 如果没有则返回初始值
MessageCardList.value.find(messageCord => {
    if (messageCord?.account === Room) {
        openThisCardChatWin(messageCord)
    }
})

// 打卡聊天窗口
function openThisCardChatWin(messageCard) {
    if (openChatWindow.value.account !== messageCard.account) {
        ipcRenderer.send("join room", messageCard.account)
        openChatWindow.value = messageCard
    }
}

// 当有新的消息，需要更新前端卡片列表的时候触发
ipcRenderer.on("new messageCard", (event, msgCard) => {
    const msgCardIndex = MessageCardList.value.findIndex(item => item?.account === msgCard.account)
    if (msgCardIndex !== -1) {
        MessageCardList.value[msgCardIndex] = msgCard
    } else {
        MessageCardList.value.unshift(msgCard)
    }
})

// 发送加入房间后的返回事件，如果加入成功修改本地的房间号
ipcRenderer.on("join room res", (event, code, account) => {
    if (code === 200) {
        Room = account
    }
})
</script>

<style lang="less" scoped>
#info-page-box {
    display: flex;
    width: 100%;
    height: calc(100vh - 30px);

    #message-list-box {
        display: flex;
        flex-direction: column;
        width: 260px;
        height: 100%;
        margin-right: 10px;
        background-color: rgba(255, 255, 255, 0.3);

        .message-card {
            position: relative;
        }

        .current-message-card::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            display: block;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.1);
        }
    }

    #chat-wins-box {
        flex: 1;
        overflow: hidden;
    }
}
</style>
