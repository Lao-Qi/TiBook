<script setup>
import { ref, watch } from "vue"
import { useRoute } from "vue-router"
import { PeoplePlusOne } from "@icon-park/vue-next"
import userInfoContainer from "../../components/user-info-container.vue"
import Notification from "../../components/notification-popup"

const TIBOOK = window.TIBOOK
const route = useRoute()
const serverMatchUsers = ref([])
const showUser = ref(null)

watch(
    () => route.query.keyWord,
    value => {
        SearchKeyWordMatchInfo(value)
    },
    { immediate: true }
)

/**
 * 关键词搜索用户
 * @param {string} keyWord
 */
function SearchKeyWordMatchInfo(keyWord) {
    TIBOOK.serverRequest("SearchUsers", keyWord, result => {
        if (result.code === 200) {
            serverMatchUsers.value = result.data
        }
    })
}

/**
 * 添加好友
 * @param {string} account
 */
function AddUser(account) {
    TIBOOK.socketCommunicate("AddFriend", account, result => {
        console.log(result)
    })
}

/**
 * 渲染详细信息
 * @param {string} account
 */
async function showUserInfo(account) {
    try {
        const userInfo = await getUserInfo(account)
        console.log("userInfo", userInfo)
        showUser.value = userInfo
    } catch (result) {
        Notification({
            type: result.code,
            title: "搜索页状态",
            content: result.msg
        })
    }
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
</script>

<template>
    <div class="search-view-container" :class="{ 'exist-show-user': showUser }">
        <div class="server-match-users-container view-element-container">
            <div class="container-title">
                <p>匹配用户: ({{ serverMatchUsers.length }})</p>
                <div class="cue-line-color"></div>
            </div>
            <div class="container-content">
                <template v-if="serverMatchUsers.length">
                    <div v-for="user in serverMatchUsers" :key="user.account" class="user-info-container" @click="showUserInfo(user.account)">
                        <div class="user-avatar">
                            <img :src="user.avatar" />
                        </div>
                        <div class="user-name user-text-info">{{ user.name }}</div>
                        <div class="user-account user-text-info">{{ user.account }}</div>
                        <div class="add-this-user-icon" @click="AddUser(user.account)">
                            <people-plus-one size="20" title="添加好友"></people-plus-one>
                        </div>
                    </div>
                </template>
            </div>
        </div>
        <template v-if="showUser">
            <user-info-container :user-info="showUser">
                <template v-slot:user-operate>
                    <div class="add-friend operate-button" @click="AddUser(showUser.account)">添加好友</div>
                </template>
            </user-info-container>
        </template>
    </div>
</template>

<style lang="less">
.search-view-container {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;

    .server-match-users-container {
        position: relative;
        width: 480px;
        min-width: 250px;
        height: 100%;
        transition: all ease 0.2s;

        .container-title {
            width: 100%;
            height: 30px;
            padding-left: 10px;
            line-height: 30px;

            .cue-line-color {
                position: absolute;
                left: 0;
                width: 100%;
                height: 2px;
            }

            p {
                font-size: 16px;
            }
        }

        .container-content {
            display: flex;
            width: 100%;
            height: auto;
            padding-inline: 5px;
            flex-wrap: wrap;
            justify-content: space-between;

            .user-info-container {
                position: relative;
                width: 230px;
                height: 60px;
                max-width: 300px;
                min-width: 200px;
                margin-top: 10px;
                border-radius: 10px;
                background-color: var(--user-list-element-background-color);
                user-select: none;

                .user-avatar {
                    position: absolute;
                    top: 50%;
                    left: 5px;
                    width: 50px;
                    height: 50px;
                    border-radius: 10px;
                    transform: translateY(-50%);
                    overflow: hidden;
                }

                .user-name {
                    left: 60px;
                    top: 5px;
                }

                .user-account {
                    bottom: 5px;
                    color: #aaa;
                    font-size: 15px;
                }

                .user-text-info {
                    position: absolute;
                    left: 65px;
                    width: max-content;
                    height: auto;
                }

                .add-this-user-icon {
                    position: absolute;
                    top: 5px;
                    right: 10px;
                    width: max-content;
                    height: max-content;
                    cursor: pointer;
                }
            }
        }
    }
}

.exist-show-user {
    justify-content: space-between;

    .server-match-users-container {
        width: 230px;

        .container-content {
            justify-content: center;
        }
    }

    .operate-button {
        width: 100px;
        height: 35px;
        text-align: center;
        line-height: 35px;
        color: #fff;
        border-radius: 7px;
        background-color: var(--cue--line-color);
        cursor: pointer;
    }
}
</style>
