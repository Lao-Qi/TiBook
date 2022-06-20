import {createRouter, createWebHashHistory} from "vue-router";
import info_page from '../view/info.vue';
import home_page from "../view/home.vue";
import contact_page from '../view/contact.vue';
import search_page from '../view/search.vue';
import config_page from '../view/config.vue';

export const Router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: "/", // 消息页
            name: "info",
            component: info_page,
            props: {

            }
        }, {
            path: "/home", // 用户信息页
            name: "home",
            component: home_page
        }, {
            path: "/contact", // 联系人页
            name: "contact",
            component: contact_page
        }, {
            path: "/search", // 搜索页
            name: "search",
            component: search_page,
        }, {
            path: "/config", // 设置页
            name: "config",
            component: config_page
        }
    ]
})