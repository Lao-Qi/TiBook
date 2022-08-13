<template>
    <div id="window-controls-container">
        <div class="window-controls window-close" @click="() => TIBOOK.send('window-close')"></div>
        <div class="window-controls window-minimize" @click="() => TIBOOK.send('window-minimize')"></div>
        <div class="window-controls window-maximize" @click="() => TIBOOK.send('window-maximize')"></div>
    </div>
    <div class="window-drag-area">
        <div id="search-box" v-if="renderSearchBox">
            <div class="search-icon">
                <people-search></people-search>
            </div>
            <input type="text" placeholder="搜索" class="search-input" />
        </div>
    </div>
</template>

<script setup>
import { watch, inject, ref } from "vue"
import { PeopleSearch } from "@icon-park/vue-next"
const TIBOOK = window.TIBOOK

const renderSearchBox = ref(false)

watch(
    () => inject("render").loginUser,
    value => (renderSearchBox.value = value),
    { immediate: true }
)
</script>

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

    #search-box {
        display: flex;
        width: 200px;
        height: 30px;
        padding: 2px;
        padding-right: 20px;
        margin-top: 5px;
        align-items: center;
        border-radius: 20px;
        box-shadow: var(--box-inset-show);
        background-color: var(--input-box-background-color);
        -webkit-app-region: no-drag;

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
</style>
