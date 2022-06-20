import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Router } from './router/index';
import { ElTooltip, ElNotification } from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';


const pinia = createPinia();
const app = createApp(App);
app.use(Router);
app.use(ElTooltip);
app.use(ElNotification);
app.use(pinia);
app.mount('#app');