import { createWebHistory, createRouter } from 'vue-router'
import Index from '@/components/index.vue'
import UserManage from "@/view/user/UserManager.vue"
import LoginView from "@/view/Login.vue"
//@ts-ignore
import RoleInfo from "@/view/RoleInfo.vue"

const routes = [
    {
        path: '/',
        component: LoginView
    },
    {
        path: '/dashboard',
        component: Index,
        children: [
            { path: 'UserManage', component: UserManage },
            { path: 'RoleInfo', component: RoleInfo },
        ]
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router