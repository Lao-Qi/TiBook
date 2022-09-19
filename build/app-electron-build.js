// const { spawn } = require("child_process")

// let buildOS = ""

// for (const [_, arg] of Object.entries(process.argv)) {
//     if (arg.includes("--os")) {
//         buildOS = `${arg.includes("w") ? "-w" : ""} ${arg.includes("m") ? "-m" : ""} ${arg.includes("l") ? "-l" : ""}`
//     }
// }

// const buildElectronProcess = spawn(`electron-builder --config='./electron-builder.js' --projectDir='./dist' ${buildOS}`)

// buildElectronProcess.on("message", msg => {
//     console.log(msg)
// })

// buildElectronProcess.on("error", err => {
//     console.error(err)
// })

const { build } = require("electron-builder")

module.exports = async () => {
    return await build({
        config: {
            productName: "题书",
            appId: "com.tibook.app",
            copyright: "Copyright © 2022 - present WangLaoQi(https://github.com/Lao-Qi)",
            files: ["app-main/**/*", "app-render/**/*"],
            directories: {
                buildResources: "public/**/*",
                output: "../app-dist"
            },
            asar: false,
            dmg: {
                window: {
                    x: 100,
                    y: 100,
                    width: 500,
                    height: 300
                }
            },
            nsis: {
                oneClick: false,
                installerIcon: "./public/icon-256x256.ico",
                installerHeaderIcon: "./public/icon-256x256.ico",
                uninstallerIcon: "./public/icon-uninstall-256x256.ico",
                uninstallDisplayName: "卸载题书",
                allowElevation: true,
                createDesktopShortcut: true,
                createStartMenuShortcut: true,
                allowToChangeInstallationDirectory: true,
                artifactName: "TIBookSetup-win-x32-${version}.${ext}"
            },
            win: {
                icon: "./public/icon-256x256.ico",
                target: [
                    {
                        target: "nsis",
                        arch: ["ia32"]
                    }
                ]
            },
            mac: {
                icon: "./public/icns-256x256.icns",
                target: {
                    target: "dmg",
                    arch: "x64"
                }
            },
            linux: {
                icon: "./public/icon-256x256.ico",
                target: "deb"
            }
        },
        projectDir: "./dist"
    })
}
