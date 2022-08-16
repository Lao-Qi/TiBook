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
                        <img :src="userInfo.avatar" />
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
                        <p>{{ showUser.AddTime === "none" ? "用户未设置" : showUser.AddTime }}</p>
                        <div class="user-text-info-ele-cue-line cue-line-color"></div>
                    </div>
                    <div class="user-text-info-ele">
                        <p class="explain">邮箱</p>
                        <p>{{ showUser.mail === "none" ? "用户未设置" : showUser.mail }}</p>
                        <div class="user-text-info-ele-cue-line cue-line-color"></div>
                    </div>
                    <div class="user-text-info-ele">
                        <p class="explain">年龄</p>
                        <p>{{ showUser.age === "none" ? "用户未设置" : showUser.age }}</p>
                        <div class="user-text-info-ele-cue-line cue-line-color"></div>
                    </div>
                    <div class="user-text-info-ele">
                        <p class="explain">性别</p>
                        <p>{{ showUser.gender === "none" ? "用户未设置" : showUser.gender }}</p>
                        <div class="user-text-info-ele-cue-line cue-line-color"></div>
                    </div>
                    <div class="user-text-info-ele">
                        <p class="explain">出生日期</p>
                        <p>{{ showUser.birth === "none" ? "用户未设置" : showUser.birth }}</p>
                        <div class="user-text-info-ele-cue-line cue-line-color"></div>
                    </div>
                    <div class="user-text-info-ele">
                        <p class="explain">地址</p>
                        <p>{{ showUser.address === "none" ? "用户未设置" : showUser.address }}</p>
                        <div class="user-text-info-ele-cue-line cue-line-color"></div>
                    </div>
                </div>
            </div>
            <div class="right-content">
                <div class="user-personality-info-container">
                    <div class="user-personalized-background-picture">
                        <img src="../../assets/img/f062936a96d3c8bd1474189161.jpg" v-if="showUser.cover === 'none'" />
                    </div>
                    <div class="user-personalized-signature">
                        {{ showUser.signature === "none" ? "该用户可能也许应该大概或许八成不想通过此等途径展示自己的个性签名" : showUser.signature }}
                    </div>
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
        height: 55%;

        .left-content {
            display: flex;
            width: 320px;
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
                    top: 0;
                    left: 0;
                    width: 100px;
                    height: 100px;
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
                margin-top: auto;

                .user-text-info-ele {
                    width: 70%;
                    min-width: 200px;
                    height: 30px;
                    padding-left: 10px;

                    p {
                        display: inline-block;
                        font-size: 14px;
                    }

                    .explain {
                        width: 65px;
                        font-size: 15px;
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

            .user-personality-info-container {
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;

                .user-personalized-background-picture {
                    width: max-content;
                    height: 100%;
                    opacity: 0.7;
                }

                .user-personalized-signature {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    width: max-content;
                    height: max-content;
                    padding-block: 2px;
                    border-radius: 10px;
                    color: #ccc;
                }
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
