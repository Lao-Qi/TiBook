<template>
  <p>登录页</p>
  <a href="javascript:;" @click="goMain">切换到主页</a>
</template>

<script>
export default {
  name: "login"
}
</script>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();

function goMain() {
  router.replace({
    path: "/main"
  })
}
</script>

<style scoped>

</style>