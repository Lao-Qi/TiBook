<template>
  <div id="side-nav-bar">
    <div class="nav-top-option">
      <el-tooltip
          :hide-after="0"
          :offset="2"
          :show-after="340"
          content="个人信息"
          placement="right"
      >
        <div
            :class="{ 'current-option': current === 'home' }"
            class="option"
            @click="ToggleOptions('home')"
        >
          <i class="iconfont">&#xe603;</i>
        </div>
      </el-tooltip>
      <el-tooltip
          :hide-after="0"
          :offset="2"
          :show-after="340"
          content="聊天"
          placement="right"
      >
        <div
            :class="{ 'current-option': current === 'message' }"
            class="option"
            @click="ToggleOptions('message')"
        >
          <i class="iconfont">&#xe8bd;</i>
        </div>
      </el-tooltip>
      <el-tooltip
          :hide-after="0"
          :offset="2"
          :show-after="340"
          content="联系人"
          placement="right"
      >
        <div
            :class="{ 'current-option': current === 'contact' }"
            class="option"
            @click="ToggleOptions('contact')"
        >
          <i class="iconfont">&#xe613;</i>
        </div>
      </el-tooltip>
      <el-tooltip
          :hide-after="0"
          :offset="2"
          :show-after="340"
          content="搜索"
          placement="right"
      >
        <div
            :class="{ 'current-option': current === 'search' }"
            class="option"
            @click="ToggleOptions('search')"
        >
          <i class="iconfont">&#xe6a5;</i>
        </div>
      </el-tooltip>
    </div>
    <div class="nav-bot-option">
      <el-tooltip
          :hide-after="0"
          :offset="2"
          :show-after="340"
          content="设置"
          placement="right"
      >
        <div
            :class="{ 'current-option': current === 'config' }"
            class="option"
            @click="ToggleOptions('config')"
        >
          <i class="iconfont">&#xe61f;</i>
        </div>
      </el-tooltip>
    </div>
  </div>
  <div id="content-win">
    <Suspense>
      <router-view @pageChange="ToggleOptions"></router-view>
    </Suspense>
  </div>
</template>

<script setup>
import { ref, watchEffect } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const current = ref("message");

function ToggleOptions(page) {
  current.value = page;
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
  overflow: hidden;
  background-color: var(--theme-color-two);

  .nav-top-option {
    margin-bottom: auto;
  }

  .option {
    width: calc(100% - 1px);
    height: 55px;
    text-align: center;
    line-height: 55px;
    cursor: pointer;
    border-left: 2px solid transparent;

    .iconfont {
      font-size: 24px;

      &:hover {
        color: #fff;
      }
    }
  }

  .current-option {
    color: var(--theme-color-three);
    border-left: 2px solid var(--theme-color-three);
  }
}

#content-win {
  width: 100%;
  height: calc(100vh - 30px);
}
</style>
