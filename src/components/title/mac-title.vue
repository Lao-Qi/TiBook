<template>
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

<script setup></script>
