import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import { ElementPlusResolver, VueUseComponentsResolver } from "unplugin-vue-components/resolvers"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue({
            include: [/\.vue$/, /\.md$/],
        }),
        AutoImport({
            resolvers: [ElementPlusResolver(), VueUseComponentsResolver()],
            imports: [
                "vue",
                "vue-router",
                {
                    "element-plus": ["ElTooltip", "ElNotification"],
                },
            ],
        }),
        Components({
            extensions: ["vue", "md", "svg"],
            directoryAsNamespace: true,
            dts: true,
            resolvers: [
                ElementPlusResolver(),
                VueUseComponentsResolver(),
                componentName => {
                    if (componentName.startsWith("Icon")) {
                        return { name: componentName.slice(4), from: "@icon-park/vue-next" }
                    }
                },
            ],
        }),
    ],
    base: "./",
    resolve: {
        alias: {
            "@": __dirname,
        },
    },
    build: {
        target: "modules",
        assetsInlineLimit: 4096,
        assetsDir: "./assets",
    },
    server: {
        host: true,
    },
})
