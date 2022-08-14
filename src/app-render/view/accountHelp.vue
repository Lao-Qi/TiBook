<script setup>
import { ref, watch } from "vue"
import { useRouter } from "vue-router"

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

const operateMap = {
    conciseLogin() {
        TIBOOK.renderEnv.login = true
        router.replace({ path: "/main" })
    },
    loginUser(account, password) {
        if (account && password) {
            TIBOOK.serverRequest("LoginUser", account, password, result => {
                if (result.code === 200) {
                    TIBOOK.env["USER_CONFIG"]["user_data"] = {
                        info: result.data.userDoc,
                        token: result.data.token,
                        upLoginDate: Date.now()
                    }
                    TIBOOK.renderEnv.login = true
                    router.replace({ path: "/main" })
                }
            })
        } else {
            alert("请完整的填写表单信息")
        }
    },
    registerUser(name, account, password) {
        if (name && account && password) {
            TIBOOK.serverRequest("RegisterUser", name, account, password, result => {
                alert(result.msg)
                if (result.code === 200) {
                    ToggleUserState()
                }
            })
        } else {
            alert("请填写完整的填写表单信息")
        }
    }
}
</script>

<template>
    <div class="page-container">
        <div class="big-background-logo-img">
            <img src="../assets/img/tibook-transparent-logo.png" alt="" />
        </div>
        <div class="account-operate-body-container">
            <router-view @toggleUserState="ToggleUserState" @runStateOperate="runStateOperate"></router-view>
        </div>
    </div>
</template>

<style lang="less" scoped>
.page-container {
    position: relative;
    width: 100%;
    height: 100%;
    margin: 0 10px 0 10px;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    box-shadow: var(--box-inset-show);
    background-color: var(--page-background-color);

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
