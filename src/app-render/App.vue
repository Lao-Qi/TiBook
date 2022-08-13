<template>
    <div id="title">
        <WindowTitle></WindowTitle>
    </div>
    <div id="view">
        <router-view></router-view>
    </div>
</template>

<script setup>
/**
 * 页面展示逻辑
 *
 * 窗口控件(最小化，最大化，关闭) -> 账号帮助页 -> 登录用户 -> 主页
 *
 * 主页和登录注册页分别是俩个路由，App进行判断后跳转对应路由
 */
import { useRouter } from "vue-router"
import { defineAsyncComponent, provide } from "vue"
const router = useRouter()

provide("render", {
    loginUser: false
})

const WindowTitle = defineAsyncComponent(() => {
    let windowTitleComponent = null
    switch (process.env.OS) {
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

// 直接跳转到账号帮助页
router.replace({ path: "/account-help" })
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
    height: 40px;
    font-size: 16px;
    justify-content: space-between;
    background-color: var(--peripheral-menu-background-color);
}

#view {
    flex: 1;
    display: flex;
    margin: 10px;
    margin-bottom: 0;
    justify-content: center;
    z-index: 1;
}
</style>
