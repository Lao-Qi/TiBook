<script setup>
import SearchBox from "./search-box.vue"

const TIBOOK = window.TIBOOK
</script>

<template>
    <div id="window-controls-container">
        <div class="window-controls window-close" @click="() => TIBOOK.renderSend('window-close')"></div>
        <div class="window-controls window-minimize" @click="() => TIBOOK.renderSend('window-minimize')"></div>
        <div class="window-controls window-maximize" @click="() => TIBOOK.renderSend('window-maximize')"></div>
    </div>
    <div class="window-drag-area">
        <search-box />
    </div>
</template>

<style scoped lang="less">
#window-controls-container {
    display: flex;
    margin-left: 1px;
    height: 30px;

    .window-controls {
        display: inline-block;
        width: 30px;
        height: 30px;
        text-align: center;
        line-height: 33px;

        &::before {
            content: "";
            display: inline-block;
            width: 18px;
            height: 18px;
            cursor: pointer;
            border-radius: 30px;
            box-sizing: border-box;
            background-color: rgba(0, 0, 0, 0.3);
        }
    }

    .window-close:hover::before {
        border: 2px solid rgb(231, 78, 68);
        background-color: rgb(253, 93, 83);
    }

    .window-maximize:hover::before {
        border: 2px solid rgb(39, 168, 75);
        background-color: rgb(26, 199, 74);
    }

    .window-minimize:hover::before {
        border: 2px solid rgb(228, 164, 45);
        background-color: rgb(255, 181, 43);
    }
}

.window-drag-area {
    display: flex;
    justify-content: center;
    flex: 1;
    text-align: center;
    -webkit-app-region: drag;
}
</style>
