<template>
    <div class="chat-win">
        <div class="title">
            <img :src="avatar" :alt="name" />
            <p>{{ name }}</p>
        </div>
        <div class="chat-win-content" ref="chatWin">
            <template v-if="ChatHistory.length">
                <div
                    v-for="chatMessage in ChatHistory"
                    :key="chatMessage.date"
                    class="message"
                    :class="{
                        'not-me': chatMessage.from !== localUserInfo.account,
                        'is-me': chatMessage.from === localUserInfo.account,
                        'up-message-is-same-person': thisMessageIsMe(chatMessage.from === localUserInfo.account)
                    }"
                >
                    <div class="message-content">
                        <span>{{ chatMessage.content }}</span>
                    </div>
                </div>
            </template>
        </div>
        <div class="input-box">
            <div class="input-textarea-box">
                <div class="textarea" contenteditable="true" spellcheck="false" ref="textareaBox" @keydown.shift.enter.prevent="SendMessage"></div>
            </div>
            <div class="send-btn-box">
                <a href="javascript:;" class="send-btn" @click.prevent="SendMessage">
                    <send theme="outline" size="20" fill="#fbfbfb" />
                </a>
            </div>
        </div>
    </div>
</template>

<script setup async>
import { ref, onMounted } from "vue"
import { Send } from "@icon-park/vue-next"
const { ipcRenderer } = require("electron")

const props = defineProps({
    name: String,
    account: String,
    avatar: String,
    localUserInfo: Object
})

const avatar = props.avatar === "none" ? "/src/assets/img/DefaultAvatar.jpg" : props.avatar
const ChatHistory = ref([])
const textareaBox = ref(null)
const chatWin = ref(null)
let upMessageIsMe = false

ChatHistory.value = await ipcRenderer.invoke("get account history message", props.account)

// 用户发送消息
function SendMessage() {
    if (textareaBox.value.innerText.length > 0) {
        ipcRenderer.send("send message", textareaBox.value.innerText)
        textareaBox.value.innerText = ""
    }
}

/**
 * @example 判断上一条消息是否为同一人发送
 * @param {Boolean} isMe
 */
function thisMessageIsMe(isMe) {
    if (isMe === upMessageIsMe) {
        return true
    } else {
        // 非同一人则修改为上一条消息为该人输入
        upMessageIsMe = isMe
        return false
    }
}

onMounted(() => {
    chatWin.value.scrollTo(0, 1000)
})

// 主进程有消息发送过来
ipcRenderer.on("message", (event, msg) => {
    // 该消息是本房间的
    console.log(msg)
    ChatHistory.value.push(msg)
    chatWin.value.scrollTo(0, 1000)
})
</script>

<style scoped lang="less">
.chat-win {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;

    // 标题
    .title {
        display: flex;
        width: 100%;
        height: 50px;
        justify-content: center;
        align-items: center;
        padding-left: 10px;
        font-size: 18px;
        background-color: var(--card-background-color);
        margin-bottom: 10px;

        img {
            display: block;
            width: 43px;
            height: 43px;
            border-radius: 25px;
        }

        p {
            margin-left: 10px;
        }
    }

    // 消息列表展示框
    .chat-win-content {
        flex: 1;
        overflow-y: scroll;
        overflow-x: hidden;
        padding: 0 10px 0 10px;
        background-color: var(--card-background-color);

        .message {
            width: 100%;
            min-height: 40px;
            height: auto;
            margin-top: 10px;

            // .avatar {
            //     width: 38px;
            //     height: 38px;
            //     border-radius: 20px;
            //     display: inline-block;
            //     background-size: cover;
            //     background-position: center;
            //     background-repeat: no-repeat;
            // }

            .message-content {
                display: inline-block;
                width: auto;
                height: auto;
                max-width: 60%;
                min-height: 30px;
                padding: 8px 16px;
                overflow-wrap: break-word;
                word-break: break-word;

                span {
                    font-size: 16px;
                    color: var(--text-color-two);
                }
            }
        }

        .not-me {
            text-align: left;
            padding: 5px 0 0 10px;

            .message-content {
                border-top-right-radius: 10px;
                border-bottom-left-radius: 10px;
                border-bottom-right-radius: 10px;
                box-shadow: 2px 2px 2px 1px var(--not-me-message-box-show), 3px 3px 2px 1px rgba(0, 0, 0, 0.3);
                background-color: var(--not-me-message-background-color);
            }
        }

        .is-me {
            text-align: right;
            padding: 5px 10px 0 0;

            .message-content {
                border-top-left-radius: 10px;
                border-bottom-left-radius: 10px;
                border-bottom-right-radius: 10px;
                box-shadow: 2px 2px 2px 1px var(--is-me-message-box-show), 3px 3px 2px 1px rgba(0, 0, 0, 0.3);
                background-color: var(--is-me-message-background-color);
            }
        }

        .up-message-is-same-person {
            margin-top: 0;
        }
    }

    // 输入框
    .input-box {
        display: flex;
        height: auto;
        min-height: 30px;
        max-height: 150px;
        padding: 10px 7px 7px 7px;
        justify-content: space-around;
        align-items: end;
        overflow: hidden;
        box-sizing: content-box;
        background-color: var(--card-background-color);

        .input-textarea-box {
            display: block;
            width: 86%;
            height: 100%;
            overflow: hidden;
            border-radius: 8px;
            box-shadow: 1px 1px 1px 1px #ccc;
            background-color: var(--card-background-color);

            .textarea {
                display: block;
                width: 100%;
                height: 100%;
                padding: 4px 0 0 10px;
                border: none;
                outline: none;
                font-size: 16px;
                text-indent: 16px;
                overflow-y: scroll;
                overflow-wrap: break-word;
                word-break: break-word;

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
            .send-btn {
                float: left;
                width: 50px;
                height: 28px;
                padding: 4px 10px 4px 10px;
                line-height: 20px;
                font-size: 16px;
                text-decoration: none;
                text-align: center;
                color: var(--text-color-two);
                border-radius: 8px;
                box-shadow: 1px 1px 1px 1px #ccc;
                background-color: var(--operable-box-prompt-color);
            }
        }
    }
}
</style>
