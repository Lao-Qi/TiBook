import { createRouter, createWebHashHistory } from "vue-router"

export const Router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: "/account-help", // 软件登录页
            name: "account-help",
            component: () => import("../view/accountHelp.vue"),
            children: [
                {
                    path: "login",
                    name: "login",
                    component: () => import("../view/accountHelp/login.vue")
                },
                {
                    path: "register",
                    name: "register",
                    component: () => import("../view/accountHelp/register.vue")
                }
            ]
        },
        {
            path: "/main", // 软件主页
            name: "main",
            component: () => import("../view/main.vue"),
            children: [
                {
                    path: "message",
                    name: "message",
                    component: () => import("../view/main/message.vue")
                },
                {
                    path: "home", // 用户信息页
                    name: "home",
                    component: () => import("../view/main/home.vue")
                },
                {
                    path: "contact", // 联系人页
                    name: "contact",
                    component: () => import("../view/main/contact.vue")
                },
                {
                    path: "search", // 搜索页
                    name: "search",
                    component: () => import("../view/main/search.vue")
                },
                {
                    path: "config", // 设置页
                    name: "config",
                    component: () => import("../view/main/config.vue")
                }
            ]
        }
    ]
})
