const { build } = require("vite")


build({
    // 使用外部的配置文件来加载需要前端运行环境才能导入的打包优化插件
    configFile: join(__dirname, "./vite.config.js"),
    root: join(__dirname, "../src/electron-render"),
    base: "./",
    build: {
        target: "modules",
        assetsDir: "./assets",
        outDir: join(__dirname, "./dist")
    }
}).then(() => {
    console.log("渲染资源打包成功");
}).catch(err => {
    console.log("渲染资源打包错误");
    throw err
})