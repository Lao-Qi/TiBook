<template>
  <div id="title">
    <template v-if="SystemType === 'Windows_NT'">
      <windows-title></windows-title>
    </template>
    <template v-if="SystemType === 'Darwin'">
      <mac-title></mac-title>
    </template>
    <template v-if="SystemType === 'Linux'">
      <linux-title></linux-title>
    </template>
  </div>
  <div id="view">
    <router-view></router-view>
  </div>
</template>

<script setup>
import WindowsTitle from "./components/title/windows-title.vue";
import MacTitle from "./components/title/mac-title.vue";
import LinuxTitle from "./components/title/linux-title.vue";
import { useRouter } from "vue-router";
const { type } = require("os");

const router = useRouter();
const SystemType = type();

router.replace({
  path: "/login"
})

</script>

<style lang="less">
#app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

#title {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 25px;
  text-align: center;
  font-size: 13px;
  line-height: 25px;
  background-color: var(--background-color);
}

#view {
  padding: 0 25px 25px 25px;
}
</style>
