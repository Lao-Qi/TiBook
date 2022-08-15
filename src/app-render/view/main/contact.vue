<script setup>
import { DropDownList } from "@icon-park/vue-next"
import { ref } from "vue"
import friendInfoWin from "../../components/friend-info-win.vue"

const TIBOOK = window.TIBOOK
const newFriendsPartition = ref(null)
const friendsPartition = ref(null)
const friends = ref([])
const newfriends = ref([
    {
        account: "1230000000",
        name: "老A",
        avatar: "http://192.168.3.8:8080/resource/defaultAvater.jpg"
    }
])
const showFriend = ref(null)

const toggleShowFrien = (type, friend) => {
    showFriend.value = {
        account: friend.account,
        date: friend.date ?? 0,
        type
    }
}

TIBOOK.serverRequest("FindUserFriends", result => result.code === 200 && (friends.value = result.firendsList))
TIBOOK.onSocket("sockey-add-friend", result => newfriends.value.push(result))
</script>

<template>
    <div class="contact-view-container">
        <div class="friends-list-container view-element-container">
            <div class="list-partition-title list-partition-title-focus" data-ele-partition="new-friends-partition">
                <p>新朋友</p>
                <drop-down-list size="20" />
            </div>
            <div class="new-friends-partition list-partition">
                <template v-if="newfriends.length">
                    <div
                        v-for="newfriend in newfriends"
                        :key="newfriend.account"
                        ref="newFriendsPartition"
                        class="list-partition-ele"
                        @click="toggleShowFrien('newFriend', newfriend)"
                    >
                        <img :alt="newfriend.name" :src="newfriend.avatar" />
                        <div class="friend-name">{{ newfriend.name }}</div>
                        <div class="friend-account">{{ newfriend.account }}</div>
                    </div>
                </template>
            </div>
            <div class="list-partition-title list-partition-title-focus" data-ele-partition="friends-partition">
                <p>好友</p>
                <drop-down-list size="20" />
            </div>
            <div class="friends-partition list-partition">
                <template v-if="friends.length">
                    <div v-for="friend in friends" :key="friend.account" ref="friendsPartition" class="list-partition-ele" @click="toggleShowFrien('friend', friend)">
                        <img :alt="friend.name" :src="friend.avatar" />
                        <div class="friend-name">{{ friend.name }}</div>
                        <div class="friend-account">{{ friend.account }}</div>
                    </div>
                </template>
            </div>
        </div>
        <div class="contact-info-box">
            <template v-if="showFriend">
                <friend-info-win :account="showFriend.account" :show-friend-type="showFriend.type" :add-time="showFriend.date" />
            </template>
        </div>
    </div>
</template>

<style lang="less" scoped>
.contact-view-container {
    display: flex;
    width: 100%;
    height: 100%;

    .friends-list-container {
        max-width: 250px;
        min-width: 170px;
        width: 20vw;
        height: 100%;
        border-radius: 10px;
        background-color: var(--box-background-color);

        .list-partition-title {
            display: flex;
            justify-content: space-between;
            width: 100%;
            height: 25px;
            padding-inline: 10px;
            background-color: var(--input-box-background-color);

            .i-icon-drop-down-list {
                transform: rotateZ(90deg);
                transition: all ease 0.2s;
            }
        }

        .list-partition-title-focus {
            .i-icon-drop-down-list {
                transform: rotateZ(0);
            }
        }

        .list-partition {
            width: 100%;
            height: auto;
            padding: 5px 8px;
            box-shadow: var(--box-inset-show);

            .list-partition-ele {
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

            .current-list-partition-ele {
                border: 2px solid var(--cue--line-color);
            }
        }
    }

    .contact-info-box {
        display: flex;
        flex: 1;
        justify-content: center;
    }
}
</style>
