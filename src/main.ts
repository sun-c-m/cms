import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from "./router/router.ts";
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const elementLocale = {
    ...zhCn,
    el: {
        ...zhCn.el,
        pagination: {
            ...zhCn.el.pagination,
            goto: '跳转到',
            pagesize: '/页',
            total: '共 {total}',
        },
    },
}
const app=createApp(App);

app.use(ElementPlus, { locale: elementLocale })
app.use(router);
app.mount('#app')
