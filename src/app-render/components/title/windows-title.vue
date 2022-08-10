<template>
    <div id="logo">
        <img src="../../assets/icons/tibook-login.svg" alt="题书" />
    </div>
    <p></p>
    <div class="window-controls-container">
        <div class="window-icon window-minimize" @click="() => TIBOOK.send('window-minimize')"></div>
        <div class="window-icon" :class="isMaximize ? 'window-unmaximize' : 'window-maximize'" ref="maximizeBtn" @click="() => TIBOOK.send('window-maximize')"></div>
        <div class="window-icon window-close" @click="() => TIBOOK.send('window-close')"></div>
    </div>
</template>

<script setup>
import { ref } from "vue"

const TIBOOK = window.TIBOOK
const isMaximize = ref(false)
TIBOOK.on("window-maximize", () => (isMaximize.value = true))
TIBOOK.on("window-unmaximize", () => (isMaximize.value = false))
</script>

<style scoped lang="less">
#logo {
    width: 30px;
    height: 100%;

    img {
        width: 100%;
        height: 100%;
    }
}

p {
    flex: 1;
    font-family: Haettenschweiler, "Arial Narrow Bold", sans-serif;
    font-size: 16px;
    letter-spacing: 1px;
    -webkit-app-region: drag;
}

.window-controls-container {
    display: flex;
}

.window-controls-container div {
    width: 46px;
    height: 100%;
}
</style>
