const { build } = require("vite")
const { join } = require("path")

console.log("打包渲染进程资源 ...")
build({
    // 使用外部的配置文件来加载需要前端运行环境才能导入的打包优化插件
    configFile: join(__dirname, "./vite.config.js"),
    root: join(__dirname, "../src/app-render"),
    base: "./",
    build: {
        target: "modules",
        assetsDir: "./assets",
        outDir: join(__dirname, "./dist/app-render"),
        emptyOutDir: true
    }
})
    .then(() => {
        console.log("打包渲染进程资源 - 成功")
    })
    .catch(err => {
        console.log("打包渲染进程资源 - 错误")
        throw err
    })
