<template>
    <div class="page-content">
        <div
            :class="{
                'background-box': true,
                'background-box-transition': isBackgroundBoxStartPlayAnimation
            }"
        ></div>
        <div class="slogan-text-box">
            <a href="javascript:;" class="register-btn" @click="changeCahtWindow">
                <h1>前往{{ userInputInfo.slogan }}</h1>
            </a>
        </div>
        <div class="chat-window-container">
            <div class="chat-window-title">
                <p>{{ userInputInfo.title }}</p>
            </div>
            <div class="chat-message-content-container">
                <div class="chat-message-content-container-inset-show">
                    <template v-if="MessageList.length">
                        <div
                            v-for="message in MessageList"
                            :key="message"
                            :class="{
                                'message-box': true,
                                'is-me': message.isMe,
                                'not-me': !message.isMe,
                                'up-message-is-same-person': (message.isMe === upMessageIsMe ? true : (upMessageIsMe = message.isMe), false)
                            }"
                        >
                            <div
                                :class="{
                                    'message-content': true,
                                    'message-content-animation': isMessageListStartPlayAnimation,
                                    'not-me-message-animation': !message.isMe && isMessageListStartPlayAnimation,
                                    'is-me-message-animation': message.isMe && isMessageListStartPlayAnimation
                                }"
                            >
                                {{ message.content }}
                            </div>
                        </div>
                    </template>
                </div>
            </div>
            <div
                class="chat-input-container"
                :class="{
                    'changes-in-input-focus': inputConfig.focus
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
                    <a href="javascript:" class="iconfont icon-send" @click="userSendMessage"></a>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue"
const { ipcRenderer } = require("electron")

// 输入框的配置信息
const inputConfig = reactive({
    focus: false,
    type: "text",
    contentPurpose: "account",
    placeholder: "账号",
    content: ""
})

// 用户输入的信息
const userInputInfo = reactive({
    name: "",
    account: "",
    password: "",
    // 用户当前的状态 login | register
    state: "login",
    // 页面标语 注册 | 登录
    slogan: "注册",
    // 聊天窗口标题 注册 | 登录
    title: "登录"
})
// 是否开启背景盒子动画
const isBackgroundBoxStartPlayAnimation = ref(false)
// 是否开启消息动画
const isMessageListStartPlayAnimation = ref(false)
// 上一条消息是否为自己输入
let upMessageIsMe = false
// 显示的消息列表
let MessageList = ref([])

// 切换聊天窗口功能的函数集合
const changeChatWindowOperationFunMap = {
    login: () => {
        // 改变为注册功能
        userInputInfo.title = "注册"
        userInputInfo.slogan = "登录"
        userInputInfo.state = "register"
        inputConfig.contentPurpose = "name"
        inputConfig.type = "text"
        inputConfig.placeholder = "名称"

        MessageList.value.push({
            content: "请输入用户名称",
            isMe: false
        })
    },
    register: () => {
        // 改变为登录功能
        userInputInfo.title = "登录"
        userInputInfo.slogan = "注册"
        userInputInfo.state = "login"
        inputConfig.contentPurpose = "account"
        inputConfig.type = "text"
        inputConfig.placeholder = "账号"

        MessageList.value.push({
            content: "请输入账号",
            isMe: false
        })
    }
}

// 用户发送消息功能的操作函数集合
const userSendMessageOperationFunMap = {
    login: {
        account: () => {
            inputConfig.type = "password"
            inputConfig.placeholder = "密码"
            inputConfig.contentPurpose = "password"

            MessageList.value.push({
                content: "请输入账户密码",
                isMe: false
            })
        },
        password: () => {
            inputConfig.type = "text"
            inputConfig.placeholder = "..."

            // 调用后台登录事件
            ipcRenderer.send("login", userInputInfo.account, userInputInfo.password)

            MessageList.value.push({
                content: "正在登录中...",
                isMe: false
            })
        }
    },
    register: {
        name: () => {
            inputConfig.type = "text"
            inputConfig.contentPurpose = "account"
            inputConfig.placeholder = "账号"

            MessageList.value.push({
                content: "请输入账户",
                isMe: false
            })
        },
        account: () => {
            inputConfig.type = "password"
            inputConfig.contentPurpose = "password"
            inputConfig.placeholder = "该账户的密码"

            MessageList.value.push({
                content: "请输入该账户的密码",
                isMe: false
            })
        },
        password: () => {
            inputConfig.type = "text"
            inputConfig.contentPurpose = "text"
            inputConfig.placeholder = "..."

            ipcRenderer.send("register", userInputInfo.name, userInputInfo.account, userInputInfo.password)

            MessageList.value.push({
                content: "注册账户中，请稍等",
                isMe: false
            })
        }
    }
}

// 服务器返回消息功能的操作函数集合
const serverReturnOperationFunMap = {
    login: () => {
        MessageList.value.push({
            content: "正在跳转主页...",
            isMe: false
        })
        ipcRenderer.send("login-complete-open-mainWin")
    },
    register: () => {
        changeChatWindowOperationFunMap["register"]()

        MessageList.value = []
        userInputInfo.name = ""
        userInputInfo.password = ""

        inputConfig.contentPurpose = "password"
        inputConfig.type = "password"
        inputConfig.placeholder = "密码"

        MessageList.value.push({
            content: `账户已录入： { ${userInputInfo.account} }`,
            isMe: false
        })
        MessageList.value.push({
            content: "请输入该账户的密码",
            isMe: false
        })
    }
}

/**
 * @example 改变聊天窗口的功能 login | register
 */
function changeCahtWindow() {
    // 清空聊天窗记录和用户输入的信息
    MessageList.value = []
    userInputInfo.name = ""
    userInputInfo.account = ""
    userInputInfo.password = ""
    inputConfig.content = ""

    // 改变窗口的功能
    changeChatWindowOperationFunMap[userInputInfo.state]()
}

/**
 * @example 用户发送消息
 */
function userSendMessage() {
    MessageList.value.push({
        content: inputConfig.content,
        isMe: true
    })
    userInputInfo[inputConfig.contentPurpose] = inputConfig.content

    // 找到用户当前页面(userInputInfo.state)上的可操作方法，找到当前对应进度的操作方法(inputConfig.contentPurpose)
    userSendMessageOperationFunMap[userInputInfo.state][inputConfig.contentPurpose]()
    inputConfig.content = ""
}

onMounted(() => {
    MessageList.value.push({
        content: "请输入账号",
        isMe: false
    })

    // 延时添加动画，等到窗口加载完毕并显示出来时添加动画
    setTimeout(() => {
        isBackgroundBoxStartPlayAnimation.value = true
        setTimeout(() => {
            isMessageListStartPlayAnimation.value = true
        }, 5)
    }, 10)
})

// 服务端返回的消息
ipcRenderer.on("server-return-message", (event, msg, code) => {
    MessageList.value.push({
        content: msg,
        isMe: false
    })
    console.log(code, userInputInfo.state)
    code === 200 && serverReturnOperationFunMap[userInputInfo.state]()
})
</script>

<style scoped lang="less">
.page-content {
    display: flex;
    width: 100%;
    max-width: 800px;
    height: 100%;
    padding: 5px 25px 25px 25px;
    justify-content: right;
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
        background-color: rgba(199, 108, 52, 0.7);
        border: 1vw solid var(--card-background-color);
        filter: blur(3px);
        transition: all ease 1s;
    }

    .background-box-transition {
        top: 50px;
        left: 50px;
        border-radius: calc(35vw / 2);
    }

    /**
        标语盒子
    */
    .slogan-text-box {
        position: absolute;
        top: 150px;
        left: 200px;

        a {
            font-size: 20px;
            color: var(--text-colo);
        }
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

            .chat-message-content-container-inset-show {
                width: 100%;
                height: 100%;
                padding: 10px 10px 5px 10px;
                overflow: hidden;
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
                        opacity: 0;
                        padding: 5px 10px;
                        color: var(--text-color-two);
                        transition: all ease 1s;
                    }

                    .message-content-animation {
                        opacity: 1;
                    }
                }

                .not-me {
                    padding-right: 25px;
                    justify-content: left;

                    .message-content {
                        border-radius: 0 10px 10px 15px;
                        box-shadow: 2px 2px 2px 1px var(--not-me-message-box-show), 3px 3px 2px 1px rgba(0, 0, 0, 0.3);
                        background-color: var(--not-me-message-background-color);
                    }
                }

                .is-me {
                    padding-left: 25px;
                    justify-content: right;

                    .message-content {
                        border-radius: 10px 0 10px 10px;
                        box-shadow: 2px 2px 2px 1px var(--is-me-message-box-show), 3px 3px 2px 1px rgba(0, 0, 0, 0.3);
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
                        box-shadow: 2px 2px 3px 1px rgba(0, 0, 0, 0.4), 2px 1px 3px 1px inset rgba(0, 0, 0, 0.4);
                    }

                    &:focus {
                        box-shadow: 2px 2px 3px 1px rgba(0, 0, 0, 0.4), 2px 1px 3px 1px inset rgba(0, 0, 0, 0.4);
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
                    background-color: var(--operable-box-prompt-color);
                    box-shadow: 2px 2px 3px 1px rgba(0, 0, 0, 0.4);
                    transition: all 0.3s ease;

                    &:hover {
                        box-shadow: 2px 2px 3px 1px rgba(0, 0, 0, 0.4), 2px 1px 3px 1px inset rgba(0, 0, 0, 0.4);
                    }

                    &:before {
                        color: var(--text-color-two);
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
