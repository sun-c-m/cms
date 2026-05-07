import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 5000, // 1000ms 有点短，容易超时
});

// 请求拦截器
instance.interceptors.request.use((config) => {
    // 只有当方法不是 GET 时，才强制设置 JSON 格式
    if (config.method?.toLowerCase() !== 'get') {
        config.headers['Content-Type'] = 'application/json;charset=UTF-8';
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
// 响应拦截器
instance.interceptors.response.use(
    (response) => {
        // 过滤掉 axios 包装，直接返回后端的数据内容
        return response.data;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token 过期或无效
            console.error("登录状态失效，请重新登录");
            localStorage.removeItem('token'); // 清除本地 token
            window.location.href = '/login'; // 强制跳转登录页
        }
        return Promise.reject(error);
    }
);

export default (options: any) => instance(options);