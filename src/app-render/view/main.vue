<script setup>
import { ref, reactive, watch, provide } from "vue"
import { useRouter } from "vue-router"
import { SettingConfig, Comment, Peoples, Me } from "@icon-park/vue-next"

const TIBOOK = window.TIBOOK
const router = useRouter()
const currentView = ref("message")
const sideTipLine = ref(null)

const sideNavBarItems = {
    home: {
        location: "top",
        ranking: 0
    },
    message: {
        location: "top",
        ranking: 1
    },
    contact: {
        location: "top",
        ranking: 2
    },
    config: {
        location: "bottom",
        ranking: 0
    }
}

const iconConfig = reactive({
    size: "25",
    fill: "#333",
    theme: "outline"
})

// 启动socket服务
TIBOOK.send("start-socket-communication")

const toggleOptions = page => (currentView.value = page)

provide("toggleOptions", toggleOptions)

watch(
    currentView,
    page => {
        const itemInfo = sideNavBarItems[page]
        sideTipLine.value.setAttribute("style", `${itemInfo.location}: ${itemInfo.ranking * 60 + 9}px;`)
        router.push({ name: page })
    }
    // { immediate: true }
)
</script>

<template>
    <div id="side-nav-bar">
        <div class="nav-top-option">
            <div class="view-option-container" @click="toggleOptions('home')">
                <me :theme="iconConfig.theme" :size="iconConfig.size" :fill="iconConfig.fill" />
                <div class="option-toolstip">我的</div>
            </div>
            <div class="view-option-container" @click="toggleOptions('message')">
                <comment :theme="iconConfig.theme" :size="iconConfig.size" :fill="iconConfig.fill" />
                <div class="option-toolstip">消息</div>
            </div>
            <div class="view-option-container" @click="toggleOptions('contact')">
                <peoples :theme="iconConfig.theme" :size="iconConfig.size" :fill="iconConfig.fill" />
                <div class="option-toolstip">联系人</div>
            </div>
        </div>
        <div class="nav-bot-option">
            <div class="view-option-container" @click="toggleOptions('config')">
                <setting-config :theme="iconConfig.theme" :size="iconConfig.size" :fill="iconConfig.fill" />
                <div class="option-toolstip">设置</div>
            </div>
        </div>
        <div class="side-tip-line" ref="sideTipLine"></div>
    </div>
    <div id="view-container">
        <div class="background-logo-image">
            <img src="../assets/img/tibook-transparent-logo.png" />
        </div>
        <router-view class="view"></router-view>
    </div>
</template>

<style lang="less">
#app {
    display: flex;
}

#side-nav-bar {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 50px;
    height: 100%;
    padding: 9px 0 9px 0;
    background-color: var(--peripheral-menu-background-color);

    .nav-top-option {
        margin-bottom: auto;
    }

    // 视图选项容器
    .view-option-container {
        position: relative;
        display: flex;
        width: 50px;
        height: 60px;
        justify-content: center;
        align-items: center;
        cursor: pointer;

        // 鼠标放置选项上会出现的右侧提示
        .option-toolstip {
            opacity: 0;
            position: absolute;
            left: 53px;
            top: 50%;
            width: max-content;
            height: 20px;
            padding-inline: 8px;
            padding-block: 1px;
            font-size: 12px;
            text-align: center;
            line-height: 20px;
            color: #fff;
            user-select: none;
            border-radius: 3px;
            box-sizing: content-box;
            background-color: var(--cue--line-color);
            transform: translateY(-50%);
            transition: all ease 0.1s;
            transition-delay: 0.2s;

            &::before {
                content: "";
                position: absolute;
                top: 50%;
                left: 0;
                width: 5px;
                height: 5px;
                background-color: var(--cue--line-color);
                transform: translateY(-50%) translateX(-50%) rotateZ(45deg);
            }
        }

        &:hover {
            .option-toolstip {
                opacity: 1;
            }
        }
    }

    // 侧边提示线
    .side-tip-line {
        position: absolute;
        left: 0;
        width: 3px;
        height: 60px;
        border-radius: 10px;
        background-color: var(--cue--line-color);
        transition: all ease 0.2s;
    }
}

#view-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    margin-right: 5px;
    padding: 10px;
    padding-bottom: 6px;
    background-color: var(--view-background-color);
    box-shadow: var(--container-inset-show);
    border-radius: 10px 10px 0 0;

    // 页面背景上的logo
    .background-logo-image {
        position: absolute;
        width: 20vw;
        height: 20vw;
        min-width: 300px;
        min-height: 300px;

        img {
            width: 100%;
            height: 100%;
        }
    }

    .view {
        z-index: 2;
    }
}
</style>
