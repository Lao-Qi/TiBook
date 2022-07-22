import { createRouter, createWebHashHistory } from "vue-router"

export const Router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: "/login", // 软件登录页
            name: "login",
            component: () => import("../view/login.vue"),
        },
        {
            path: "/main", // 软件主页
            name: "main",
            component: () => import("../view/main.vue"),
            children: [
                {
                    path: "/message",
                    name: "message",
                    component: () => import("../view/message.vue"),
                },
                {
                    path: "/home", // 用户信息页
                    name: "home",
                    component: () => import("../view/home.vue"),
                },
                {
                    path: "/contact", // 联系人页
                    name: "contact",
                    component: () => import("../view/contact.vue"),
                },
                {
                    path: "/search", // 搜索页
                    name: "search",
                    component: () => import("../view/search.vue"),
                },
                {
                    path: "/config", // 设置页
                    name: "config",
                    component: () => import("../view/config.vue"),
                },
            ],
        },
    ],
})
