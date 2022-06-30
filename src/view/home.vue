<template>
    <h3>home</h3>
</template>

<script>
export default {
    name: "home",
    created() {
        document.querySelector("#title>p").innerHTML = "Home"
        this.$emit("pageChange", "home")
    },
}
</script>
