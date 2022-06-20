<template>
  <div class="chat-win">
    <div class="title">
      <p>{{name}}</p>
    </div>
    <div class="chat-win-content" ref="chatWin">
      <template v-if="ChatHistory.length">
        <div
            v-for="chatMessage in ChatHistory"
            :key="chatMessage.date"
            class="message"
            :class="{
            'not-me': chatMessage.from !== UserInfo.account,
            'is-me': chatMessage.from === UserInfo.account
          }"
        >
          <div class="avatar" :style="{ backgroundImage: `url('${avatar}')` }"></div>
          <div class="message-content">
            <span>{{chatMessage.content}}</span>
          </div>
        </div>
      </template>
    </div>
    <div class="input-box">
      <div class="input-textarea-box">
        <textarea class="input-textarea" placeholder="输入消息" @keydown.enter.prevent="SendMessage" v-model="sendText"></textarea>
      </div>
      <div class="send-btn-box">
        <a href="javascript:;" class="send-btn" @click.prevent="SendMessage">发送</a>
      </div>
    </div>
  </div>
</template>

<script setup async>
import { ref, onMounted } from "vue";
const { ipcRenderer } = require("electron");

const props = defineProps({
  name: String,
  account: String,
  avatar: String
})

const avatar = props.avatar === "none" ? "/src/assets/img/DefaultAvatar.jpg" : props.avatar;
const ChatHistory = ref([]);
const UserInfo = ref({});
const sendText = ref("");
const chatWin = ref(null);

ChatHistory.value = await ipcRenderer.invoke("get account history message", props.account);
UserInfo.value = await ipcRenderer.invoke("get user info");

// 主进程有消息发送过来
ipcRenderer.on("message", (event, msg) => {
  // 该消息是本房间的
  ChatHistory.value.push(msg);
  chatWin.value.scrollTo(0, 1000);
})

onMounted(() => {
  chatWin.value.scrollTo(0, 1000);
})

function SendMessage() {
  if(sendText.value.length > 0) {
    ipcRenderer.send("send message", sendText.value);
    sendText.value = "";
  }
}

</script>

<style scoped lang="less">
.chat-win {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: var(--theme-color-one);

  .title {
    width: 100%;
    height: 40px;
    line-height: 30px;
    padding-left: 10px;
    font-size: 18px;
    border-top: 2px solid var(--chat-win-border-color);
    border-bottom: 2px solid var(--chat-win-border-color);
  }

  .chat-win-content {
    flex: 1;
    overflow-y: scroll;
    overflow-x: hidden;
    padding: 0 10px 0 10px;

    .message {
      width: 100%;
      min-height: 50px;
      height: auto;
      margin-bottom: 10px;

      .avatar {
        width: 38px;
        height: 38px;
        border-radius: 20px;
        display: inline-block;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      }

      .message-content {
        display: inline-block;
        width: auto;
        height: auto;
        max-width: 75%;
        min-height: 30px;
        padding: 8px 16px;
        word-wrap: break-word; // 内容自动换行
        word-break: break-word; // 换行的方式
        background-color: #fff;

        span {
          font-size: 16px;
        }
      }
    }

    .not-me {
      padding: 5px 0 0 10px;

      .avatar {
        float: left;
      }

      .message-content {
        margin-left: 10px;
        border-top-right-radius: 10px;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
      }
    }

    .is-me {
      padding: 5px 10px 0 0;

      .avatar {
        float: right;
      }

      .message-content {
        float: right;
        margin-right: 10px;
        color: var(--theme-color-three);
        border-top-left-radius: 10px;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
        background-color: var(--theme-color-one);
      }
    }
  }

  .input-box {
    position: relative;
    display: flex;
    width: 100%;
    height: 150px;
    padding: 10px;
    background-color: #fff;

    .input-textarea-box {
      flex: 1;
      padding-top: 2px;
      border-radius: 10px;
      background-color: var(--theme-color-three);

      .input-textarea {
        display: inline-block;
        width: 100%;
        height: 100vh;
        max-height: 80%;
        border: none;
        resize: none;
        outline: none;
        box-sizing: border-box;
        padding: 10px 5px 10px 5px;
        font-size: 16px;
        background-color: transparent;

        &::-webkit-scrollbar {
          width: 5px;
          cursor: pointer;
        }

        &::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.6);
        }
      }
    }
    .send-btn-box {
      line-height: 200px;

      .send-btn {
        border-radius: 5px;
        font-size: 16px;
        text-decoration: none;
        margin-left: 10px;
        padding: 4px 10px 4px 10px;
        color: var(--theme-color-three);
        background-color: var(--theme-color-one);
      }
    }
  }
}
</style>