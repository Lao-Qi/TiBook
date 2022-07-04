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
import WindowsTitle from "./components/title/windows-title.vue"
import MacTitle from "./components/title/mac-title.vue"
import LinuxTitle from "./components/title/linux-title.vue"
const { type } = require("os");

const SystemType = type();
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
    width: 100%;
    height: 30px;
    justify-content: space-between;
    text-align: center;
    font-size: 16px;
    line-height: 30px;
    background-color: var(--background-color);
}

#view {
    flex: 1;
    display: flex;
    justify-content: center;
    z-index: 1;
}
</style>
