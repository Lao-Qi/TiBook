<template>
    <div id="side-nav-bar">
        <div class="nav-top-option">
            <el-tooltip :hide-after="0" :offset="2" :show-after="340" content="个人信息" placement="right">
                <div :class="{ 'current-option': current === 'home' }" class="option" @click="toggleOptions('home')">
                    <home theme="outline" size="30" fill="#333" />
                </div>
            </el-tooltip>
            <el-tooltip :hide-after="0" :offset="2" :show-after="340" content="聊天" placement="right">
                <div :class="{ 'current-option': current === 'message' }" class="option"
                    @click="toggleOptions('message')">
                    <comment theme="outline" size="30" fill="#333" />
                </div>
            </el-tooltip>
            <el-tooltip :hide-after="0" :offset="2" :show-after="340" content="联系人" placement="right">
                <div :class="{ 'current-option': current === 'contact' }" class="option"
                    @click="toggleOptions('contact')">
                    <personal-collection theme="outline" size="30" fill="#333" />
                </div>
            </el-tooltip>
            <el-tooltip :hide-after="0" :offset="2" :show-after="340" content="搜索" placement="right">
                <div :class="{ 'current-option': current === 'search' }" class="option"
                    @click="toggleOptions('search')">
                    <search theme="outline" size="30" fill="#333" />
                </div>
            </el-tooltip>
        </div>
        <div class="nav-bot-option">
            <el-tooltip :hide-after="0" :offset="2" :show-after="340" content="设置" placement="right">
                <div :class="{ 'current-option': current === 'config' }" class="option"
                    @click="toggleOptions('config')">
                    <setting-config theme="outline" size="30" fill="#333" />
                </div>
            </el-tooltip>
        </div>
    </div>
    <div id="content-win">
        <Suspense>
            <router-view @pageChange="toggleOptions"></router-view>
        </Suspense>
    </div>
</template>

<script setup>
import { ref, watchEffect } from "vue"
import { useRouter } from "vue-router"
import { SettingConfig, Comment, PersonalCollection, Home, Search } from "@icon-park/vue-next"

const router = useRouter()
const current = ref("message")

function toggleOptions(page) {
    current.value = page
}

watchEffect(() => {
    router.replace({ name: current.value })
})
</script>

<style lang="less">
#app {
    display: flex;
}

#side-nav-bar {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 55px;
    height: 100%;
    padding: 9px 0 9px 0;
    margin-right: 10px;
    overflow: hidden;
    background-color: var(--card-background-color);

    .nav-top-option {
        margin-bottom: auto;
    }

    .option {
        width: calc(100% - 1px);
        height: 55px;
        text-align: center;
        line-height: 55px;
        cursor: pointer;

        .iconfont {
            font-size: 24px;
        }
    }

    .current-option {
        position: relative;
        color: var(--text-color);

        &::before {
            position: absolute;
            display: block;
            content: "";
            width: 3px;
            height: 100%;
            border-radius: 3px;
            background-color: var(--small-mark-color);
        }
    }
}

#content-win {
    width: 100%;
    height: calc(100vh - 30px);
}
</style>
