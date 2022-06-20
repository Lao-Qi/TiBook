<template>
  <div class="contact-page-box">
    <div class="side-bar">
      <div class="newFriendBox side-ber-el">
      <img alt="新好友" src="../assets/img/DefaultAvatar.jpg">
      <div class="text-content">新朋友</div>
    </div>
    <template v-if="friendList.length">
      <div class="friendList">
        <div
            v-for="friend in friendList"
            :key="friend.account"
            class="side-ber-el"
            @click="ExhibitionFriend = friend"
        >
          <img
              :alt="friend.name"
              :src="friend.avatar !== 'none' ?
                    `http://127.0.0.1:8080/user/avatar/${friend.avatar}` : '/src/assets/img/DefaultAvatar.jpg'"
          >
          <div class="text-content">{{ friend.name }}</div>
        </div>
      </div>
    </template>
  </div>
  <div class="contact-info-box">
    <template v-if="ExhibitionFriend.account">
      <friend-info-win
          :add-obj="friendAddTimeList.find(item => item.account === ExhibitionFriend.account)"
          :friend="ExhibitionFriend">
      </friend-info-win>
    </template>
  </div>
  </div>
</template>

<script setup async>
import { onMounted, ref } from "vue";
import { ElNotification } from "element-plus";
import FriendInfoWin from "../components/friend-info-win.vue";
const { ipcRenderer } = require("electron");

const friendList = ref([]);
const friendAddTimeList = ref([]);
const ExhibitionFriend = ref({})

// 获取好友列表信息
const friendsData = await ipcRenderer.invoke("user-friendsList");
if (friendsData) {
  friendList.value = friendsData.userList;
} else {
  ElNotification({
    title: "用户列表获取失败",
    message: `error: ${friendsData.msg}; code: ${friendsData.code}`,
    duration: 3000,
    type: "error",
    showClose: false,
    offset: 20
  })
}

onMounted(() => {
  document.querySelector("#title>p").innerHTML = "Contact";
})
</script>

<style lang="less" scoped>
.contact-page-box {
  display: flex;
  width: 100%;
  height: 100%;
  background-color: var(--theme-color-one);

  .side-bar {
    width: 240px;
    height: 100%;
    border-right: 2px solid #fff;

    .side-ber-el {
      transition: all 0.3s ease;
      position: relative;
      width: 100%;
      height: 60px;
      border-bottom: 2px solid #eee;

      &:hover {
        background-color: #9da5b4;

        .text-content {
          color: #fff;
        }
      }

      img {
        position: absolute;
        top: 50%;
        left: 10px;
        transform: translateY(-50%);
        width: 50px;
        height: 50px;
        border-radius: 10px;
      }
    }

    .text-content {
      position: absolute;
      top: 45%;
      left: 70px;
      transform: translateY(-50%);
      font-size: 16px;
    }
  }

  .contact-info-box {
    display: flex;
    flex: 1;
    justify-content: center;
  }
}
</style>