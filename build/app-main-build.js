const esbuild = require("esbuild")
const { join } = require("path")
const { mkdirSync, cpSync } = require("fs")

// 配置一个打包中的环境变量
process.env["BUILD_ING"] = true
const mainResourcePath = "./dist/app-main"

try {
    console.log("打包后台主进程资源 ...")
    console.log("打包后台主进程资源 - 主进程资源")
    esbuild.buildSync({
        entryPoints: [join(__dirname, "../src/app-main/main.js")], // 入口文件
        bundle: true, // 打包依赖文件或包
        write: true,
        minify: true, // 代码压缩
        platform: "node", // 文件类型
        format: "cjs", // 文件类型
        outdir: mainResourcePath, // 结束文件夹
        external: ["electron"] // 免打包的包
    })

    console.log("打包后台主进程资源 - 服务进程预加载脚本")
    // 服务进程的预加载脚本
    esbuild.buildSync({
        entryPoints: [join(__dirname, "../src/app-main/lib/ServicesProcess/servicePreload.js")],
        bundle: true,
        write: true,
        minify: true,
        platform: "browser",
        format: "esm",
        outfile: `${mainResourcePath}/servicePreload.js`,
        external: ["electron"]
    })

    console.log("打包后台主进程资源 - 工具进程预加载脚本")
    // 工具进程的预加载脚本
    esbuild.buildSync({
        entryPoints: [join(__dirname, "../src/app-main/lib/ToolsProcess/toolPreload.js")],
        bundle: true, // 打包依赖文件或包
        write: true,
        minify: true, // 代码压缩
        platform: "node", // 文件类型
        format: "cjs", // 文件类型
        outfile: `${mainResourcePath}/toolPreload.js`,
        external: ["electron"] // 免打包的包
    })
    console.log("打包后台主进程资源 - 成功")
} catch (err) {
    console.log("打包后台主进程资源 - 失败")
    throw err
}

try {
    console.log("打包工具进程资源 ...")

    const toolsConfig = require("../src/app-main/toolsProcessFile.config.js")

    esbuild.buildSync({
        entryPoints: toolsConfig.map(toolConfig => toolConfig.path),
        bundle: true, // 打包依赖文件或包
        write: true,
        minify: true, // 代码压缩
        platform: "node", // 文件类型
        format: "cjs", // 文件类型
        outdir: `${mainResourcePath}/tools/`
    })
    console.log("打包工具进程资源 - 成功")
} catch (err) {
    console.log("打包工具进程资源 - 失败")
    throw err
}

try {
    console.log("移动内置的服务进程资源 ...")
    mkdirSync(`${mainResourcePath}/services`)
    cpSync(join(__dirname, "../src/app-main/services"), join(__dirname, `${mainResourcePath}/services`), {
        recursive: true
    })
    console.log("移动内置的服务进程资源 - 成功")
} catch (err) {
    console.log("移动内置的服务进程资源 - 失败")
    throw err
}
