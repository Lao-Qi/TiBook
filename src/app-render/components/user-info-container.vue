<script setup>
import { defineProps, computed } from "vue"

const props = defineProps({
    userInfo: {
        avatar: String, // 头像
        name: String, // 名称
        AddTime: String, // 添加时间
        account: String, // 账号
        mail: String, // 邮箱
        age: String, // 年龄
        gender: String, // 性别
        birth: String, // 出生日期
        address: String, // 地址
        cover: String, // 个性图片
        signature: String // 个性签名
    }
})

const showUser = computed(() => props.userInfo)
</script>

<template>
    <div class="show-user-info-container view-element-container">
        <div class="info-container-in-container">
            <div class="left-content">
                <div class="user-basic-info-container">
                    <div class="user-avatar">
                        <img :src="showUser.avatar" />
                    </div>
                    <div class="user-name">
                        <p>{{ showUser.name }}</p>
                    </div>
                    <div class="user-account">
                        <p>{{ showUser.account }}</p>
                    </div>
                </div>
                <div class="user-text-info-container">
                    <div class="user-text-info-ele" v-if="showUser.AddTime">
                        <p class="explain">添加时间</p>
                        <p>
                            <span>{{ showUser.AddTime === "none" ? "用户未设置" : showUser.AddTime }}</span>
                            <div class="user-text-info-ele-cue-line cue-line-color"></div>
                        </p>
                    </div>
                    <div class="user-text-info-ele">
                        <p class="explain">邮箱</p>
                        <p>
                            <span>{{ showUser.mail === "none" ? "用户未设置" : showUser.mail }}</span>
                            <div class="user-text-info-ele-cue-line cue-line-color"></div>
                        </p>
                    </div>
                    <div class="user-text-info-ele">
                        <p class="explain">年龄</p>
                        <p>
                            <span>{{ showUser.age === "none" ? "用户未设置" : showUser.age }}</span>
                            <div class="user-text-info-ele-cue-line cue-line-color"></div>
                        </p>

                    </div>
                    <div class="user-text-info-ele">
                        <p class="explain">性别</p>
                        <p>
                            <span>{{ showUser.gender === "none" ? "用户未设置" : showUser.gender }}</span>
                            <div class="user-text-info-ele-cue-line cue-line-color"></div>
                        </p>
                        
                    </div>
                    <div class="user-text-info-ele">
                        <p class="explain">出生日期</p>
                        <p>
                            <span>{{ showUser.birth === "none" ? "用户未设置" : showUser.birth }}</span>
                            <div class="user-text-info-ele-cue-line cue-line-color"></div>
                        </p>
                    </div>
                    <div class="user-text-info-ele">
                        <p class="explain">地址</p>
                        <p>
                            <span>{{ showUser.address === "none" ? "用户未设置" : showUser.address }}</span>
                            <div class="user-text-info-ele-cue-line cue-line-color"></div>
                        </p>
                    </div>
                </div>
            </div>
            <div class="right-content">
                <div class="user-personalized-background-picture">
                    <!-- <img :src="userInfo.cover" v-if="showUser.cover === 'none'" /> -->
                    <img src="../assets/img/f062936a96d3c8bd1474189161.jpg" alt="">
                </div>
                <div class="user-personalized-signature" :class="{ 'is-not-signature': showUser.signature }" :style="{'user-select': showUser.signature !== 'none' ? 'auto' : 'none'}">
                    <p>{{ showUser.signature === "none" ? "该用户还没展示自己的个性签名" : showUser.signature }}</p>
                </div>
            </div>
        </div>
        <div class="operate-on-show-user">
            <slot name="user-operate"></slot>
        </div>
    </div>
</template>

<style lang="less" scoped>
.show-user-info-container {
    display: flex;
    flex: 1;
    margin-left: 20px;
    padding: 10px;
    flex-direction: column;
    overflow: hidden;

    .info-container-in-container {
        display: flex;
        width: 100%;
        height: 70%;

        .left-content {
            display: flex;
            width: 400px;
            flex-direction: column;

            .user-basic-info-container {
                position: relative;
                height: 120px;

                div {
                    position: absolute;
                    width: max-content;
                    height: max-content;
                }

                .user-avatar {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    width: 80px;
                    height: 80px;
                    border-radius: 10px;
                    overflow: hidden;
                    user-select: none;
                }

                .user-name {
                    left: 120px;
                    bottom: 50px;
                    font-size: 20px;
                }

                .user-account {
                    left: 120px;
                    bottom: 20px;
                    color: #8f8f8f;
                }
            }

            .user-text-info-container {
                flex: 1;
                display: flex;
                padding-top: 10px;
                justify-content: space-between;

                .user-text-info-ele {
                    display: flex;
                    align-items: center;
                    width: 70%;
                    min-width: 200px;
                    height: 30px;
                    padding-left: 10px;

                    p {
                        display: inline-block;

                        &:nth-child(2) {
                            flex: 1;
                            font-size: 15px;
                            text-align: center;
                        }
                    }

                    .explain {
                        width: 75px;
                        font-size: 17px;
                        margin-right: 15px;
                        user-select: none;
                    }

                    .user-text-info-ele-cue-line {
                        width: 100%;
                        height: 2px;
                        border-radius: 10px;
                    }
                }
            }
        }

        .right-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            .user-personalized-background-picture {
                display: flex;
                width: auto;
                height: 260px;
                align-items: center;
                justify-content: right;
                overflow: hidden;

                img {
                    width: auto;
                }
            }

            .user-personalized-signature {
                margin-top: 20px;
                width: 100%;
                height: 100px;
                overflow-y: scroll;
                overflow-x: hidden;
                padding: 5px;
                border-radius: 10px 0 0 10px;
                background-color: rgba(143, 143, 143, 0.2);

                p {
                    width: 100%;
                    height: max-content;
                    word-break: break-all;
                }
            }

            .is-not-signature {
                color: #ccc;
            }
        }
    }

    .operate-on-show-user {
        display: flex;
        flex: 1;
        justify-content: center;
        align-items: center;
    }
}
</style>
