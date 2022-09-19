const { build } = require("vite")
const { join } = require("path")

module.exports = async () => {
    return await build({
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
}
