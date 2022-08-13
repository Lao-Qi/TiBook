<template>
    <div class="isolation-box">
        <div id="logo">
            <img src="../../assets/img/tibook-login.svg" alt="题书" />
        </div>
        <div id="search-box" v-if="renderSearchBox">
            <div class="search-icon">
                <people-search></people-search>
            </div>
            <input type="text" placeholder="搜索" class="search-input" />
        </div>
    </div>
    <p class="window-drag-area"></p>
    <div class="window-controls-container">
        <div @click="() => TIBOOK.send('window-minimize')" class="window-minimize">
            <minus></minus>
        </div>
        <div @click="() => TIBOOK.send('window-maximize')" class="window-maximize">
            <off-screen v-if="isMaximize"></off-screen>
            <full-screen v-else></full-screen>
        </div>
        <div @click="() => TIBOOK.send('window-close')" class="window-close">
            <close></close>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, inject } from "vue"
import { PeopleSearch, Close, FullScreen, OffScreen, Minus } from "@icon-park/vue-next"

const TIBOOK = window.TIBOOK

const renderSearchBox = ref(false)
const isMaximize = ref(false)

TIBOOK.on("window-maximize", () => (isMaximize.value = true))
TIBOOK.on("window-unmaximize", () => (isMaximize.value = false))

watch(
    () => inject("render").loginUser,
    value => (renderSearchBox.value = value),
    { immediate: true }
)
</script>

<style scoped lang="less">
.isolation-box {
    display: flex;
    height: 100%;
    margin-top: 5px;

    #logo {
        display: inline-block;
        width: 30px;
        height: 30px;
        margin-left: 5px;

        margin-right: 25px;

        img {
            width: 100%;
            height: 100%;
        }
    }

    #search-box {
        display: flex;
        width: 200px;
        height: 30px;
        padding: 2px;
        padding-right: 20px;
        align-items: center;
        border-radius: 20px;
        box-shadow: var(--box-inset-show);
        background-color: var(--input-box-background-color);

        .search-icon {
            display: inline-block;
            width: 25px;
            height: 25px;
            line-height: 25px;
            padding-left: 5px;
            margin-right: 10px;
            color: #000;
        }

        .search-input {
            width: 150px;
            height: 30px;
            font-size: 15px;
            box-sizing: border-box;
            border: none;
            background-color: transparent;
            outline: none;

            &::placeholder {
                color: #8f8f8f;
            }
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
