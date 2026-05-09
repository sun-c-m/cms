import { createWebHistory, createRouter } from 'vue-router'
import Index from '@/components/index.vue'
import UserManager from "@/view/user/UserManager.vue"
import LoginView from "@/view/Login.vue"
//@ts-ignore
import RoleInfo from "@/view/RoleInfo.vue"

const routes = [
    {
        path: '/login',
        component: LoginView
    },
    {
        path: '/dashboard',
        component: Index,
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