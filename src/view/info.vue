<template>
    <div id="info-page-box">
      <div class="sidebar-border"></div>
      <div id="message-list-box">
        <template v-if="MessageCardList.length">
          <message-card
              v-for="messageCard in MessageCardList"
              :data-id="messageCard._id"
              :key="messageCard._id"
              :name="messageCard.name"
              :account="messageCard.account"
              :avatar="messageCard.avatar"
              :message="messageCard.msg.content"
              :date="messageCard.msg.date"
              @click="openThisCardChatWin(messageCard)"
              class="message-card"
              :class="{
                'current-message-card': messageCard.account === openChatWindow.account
              }"
          ></message-card>
        </template>
      </div>
      <div id="chat-wins-box">
        <template v-if="Object.keys(openChatWindow).length">
          <Suspense>
            <chat-win
                :name="openChatWindow.name"
                :account="openChatWindow.account"
                :avatar="openChatWindow.avatar"
            ></chat-win>
          </Suspense>
        </template>
      </div>
    </div>
</template>

<script>
export default {
  name: "info",
  created() {
    document.querySelector("#title>p").innerHTML = "Message";
    this.$emit("pageChange", "message");
  }
}
</script>

<script setup async>
import MessageCard from "../components/message-card.vue";
import ChatWin from "../components/chat-win.vue";
import { ref } from "vue";
const { ipcRenderer } = require("electron");

const MessageCardList = ref([]);
const openChatWindow = ref({});
const Room = ref("");

// 获取用户消息卡片列表
MessageCardList.value = await ipcRenderer.invoke("get local message card list");
// 获取用户上次所处房间
Room.value = await ipcRenderer.invoke("get room");

// 找到上次所处房间的消息卡片，并打开聊天窗口, 如果没有则返回初始值
openChatWindow.value = MessageCardList.value.find(item => item?.account === Room.value) ?? {};


// 打卡聊天窗口
function openThisCardChatWin(messageCard) {
  ipcRenderer.send("join room", messageCard.account);
  openChatWindow.value = messageCard;
}

// 当有新的消息，需要更新前端卡片列表的时候触发
ipcRenderer.on("new messageCard", (event, msgCard) => {
  const msgCardIndex = MessageCardList.value.findIndex(item => item?.account === msgCard.account);
  if(msgCardIndex !== -1) {
    MessageCardList.value[msgCardIndex] = msgCard;
  }else {
    MessageCardList.value.unshift(msgCard);
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
      width: 300px;
      height: 100%;
      background-color: var(--theme-color-two);

      .message-card {
        border: 3px solid var(--border-color);
        border-bottom: none;

        &:nth-last-child(1) {
          border-bottom: 3px solid var(--border-color);
          padding-bottom: 3px;
        }
      }

      .current-message-card {
        background-color: var(--border-color);
        box-shadow: var(--el-box-shadow);
        z-index: 999;
      }
    }

    #chat-wins-box {
      flex: 1;
      overflow: hidden;
      background-color: var(--theme-color-two);
    }
  }
</style>