<template>
  <div id="logo"></div>
  <p></p>
  <div id="control-keys">
    <i class="iconfont icon-zuixiaohua" id="minimize" @click="() => ipcRenderer.send('window-minimize')"></i>
    <i class="iconfont icon-zuidahuaxi" id="maximize" ref="maximizeBtn" @click="() => ipcRenderer.send('window-maximize')"></i>
    <i class="iconfont icon-guanbi" id="closure" @click="MainWinDestroy"></i>
  </div>
</template>

<script setup>
import { ref } from "vue";
const { ipcRenderer } = require("electron");
const maximizeBtn = ref(null);
ipcRenderer.on("window-maximize", () => {
  console.log(maximizeBtn);
  maximizeBtn.value.setAttribute('class', 'iconfont icon-zuidahua')
});
ipcRenderer.on("window-unmaximize", () => maximizeBtn.value.setAttribute('class', 'iconfont icon-zuidahuaxi'));

function MainWinDestroy() {
  ipcRenderer.send('window-destroy');
  ipcRenderer.send('mainWin-destroy');
}
</script>

<style scoped lang="less">
#logo {
  width: 30px;
  height: 100%;
}

p {
  flex: 1;
  font-family: Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-size: 16px;
  letter-spacing: 1px;
  -webkit-app-region: drag;
}

#control-keys i {
  display: inline-block;
  width: 40px;
  height: 100%;
}
</style>