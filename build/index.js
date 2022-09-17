"use strict"

const { readFileSync, writeFileSync, cpSync, rmSync, mkdirSync, accessSync } = require("fs")
const { join } = require("path")

/**
 * 先打包渲染资源后打包主资源，顺序不能颠倒
 * 渲染资源打包后资源存放于dist下面，直接存放，没有多包一层目录
 *
 * 主资源打包后生成main.js文件，存放于dist下面，作为软件的入口文件
 *
 * 所有软件运行时得用到的包都被会打包到文件里面，所有不需要node_module文件夹
 * 且打包后的文件内部有做了代码的压缩，所以体积也会小很多
 *
 * 唯一导入就electron，但是在打包后的软件中electron已经内置，所有不需要
 */

// 使用立即执行函数的方式可以用来实现终止文件执行的功能
;(() => {
    const build_operates = {
        init_dist: () => {
            try {
                console.log("初始化dist文件夹 ...")
                rmSync(join(__dirname, "./dist"), { recursive: true })
                mkdirSync(join(__dirname, "./dist"))
                console.log("初始化dist文件夹 - 成功")
            } catch (err) {
                console.log("初始化dist文件夹 - 失败")
                throw err
            }
        },
        cp_public: () => {
            try {
                console.log("拷贝public目录 ...")
                cpSync(join(__dirname, "../public"), join(__dirname, "./dist/public"), { recursive: true })
                console.log("拷贝public目录 - 成功")
            } catch (err) {
                console.log("拷贝public资源 - 失败")
                throw err
            }
        },
        generate_package: () => {
            /**
             * 在打包好了的dist文件夹内部中添加package.json文件，其中的信息来自跟目录下的app.deploy.json
             *
             * dist将作为软件最终的资源被打包进electron应用的app.asar中
             */
            try {
                console.log("生成package.json ...")
                const APP_DEPLOY = JSON.parse(readFileSync(join(__dirname, "../app.deploy.json")))
                const APP_electron_version = JSON.parse(readFileSync(join(__dirname, "../package.json"))).devDependencies.electron
                // 配置打包好的资源的入口文件
                APP_DEPLOY["main"] = "./app-main/main.js"

                APP_DEPLOY["devDependencies"] = {
                    electron: APP_electron_version
                }

                writeFileSync(join(__dirname, "./dist/package.json"), JSON.stringify(APP_DEPLOY))
                console.log("生成package.json - 成功")
            } catch (err) {
                console.log("生成package.json - 失败")
                throw err
            }
        },
        render_build: () => {
            try {
                accessSync(join(__dirname, "./dist/app-render"))
                rmSync(join(__dirname, "./dist/app-render"), { recursive: true })
            } catch {
                mkdirSync(join(__dirname, "./dist/app-render"))
            }
            require("./app-render-build")
        },
        main_build: () => {
            try {
                accessSync(join(__dirname, "./dist/app-main"))
                rmSync(join(__dirname, "./dist/app-main"), { recursive: true })
            } catch {
                mkdirSync(join(__dirname, "./dist/app-main"))
            }
            require("./app-main-build")
        },
        electron_build: () => {
            require("./app-electron-build")
        }
    }

    if (process.argv.length >= 2) {
        process.argv.shift()
        process.argv.shift()

        for (const [_, operateName] of Object.entries(process.argv)) {
            const operate = build_operates[operateName]
            if (operate) {
                operate()
            }
        }
    } else {
        build_operates.init_dist()
        build_operates.main_build()
        build_operates.render_build()
        build_operates.cp_public()
        build_operates.generate_package()
        build_operates.electron_build()
    }
})()
