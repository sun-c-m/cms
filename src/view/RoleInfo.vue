<template>
  <div class="role-management">
    <!-- 搜索区域 -->
    <el-card shadow="never" style="margin-bottom: 20px;">
      <el-input
          v-model="searchKeyword"
          placeholder="请输入角色名称搜索"
          clearable
          style="width: 300px"
      />
    </el-card>

    <!-- 角色表格 -->
    <el-table :data="allRoles" border style="width: 100%">
      <el-table-column prop="id" label="角色ID" width="120" />
      <el-table-column prop="name" label="角色名称" />

      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="success" @click="handleAuthorize(scope.row)">授权</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <div class="pagination-wrapper">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[1, 2, 3]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import {ref, computed, watch, onMounted} from 'vue'
import { ElMessageBox } from 'element-plus'
import { debounce } from 'lodash-es'
import {getRoleInfoPage} from "@/http/role.js";

// 模拟原始角色数据（实际应来自 API）
const allRoles = ref([])

const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(1)
const total = ref(0)
const getRoleInfoData = () => {
  const data={
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    params:[
      {
        name:"roleName",
        value:searchKeyword.value}
    ]
  }

  getRoleInfoPage(data).then((res) => {
    console.log(res);
    //解构
    let{records,total:totalCount} = res.data;
    allRoles.value = records;
    total.value = totalCount;
  })
}
watch(searchKeyword, () => {
  currentPage.value = 1
  getRoleInfoData();
},{immediate:true})
// 过滤后的角色（响应式）
const filteredRoles = computed(() => {
  if (!searchKeyword.value.trim()) return allRoles.value
  const keyword = searchKeyword.value.trim().toLowerCase()
  return allRoles.value.filter(role =>
      role.name.toLowerCase().includes(keyword)
  )
})

// 分页事件
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  getRoleInfoData();
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getRoleInfoData();
}

// 操作方法
const handleEdit = (role) => {
  console.log('编辑角色:', role)
}

const handleAuthorize = (role) => {
  console.log('授权角色:', role)
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm(
        '确定要删除该角色吗？此操作不可恢复！',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )
    // 执行删除
    allRoles.value = allRoles.value.filter(r => r.id !== id)
    // 如果当前页无数据且不是第一页，则跳回上一页
    if (paginatedRoles.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
  } catch (error) {
    // 用户取消
  }
}
</script>

<style scoped>
.role-management {
  padding: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>