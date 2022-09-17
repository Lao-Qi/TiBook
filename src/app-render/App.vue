<script setup>
/**
 * 页面展示逻辑
 *
 * 窗口控件(最小化，最大化，关闭) -> 账号帮助页 -> 登录用户 -> 主页
 *                                                      -> 注册页 -> 登录页 -> 主页
 *
 * 主页和登录注册页分别是俩个路由，App进行判断后跳转对应路由
 */
import { defineAsyncComponent } from "vue"
import { useRouter } from "vue-router"
import { CodeOne } from "@icon-park/vue-next"

const router = useRouter()
const TIBOOK = window.TIBOOK

// 配置renderEnv环境变量
TIBOOK.renderEnv.login = false

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

function openMainWindowCli() {
    TIBOOK.renderSend("operation-service-window", "openDevTools")
}

// 直接跳转到账号帮助页
router.replace({ path: "/account-help" })
</script>

<template>
    <header id="title">
        <WindowTitle></WindowTitle>
    </header>
    <main id="view">
        <router-view></router-view>
    </main>
    <footer id="statusbar">
        <div class="left-items items-container">
            <div class="statusbar-item version-item">{{ TIBOOK.env.APP_INFO.version }}</div>
        </div>
        <div class="right-items items-container">
            <div class="statysbar-item operational-item open-cli-item" @click="openMainWindowCli">
                <code-one></code-one>
                <span>控制台</span>
            </div>
        </div>
    </footer>
</template>

<style lang="less">
#app {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

#title {
    z-index: 999;
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
    margin-top: 3px;
    margin-bottom: 0;
    justify-content: center;
    z-index: 1;
}

#statusbar {
    display: flex;
    width: 100%;
    height: 20px;
    padding-inline: 10px;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    background-color: var(--input-box-background-color);
    z-index: 999;

    .statusbar-item {
        user-select: none;
        width: fit-content;
    }

    .operational-item {
        span {
            margin-left: 4px;
        }
    }

    .operational-item:hover {
        text-align: center;
        cursor: pointer;
        background-color: rgba(0, 0, 0, 0.2);
    }
}
</style>
