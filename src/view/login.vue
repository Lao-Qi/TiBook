<template>
    <div class="page-content">
        <div
            :class="{
                'background-box': true,
                'background-box-transition': isBackgroundBoxStartTransition,
            }"
        ></div>
        <div class="chat-window-container">
            <div class="chat-window-title">
                <p>登录</p>
            </div>
            <div class="chat-message-content-container">
                <div class="chat-message-content-container-inset-border">
                    <template v-if="MessageList.length">
                        <div
                            v-for="(message, index) in MessageList"
                            :key="index"
                            :class="{
                                'message-box': true,
                                'is-me': message.isMe,
                                'not-me': !message.isMe,
                                'up-message-is-same-person': ThisMessageIsMe(
                                    message.isMe
                                ),
                            }"
                        >
                            <div class="message-content">
                                {{ message.content }}
                            </div>
                        </div>
                    </template>
                </div>
            </div>
            <div
                class="chat-input-container"
                :class="{
                    'changes-in-input-focus': inputConfig.focus,
                }"
            >
                <div class="input-box">
                    <input
                        :type="inputConfig.type"
                        :placeholder="inputConfig.placeholder"
                        v-model="inputConfig.content"
                        @focus="inputConfig.focus = true"
                        @blur="inputConfig.focus = false"
                        @keydown.enter="userSendMessage"
                    />
                    <p>{{ inputConfig.content }}</p>
                </div>
                <div class="message-send-btn">
                    <a
                        href="javascript:"
                        class="iconfont icon-send"
                        @click="userSendMessage"
                    ></a>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"
const { ipcRenderer } = require("electron")

const router = useRouter()

// 输入框的配置信息
const inputConfig = reactive({
    focus: false,
    type: "text",
    placeholder: "账号",
    content: "",
})

// 用户输入的信息
const userInputInfo = reactive({
    name: "",
    account: "",
    pw: "",
    // 用户当前的状态 login | register
    state: "login",
})

// 上一条消息是否为自己输入
let upMessageIsMe = false
// 显示的消息列表
const MessageList = reactive([])
const isBackgroundBoxStartTransition = ref(false)

function ThisMessageIsMe(isMe) {
    if (isMe === upMessageIsMe) {
        return true
    } else {
        upMessageIsMe = isMe
        return false
    }
}

// 用户发送消息
function userSendMessage() {
    if (userInputInfo.state === "login") {
        LoginUser()
    } else if (userInputInfo.state === "register") {
        RegisterUser()
    }

    MessageList.push({
        content: inputConfig.content,
        isMe: true,
    })
    inputConfig.content = ""
}

function LoginUser() {
    if (inputConfig.type === "text") {
        userInputInfo.account = inputConfig.content
        inputConfig.type = "password"
        inputConfig.placeholder = "密码"
    } else if (inputConfig.type === "password") {
        userInputInfo.pw = inputConfig.content
        inputConfig.type = "text"
        inputConfig.placeholder = "..."

        ipcRenderer.send("login", { ...userInputInfo })
        ipcRenderer.send("")
    }
}

function RegisterUser() {}

onMounted(() => {
    isBackgroundBoxStartTransition.value = true

    MessageList.push({
        content: "请输入账号",
        isMe: false,
    })
})
</script>

<style scoped lang="less">
.page-content {
    width: 100%;
    max-width: 800px;
    height: 100%;
    display: flex;
    justify-content: right;
    margin-top: 5px;
    border-radius: 10px;

    /**
    背景盒子
  */
    .background-box {
        position: absolute;
        top: -400px;
        left: -400px;
        width: 30vw;
        height: 30vw;
        z-index: -1;
        background-color: var(--not-me-message-box-show);
        border: 1vw solid var(--card-background-color);
        transition: all ease 0.4s;
    }

    .background-box-transition {
        top: 50px;
        left: 50px;
        filter: blur(5px);
        border-radius: calc(35vw / 2);
    }

    /** 
    聊天窗口 
  */
    .chat-window-container {
        width: 300px;
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-radius: 10px;
        box-shadow: 2px 3px 5px 0 rgba(0, 0, 0, 0.4);
        background-color: var(--card-background-color);

        .chat-window-title {
            width: 100%;
            height: 35px;
            font-size: 18px;
            line-height: 40px;
            text-align: center;
            font-weight: 700;
        }

        .chat-message-content-container {
            flex: 1;
            padding: 5px 7px;

            .chat-message-content-container-inset-border {
                width: 100%;
                height: 100%;
                padding: 10px 10px 5px 10px;
                border-radius: 10px;
                box-shadow: 2px 2px 4px 1px inset rgba(0, 0, 0, 0.4);

                .message-box {
                    display: flex;
                    width: 100%;
                    height: auto;
                    padding-top: 20px;

                    .message-content {
                        display: inline-block;
                        width: auto;
                        height: auto;
                        padding: 5px 10px;
                        color: var(--card-background-color);
                    }
                }

                .not-me {
                    padding-right: 25px;
                    justify-content: left;

                    .message-content {
                        border-radius: 0 10px 10px 15px;
                        box-shadow: 2px 2px 2px 1px
                                var(--not-me-message-box-show),
                            3px 3px 2px 1px rgba(0, 0, 0, 0.3);
                        background-color: var(
                            --not-me-message-background-color
                        );
                    }
                }

                .is-me {
                    padding-left: 25px;
                    justify-content: right;

                    .message-content {
                        border-radius: 10px 0 10px 10px;
                        box-shadow: 2px 2px 2px 1px
                                var(--is-me-message-box-show),
                            3px 3px 2px 1px rgba(0, 0, 0, 0.3);
                        background-color: var(--is-me-message-background-color);
                    }
                }

                .up-message-is-same-person {
                    padding-top: 8px;
                }
            }
        }

        .chat-input-container {
            display: flex;
            width: 100%;
            height: 60px;
            padding: 10px 5px 20px 5px;
            justify-content: space-evenly;
            transition: all 0.3s ease;

            .input-box {
                width: 80%;
                height: 100%;
                border-radius: 10px;
                box-shadow: 2px 2px 3px 1px rgba(0, 0, 0, 0.4);
                overflow: hidden;
                transition: all 0.3s ease;

                input {
                    width: 100%;
                    height: 100%;
                    font-size: 16px;
                    color: var(--text-color);
                    padding-left: 10px;
                    outline: none;
                    border-radius: 10px;
                    border: none;
                    background-color: transparent;
                    transition: all 0.3s ease;

                    &:hover {
                        box-shadow: 2px 2px 3px 1px rgba(0, 0, 0, 0.4),
                            2px 1px 3px 1px inset rgba(0, 0, 0, 0.4);
                    }

                    &:focus {
                        box-shadow: 2px 2px 3px 1px rgba(0, 0, 0, 0.4),
                            2px 1px 3px 1px inset rgba(0, 0, 0, 0.4);
                    }
                }
            }

            .message-send-btn {
                width: 15%;
                height: 100%;
                border-radius: 10px;
                transition: all 0.3s ease;

                a {
                    display: flex;
                    width: 100%;
                    height: 100%;
                    justify-content: center;
                    align-items: center;
                    text-decoration: none;
                    font-size: 16px;
                    border-radius: 10px;
                    background-color: var(--theme-color-one);
                    box-shadow: 2px 2px 3px 1px rgba(0, 0, 0, 0.4);
                    transition: all 0.3s ease;

                    &:hover {
                        box-shadow: 2px 2px 3px 1px rgba(0, 0, 0, 0.4),
                            2px 1px 3px 1px inset rgba(0, 0, 0, 0.4);
                    }

                    &:before {
                        color: var(--card-background-color);
                    }
                }
            }
        }

        .changes-in-input-focus {
            height: 80px;

            .input-box {
                height: 35px;
            }

            .message-send-btn {
                height: 35px;
            }
        }
    }
}
</style>
