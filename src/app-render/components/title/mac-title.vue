<template>
    <div id="window-controls-container">
        <div class="window-controls" id="window-closure" @click="() => ipcRenderer.send('window-destroy')"></div>
        <div class="window-controls" id="window-minimize" @click="() => ipcRenderer.send('window-minimize')"></div>
        <div class="window-controls" id="window-maximize" @click="() => ipcRenderer.send('window-maximize')"></div>
    </div>
    <p></p>
</template>

<script setup>
const { ipcRenderer } = require("electron")
</script>

<style scoped lang="less">
#window-controls-container {
    display: flex;
    padding-left: 10px;

    .window-controls {
        display: flex;
        width: 27px;
        height: 100%;
        align-items: center;
        justify-content: center;

        &::before {
            content: "";
            display: block;
            width: 18px;
            height: 18px;
            cursor: pointer;
            box-sizing: border-box;
            border-radius: 10px;
        }
    }

    #window-closure::before {
        border: 2px solid rgb(231, 78, 68);
        background-color: rgb(253, 93, 83);
    }

    #window-maximize::before {
        border: 2px solid rgb(39, 168, 75);
        background-color: rgb(26, 199, 74);
    }

    #window-minimize::before {
        border: 2px solid rgb(228, 164, 45);
        background-color: rgb(255, 181, 43);
    }
}

p {
    flex: 1;
    -webkit-app-region: drag;
}
</style>
