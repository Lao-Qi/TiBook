<template>
    <div class="friend-info-box">
        <div class="basic-info">
            <div class="friend-name">
                {{ friendInfoOnServer.name }}
            </div>
            <div class="friend-avatar">
                <img :src="src" :alt="friendInfoOnServer.name" />
            </div>
        </div>
        <div class="basic-border"></div>
        <div class="info">
            <div>
                <span class="left">添加时间： </span>
                <span class="right">{{ addTime }}</span>
            </div>
            <div>
                <span class="left">账号： </span>
                <span class="right">{{ friendInfoOnServer.account }}</span>
            </div>
        </div>
        <div class="info-border"></div>
        <div class="button" @click="GoChatWin">
            <p class="send-message-button">发送消息</p>
        </div>
    </div>
</template>

<script>
import { inject } from "vue"
const { ipcRenderer } = require("electron")
export default {
    name: "friendInfoWin",
    props: {
        account: String
    },
    async setup(props) {
        const toggleOptions = inject("toggleOptions")
        const friendInfoOnServer = await ipcRenderer.invoke("get-user-info", props.account)
        const localInfo = await ipcRenderer.invoke("get local friend info", props.account)

        const src = friendInfoOnServer.avatar === "none" ? "/src/assets/img/DefaultAvatar.jpg" : `http://127.0.0.1:8080/static/user/avatar/${friendInfoOnServer.avatar}`
        const date = new Date(localInfo.AddTime)
        const addTime = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`

        function GoChatWin() {
            ipcRenderer.send("contactPage Go ChatWin", props.account)
            ipcRenderer.on("contactPage Go ChatWin return", (event, isGo) => {
                if (isGo) {
                    toggleOptions("message")
                } else {
                    console.log("跳转失败")
                }
            })
        }

        return {
            friendInfoOnServer,
            src,
            addTime,
            GoChatWin
        }
    }
}
</script>

<!-- <script setup async>
import { onMounted } from "vue"
const { ipcRenderer } = require("electron")
const props = defineProps({
    account: String,
})

function GoChatWin() {
    onMounted(() => {
        console.log(this)
    })
    // ipcRenderer.send("contactPage Go ChatWin", props.account)
    // ipcRenderer.on("contactPage Go ChatWin return", (event, isGo) => {
    //     if (isGo) {
    //         this
    //     } else {
    //         console.log("跳转失败")
    //     }
    // })
}

const friendInfoOnServer = await ipcRenderer.invoke("get-user-info", props.account)
const localInfo = await ipcRenderer.invoke("get local friend info", props.account)

const src = friendInfoOnServer.avatar === "none" ? "/src/assets/img/DefaultAvatar.jpg" : `http://127.0.0.1:8080/static/user/avatar/${friendInfoOnServer.avatar}`
const date = new Date(localInfo.AddTime)
const addTime = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
</script> -->

<style scoped lang="less">
.friend-info-box {
    position: relative;
    width: 80%;
    height: 100%;
    padding-top: 100px;

    .basic-info {
        display: flex;
        width: 100%;
        height: 130px;
        justify-content: space-evenly;

        .friend-name {
            padding-top: 10px;
            font-size: 20px;
        }

        .friend-avatar {
            width: 100px;
            height: 100px;

            img {
                width: 100%;
                height: 100%;
                border-radius: 10px;
            }
        }
    }

    .basic-border {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        width: 85%;
        height: 0.8px;
        border-radius: 2px;
        background-color: #ccc;
    }

    .info {
        padding-top: 20px;
        & > div {
            display: flex;
            justify-content: space-between;
            padding: 0 60px 20px 60px;
            .right {
                width: 70%;
                text-align: left;
            }
        }
    }

    .info-border {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        width: 85%;
        height: 0.8px;
        border-radius: 2px;
        background-color: #ccc;
    }

    .button {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        height: 50px;
        padding-top: 30px;
        text-align: center;

        .send-message-button {
            display: inline-block;
            width: 100px;
            height: 40px;
            line-height: 40px;
            background-color: #353a45;
            border-radius: 10px;
            border: 2px solid #fff;
            cursor: pointer;
        }
    }
}
@media only screen and (max-width: 850px) {
    .friend-info-box {
        width: 100%;
    }
}
</style>
