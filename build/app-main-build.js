const esbuild = require("esbuild")
const { join } = require("path")

try {
    esbuild.buildSync({
        entryPoints: [join(__dirname, "../src/electron-main/main.js")],
        bundle: true,
        write: true,
        minify: true,
        platform: "node",
        format: "cjs",
        outdir: "./dist",
        external: ["electron"]
    })
} catch (err) {
    console.error(err)
}
