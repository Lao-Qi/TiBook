<template>
    <div class="message-card-box">
        <div class="avatar user-info">
            <img :src="showAvatar" :alt="name" />
        </div>
        <div class="text">
            <div class="name user-info">
                <span>{{ name }}</span>
                <span class="date user-info">{{ showDate }}</span>
            </div>
            <div class="message user-info">
                <p>{{ showMessage }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue"
const { ipcRenderer } = require("electron")

const props = defineProps({
    name: String,
    account: String,
    avatar: String,
    message: String,
    date: Number,
})

const initAvatar = ref(props.avatar) // 初始头像
const initDate = ref(props.date) // 初始消息的时间戳
const initMessage = ref(props.message) // 初始消息

const showAvatar = computed(() => (initAvatar.value === "none" ? "/src/assets/img/DefaultAvatar.jpg" : initAvatar.value))
const showMessage = computed(() => (initMessage.length > 15 ? `${initMessage.slice(0, 15)}...` : initMessage))
const showDate = computed(() => conversionTime(initDate.value))

// 绑定该用户卡片的消息，用户切换消息卡片上的消息
ipcRenderer.on(`new message to ${props.account}`, (event, { content, date }) => {
    // 更新内容与时间
    console.log(content, date)
    initMessage.value = content
    initDate.value = date
})

// 转换时间方法
function conversionTime(ts) {
    // 今天的时间
    const todayTime = new Date()
    const messageDate = new Date(ts)
    todayTime.setSeconds(0)
    todayTime.setHours(0)
    todayTime.setMinutes(0)
    // 今天的消息
    if (todayTime.getTime() <= ts) {
        let Hours = messageDate.getHours()
        let Minutes = messageDate.getMinutes()

        return `${zeroFilling(Hours)}:${zeroFilling(Minutes)}`

        // 不是今天的消息
    } else {
        return `${messageDate.getFullYear()}/${zeroFilling(messageDate.getMonth() + 1)}/${zeroFilling(messageDate.getDate())}`
    }
}

// 补零
function zeroFilling(num) {
    return num < 10 ? "0" + num : num
}
</script>

<style scoped lang="less">
.message-card-box {
    position: relative;
    display: flex;
    width: 100%;
    height: 70px;
    padding: 3px 10px 6px 20px;
    cursor: pointer;
    box-sizing: border-box;
    background-color: var(--card-background-color);

    .user-info {
        z-index: 999;
    }

    .avatar {
        width: 50px;
        height: 50px;
        border-radius: 30px;
        align-self: center;
        overflow: hidden;

        img {
            width: 100%;
            height: 100%;
        }
    }

    .text {
        flex: 1;
        padding: 3px 10px 5px 10px;

        .name {
            position: relative;
            margin-bottom: 10px;
            font-size: 16px;

            .date {
                position: absolute;
                right: 10px;
                font-size: 13px;
                color: var(--message-card-color);
            }
        }

        .message {
            font-size: 14px;
            color: var(--message-card-color);
        }
    }
}
</style>
