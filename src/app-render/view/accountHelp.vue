<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import loginVue from "../components/accountHelp/login.vue"
import registerVue from "../components/accountHelp/register.vue"

const TIBOOK = window.TIBOOK
const router = useRouter()
const userState = ref("login")

function ToggleUserState() {
    userState.value = userState.value === "login" ? "register" : "login"
}

function loginUser(account, password) {
    if (account && password) {
        TIBOOK.serverRequest("LoginUser", account, password, result => {
            if (result.code === 200) {
                TIBOOK.env["USER_CONFIG"]["user_data"] = { info: result.data.userDoc, token: result.data.token }
                router.replace({ path: "/main" })
            }
        })
    } else {
        alert("请完整的填写表单信息")
    }
}

function registerUser(name, account, password) {
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
</script>

<template>
    <div class="page-container">
        <div class="big-background-logo-img">
            <img src="../assets/img/tibook-transparent-logo.png" alt="" />
        </div>
        <!-- 主要功能容器 -->
        <div class="account-operate-body-container">
            <login-vue v-if="userState === 'login'" @toggleUserState="ToggleUserState" @loginUser="loginUser"></login-vue>
            <register-vue v-else-if="userState === 'register'" @toggleUserState="ToggleUserState" @registerUser="registerUser"></register-vue>
        </div>
    </div>
</template>

<style lang="less" scoped>
.page-container {
    position: relative;
    width: 100%;
    height: 100%;
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
