<script setup>
import { ref, onUpdated, onMounted } from "vue"
import { useRoute } from "vue-router"
import { PeoplePlusOne } from "@icon-park/vue-next"

const TIBOOK = window.TIBOOK
const route = useRoute()
const serverMatchUsers = ref([])

function AddUser(account) {
    TIBOOK.socketCommunicate("AddFriend", result => {})
}

// 服务器关键词搜索用户
function SearchKeyWordMatchInfo(keyWord) {
    TIBOOK.serverRequest("SearchUsers", keyWord, result => {
        if (result.code === 200) {
            serverMatchUsers.value = result.data
        }
    })
}

// 执行查询函数
onMounted(() => {
    SearchKeyWordMatchInfo(route.query.keyWord)
})

// 更新搜索关键词重新执行查询函数
onUpdated(() => {
    SearchKeyWordMatchInfo(route.query.keyWord)
})
</script>

<template>
    <div class="search-view-container">
        <div class="server-match-users-container view-element-container">
            <div class="container-title">
                <p>匹配用户: ({{ serverMatchUsers.length }})</p>
                <div class="cue-line-color"></div>
            </div>
            <div class="container-content">
                <template v-if="serverMatchUsers.length">
                    <div v-for="user in serverMatchUsers" :key="user.account" class="user-info-container">
                        <div class="user-avatar">
                            <img :src="user.avatar" />
                        </div>
                        <div class="user-name user-text-info">{{ user.name }}</div>
                        <div class="user-account user-text-info">{{ user.account }}</div>
                        <div class="add-this-user-icon" @click="AddUser(user.account)">
                            <people-plus-one size="20"></people-plus-one>
                        </div>
                    </div>
                </template>
            </div>
        </div>
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
        width: 40%;
        min-width: 220px;
        height: 100%;

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
            padding-inline: 10px;
            flex-wrap: wrap;
            align-items: flex-start;
            justify-content: space-between;

            .user-info-container {
                position: relative;
                width: 46%;
                min-width: 200px;
                height: 60px;
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
</style>
