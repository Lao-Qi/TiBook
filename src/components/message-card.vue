<template>
  <div class="message-card-box">
    <div class="avatar">
      <img :src="avatar" :alt="name">
    </div>
    <div class="text">
      <div class="name">
        <span>{{name}}</span>
        <span class="date">{{showDate}}</span>
      </div>
      <div class="message">
        <p>{{message}}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
const { ipcRenderer } = require("electron");

const props = defineProps({
  name: String,
  account: String,
  avatar: String,
  message: String,
  date: Number
})

const avatar = ref(null); // 头像
const message = ref(null); // 最近消息
const date = ref(null); // 最近消息发送时间
const showDate = ref(null); // 要显示的时间

avatar.value = props.avatar === "none" ? "/src/assets/img/DefaultAvatar.jpg" : props.avatar;
message.value = props.message.length > 15 ? `${props.message.slice(0, 15)}...` : props.message;
showDate.value = ConversionTime(props.date);

// 绑定该用户卡片的消息，用户切换消息卡片上的消息
ipcRenderer.on(`new messageCard ${props.account}`, (event, card) => {
  avatar.value = card.avatar;
  message.value = card.msg.content; // 更好内容与时间
  showDate.value = ConversionTime(card.msg.date);
})



// 转换时间方法
function ConversionTime(ts) {
  // 今天的时间
  const todayTime = new Date();
  const messageDate = new Date(ts);
  todayTime.setSeconds(0);
  todayTime.setHours(0);
  todayTime.setMinutes(0);
  // 今天的消息
  if(todayTime.getTime() <= ts) {
    let Hours = messageDate.getHours();
    let Minutes = messageDate.getMinutes();

    return `${ZeroFilling(Hours)}:${ZeroFilling(Minutes)}`;

    // 不是今天的消息
  }else {
    return `${messageDate.getFullYear()}/${ZeroFilling(messageDate.getMonth() + 1)}/${ZeroFilling(messageDate.getDate())}`;
  }
}

// 补零
function ZeroFilling(num) {
  return num < 10 ? '0' + num : num;
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
  transition: all ease 0.3s;

  &:hover {
    background-color: rgba(163, 170, 183, 0.1);
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