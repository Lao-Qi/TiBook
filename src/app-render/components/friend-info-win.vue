<template>
    <div class="friend-info-box">
        <div class="basic-info">
            <div class="friend-name">
                {{ friendInfo.name }}
            </div>
            <div class="friend-avatar">
                <img :src="friendInfo.avatar" />
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
                <span class="right">{{ account }}</span>
            </div>
        </div>
        <div class="info-border"></div>
        <div class="button" @click="GoChatWin">
            <p class="send-message-button">发送消息</p>
        </div>
    </div>
</template>

<script setup>
import { inject, defineProps, ref } from "vue"

const props = defineProps({
    account: String,
    addTime: Number
})

const TIBOOK = window.TIBOOK
const toggleOptions = inject("toggleOptions")
const friendInfo = ref({})

TIBOOK.serverRequest("SearchUser", props.account, result => {
    if (result.code === 200) {
        friendInfo.value = result
    }
})

const date = new Date(props.addTime)
const addTime = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`

function GoChatWin() {
    TIBOOK.socketCommunicate("ToggleRoom", props.account, result => {
        if (result.code === 200) {
            toggleOptions("message")
        }
    })
}
</script>

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
