<script setup lang="ts">
import {ref} from 'vue';

const input=ref('')
const options=[
  {
    id:'1',
    label:'管理员',
  },
  {
    id:'2',
    label:'普通用户',
  },
  {
    id:'3',
    label:'职员',
  }
]
const handleClick = () => {
  console.log('click')
}
const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
  }
]

</script>

<template>
  用户名：<el-input v-model="input" style="width: 300px" placeholder="请输入用户名" />
  所属角色：<el-select v-model="input" style="width: 300px" placeholder="选择所属角色">
<el-option
    v-for="item in options"
    :id="item.id"
    :label="item.label"
/>
</el-select >
  <el-button type="primary">查询</el-button>
  <el-button type="info">重置</el-button>

  <el-table :data="tableData" style="width: 100%">
    <el-table-column fixed prop="date" label="用户名" width="auto" />
    <el-table-column prop="name" label="所属角色" width="auto" />
    <el-table-column fixed="right" label="操作" min-width="auto">
      <template #default>
        <el-button link type="primary" size="small" @click="handleClick">
          编辑
        </el-button>
        <el-button link type="primary" size="small">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped>

</style>