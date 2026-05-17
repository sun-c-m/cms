<script setup lang="ts">
import {nextTick, ref, shallowRef,onMounted,reactive} from "vue";
import '@wangeditor/editor/dist/css/style.css'
import {Editor, Toolbar} from '@wangeditor/editor-for-vue'
import {
  ElMessage,
  type FormInstance,
  type FormRules,
} from "element-plus";
import type {IDomEditor, IEditorConfig, IToolbarConfig} from "@wangeditor/editor";
import {createNews,getNewsPage} from "@/http/news.ts";

interface NewsForm {
  title: string
  category: string
  supplier: string
  reviewer: string
  content: string
}

interface NewsItem extends NewsForm {
  id: string
  status: string
  createTime?: string
  updateTime?: string
  publishTime?: string
}
const emptyForm = (): NewsForm => ({
  title: '',
  category: '学院新闻',
  supplier: '',
  reviewer: '',
  content: '',
})

const rules: FormRules<NewsForm> = {
  title: [{required: true, message: '请输入新闻标题', trigger: 'blur'}],
  category: [{required: true, message: '请选择栏目', trigger: 'change'}],
  content: [{required: true, message: '请输入新闻正文', trigger: 'change'}],
}

const categoryOptions = ['学院新闻', '通知公告', '学术活动', '学工新闻']
const formRef = ref<FormInstance>()
const editorRef = shallowRef<IDomEditor>()
const newsForm = ref<NewsForm>(emptyForm())
const dialogVisible = ref(false)
const submitting = ref(false)
const shouldAutoScrollEditor = ref(false)
const removeEditorListeners = ref<(() => void) | null>(null)
let editorMutationObserver: MutationObserver | null = null
const editorWrapperRef = ref<HTMLElement>()
const tableLoading = ref(false)
const newsList = ref<NewsItem[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const queryForm = reactive({
  keyword: '',
  category: '',
  status: '',
})

const statusTextMap: Record<string, string> = {
  PENDING_REVIEW: '待审核',
  PUBLISHED: '已发布',
  REJECTED: '已驳回',
}

const statusTagMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
  PENDING_REVIEW: 'warning',
  PUBLISHED: 'success',
  REJECTED: 'danger',
}

const handleSearch = () => {
  currentPage.value = 1
  getNewsList()
}

const resetSearch = () => {
  queryForm.keyword = ''
  queryForm.category = ''
  queryForm.status = ''
  handleSearch()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  getNewsList()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  getNewsList()
}
const getStatusText = (status: string) => statusTextMap[status] || status || '-'
const getStatusTagType = (status: string) => statusTagMap[status] || 'info'

const formatDateTime = (value?: string) => {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 16)
}

const stripHtml = (html: string) => {
  // 防止 undefined 或 null
  if (!html) return ''

  return html
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
}

const getNewsList = async () => {
  tableLoading.value = true
  try {
    const result: any = await getNewsPage({
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      params: [
        {name: 'keyword', value: queryForm.keyword},
        {name: 'category', value: queryForm.category},
        {name: 'status', value: queryForm.status},
      ],
    })
    console.log('=== getNewsList 响应 ===')
    console.log('完整 result:', result)
    console.log('result.data:', result.data)
    console.log('result.data?.records:', result.data?.records)
    console.log('result.data?.total:', result.data?.total)
    newsList.value = result.data?.records || []
    total.value = Number(result.data?.total || 0)
    console.log('处理后 newsList:', newsList.value)
    console.log('处理后 total:', total.value)
  } catch (error: any) {
    showRequestError(error, '新闻列表加载失败')
  } finally {
    tableLoading.value = false
  }
}

const getContentSummary = (html: string, maxLength = 60) => {
  // 防止 undefined 或 null
  if (!html) return '-'

  const text = stripHtml(html)
  if (!text) return '-'
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys: ['fullScreen'],
}

const editorConfig: Partial<IEditorConfig> = {
  placeholder: '请输入新闻正文内容...',
  MENU_CONF: {
    uploadImage: {
      base64LimitSize: 5 * 1024 * 1024,
    },
  },
}

const openAddDialog = () => {
  console.log('openAddDialog 被调用')  // 添加日志
  shouldAutoScrollEditor.value = false
  Object.assign(newsForm.value, emptyForm())
  formRef.value?.clearValidate()
  dialogVisible.value = true
  console.log('dialogVisible:', dialogVisible.value)  // 添加日志
}

const getEditorScrollContainer = () => {
  return editorWrapperRef.value?.querySelector<HTMLElement>('.w-e-scroll')
}

const bindEditorAutoScroll = async () => {
  removeEditorListeners.value?.()
  editorMutationObserver?.disconnect()

  await nextTick()

  const scrollContainer = getEditorScrollContainer()
  const editable = editorWrapperRef.value?.querySelector<HTMLElement>('[data-slate-editor]')

  if (!scrollContainer || !editable) return

  const handleInput = () => {
    if (!shouldAutoScrollEditor.value) return

    requestAnimationFrame(() => {
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    })
  }

  const enableAutoScroll = () => {
    shouldAutoScrollEditor.value = true
  }

  editable.addEventListener('compositionstart', enableAutoScroll)
  editable.addEventListener('beforeinput', enableAutoScroll)
  editable.addEventListener('input', handleInput)
  editable.addEventListener('keyup', handleInput)
  editable.addEventListener('paste', handleInput)
  editorMutationObserver = new MutationObserver(handleInput)
  editorMutationObserver.observe(editable, {
    childList: true,
    characterData: true,
    subtree: true,
  })

  removeEditorListeners.value = () => {
    editable.removeEventListener('compositionstart', enableAutoScroll)
    editable.removeEventListener('beforeinput', enableAutoScroll)
    editable.removeEventListener('input', handleInput)
    editable.removeEventListener('keyup', handleInput)
    editable.removeEventListener('paste', handleInput)
    editorMutationObserver?.disconnect()
    editorMutationObserver = null
  }
}

const handleEditorCreated = (editor: IDomEditor) => {
  editorRef.value = editor
  bindEditorAutoScroll()
}

const scrollEditorToBottom = async () => {
  if (!shouldAutoScrollEditor.value) return

  await nextTick()

  const scrollToBottom = () => {
    const scrollContainer = getEditorScrollContainer()
    if (!scrollContainer) return

    scrollContainer.scrollTop = scrollContainer.scrollHeight
  }

  requestAnimationFrame(scrollToBottom)
  setTimeout(scrollToBottom, 0)
}

const showRequestError = (error: any, fallback: string) => {
  ElMessage.error(error?.response?.data?.message || error?.message || fallback)
}

const submitNews = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const result: any = await createNews(newsForm.value)

    if (result.code !== 200) {
      ElMessage.error(result.message || '新闻保存失败')
      return
    }

    dialogVisible.value = false
    ElMessage.success(result.message || '新闻已提交审核')
    await getNewsList()
  } catch (error: any) {
    showRequestError(error, '新闻保存失败')
  } finally {
    submitting.value = false
  }
}
onMounted(() => {
  getNewsList()
})
</script>

<template>
  <div class="news-page">
    <div class="page-toolbar">
      <div>
        <h2>新闻管理</h2>
        <p>维护标题、栏目、审核信息和正文内容。</p>
      </div>

      <el-button type="primary" @click="openAddDialog">添加新闻</el-button>
    </div>
    <div class="list-panel">
      <el-form :model="queryForm" inline class="query-form">
        <el-form-item label="关键词">
          <el-input
              v-model="queryForm.keyword"
              clearable
              placeholder="标题、供稿、审稿"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="栏目">
          <el-select v-model="queryForm.category" clearable placeholder="全部栏目" style="width: 150px" @clear="handleSearch">
            <el-option
                v-for="item in categoryOptions"
                :key="item"
                :label="item"
                :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="queryForm.status" clearable placeholder="全部状态" style="width: 130px" @clear="handleSearch">
            <el-option label="待审核" value="PENDING_REVIEW"/>
            <el-option label="已发布" value="PUBLISHED"/>
            <el-option label="已驳回" value="REJECTED"/>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
        v-loading="tableLoading"
        :data="newsList"
        border
        class="news-table"
        height="100%"
    >
      <el-table-column prop="title" label="新闻标题" min-width="220" show-overflow-tooltip/>
      <el-table-column prop="category" label="栏目" width="110"/>

      <el-table-column label="正文摘要" min-width="240">
        <template #default="{ row }">
          {{ getContentSummary(row.content) }}
        </template>
      </el-table-column>

      <el-table-column prop="supplier" label="供稿" width="110" show-overflow-tooltip>
        <template #default="{ row }">{{ row.supplier || '-' }}</template>
      </el-table-column>

      <el-table-column prop="reviewer" label="审稿" width="110" show-overflow-tooltip>
        <template #default="{ row }">{{ row.reviewer || '-' }}</template>
      </el-table-column>

      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="发布时间" width="160">
        <template #default="{ row }">{{ formatDateTime(row.publishTime) }}</template>
      </el-table-column>

      <el-table-column label="更新时间" width="160">
        <template #default="{ row }">{{ formatDateTime(row.updateTime || row.createTime) }}</template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>
    <el-dialog
        v-model="dialogVisible"
        title="添加新闻"
        width="1040px"
        destroy-on-close
        align-center
        class="news-dialog"
    >
      <el-form ref="formRef" :model="newsForm" :rules="rules" label-width="86px" class="news-form">
        <div class="form-basic">
          <el-form-item label="新闻标题" prop="title">
            <el-input v-model="newsForm.title" maxlength="80" show-word-limit placeholder="请输入新闻标题"/>
          </el-form-item>

          <el-row :gutter="18">
            <el-col :span="8">
              <el-form-item label="栏目" prop="category">
                <el-select v-model="newsForm.category" placeholder="请选择栏目" style="width: 100%">
                  <el-option
                      v-for="item in categoryOptions"
                      :key="item"
                      :label="item"
                      :value="item"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="18">
            <el-col :span="12">
              <el-form-item label="供稿">
                <el-input v-model="newsForm.supplier" placeholder="请输入供稿人"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="审稿">
                <el-input v-model="newsForm.reviewer" placeholder="请输入审稿人"/>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <el-form-item label="正文内容" prop="content" class="content-form-item">
          <div ref="editorWrapperRef" class="editor-wrapper">
            <Toolbar
                :editor="editorRef"
                :default-config="toolbarConfig"
                mode="default"
                class="editor-toolbar"
            />
            <Editor
                v-model="newsForm.content"
                :default-config="editorConfig"
                mode="default"
                class="editor-content"
                @on-created="handleEditorCreated"
                @on-change="scrollEditorToBottom"
                @keyup="scrollEditorToBottom"
                @input="scrollEditorToBottom"
            />
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <div class="editor-footer-border"></div>
          <div class="dialog-footer-actions">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="submitting" @click="submitNews">
              保存新闻
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.news-page {
  height: 100%;
  padding: 22px;
  background: #f5f7fb;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 18px;  /* 新增：页面各模块间距 */
}

.page-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;  /* 增加内边距 */
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 12px;  /* 更圆润 */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);  /* 轻微阴影增加层次 */
}

.page-toolbar h2 {
  margin: 0 0 8px;  /* 增加底部间距 */
  color: #1f2d3d;
  font-size: 24px;  /* 稍大一点 */
  font-weight: 600;
}

.page-toolbar p {
  margin: 0;
  color: #7a8499;
  font-size: 14px;
}

/* 查询区域独立面板 */
.query-panel {
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  padding: 16px 20px;
}

.query-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;  /* 增加垂直间距 */
  margin-bottom: 0;
}

.query-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 0;
}

.query-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

/* 表格区域容器 */
.table-container {
  flex: 1;
  min-height: 0;
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.news-table {
  flex: 1;
  min-height: 0;
}

/* 表格内部样式优化 */
.news-table :deep(.el-table__header-wrapper th) {
  background-color: #fafafa;
  font-weight: 600;
  color: #1f2d3d;
  padding: 14px 0;  /* 增加表头高度 */
}

.news-table :deep(.el-table__body-wrapper td) {
  padding: 12px 0;  /* 增加行高 */
}

/* 分页区域 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;  /* 增加内边距 */
  border-top: 1px solid #eef0f4;
  background: #fff;
}

/* 弹窗样式调整 */
:global(.news-dialog.el-dialog),
:global(.news-dialog .el-dialog) {
  width: min(1080px, calc(100vw - 48px));  /* 稍宽一点 */
  height: min(880px, calc(100vh - 48px));  /* 稍高一点 */
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  border-radius: 16px;
}

:global(.news-dialog.el-dialog .el-dialog__header),
:global(.news-dialog .el-dialog__header) {
  flex-shrink: 0;
  padding: 20px 24px 12px;
  border-bottom: 1px solid #eef0f4;
}

:global(.news-dialog.el-dialog .el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
}

:global(.news-dialog.el-dialog .el-dialog__body) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 20px 24px;
}

:global(.news-dialog.el-dialog .el-dialog__footer) {
  flex-shrink: 0;
  padding: 12px 24px 20px;
  border-top: 1px solid #eef0f4;
}

/* 表单区域 */
.news-form {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;  /* 表单区域间距 */
  overflow: hidden;
}

.form-basic {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;  /* 表单项间距 */
}

.form-basic :deep(.el-form-item) {
  margin-bottom: 0;  /* 移除默认 margin，由 gap 控制 */
}

/* 富文本区域 */
.content-form-item {
  flex: 1;
  min-height: 0;
  margin-bottom: 0;
}

.content-form-item :deep(.el-form-item__content) {
  height: 100%;
  min-height: 0;
  display: flex;
  align-items: stretch;
}

/* 编辑器包装器 */
.editor-wrapper {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.news-page {
  height: 100%;
  padding: 22px;
  background: #f5f7fb;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.page-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
}

.page-toolbar h2 {
  margin: 0 0 8px;
  color: #1f2d3d;
  font-size: 24px;
  font-weight: 600;
}

.page-toolbar p {
  margin: 0;
  color: #7a8499;
  font-size: 14px;
}

/* 查询表单区域 */
.query-panel {
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  padding: 16px 20px;
}

.query-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
}

.query-form :deep(.el-form-item) {
  margin-bottom: 0;
}

/* 表格容器 */
.table-container {
  flex: 1;
  min-height: 0;
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.news-table {
  flex: 1;
  min-height: 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid #eef0f4;
  background: #fff;
}

/* 弹窗样式 */
:global(.news-dialog.el-dialog),
:global(.news-dialog .el-dialog) {
  width: min(1080px, calc(100vw - 48px));
  height: min(880px, calc(100vh - 48px));
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  border-radius: 16px;
}

:global(.news-dialog.el-dialog .el-dialog__body) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 20px 24px;
}

:global(.news-dialog.el-dialog .el-dialog__footer) {
  padding: 12px 24px 20px;
  border-top: 1px solid #eef0f4;
}

/* 表单 */
.news-form {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
}

.form-basic {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.content-form-item {
  flex: 1;
  min-height: 0;
  margin-bottom: 0;
}

.content-form-item :deep(.el-form-item__content) {
  height: 100%;
  min-height: 0;
  display: flex;
  align-items: stretch;
}

.editor-wrapper {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.editor-toolbar {
  flex-shrink: 0;
  min-height: 44px;
  background: #fff;
  border-bottom: 1px solid #dcdfe6;
}

.editor-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

:deep(.editor-content .w-e-scroll) {
  height: 100% !important;
  overflow-y: auto !important;
  padding: 16px;
}

.dialog-footer {
  text-align: right;
}

.dialog-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>