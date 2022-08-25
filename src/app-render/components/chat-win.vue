<script setup>
import { ref, inject, watch } from "vue"
// import { Send } from "@icon-park/vue-next"
import Notification from "./notification-popup"

const TIBOOK = window.TIBOOK
const userAccount = TIBOOK.env["USER_CONFIG"]["user_data"]["info"]["account"]
const props = defineProps({
    chatUser: Object
})

const historyChatMessageList = ref([])
const textareaBox = ref(null)
let upMessageIsMe = false

TIBOOK.localOperation("OnDemandFindCorrespondAccountMessage", props.chatUser.account, 0, 20, result => {
    console.log("本地聊天记录", result)
    historyChatMessageList.value = result
})

watch(inject("newMessage"), newMessage => {
    historyChatMessageList.value.push(newMessage)
    console.log("newMessage", newMessage)
})

// 用户发送消息
function SendMessage() {
    const contentText = String(textareaBox.value.innerText)
    if (contentText.trim().length) {
        TIBOOK.socketCommunicate("SendTextMessage", { content: contentText }, result => {
            console.log(result)
        })
        textareaBox.value.innerText = ""
    } else {
        Notification({
            title: "聊天窗状态",
            content: "发送的消息不能为空"
        })
    }
}

/**
 * 判断上一条消息是否为同一人发送
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
</script>

<template>
    <div class="chat-win-container view-element-container">
        <div class="container-title">
            <img :src="chatUser.avatar" :alt="chatUser.name" />
            <p>{{ chatUser.name }}</p>
            <div class="chat-win-operation"></div>
        </div>
        <div class="message-list-container">
            <template v-if="historyChatMessageList.length">
                <div
                    v-for="historyMessage in historyChatMessageList"
                    :key="historyMessage.id"
                    class="message"
                    :class="{
                        'not-me': historyMessage.from !== userAccount,
                        'is-me': historyMessage.from === userAccount,
                        'up-message-is-same-person': thisMessageIsMe(historyMessage.from === userAccount)
                    }"
                >
                    <div class="message-content">
                        <span>{{ historyMessage.content }}</span>
                    </div>
                </div>
            </template>
        </div>
        <div class="chat-win-input-container">
            <div class="input-textarea" contenteditable="true" spellcheck="false" ref="textareaBox" @keydown.enter.prevent="SendMessage"></div>
            <!-- <div class="send-message-btn-container">
                <send theme="outline" size="20" fill="#fbfbfb" />
            </div> -->
        </div>
    </div>
</template>

<style scoped lang="less">
.chat-win-container {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;

    // 标题
    .container-title {
        display: flex;
        width: 100%;
        height: 50px;
        justify-content: space-between;
        align-items: center;
        padding-inline: 10px;
        margin-bottom: 10px;
        border-radius: 0 0 0 0;

        img {
            width: 40px;
            height: 40px;
        }

        p {
            margin-left: 15px;
            margin-top: 3px;
            font-size: 18px;
        }

        .chat-win-operation {
            width: 20%;
            height: 100%;
        }
    }

    // 消息列表展示框
    .message-list-container {
        flex: 1;
        overflow-y: scroll;
        overflow-x: hidden;

        .message {
            width: 100%;
            min-height: 40px;
            height: auto;
            margin-top: 10px;

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
                }
            }
        }

        .not-me {
            text-align: left;
            padding: 5px 0 0 10px;

            .message-content {
                border-top-right-radius: 20px;
                border-bottom-left-radius: 20px;
                border-bottom-right-radius: 20px;
                background-color: var(--not-me-message-background-color);
            }
        }

        .is-me {
            text-align: right;
            padding: 5px 10px 0 0;

            .message-content {
                color: #fff;
                border-top-left-radius: 20px;
                border-bottom-left-radius: 20px;
                border-bottom-right-radius: 20px;
                background-color: var(--is-me-message-background-color);
            }
        }

        .up-message-is-same-person {
            margin-top: 0;
        }
    }

    // 输入框
    .chat-win-input-container {
        display: flex;
        height: auto;
        min-height: 30px;
        max-height: 150px;
        padding: 10px 7px 7px 7px;
        justify-content: space-between;
        align-items: end;

        .input-textarea {
            display: block;
            width: 100%;
            height: auto;
            min-height: 30px;
            max-height: 200px;
            padding: 4px 0 0 10px;
            font-size: 16px;
            border-radius: 10px;
            text-indent: 10px;
            box-shadow: var(--container-inset-show);
            background-color: var(--input-box-background-color);
            overflow-y: scroll;
            overflow-x: hidden;
            overflow-wrap: break-word;
            word-break: break-word;
            border: none;
            outline: none;
        }

        // .send-message-btn-container {
        //     float: left;
        //     width: 50px;
        //     height: 28px;
        //     padding: 4px 10px 4px 10px;
        //     line-height: 20px;
        //     font-size: 16px;
        //     text-decoration: none;
        //     text-align: center;
        //     color: var(--text-color-two);
        //     border-radius: 8px;
        //     box-shadow: 1px 1px 1px 1px #ccc;
        //     background-color: var(--cue--line-color);
        //     cursor: pointer;
        // }
    }
}
</style>
