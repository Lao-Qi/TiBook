<template>
    <div id="info-page-box">
        <div class="sidebar-border"></div>
        <div id="message-list-box">
            <template v-if="CardList.length">
                <message-card
                    v-for="messageCard in CardList"
                    :key="messageCard._id"
                    :name="messageCard.name"
                    :account="messageCard.account"
                    :avatar="messageCard.avatar"
                    :message="messageCard.msg.content"
                    :date="messageCard.msg.date"
                    @click="toggleChatWindow = messageCard"
                    :class="{
                        'message-card': true,
                        'current-message-card': true
                    }"
                >
                </message-card>
            </template>
        </div>
        <div id="chat-wins-box">
            <template v-if="currentChatWindow">
                <chat-win :name="currentChatWindow.name" :account="currentChatWindow.account" :avatar="currentChatWindow.avatar"></chat-win>
            </template>
        </div>
    </div>
</template>

<script setup>
import MessageCard from "../components/message-card.vue"
import ChatWin from "../components/chat-win.vue"
import { ref, watch } from "vue"

const TIBOOK = window.TIBOOK
const CardList = ref([])
const toggleChatWindow = ref(null)
const currentChatWindow = ref(null)

// 获取本地的聊天列表
TIBOOK.localOperation("GetChatList", result => {
    CardList.value = result
})

watch(toggleChatWindow, TCW => {
    TIBOOK.socketCommunicate("ToggleRoom", TCW.account, result => {
        if (result.code === 200) {
            currentChatWindow.value = TCW
        }
    })
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
