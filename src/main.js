import { createApp } from "vue"
import { Router } from "./router/index"
import { ElTooltip, ElNotification } from "element-plus"
import "element-plus/dist/index.css"
import "@icon-park/vue-next/styles/index.css"
import App from "./App.vue"

const app = createApp(App)
app.use(Router)
app.use(ElTooltip)
app.use(ElNotification)
app.mount("#app")
