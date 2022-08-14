<script setup>
import { reactive, defineEmits, onMounted, ref } from "vue"

const emit = defineEmits(["toggleUserState", "registerUser"])

const nameInput = ref(null)
const accountInput = ref(null)
const passwordInput = ref(null)
const tpasswordInput = ref(null)
const runOperstionButton = ref(null)

const input = reactive({
    name: {
        focus: false,
        value: ""
    },
    account: {
        focus: false,
        value: ""
    },
    password: {
        focus: false,
        value: ""
    },
    tpassword: {
        focus: false,
        value: ""
    }
})

function registerUser() {
    if(input.account.value && input.name.value && input.password.value && input.tpassword.value) {
        if(input.password.value === input.tpassword.value) {
            emit("registerUser", input.name.value, input.account.value, input.password.value)
        }else {
            alert("俩次密码不相同")
        }
    } else {
        alert("请完整的填写表单信息")
    }
}


onMounted(() => {
    nameInput.value.focus()
})
</script>

<template>
    <div class="operate-title">
        <p>注册题书账号</p>
    </div>
    <div class="user-input-form">
        <div 
            class="account-help-input-box" 
            :class="{ 'account-help-input-box-foucs': input.name.focus }"
        >
            <input 
                type="text"
                ref="nameInput"
                v-model="input.name.value"
                @focus="input.name.focus = true"
                @blur="input.name.focus = false"
                @keydown.enter="accountInput.focus"
                @keydown.down="accountInput.focus"
            />
            <p :class="{'input-focus-ing': input.name.focus || input.name.value }">名称</p>
            <i v-if="input.name.focus || input.name.value"></i>
            <div class="box-underscore" v-if="input.name.focus"></div>
        </div>
        <div 
            class="account-help-input-box" 
            :class="{ 'account-help-input-box-foucs': input.account.focus }"
        >
            <input 
                type="text"
                ref="accountInput"
                v-model="input.account.value"
                @focus="input.account.focus = true"
                @blur="input.account.focus = false"
                @keydown.enter="passwordInput.focus"
                @keydown.down="passwordInput.focus"
                @keydown.up="nameInput.focus"
            />
            <p :class="{'input-focus-ing': input.account.focus || input.account.value }">账号</p>
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
                @keydown.enter="tpasswordInput.focus"
                @keydown.down="tpasswordInput.focus"
                @keydown.up="accountInput.focus"
            />
            <p :class="{ 'input-focus-ing': input.password.focus || input.password.value }">密码</p>
            <i v-if="input.password.focus || input.password.value"></i>
            <div class="box-underscore" v-if="input.password.focus"></div>
        </div>
        <div 
            class="account-help-input-box" 
            :class="{ 'account-help-input-box-foucs': input.tpassword.focus }"
        >
            <input 
                type="password"
                ref="tpasswordInput"
                v-model="input.tpassword.value"
                @focus="input.tpassword.focus = true"
                @blur="input.tpassword.focus = false"
                @keydown.enter="runOperstionButton.click"
                @keydown.up="passwordInput.focus"
            />
            <p :class="{'input-focus-ing': input.tpassword.focus || input.tpassword.value }">确认密码</p>
            <i v-if="input.tpassword.focus || input.tpassword.value" style="width: 58px"></i>
            <div class="box-underscore" v-if="input.tpassword.focus"></div>
        </div>
    </div>
    <div class="register-operation">
        <div class="toggle-register-href">
            <p @click="emit('toggleUserState')">
                切换到登录功能
                <div class="toggle-href-underscore"></div>
            </p>
        </div>
        <div class="run-operstion" ref="runOperstionButton" @click="registerUser">注册</div>
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
        box-shadow: var(--box-inset-show);
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

        p {
            position: absolute;
            top: 5px;
            left: 10px;
            width: fit-content;
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

        p {
            top: -12px;
            left: 8px;
            font-size: 14px;
        }

        .box-underscore {
            bottom: 0;
            width: 100%;
            height: 3px;
            border-radius: 10px;
        }
    }
}

.register-operation {
    width: 240px;
    height: auto;
    text-align: center;

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
            user-select: none;

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
</style>
