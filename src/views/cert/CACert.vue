<template>
  <div class="ca-cert">
    <div class="page-card">
      <el-tabs v-model="pageTab" class="ca-cert-page-tabs">
        <!-- CA 根证列表：按 DN / 有效期搜索 -->
        <el-tab-pane label="CA根证管理" name="list" lazy>
          <div class="search-area">
            <el-form :inline="true" :model="searchForm" class="search-form">
              <el-form-item label="DN">
                <el-input
                  v-model="searchForm.dn"
                  placeholder="请输入 DN 关键字"
                  clearable
                  style="width: 280px"
                />
              </el-form-item>
              <el-form-item label="有效期">
                <el-date-picker
                  v-model="searchForm.validityRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  style="width: 260px"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSearch">
                  <el-icon><Search /></el-icon>
                  查询
                </el-button>
                <el-button @click="handleReset">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <div class="action-bar">
            <el-button type="primary" @click="handleImport">
              导入根证书
            </el-button>
          </div>

          <el-table :data="pagedRootList" border stripe>
            <el-table-column prop="name" label="证书名称" width="200" show-overflow-tooltip />
            <el-table-column prop="dn" label="DN" min-width="250" show-overflow-tooltip />
            <el-table-column prop="notBefore" label="生效时间" width="120" />
            <el-table-column prop="notAfter" label="过期时间" width="120" />
            <el-table-column prop="trust" label="信任状态" width="100">
              <template #default="{ row }">
                <el-switch v-model="row.trust" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="220">
              <template #default="{ row }">
                <el-button type="primary" size="small" link @click="openDetail(row)">查看</el-button>
                <el-button type="danger" size="small" link @click="handleDelete(row)">删除</el-button>
                <el-button type="danger" size="small" link @click="handleAddToBlacklist(row)">
                  加入黑名单
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              v-model:current-page="listPage"
              v-model:page-size="listPageSize"
              background
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredRootList.length"
              :page-sizes="[10, 20, 50]"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="黑名单管理" name="blacklist" lazy>
          <div class="blacklist-toolbar">
            <el-button @click="handleExportBlacklist">
              <el-icon><Download /></el-icon>
              导出黑名单
            </el-button>
            <el-button
              type="danger"
              :disabled="!selectedBlacklistRows.length"
              @click="handleBatchRemoveBlacklist"
            >
              <el-icon><Close /></el-icon>
              批量移出黑名单
            </el-button>
          </div>
          <el-table
            :data="blacklistTableRows"
            border
            stripe
            @selection-change="onBlacklistSelectionChange"
          >
            <el-table-column type="selection" width="48" />
            <el-table-column prop="name" label="证书名称" width="200" show-overflow-tooltip />
            <el-table-column prop="dn" label="DN" min-width="260" show-overflow-tooltip />
            <el-table-column prop="notAfter" label="过期时间" width="120" />
            <el-table-column label="操作" fixed="right" width="120">
              <template #default="{ row }">
                <el-button type="success" size="small" link @click="handleRemoveFromBlacklist(row)">
                  移出黑名单
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog v-model="importVisible" title="导入根证书" width="500px" destroy-on-close>
      <el-upload
        drag
        action="#"
        :auto-upload="false"
        accept=".cer,.crt,.pem,.p7b"
        :on-change="onImportFileChange"
      >
        <el-icon class="el-icon--upload" :size="48"><UploadFilled /></el-icon>
        <div class="el-upload__text">拖拽文件到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">支持 CER、CRT、PEM、P7B</div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmImport">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="根证书详情" width="640px">
      <el-descriptions v-if="currentRow" :column="1" border>
        <el-descriptions-item label="证书名称">{{ currentRow.name }}</el-descriptions-item>
        <el-descriptions-item label="DN">{{ currentRow.dn }}</el-descriptions-item>
        <el-descriptions-item label="生效时间">{{ currentRow.notBefore }}</el-descriptions-item>
        <el-descriptions-item label="过期时间">{{ currentRow.notAfter }}</el-descriptions-item>
        <el-descriptions-item label="信任状态">{{ currentRow.trust ? '信任' : '不信任' }}</el-descriptions-item>
        <el-descriptions-item label="黑名单">{{ currentRow.inBlacklist ? '是' : '否' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, watchEffect } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload, UploadFilled, Search, Download, Close } from '@element-plus/icons-vue'
import { setPageBreadcrumbItems } from '@/composables/pageBreadcrumb'

const pageTab = ref('list')
const activeTabBreadcrumb = computed(() =>
  pageTab.value === 'blacklist' ? '黑名单管理' : 'CA根证管理'
)

watchEffect(() => {
  setPageBreadcrumbItems([
    { label: '签名验签服务' },
    { label: 'CA根证管理' },
    { label: activeTabBreadcrumb.value }
  ])
})

const listPage = ref(1)
const listPageSize = ref(10)
const importVisible = ref(false)
const detailVisible = ref(false)
const currentRow = ref(null)
const selectedBlacklistRows = ref([])

const searchForm = reactive({
  dn: '',
  validityRange: []
})

function createInitialRows () {
  return [
    {
      id: '1',
      name: '测试CA根证书',
      dn: 'CN=Test CA,O=Test,C=CN',
      notBefore: '2020-01-01',
      notAfter: '2030-01-01',
      trust: true,
      inBlacklist: false
    },
    {
      id: '2',
      name: '国密CA根证书',
      dn: 'CN=GM CA,O=GM,C=CN',
      notBefore: '2021-06-01',
      notAfter: '2031-06-01',
      trust: true,
      inBlacklist: false
    },
    {
      id: '3',
      name: '已停用根证（示例）',
      dn: 'CN=Legacy CA,O=Old,C=CN',
      notBefore: '2018-01-01',
      notAfter: '2025-12-31',
      trust: false,
      inBlacklist: true
    }
  ]
}

const allRows = ref(createInitialRows())

function parseYmd (s) {
  if (!s) return null
  const t = Date.parse(s)
  return Number.isNaN(t) ? null : t
}

/** 根证列表 Tab：不展示已在黑名单中的记录 */
const filteredRootList = computed(() => {
  const [start, end] = searchForm.validityRange || []
  const startT = start ? parseYmd(start) : null
  const endT = end ? parseYmd(end) : null

  return allRows.value.filter((row) => {
    if (row.inBlacklist) return false
    if (searchForm.dn && !row.dn.toLowerCase().includes(searchForm.dn.trim().toLowerCase())) {
      return false
    }
    if (startT != null && endT != null) {
      const nb = parseYmd(row.notBefore)
      const na = parseYmd(row.notAfter)
      if (nb == null || na == null) return false
      if (!(nb <= endT && na >= startT)) return false
    }
    return true
  })
})

const pagedRootList = computed(() => {
  const list = filteredRootList.value
  const start = (listPage.value - 1) * listPageSize.value
  return list.slice(start, start + listPageSize.value)
})

watch(filteredRootList, (list) => {
  const pages = Math.max(1, Math.ceil(list.length / listPageSize.value) || 1)
  if (listPage.value > pages) listPage.value = pages
})

const blacklistTableRows = computed(() => allRows.value.filter((r) => r.inBlacklist))

const handleSearch = () => {
  listPage.value = 1
  ElMessage.success('已按条件筛选（原型演示）')
}

const handleReset = () => {
  Object.assign(searchForm, { dn: '', validityRange: [] })
  listPage.value = 1
}

const handleImport = () => {
  importVisible.value = true
}

const onImportFileChange = () => {
  // 原型：仅演示上传区域
}

const confirmImport = () => {
  ElMessage.success('导入任务已提交（原型演示）')
  importVisible.value = false
}

const openDetail = (row) => {
  currentRow.value = row
  detailVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除根证书「${row.name}」？`, '提示', {
    type: 'warning'
  })
    .then(() => {
      allRows.value = allRows.value.filter((r) => r.id !== row.id)
      ElMessage.success('已删除')
    })
    .catch(() => {})
}

const handleAddToBlacklist = (row) => {
  row.inBlacklist = true
  row.trust = false
  ElMessage.success('已加入黑名单')
}

const handleRemoveFromBlacklist = (row) => {
  row.inBlacklist = false
  ElMessage.success('已移出黑名单')
}

const onBlacklistSelectionChange = (rows) => {
  selectedBlacklistRows.value = rows
}

const handleExportBlacklist = () => {
  ElMessage.success('黑名单导出成功（原型演示）')
}

const handleBatchRemoveBlacklist = () => {
  const n = selectedBlacklistRows.value.length
  selectedBlacklistRows.value.forEach((r) => {
    r.inBlacklist = false
  })
  selectedBlacklistRows.value = []
  ElMessage.success(`已将 ${n} 条记录移出黑名单`)
}
</script>

<style lang="scss" scoped>
.ca-cert-page-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }
}

.search-area {
  background: #fafafa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .el-form-item {
    margin-bottom: 0;
  }
}

.action-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.blacklist-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
