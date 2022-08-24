<script setup>
import { ref, reactive } from "vue"
import { useRouter, useRoute } from "vue-router"
import { DropDownList } from "@icon-park/vue-next"
import moment from "moment"
import userInfoContainer from "../../components/user-info-container.vue"
import Notification from "../../components/notification-popup"

const TIBOOK = window.TIBOOK
const router = useRouter()

const friends = ref([])
const newfriends = ref([])
const showUser = ref(null)
const areaShowManage = reactive({
    "new-friends-area": false,
    "friends-area": false
})

/**
 * 展示对应的用户列表
 * @param {string} area
 */
function showListArea(area) {
    areaShowManage[area] = !areaShowManage[area]
}

/**
 * 展示用户详细信息
 * @param {any} userBaseInfo
 * @param {string} AddTime
 */
function showUserInfo(userBaseInfo, AddTime) {
    TIBOOK.serverRequest("SearchUserInfo", userBaseInfo.account, result => {
        Notification({
            type: result.code,
            title: "用户信息获取状态",
            content: result.msg
        })

        if (result.code === 200) {
            const userInfo = result.data
            userInfo.showType = "newfriend"
            if (AddTime) {
                userInfo.AddTime = moment(AddTime).format("YYYY-MM-DD HH:mm:ss")
                userInfo.showType = "friend"
            }
            console.log(userInfo)
            showUser.value = userInfo
            console.log(result)
        }
    })
}

/** 添加好友 */
function addFriend() {
    TIBOOK.serverRequest("AddFriend", showUser.value.account, result => {
        console.log(result)
    })
}

/** 切换到聊天窗 */
function toggleChatWindow() {
    router.push({
        name: "message",
        params: {
            joinAccount: showUser.value.account
        }
    })
}

// 获取用户的好友列表
TIBOOK.serverRequest("FindUserFriends", result => {
    console.log(result)
    Notification({
        type: result.code,
        title: "好友列表获取状态",
        content: result.msg
    })
    if (result.code === 200) {
        friends.value = result.data
    }
})

// 监听服务器发过来的添加好友申请
TIBOOK.onSocket("socket-add-friend", result => {
    newfriends.value.push(result)
})
</script>

<template>
    <div class="contact-view-container">
        <div class="friends-list-container view-element-container">
            <div class="list-area-title" :class="{ 'list-area-title-focus': areaShowManage['new-friends-area'] }" @click="showListArea('new-friends-area')">
                <p>新朋友{{ newfriends.length ? `: (${newfriends.length})` : "" }}</p>
                <drop-down-list size="20" />
            </div>
            <div class="new-friends-area list-area" :class="{ 'show-list-area': areaShowManage['new-friends-area'] }">
                <template v-if="newfriends.length">
                    <div v-for="newfriend in newfriends" :key="newfriend.account" class="list-area-ele" @click="showUserInfo(newfriend)">
                        <img :alt="newfriend.name" :src="newfriend.avatar" />
                        <div class="friend-name">{{ newfriend.name }}</div>
                        <div class="friend-account">{{ newfriend.account }}</div>
                    </div>
                </template>
            </div>
            <div class="list-area-title" :class="{ 'list-area-title-focus': areaShowManage['friends-area'] }" @click="showListArea('friends-area')">
                <p>好友{{ friends.length ? `: (${friends.length})` : "" }}</p>
                <drop-down-list size="20" />
            </div>
            <div class="friends-area list-area" :class="{ 'show-list-area': areaShowManage['friends-area'] }">
                <template v-if="friends.length">
                    <div v-for="friend in friends" :key="friend.account" ref="friendsArea" class="list-area-ele" @click="showUserInfo(friend, friend.AddTime)">
                        <img :alt="friend.name" :src="friend.avatar" />
                        <div class="friend-name">{{ friend.name }}</div>
                        <div class="friend-account">{{ friend.account }}</div>
                    </div>
                </template>
            </div>
        </div>
        <template v-if="showUser">
            <user-info-container :user-info="showUser">
                <template v-slot:user-operate>
                    <div class="operate-button" @click="toggleChatWindow()" v-if="showUser.showType === 'friend'">切换到聊天窗</div>
                    <div class="remove-friend operate-button" @click="pullFriend()" v-if="showUser.showType === 'friend'">删除好友</div>
                    <div class="operate-button" @click="addFriend()" v-if="showUser.showType === 'newfriend'">通过好友申请</div>
                </template>
            </user-info-container>
        </template>
    </div>
</template>

<style lang="less" scoped>
.contact-view-container {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: space-between;

    .friends-list-container {
        width: 230px;
        height: 100%;
        user-select: none;

        .list-area-title {
            position: relative;
            display: flex;
            width: 100%;
            height: 25px;
            padding-inline: 10px;
            justify-content: space-between;
            background-color: var(--container-title-background-color);
            cursor: pointer;

            &::after {
                content: "";
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 2px;
                background-color: var(--cue--line-color);
            }

            .i-icon-drop-down-list {
                transform: rotateZ(90deg);
                transition: var(--all-transition);
            }
        }

        .list-area-title-focus {
            .i-icon-drop-down-list {
                transform: rotateZ(0);
            }
        }

        .list-area {
            width: 100%;
            height: 0;
            opacity: 0;
            overflow-x: hidden;
            overflow-y: scroll;
            transition: var(--all-transition);

            .list-area-ele {
                position: relative;
                width: 100%;
                height: 55px;
                border-radius: 10px;
                background-color: var(--input-box-background-color);
                overflow: hidden;

                img {
                    position: absolute;
                    top: 50%;
                    left: 10px;
                    transform: translateY(-50%);
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                }

                .friend-name {
                    position: absolute;
                    top: 10px;
                    left: 70px;
                    font-size: 16px;
                }

                .friend-account {
                    position: absolute;
                    bottom: 5px;
                    left: 70px;
                    font-size: 14px;
                }
            }

            .current-list-area-ele {
                border: 2px solid var(--cue--line-color);
            }
        }

        .show-list-area {
            opacity: 1;
            height: auto;
            padding: 5px 8px;
        }
    }

    .operate-button {
        width: max-content;
        min-width: 100px;
        height: 35px;
        padding-inline: 10px;
        text-align: center;
        line-height: 35px;
        color: #fff;
        border-radius: 7px;
        background-color: var(--cue--line-color);
        cursor: pointer;
    }

    .remove-friend {
        background-color: #d51324;
        margin-left: 120px;
    }
}
</style>
