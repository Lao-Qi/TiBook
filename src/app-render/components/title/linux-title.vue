<script setup>
import { ref } from "vue"
import { Close, FullScreen, OffScreen, Minus } from "@icon-park/vue-next"
import SearchBox from "./search-box.vue"

const TIBOOK = window.TIBOOK
const isMaximize = ref(false)

TIBOOK.on("window-maximize", () => (isMaximize.value = true))
TIBOOK.on("window-unmaximize", () => (isMaximize.value = false))
</script>

<template>
    <div class="isolation-box">
        <div id="logo">
            <img src="../../assets/img/tibook-login.svg" alt="题书" />
        </div>
        <search-box />
    </div>
    <p class="window-drag-area"></p>
    <div class="window-controls-container">
        <div @click="() => TIBOOK.renderSend('window-minimize')" class="window-minimize">
            <minus />
        </div>
        <div @click="() => TIBOOK.renderSend('window-maximize')" class="window-maximize">
            <off-screen v-if="isMaximize" />
            <full-screen v-else />
        </div>
        <div @click="() => TIBOOK.renderSend('window-close')" class="window-close">
            <close />
        </div>
    </div>
</template>

<style scoped lang="less">
.isolation-box {
    display: flex;
    height: 100%;
    margin-top: 5px;

    #logo {
        display: inline-block;
        width: 33px;
        height: 33px;
        margin-left: 8px;

        margin-right: 25px;

        img {
            width: 100%;
            height: 100%;
        }
    }
}

.window-drag-area {
    flex: 1;
    -webkit-app-region: drag;
}

.window-controls-container {
    width: auto;
    height: 30px;
}

.window-controls-container div {
    display: inline-block;
    width: 50px;
    height: 30px;
    text-align: center;
    line-height: 30px;
}
.window-controls-container div:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

.window-controls-container .window-close:hover {
    background-color: #e81123;
    color: #fff;
}
</style>
