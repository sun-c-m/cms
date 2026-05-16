<template>
  <div class="login-container">
    <el-card class="login-form">
      <h2 class="title">CMS 管理系统</h2>
      <el-form
          ref="loginFormRef"
          :model="form"
          :rules="rules"
          label-position="top"
          @submit.prevent="handleSubmit"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              native-type="submit"
              style="width: 100%"
              :loading="loading"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import router from '@/router/router'
import {login} from '@/http/login.ts'
import type { ElForm } from 'element-plus'
import {useUserStore} from "@/stores/user.ts";


const form = ref({
  username: 'sun',
  password: '784250'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码不能少于6位', trigger: 'blur' }
  ]
}

const loginFormRef = ref<InstanceType<typeof ElForm> | null>(null)
const loading = ref(false)

const handleSubmit = () => {
  loginFormRef.value?.validate(async (valid:any) => {
    if (valid) {
      loading.value = true
      try {
        // 登录请求
        login(form.value).then((data:any) => {
          console.log(data);
          if(data.code==200) {
            //localStorage.setItem('info', JSON.stringify(data));
            const userStore = useUserStore();
// 1. 存入 Token (Action 里会同步到 localStorage)
            userStore.setToken(data.data.token);
            userStore.setUserInfo(data.data);
            router.push('/dashboard')
          }
        })
        // 登录成功后可跳转：router.push('/dashboard')
      } catch (error) {
        console.error('登录失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.login-form {
  width: 400px;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}
</style>