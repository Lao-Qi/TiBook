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
            @click="showFriendAccount = friend.account"
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
    <template v-if="showFriendAccount">
      <Suspense>
        <friend-info-win
            :account="showFriendAccount"
            >
        </friend-info-win>
      </Suspense>
    </template>
  </div>
  </div>
</template>

<script setup async>
import { onMounted, ref } from "vue";
import FriendInfoWin from "../components/friend-info-win.vue";
const { ipcRenderer } = require("electron");

const friendList = ref([]);
const showFriendAccount = ref(null);
friendList.value = await ipcRenderer.invoke("user-friendList");

onMounted(() => {
  document.querySelector("#title>p").innerHTML = "Contact";
})
</script>

<style lang="less" scoped>
.contact-page-box {
  display: flex;
  width: 100%;
  height: 100%;
  background-color: var(--theme-color-two);

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