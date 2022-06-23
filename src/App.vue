<template>
<router-view></router-view>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
router.replace({
  path: "/login"
})

</script>

<style lang="less">
#app {
  display: flex;
}
</style>
