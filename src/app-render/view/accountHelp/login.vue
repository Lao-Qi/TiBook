<script setup>
/**
 * 登录组件
 */
import { reactive, defineEmits, onMounted, ref } from "vue"

const emit = defineEmits(["toggleUserState", "runStateOperate"])

const TIBOOK = window.TIBOOK

const user_data = ref(null)
const accountInput = ref(null)
const passwordInput = ref(null)
const runOperationButton = ref(null)
// 登录的模式(正常 | 简洁) 简洁模式为直接点击头像登录
const loginModel = ref("normal") // normal || concise


// 验证本地token，设置登录模式
TIBOOK.serverRequest("FindTokenUser", result => {
    console.log(result);
    if(result?.code === 200) {
        loginModel.value = "concise"
        user_data.value = result.data
    }
})

const input = reactive({
    account: {
        focus: false,
        ele: null,
        value: ""
    },
    password: {
        focus: false,
        ele: null,
        value: ""
    }
})

onMounted(() => {
    if(loginModel.value === "normal") {
        accountInput.value.focus()
    }
})

</script>

<template>
    <div class="operate-title">
        <p>登录题书账号</p>
    </div>
    <div class="user-input-form" v-if="loginModel === 'normal'">
        <div 
            class="account-help-input-box" 
            :class="{ 'account-help-input-box-foucs': input.account.focus }"
        >
            <input 
                type="text" 
                v-model="input.account.value" 
                ref="accountInput"
                @focus="input.account.focus = true" 
                @blur="input.account.focus = false" 
                @keydown.enter="passwordInput.focus" 
                @keydown.down="passwordInput.focus"
            />
            <p 
                class="input-placeholder" 
                :class="{ 'input-focus-ing': input.account.focus || input.account.value }"
            >账号</p>
            <i v-if="input.account.focus || input.account.value"></i>
            <div class="box-underscore" v-if="input.account.focus"></div>
        </div>
        <div 
            class="account-help-input-box" 
            :class="{ 'account-help-input-box-foucs': input.password.focus }"
        >
            <input 
                type="password" 
                ref="passwordInput"
                v-model="input.password.value"
                @focus="input.password.focus = true" 
                @blur="input.password.focus = false" 
                @keydown.enter="runOperationButton.click"
                @keydown.up="accountInput.focus"
            />
            <p 
                class="input-placeholder" 
                :class="{ 'input-focus-ing': input.password.focus || input.password.value }"
            >密码</p>
            <i v-if="input.password.focus || input.password.value"></i>
            <div class="box-underscore" v-if="input.password.focus"></div>
        </div>
    </div>
    <div class="concise-login-model-container" v-else>
        <div class="login-user-avatar" @click="emit('runStateOperate','conciseLogin')">
            <img :src="user_data.avatar" :alt="user_data.name">
        </div>
        <div class="login-user-name">
            <p>{{user_data.name}}</p>
        </div>
    </div>
    <div class="login-operation" :class="{'normal-model': loginModel === 'concise'}">
        <div class="toggle-register-href" v-if="loginModel === 'concise'">
            <p @click="loginModel = 'normal'">
                其他账号
                <div class="toggle-href-underscore"></div>
            </p>
        </div>
        <div class="toggle-register-href">
            <p @click="emit('toggleUserState')">
                注册账号
                <div class="toggle-href-underscore"></div>
            </p>
        </div>
        <div 
            class="run-operstion"
            ref="runOperationButton"
            @click="emit('runStateOperate', 'loginUser', input.account.value, input.password.value)" 
            v-if="loginModel === 'normal'"
        >登录</div>
    </div>
</template>

<style lang="less" scoped>
.operate-title {
    font-size: 20px;
    margin-bottom: 30px;
    user-select: none;
}

.user-input-form {
    width: 240px;
    height: auto;

    .account-help-input-box {
        position: relative;
        width: 100%;
        height: 35px;
        margin-bottom: 20px;
        border-radius: 10px;
        box-shadow: var(--container-inset-show);
        background-color: var(--input-box-background-color);

        input {
            width: 100%;
            height: 100%;
            padding-left: 10px;
            font-size: 18px;
            border: none;
            outline: none;
            background-color: transparent;
        }

        .input-placeholder {
            position: absolute;
            top: 5px;
            left: 10px;
            width: 45px;
            text-align: center;
            font-size: 16px;
            color: #959595;
            background-color: transparent;
            z-index: 3;
            transition: all ease 0.2s;
            user-select: none;
        }

        .input-focus-ing {
            top: -12px;
            left: 8px;
            font-size: 14px;
        }

        i {
            position: absolute;
            top: 0;
            left: 8px;
            width: 45px;
            height: 4px;
            z-index: 2;
            background-color: var(--input-box-background-color);
            transition: all ease 0.2s;
        }

        .box-underscore {
            position: absolute;
            width: 0;
            background-color: var(--cue--line-color);
            transition: all ease 0.2s;
        }
    }

    .account-help-input-box-foucs {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;

        .box-underscore {
            bottom: 0;
            width: 100%;
            height: 3px;
            border-radius: 10px;
        }
    }
}

.concise-login-model-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 240px;
    height: auto;
    text-align: center;

    .login-user-avatar {
        width: 100px;
        height: 100px;
        border-radius: 10px;
        border: 2px solid var(--cue--line-color);
        overflow: hidden;
        cursor: pointer;

        img {
            width: 100%;
            height: 100%;
        }
    }

    .login-user-name {
        margin-top: 15px;
        font-size: 18px;
    }
}

.login-operation {
    width: 240px;
    height: auto;
    text-align: center;
    user-select: none;

    .toggle-register-href {
        width: 100%;
        height: 20px;
        text-align: right;

        p {
            display: inline-block;
            width: fit-content;
            font-size: 14px;
            color: var(--cue--line-color);
            cursor: pointer;

            .toggle-href-underscore {
                width: 100%;
                height: 2px;
                border-radius: 10px;
                background-color: var(--cue--line-color);
            }
        }
    }

    .run-operstion {
        display: inline-block;
        width: 90px;
        height: 30px;
        margin-top: 15px;
        font-size: 16px;
        color: #fff;
        line-height: 30px;
        border-radius: 10px;
        background-color: var(--cue--line-color);
        cursor: pointer;
    }
}

.normal-model {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    margin-top: 23px;
    padding-inline: 50px;

    .toggle-register-href {
        width: max-content;

        p {
            font-size: 12px;
        }
    }
}
</style>
