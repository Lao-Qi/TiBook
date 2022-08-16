<script setup>
import { DropDownList } from "@icon-park/vue-next"
import { ref, reactive } from "vue"
import moment from "moment"
import userInfoContainer from "../../components/user-info-container.vue"

const TIBOOK = window.TIBOOK

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
async function showUserInfo(userBaseInfo, AddTime) {
    const userInfo = await getUserInfo(userBaseInfo.account)
    userInfo.showType = "newfriend"
    if (AddTime) {
        userInfo.AddTime = moment(AddTime).format("YYYY-MM-DD HH:mm:ss")
        userInfo.showType = "friend"
    }
    console.log(userInfo)
    showUser.value = userInfo
}

/**
 * 获取用户详细信息
 * @param {string} account
 */
function getUserInfo(account) {
    return new Promise(res => {
        TIBOOK.serverRequest("SearchUserInfo", account, result => {
            res(result.data)
        })
    })
}

/**
 * 添加好友
 */
function addFriend() {
    TIBOOK.serverRequest("AddFriend", showUser.value.account, result => {
        console.log(result)
    })
}

// 获取用户的好友列表
TIBOOK.serverRequest("FindUserFriends", result => {
    if (result.code === 200) {
        friends.value = result.firendsList
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
    user-select: none;

    .friends-list-container {
        width: 230px;
        height: 100%;

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
                transition: all ease 0.2s;
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
            box-shadow: var(--box-inset-show);
            overflow: hidden;
            transition: all ease 0.3s;

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
                    width: 50px;
                    height: 50px;
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
