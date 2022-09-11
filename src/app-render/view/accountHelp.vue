<script setup>
import { ref, watch } from "vue"
import { useRouter } from "vue-router"
import Notification from "../components/notification-popup"

const TIBOOK = window.TIBOOK
const router = useRouter()
const userState = ref("login")

const ToggleUserState = () => (userState.value = userState.value === "login" ? "register" : "login")
const runStateOperate = (operate, ...args) => operateMap[operate](...args)

watch(
    userState,
    value => {
        router.replace({ name: value })
    },
    { immediate: true }
)

function loginResultDealWith(result) {
    Notification({
        type: result.code,
        title: "登录信息",
        content: result.msg
    })

    if (result.code === 200) {
        TIBOOK.env["USER_CONFIG"]["user_data"] = {
            info: result.data.userDoc,
            token: result.data.token,
            upLoginDate: Date.now()
        }
        TIBOOK.renderEnv.login = true
        router.replace({ path: "/main" })
        return
    }

    alert("登录失败", result.msg)
}

const operateMap = {
    conciseLogin() {
        TIBOOK.serverRequest("TokenLoginUser", loginResultDealWith)
    },
    loginUser(account, password) {
        if (account && password) {
            TIBOOK.serverRequest("LoginUser", account, password, loginResultDealWith)
        } else {
            Notification({
                type: "warn",
                title: "注意",
                content: "请完整的填写表单信息"
            })
        }
    },
    registerUser(name, account, password) {
        if (name && account && password) {
            TIBOOK.serverRequest("RegisterUser", name, account, password, result => {
                Notification({
                    type: result.code,
                    title: "登录信息",
                    content: result.msg
                })
                if (result.code === 200) {
                    ToggleUserState()
                }
            })
        } else {
            Notification({
                type: "warn",
                title: "注意",
                content: "请填写完整的表单信息"
            })
        }
    }
}
</script>

<template>
    <div class="view-container">
        <div class="big-background-logo-img">
            <img src="../assets/img/tibook-transparent-logo.png" alt="" />
        </div>
        <div class="account-operate-body-container">
            <router-view @toggleUserState="ToggleUserState" @runStateOperate="runStateOperate"></router-view>
        </div>
    </div>
</template>

<style lang="less" scoped>
.view-container {
    position: relative;
    width: 100%;
    height: 100%;
    margin: 0 10px 0 10px;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    box-shadow: var(--container-inset-show);
    background-color: var(--view-background-color);

    .big-background-logo-img {
        position: absolute;
        top: 30px;
        left: 30px;
        width: 300px;
        height: 300px;

        img {
            width: 100%;
            height: 100%;
        }
    }

    .account-operate-body-container {
        position: absolute;
        right: 20%;
        top: 20%;
        display: flex;
        width: 300px;
        height: 300px;
        flex-direction: column;
        align-items: center;
    }
}
</style>
