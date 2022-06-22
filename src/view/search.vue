<template>
  <div id="search-page-box">
    <div id="page-content" :class="{'is-show': Boolean(showUser)}">
      <div id="search-box">
        <input
          id="search-input-box"
          placeholder="输入用户的ID，名称，关键词..."
          type="text"
          @keydown.enter="Search"
          ref="SearchInput"
        />
      </div>
      <div id="search-result-box">
        <p v-if="searchData.length">用户:</p>
        <div id="account-list-box">
          <template v-if="searchData.length">
            <user-card
              v-for="item in searchData"
              :key="item.account"
              :account="item.account"
              :name="item.name"
              :avatar="item.avatar"
              @click="getShowUserInfo(item.account)"
            />
          </template>
        </div>
      </div>
    </div>
    <div id="search-user-info-box" :class="{'is-show': Boolean(showUser)}">
      <template v-if="showUser">
        <div id="search-user-basic-info">
          <span class="name">{{showUser.name}}</span>
          <img :src="VerifyAvatar(showUser.avatar)" :alt="showUser.name">
        </div>
        <div id="search-user-control">
          <a href="javascript:;" @click="addFriend" id="add-friend-btn">添加好友</a>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: "search",
  created() {
    document.querySelector("#title>p").innerHTML = "Search";
    this.$emit("pageChange", "search");
  }
}
</script>

<script setup>
import { onMounted, ref } from "vue";
import { ElNotification } from "element-plus";
import UserCard from "../components/user-card.vue";
const { ipcRenderer } = require("electron");

const SearchInput = ref(null);
const searchData = ref([]);
const showUser = ref(null);

// 搜索函数
async function Search() {
  searchData.value = await ipcRenderer.invoke("search-users", SearchInput.value.value);
}


// 验证头像
const VerifyAvatar = avatar => avatar === 'none' ? '/src/assets/img/DefaultAvatar.jpg': `http://127.0.0.1:8080/user/avatar/${avatar}`;
// 获取要显示的用户的详细信息
async function getShowUserInfo(account) {
  const SearchUser = await ipcRenderer.invoke("get-user-info", account);
  if(SearchUser) {
    showUser.value = SearchUser
  }
}
// 添加好友
function addFriend() {
  ipcRenderer.send("add-friend", showUser.value.account);
}


// 用户加载的返回消息
ipcRenderer.on("add-friend-return", (event, returnData) => {
  if(returnData.code === 200) {
    ElNotification({
      title: "成功消息",
      message: returnData.msg,
      type: "success",
      offset: 20
    })
  }else if(returnData.code >= 404){
    ElNotification({
      title: "错误消息",
      message: returnData.msg,
      type: "error",
      offset: 20
    })
  }else {
    ElNotification({
      title: "警告提示消息",
      message: returnData.msg,
      type: "warning",
      offset: 20
    })
  }

})


// 搜索框默认聚焦
onMounted(() => {
  SearchInput.value.focus();
});
</script>

<style lang="less">
#search-page-box {
  display: flex;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: var(--theme-color-two);
  border-left: 2px solid var(--chat-win-border-color);

  #page-content {
    display: flex;
    flex-direction: column;
    align-content: center;
    width: 80%;
    height: 100%;
    min-width: 460px;
    max-width: 600px;
    padding-top: 10vh;
    padding-left: 10px;

    #search-box {
      width: 100%;
      height: 50px;
      text-align: center;

      #search-input-box {
        width: 80%;
        height: 100%;
        padding: 0 20px 0 20px;
        font-size: 18px;
        border-radius: 5px;
        box-sizing: border-box;
        border: 2px solid rgba(0, 0, 0, 0.3);
        box-shadow: 2px 1px 3px 1px rgba(0, 0, 0, 0.3) inset;
        background-color: #fdfdfd;
        outline: none;
        transition: all 0.3s ease;
        caret-color: var(--theme-color-two);

        &::placeholder {
          color: #999;
        }

        &:hover {
          border: 2px solid #fdfdfd;
        }

        &:focus {
          border: 2px solid #fdfdfd;
        }
      }
    }

    #search-result-box {
      padding-top: 30px;

      p {
        font-size: 18px;
        color: var(--theme-color-three);
      }

      #account-list-box {
        display: flex;
        justify-content: space-evenly;
      }
    }
  }

  #search-user-info-box {
    display: none;
    padding: 50px 20px;
    border-left: 2px solid var(--chat-win-border-color);

    #search-user-basic-info {
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      width: 100%;
      height: auto;
      text-align: center;

      img {
        display: inline-block;
        width: 100px;
        height: 100px;
        border-radius: 10px;
      }

      .name {
        font-size: 18px;
      }
    }

    #search-user-control {
      #add-friend-btn {
        padding: 5px 10px;
        color: var(--theme-color-three);
        text-decoration: none;
        border-radius: 10px;
        box-shadow: 2px 2px 10px 0px inset rgba(255, 255, 255, 0.4);
        border: 2px solid var(--theme-color-one);
        background-color: var(--theme-color-one);
      }
    }
  }

  .is-show {
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0;
    display: block !important;
  }
}
</style>
