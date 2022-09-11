import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

export default defineConfig({
    root: "./app-render",
    base: "./",
    plugins: [vue()],
    server: {
        host: true,
        port: 3000
    }
})
