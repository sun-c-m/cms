import { createWebHistory, createRouter } from 'vue-router'
import indexView from '@/components/index.vue'
import UserManager from "@/view/user/UserManager.vue"
import LoginView from "@/view/Login.vue"
//@ts-ignore
import RoleInfo from "@/view/RoleInfo.vue"

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        component: LoginView
    },
    {
        path: '/index',
        component: indexView,
        children: [
            { path: 'UserManager', component: UserManager },
            { path: 'RoleInfo', component: RoleInfo },
        ]
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router