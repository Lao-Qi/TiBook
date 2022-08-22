<script setup>
import { reactive, onMounted, ref } from "vue"
import { AddPic } from "@icon-park/vue-next"
import monemt from "moment"
import Notification from "../../components/notification-popup";

const TIBOOK = window.TIBOOK
const USER_CONFIG = TIBOOK.env.USER_CONFIG
const userInfo = reactive({
    basic: {
        account: "none",
        avatar: "none",
        name: "none",
        registerTime: "none"
    },
    textInfo: {
        mail: {
            zh_field: "邮箱", // 中文字段
            value: "none",
        },
        age: {
            zh_field: "年龄",
            value: "none",
        },
        gender: {
            zh_field: "性别",
            value: "none",
        },
        birth: {
            zh_field: "出生日期",
            value: "none",
        },
        address: {
            zh_field: "地址",
            value: "none",
        }
    },
    personality: {
        cover: { 
            value: "none"
        }, 
        signature: { // 个性签名
            value: "none"
        }
    }
})

// 初始的信息，用于做对比
const startUserTextInfo = {}
const startBaseicUserInfo = {}

// 字段对应的存放位置， 位置其实已经是固定的，主要是为了JS代码的索引
const infoCorrespondLocation = {
    account: "basic", 
    avatar: "basic",
    name: "basic",
    registerTime: "basic",
    mail: "textInfo",
    age: "textInfo",
    gender: "textInfo",
    birth: "textInfo",
    address: "textInfo",
    signature: "personality",
    cover: "personality"
}

// 有被修改过的文本信息
const infoHaveUpdate = ref({})
const baseicInfoHaveUpdate = ref({})
let updateImageNotification = null, updateInfoNotification = null

// 文件的选择框
const fileicker = reactive({
    type: "avatar", // 选择的文件作用
    el: null // 选择框元素
})

/** 选择个性图片 */
function updateUSerPPicture() {
    updateImageNotification = Notification({
        type: "info",
        title: "状态",
        content: "正在修改您的个性图片"
    })
    fileicker.type = "PPicture"
    fileicker.el.click()
}

/** 选择头像 */
function updateUserAvatar() {
    updateImageNotification = Notification({
        type: "info",
        title: "状态",
        content: "正在修改您的头像"
    })
    fileicker.type = "avatar"
    fileicker.el.click()
}

/** 文件信息结束修改时触发，用来添加infoHaveUpdate */
function endInputTextValue(field) {
    if(startUserTextInfo[field] !== userInfo[infoCorrespondLocation[field]][field].value) {
        infoHaveUpdate.value[field] = true
    } else {
        delete infoHaveUpdate.value[field]
    }
}

/** 修改用户基本文本信息数据 */
function endInputBaseicInfoValue(field) {
    if(startBaseicUserInfo[field] !== userInfo.basic[field]) {
        baseicInfoHaveUpdate.value[field] = true
    } else {
        delete baseicInfoHaveUpdate.value[field]
    }
}

/** 向服务器提交修改过的消息 */
function pushUpdateInfo() {
    updateInfoNotification = Notification({
        type: "info",
        title: "状态",
        content: "正在修改您的头像"
    })
    const updateInfo = {}
    Object.keys(infoHaveUpdate.value).forEach(field => {
        updateInfo[field] = userInfo[infoCorrespondLocation[field]][field].value
    })

    TIBOOK.serverRequest("UpdateUserTextInfo", updateInfo, result => {
        updateInfoNotification().then(close => close())
        
        Notification({
            type: result.code,
            title: "修改状态",
            content: result.msg
        })

        if(result.post) {
            for(const [key, value] of Object.entries(updateInfo)) {
                startUserTextInfo[key] = value
            }
            infoHaveUpdate.value = {}
        }
    })

    Object.keys(baseicInfoHaveUpdate.value).forEach(field => {
        const requestName = field === "name" ? "UpdateUserName": "UpdateUserAccount"
        TIBOOK.serverRequest(requestName, userInfo.basic[field], result => {
            updateInfoNotification().then(close => close())

            Notification({
                type: result.code,
                title: "修改状态",
                content: result.msg
            })

            if(result.post) {
                startBaseicUserInfo[field] = result.data[field]

                const user_data = USER_CONFIG.user_data
                user_data.token = result.ntoken
                USER_CONFIG.user_data = user_data
            }
        })
    })
}

// 获取登录的用户详细数据
TIBOOK.serverRequest("FindTokenUserInfo", result => {
    console.log(result);
    if(result.code === 200) {
        for (const [key, value] of Object.entries(result.data)) {
            switch (infoCorrespondLocation[key]) {
                case "basic": userInfo[infoCorrespondLocation[key]][key] = value; break;
                case "textInfo": userInfo[infoCorrespondLocation[key]][key].value = value; break;
                case "personality": userInfo[infoCorrespondLocation[key]][key].value = value; break;
            }
        }

        userInfo.basic.registerTime = monemt(result.data.registerTime).format("YYYY-MM-DD HH:mm:ss")
        Object.keys(userInfo.textInfo).forEach(key => startUserTextInfo[key] = userInfo.textInfo[key].value)
        startUserTextInfo.signature = userInfo.personality.signature.value
        startBaseicUserInfo["name"] = userInfo.basic.name
        startBaseicUserInfo["account"] = userInfo.basic.account
    }
})

onMounted(() => {
    fileicker.el.onchange = function () {
        const filePath = fileicker.el.files[0].path
        const type = fileicker.type
        console.log(fileicker.el.files);
        TIBOOK.serverRequest(type === "avatar" ? "UploadAvatar" : "UploadPPictures", filePath, result => {
            updateImageNotification().then(close => close())

            Notification({
                type: result.code,
                title: "修改状态",
                content: result.msg
            })

            if (result.post === true) {
                if(type === "avatar") {
                    userInfo.basic.avatar = result.path

                    const user_data = USER_CONFIG.user_data
                    user_data.info.avatar = result.path
                    user_data.token = result.ntoken
                    USER_CONFIG.user_data = user_data
                }else {
                    userInfo.personality.cover.value = result.path
                }
            }
        })
    }
})
</script>

<template>
    <div class="home-view-container">
        <input type="file" style="display: none;" :ref="(el) => fileicker.el = el" />
        <div class="left-content-container view-element-container">
            <div class="user-basic-info-container">
                <div class="user-avatar basic-info">
                    <img :src="userInfo.basic.avatar" />
                    <add-pic size="30" @click="updateUserAvatar()"></add-pic>
                </div>
                <div class="user-name basic-info">
                    <input type="text" v-model="userInfo.basic.name" :class="{'is-update': baseicInfoHaveUpdate['name']}" @blur="endInputBaseicInfoValue('name')" @keydown.enter="(event) => event.target.blur()">
                </div>
                <div class="user-account basic-info">
                    <input type="text" v-model="userInfo.basic.account" :class="{'is-update': baseicInfoHaveUpdate['account']}" @blur="endInputBaseicInfoValue('account')" @keydown.enter="(event) => event.target.blur()">
                </div>
            </div>
            <div class="user-text-info-container">
                <div class="user-text-info-ele">
                    <p class="explain">注册时间</p>
                    <p class="text-info" :class="{ 'is-none': userInfo.basic.registerTime === 'none' }">
                        <span>{{ userInfo.basic.registerTime }}</span>
                        <div class="user-text-info-ele-cue-line cue-line-color"></div>
                    </p>
                </div>
                <div v-for="(info, infoField) in userInfo.textInfo" class="user-text-info-ele">
                    <p class="explain">{{ info.zh_field }}</p>
                    <p class="text-info" >
                        <input type="text" :class="{ 'is-none': info.value === 'none', 'is-update': infoHaveUpdate[infoField] }" v-model="info.value" @blur="endInputTextValue(infoField)" @keydown.enter="(event) => event.target.blur()">
                        <div class="user-text-info-ele-cue-line cue-line-color"></div>
                    </p>
                </div>
            </div>
            <div v-if="Object.keys(infoHaveUpdate).length || Object.keys(baseicInfoHaveUpdate).length" class="save-user-info" @click="pushUpdateInfo()">保存修改</div>
        </div>
        <div class="reght-content-container view-element-container">
            <div class="user-personality-info-container">
                <div class="user-personalized-background-picture">
                    <img v-if="userInfo.personality.cover.value !== 'none'" :src="userInfo.personality.cover.value" />
                    <add-pic :class="{ 'cover-none': userInfo.personality.cover.value === 'none' }" size="35" @click="updateUSerPPicture()"></add-pic>
                </div>
                <div class="user-personalized-signature" >
                    <textarea :class="{ 'is-none': userInfo.personality.signature.value === 'none', 'is-update': infoHaveUpdate['signature']}" v-model="userInfo.personality.signature.value" @blur="endInputTextValue('signature')" @keydown.shift.enter="(event) => event.target.blur()" placeholder="来添加你的个性签名吧！"></textarea>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="less">
.home-view-container {
    display: flex;
    width: 100%;
    height: auto;
    padding-inline: 10px;
    justify-content: space-between;

    // 视图左侧区域
    .left-content-container {
        position: relative;
        flex: 2;
        min-width: 300px;
        margin-right: 10px;
        padding: 10px;

        .save-user-info {
            position: absolute;
            top: 10px;
            right: 20px;
            width: 80px;
            height: 30px;
            font-size: 14px;
            text-align: center;
            line-height: 30px;
            color: #fff;
            border-radius: 20px;
            background-color: var(--cue--line-color);
            cursor: pointer;
        }

        // 用户的基本仨信息区域
        .user-basic-info-container {
            position: relative;
            height: 120px;

            div {
                position: absolute;
                width: max-content;
                height: max-content;
            }

            .basic-info {
                input {
                    width: 180px;
                    height: 30px;
                    padding-left: 10px;
                    font-size: 20px;
                    border: none;
                    outline: none;
                    border-radius: 20px;
                    background-color: transparent;

                    &:focus {
                        box-shadow: var(--container-inset-show);
                        background-color: var(--input-box-background-color);
                    }
                }

                .is-update {
                    color: var(--cue--line-color);
                }

                &:hover {
                    input {
                        background-color: var(--input-box-background-color);
                    }
                }
            }

            .edit-info-ing {
                p {
                    padding-inline: 5px;
                    padding-block: 2px;
                    box-sizing: content-box;
                    border: 1px solid var(--cue-line-color);
                    border-radius: 10px;
                    outline: none;
                    background-color: var(--input-box-background-color);
                }

                &:hover {
                    .info-edit-icon {
                        display: none;
                    }
                }
            }


            .user-avatar {
                display: flex;
                position: absolute;
                left: 20px;
                width: 110px;
                height: 110px;
                justify-content: center;
                align-items: center;
                border-radius: 10px;
                overflow: hidden;
                user-select: none;

                .i-icon-add-pic {
                    display: none;
                    position: absolute;
                    cursor: pointer;
                }

                &:hover {
                    img {
                        opacity: 0.3;
                    }

                    .i-icon-add-pic {
                        display: block;
                    }
                }
            }

            .user-name {
                left: 140px;
                bottom: 40px;
                font-size: 20px;
            }

            .user-account {
                left: 140px;
                bottom: 10px;
                color: #8f8f8f;
                font-size: 17px;

                input {
                    height: 20px;
                    font-size: 16px;
                    color: #8f8f8f;
                }
            }
        }

        // 所有的用户本文信息容器
        .user-text-info-container {
            margin-top: 40px;
            margin-left: 30px;

            // 用户的文本信息元素
            .user-text-info-ele {
                display: flex;
                width: 60%;
                min-width: 200px;
                height: 30px;
                margin-top: 10px;

                // 文本信息字段
                .explain {
                    width: 80px;
                    font-size: 18px;
                    margin-right: 15px;
                    user-select: none;
                }

                // 信息部分
                .text-info {
                    flex: 1;
                    text-align: center;

                    input {
                        height: 30px;
                        font-size: 16px;
                        text-align: center;
                        outline: none;
                        border-radius: 20px;
                        border: none;
                        background-color: transparent;

                        &:focus {
                            box-shadow: var(--container-inset-show);
                            background-color: var(--input-box-background-color);
                        }
                    }

                    .is-none {
                        color: #8f8f8f;
                    }

                    .is-update {
                        color: var(--cue--line-color);
                    }


                    &:hover {
                        input {
                            background-color: var(--input-box-background-color);
                        }
                    }
                }

                // 文本信息在编辑中的样式
                .edit-info-ing {

                    span:nth-child(1) {
                        padding: 2px 5px;
                        border: none;
                        outline: none;
                        background-color: var(--input-box-background-color);
                    }

                    &:hover {
                        .text-info-edit-icon {
                            display: none;
                        }
                    }
                }

                // 文本信息的下滑分割提示线
                .user-text-info-ele-cue-line {
                    width: 100%;
                    height: 2px;
                    border-radius: 10px;
                }
            }
        }
    }

    // 视图右侧区域
    .reght-content-container {
        flex: 2;
        margin-left: 10px;
        padding: 10px;
        overflow: hidden;

        .user-personality-info-container {
            width: 100%;
            height: auto;

            .user-personalized-background-picture {
                position: relative;
                display: flex;
                width: 100%;
                height: 300px;
                justify-content: center;
                align-items: center;
                border-radius: 10px;
                overflow: hidden;
                background-color: var(--input-box-background-color);

                img {
                    width: 100%;
                    height: auto;
                }

                .i-icon-add-pic {
                    position: absolute;
                    display: none;
                    cursor: pointer;
                }

                .cover-none {
                    display: block;
                }

                &:hover {
                    img {
                        opacity: 0.3;
                    }
   
                    .i-icon-add-pic {
                        display: block;
                    }
                }
            }

            .user-personalized-signature {
                width: 100%;
                height: 200px;
                margin-top: 15px;
                padding: 10px;
                color: #8f8f8f;
                word-wrap: break-word;
                border-radius: 10px;
                background-color: var(--input-box-background-color);
                overflow: hidden;

                textarea {
                    width: 100%;
                    height: 100%;
                    font-size: 16px;
                    outline: none;
                    border: none;
                    resize: none;
                    overflow-x: hidden;
                    overflow-y: scroll;
                    background-color: transparent;
                }

                .is-none {
                    color: #8f8f8f;
                }

                .is-update {
                    color: var(--cue--line-color);
                }
            }
        }
    }
}
</style>
