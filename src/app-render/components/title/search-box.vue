<template>
    <div class="search-box" :class="{ 'search-box-hover': !searchInputFoucs, 'search-input-foucs': searchInputFoucs }" v-if="renderSearchBox">
        <div class="search-icon" @click="searchInput.focus">
            <search size="23" />
        </div>
        <input
            type="text"
            placeholder="搜索"
            class="search-input"
            ref="searchInput"
            v-model="searchKeyWord"
            @focus="searchInputFoucs = true"
            @blur="SearchInputBlur"
            @keydown.enter="SearchContent"
        />
    </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { Search } from "@icon-park/vue-next"

const TIBOOK = window.TIBOOK
const router = useRouter()
const renderSearchBox = ref(false) // 是否渲染搜索框
const searchInputFoucs = ref(false) // 搜索框是否在聚焦状态
const searchInput = ref(null) // 页面搜索框
const searchKeyWord = ref("") // 关键词

// 跳转到搜索页
const SearchContent = () => {
    router.replace({ path: "/main/search", query: { keyWord: searchKeyWord.value } })
    searchKeyWord.value = ""
    searchInput.value.blur()
}
// 搜索框有内容，则失焦不隐藏
const SearchInputBlur = () => !searchKeyWord.value.length && (searchInputFoucs.value = false)

// 监听渲染环境的login变量
TIBOOK.watchRenderEnv("login", value => (renderSearchBox.value = value))
</script>

<style lang="less" scoped>
.search-box {
    display: flex;
    width: 30px;
    height: 30px;
    padding: 2px;
    padding-left: 4px;
    justify-content: left;
    align-items: center;
    border-radius: 20px;
    box-shadow: var(--box-inset-show);
    background-color: var(--input-box-background-color);
    transition: all ease 0.3s;
    overflow: hidden;

    .search-icon {
        display: inline-block;
        width: 23px;
        height: 23px;
        line-height: 30px;
        color: #000;
    }

    .search-input {
        opacity: 0;
        display: none;
        width: 150px;
        height: 30px;
        font-size: 15px;
        box-sizing: border-box;
        border: none;
        background-color: transparent;
        outline: none;

        &::placeholder {
            color: #8f8f8f;
        }
    }
}

.search-box-hover:hover {
    width: 200px;
    padding-right: 20px;

    .search-icon {
        margin-right: 10px;
    }

    .search-input {
        opacity: 1;
        display: inline-block;
    }
}

.search-input-foucs {
    width: 200px;
    padding-right: 20px;

    .search-icon {
        margin-right: 10px;
    }

    .search-input {
        opacity: 1;
        display: inline-block;
    }
}
</style>
