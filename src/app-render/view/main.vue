<script setup>
import { ref, reactive, watch, onMounted } from "vue"
import { useRouter } from "vue-router"
import { SettingConfig, Comment, Peoples, Me } from "@icon-park/vue-next"

const TIBOOK = window.TIBOOK
const router = useRouter()
const sideTipLine = ref(null)

const sideNavBarList = {
    top: {
        home: {
            el: null,
            distance: 0,
            toolstip: "我的"
        },
        message: {
            el: null,
            distance: 0,
            toolstip: "消息"
        },
        contact: {
            el: null,
            distance: 0,
            toolstip: "联系人"
        }
    },
    bottom: {
        config: {
            el: null,
            distance: 0,
            toolstip: "设置"
        }
    }
}

const sideNavBarPlace = {
    home: "top",
    message: "top",
    contact: "top",
    config: "bottom"
}

const iconConfig = reactive({
    size: "25",
    fill: "#333",
    theme: "outline"
})

// 启动socket服务
TIBOOK.send("start-socket-communication")

onMounted(() => {
    for (const [_, navBar] of Object.entries(sideNavBarList.top)) {
        navBar.distance = navBar.el.offsetTop
    }

    for (const [_, navBar] of Object.entries(sideNavBarList.bottom)) {
        navBar.distance = navBar.el.offsetTop
    }

    router.push({ name: "message" })
})

watch(
    router.currentRoute,
    nroute => {
        if (nroute.name && sideNavBarPlace[nroute.name]) {
            sideTipLine.value.style.top = sideNavBarList[sideNavBarPlace[nroute.name]][nroute.name].distance + "px"
        }
    },
    {
        deep: true
    }
)
</script>

<template>
    <div id="side-nav-bar">
        <div class="nav-top-option">
            <div v-for="(navBar, name) in sideNavBarList.top" class="view-option-container" @click="router.push({ name })" :ref="el => (navBar.el = el)">
                <me v-if="name === 'home'" :theme="iconConfig.theme" :size="iconConfig.size" :fill="iconConfig.fill" />
                <comment v-else-if="name === 'message'" :theme="iconConfig.theme" :size="iconConfig.size" :fill="iconConfig.fill" />
                <peoples v-else-if="name === 'contact'" :theme="iconConfig.theme" :size="iconConfig.size" :fill="iconConfig.fill" />
                <div class="option-toolstip">{{ navBar.toolstip }}</div>
            </div>
        </div>
        <div class="nav-bot-option">
            <div v-for="(navBar, name) in sideNavBarList.bottom" class="view-option-container" @click="router.push({ name })" :ref="el => (navBar.el = el)">
                <setting-config v-if="name === 'config'" :theme="iconConfig.theme" :size="iconConfig.size" :fill="iconConfig.fill" />
                <div class="option-toolstip">{{ navBar.toolstip }}</div>
            </div>
        </div>
        <div class="side-tip-line" ref="sideTipLine"></div>
    </div>
    <div class="view-container">
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
            padding: 1px 8px 1px 8px;
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
            z-index: 999;

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
        top: 9px;
        left: 0;
        width: 3px;
        height: 60px;
        border-radius: 10px;
        background-color: var(--cue--line-color);
        transition: var(--all-transition);
    }
}

.view-container {
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
    overflow: hidden;

    // 页面背景上的logo
    .background-logo-image {
        position: absolute;
        width: 20vw;
        height: 20vw;
        min-width: 300px;
        min-height: 300px;
        user-select: none;

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
