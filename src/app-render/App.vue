<template>
    <div id="title">
        <WindowTitle></WindowTitle>
    </div>
    <div id="view">
        <router-view></router-view>
    </div>
</template>

<script setup>
import { useRouter } from "vue-router"
import { defineAsyncComponent } from "vue"
const { type } = require("os")
const { ipcRenderer } = require("electron")

const router = useRouter()
const SystemType = type()

const WindowTitle = defineAsyncComponent(() => {
    let windowTitleComponent = null
    switch (SystemType) {
        case "Windows_NT":
            windowTitleComponent = import("./components/title/windows-title.vue")
            break
        case "Darwin":
            windowTitleComponent = import("./components/title/mac-title.vue")
            break
        case "Linux":
            windowTitleComponent = import("./components/title/linux-title.vue")
            break
        default:
            windowTitleComponent = import("./components/title/windows-title.vue")
    }
    return windowTitleComponent
})

ipcRenderer.invoke("get-current-page").then(page => {
    router.push({
        name: page
    })
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
