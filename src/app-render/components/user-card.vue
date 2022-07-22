<template>
    <div class="account-card">
        <div class="account-head-portrait">
            <img :src="avatar" :alt="name" />
        </div>
        <div class="account-info">
            <h5>{{ name.length > 10 ? `${name.slice(0, 10)}...` : name }}</h5>
        </div>
        <div class="add-btn">
            <a href="javascript:;" @click="addFriend">添加</a>
        </div>
    </div>
</template>

<script setup>
const { ipcRenderer } = require("electron")
const props = defineProps({
    account: String,
    avatar: String,
    name: String
})
const avatar = props.avatar === "none" ? "/src/assets/img/DefaultAvatar.jpg" : `http://127.0.0.1:8080/user/avatar/${props.avatar}`

function addFriend() {
    ipcRenderer.send("add-friend", props.account)
}
</script>

<style scoped lang="less">
.account-card {
    position: relative;
    width: 150px;
    height: 200px;
    margin-top: 30px;
    text-align: center;
    border-radius: 5px;
    background-color: var(--theme-color-one);
    transition: all 0.3s ease;
    cursor: pointer;
    &:hover {
        border-radius: 10px;
    }

    .account-head-portrait {
        position: absolute;
        left: 50%;
        top: 10px;
        width: 100px;
        height: 100px;
        border-radius: 10px;
        overflow: hidden;
        transition: all 0.3s ease;
        transform: translateX(-50%);
        &:hover {
            top: -10px;
            box-shadow: var(--el-box-shadow);
        }

        img {
            width: 100%;
            height: 100%;
        }
    }

    .account-info {
        position: absolute;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 20px;
    }

    .add-btn {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        a {
            text-decoration: none;
            font-size: 14px;
            font-weight: 700;
            color: #ccc;

            &:hover {
                text-decoration: underline;
            }
        }
    }
}
</style>
