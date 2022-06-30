<template>
    <div id="logo"></div>
    <p>主页 - Chain CS</p>
    <div id="control-keys">
        <i
            class="iconfont icon-zuixiaohua"
            id="minimize"
            @click="() => ipcRenderer.send('window-minimize')"
        ></i>
        <i
            class="iconfont icon-zuidahuaxi"
            id="maximize"
            ref="maximizeBtn"
            @click="() => ipcRenderer.send('window-maximize')"
        ></i>
        <i
            class="iconfont icon-guanbi1"
            id="closure"
            @click="() => ipcRenderer.send('window-destroy')"
        ></i>
    </div>
</template>

<script setup>
import { ref } from "vue"
const { ipcRenderer } = require("electron")
const maximizeBtn = ref(null)
ipcRenderer.on("mainWin-maximize", () =>
    maximizeBtn.value.setAttribute("class", "iconfont icon-zuidahua")
)
ipcRenderer.on("mainWin-unmaximize", () =>
    maximizeBtn.value.setAttribute("class", "iconfont icon-zuidahuaxi")
)
</script>
