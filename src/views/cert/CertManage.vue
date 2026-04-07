<template>
  <div class="cert-manage">
    <div class="page-card">
      <el-tabs v-model="pageTab" class="cert-page-tabs">
        <el-tab-pane label="证书管理" name="cert" lazy>
          <div class="search-area">
            <el-form :inline="true" :model="searchForm" class="search-form">
              <el-form-item label="应用编号">
                <el-input
                  v-model="searchForm.appId"
                  placeholder="请输入应用编号"
                  clearable
                  style="width: 200px"
                />
              </el-form-item>
              <el-form-item label="应用证书名称">
                <el-input
                  v-model="searchForm.appCertName"
                  placeholder="请输入应用证书名称"
                  clearable
                  style="width: 200px"
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
            <el-button type="primary" @click="openImportEncryptDialog">导入加密证书</el-button>
          </div>

          <el-table :data="pagedCertList" border stripe>
            <el-table-column label="应用证书名称/主体DN" min-width="240">
              <template #default="{ row }">
                <div class="name-dn-cell">
                  <span class="primary-line">{{ row.appCertName }}</span>
                  <span class="sub-line">{{ row.subjectDn }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="algorithm" label="算法类型" width="100" />
            <el-table-column prop="version" label="版本号" width="88" />
            <el-table-column prop="category" label="证书分类" width="110" />
            <el-table-column prop="serialNumber" label="证书序列号" width="140" show-overflow-tooltip />
            <el-table-column prop="subject" label="证书主体" min-width="160" show-overflow-tooltip />
            <el-table-column prop="status" label="证书状态" width="100">
              <template #default="{ row }">
                <span class="status-tag" :class="getStatusClass(row.status)">{{ row.status }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="notBefore" label="生效时间" width="118" />
            <el-table-column prop="notAfter" label="到期时间" width="118" />
            <el-table-column label="操作" fixed="right" width="88">
              <template #default="{ row }">
                <el-button type="primary" size="small" link @click="handleView(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              v-model:current-page="certPage"
              v-model:page-size="certPageSize"
              background
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredCertList.length"
              :page-sizes="[10, 20, 50, 100]"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="证书申请管理" name="apply" lazy>
          <el-empty description="证书申请管理功能开发中" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog v-model="importEncryptVisible" title="导入加密证书" width="520px" destroy-on-close>
      <el-form ref="importFormRef" :model="importEncryptForm" :rules="importEncryptRules" label-width="140px">
        <el-form-item label="证书名称" prop="certName">
          <el-input v-model="importEncryptForm.certName" placeholder="请输入证书名称" clearable />
        </el-form-item>
        <el-form-item label="证书文件" prop="fileName">
          <el-upload
            class="encrypt-cert-upload"
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="onEncryptCertFileChange"
            :on-remove="onEncryptCertFileRemove"
            accept=".pfx,.p12,.pem,.cer,.crt"
          >
            <el-button type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="证书保护密码" prop="certProtectPwd">
          <el-input
            v-model="importEncryptForm.certProtectPwd"
            type="password"
            show-password
            placeholder="请输入证书保护密码"
            autocomplete="new-password"
          />
        </el-form-item>
        <el-form-item label="密钥访问口令" prop="keyAccessPwd">
          <el-input
            v-model="importEncryptForm.keyAccessPwd"
            type="password"
            show-password
            placeholder="请输入密钥访问口令"
            autocomplete="new-password"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="importEncryptVisible = false">取消</el-button>
        <el-button type="primary" @click="submitImportEncrypt">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="证书详情" width="720px">
      <el-descriptions v-if="currentCert" :column="2" border>
        <el-descriptions-item label="应用编号">{{ currentCert.appId }}</el-descriptions-item>
        <el-descriptions-item label="应用证书名称">{{ currentCert.appCertName }}</el-descriptions-item>
        <el-descriptions-item label="主体 DN" :span="2">{{ currentCert.subjectDn }}</el-descriptions-item>
        <el-descriptions-item label="算法类型">{{ currentCert.algorithm }}</el-descriptions-item>
        <el-descriptions-item label="版本号">{{ currentCert.version }}</el-descriptions-item>
        <el-descriptions-item label="证书分类">{{ currentCert.category }}</el-descriptions-item>
        <el-descriptions-item label="证书序列号">{{ currentCert.serialNumber }}</el-descriptions-item>
        <el-descriptions-item label="证书主体" :span="2">{{ currentCert.subject }}</el-descriptions-item>
        <el-descriptions-item label="证书状态">
          <span class="status-tag" :class="getStatusClass(currentCert.status)">{{ currentCert.status }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="生效时间">{{ currentCert.notBefore }}</el-descriptions-item>
        <el-descriptions-item label="到期时间">{{ currentCert.notAfter }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, watchEffect } from 'vue'
import { setPageBreadcrumbItems } from '@/composables/pageBreadcrumb'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const pageTab = ref('cert')
const activeTabBreadcrumb = computed(() =>
  pageTab.value === 'apply' ? '证书申请管理' : '证书管理'
)

watchEffect(() => {
  setPageBreadcrumbItems([
    { label: '签名验签服务' },
    { label: '证书管理' },
    { label: activeTabBreadcrumb.value }
  ])
})

const certPage = ref(1)
const certPageSize = ref(10)
const detailDialogVisible = ref(false)
const currentCert = ref(null)
const importEncryptVisible = ref(false)
const importFormRef = ref(null)

const searchForm = reactive({
  appId: '',
  appCertName: ''
})

const importEncryptForm = reactive({
  certName: '',
  fileName: '',
  fileRaw: null,
  certProtectPwd: '',
  keyAccessPwd: ''
})

const importEncryptRules = {
  certName: [{ required: true, message: '请输入证书名称', trigger: 'blur' }],
  fileName: [{ required: true, message: '请上传证书文件', trigger: 'change' }],
  certProtectPwd: [{ required: true, message: '请输入证书保护密码', trigger: 'blur' }],
  keyAccessPwd: [{ required: true, message: '请输入密钥访问口令', trigger: 'blur' }]
}

/** 示意图为「暂无数据」，列表默认空；接入接口后可赋值 */
const allCerts = ref([])

const filteredCertList = computed(() =>
  allCerts.value.filter((row) => {
    if (searchForm.appId && !String(row.appId || '').includes(searchForm.appId.trim())) return false
    if (searchForm.appCertName && !String(row.appCertName || '').includes(searchForm.appCertName.trim())) {
      return false
    }
    return true
  })
)

const pagedCertList = computed(() => {
  const list = filteredCertList.value
  const start = (certPage.value - 1) * certPageSize.value
  return list.slice(start, start + certPageSize.value)
})

watch(filteredCertList, (list) => {
  const pages = Math.max(1, Math.ceil(list.length / certPageSize.value) || 1)
  if (certPage.value > pages) certPage.value = pages
})

const getStatusClass = (status) => {
  switch (status) {
    case '有效':
      return 'success'
    case '即将过期':
      return 'warning'
    case '已过期':
    case '已吊销':
      return 'danger'
    default:
      return ''
  }
}

const handleSearch = () => {
  certPage.value = 1
  ElMessage.success('已按条件筛选（原型演示）')
}

const handleReset = () => {
  Object.assign(searchForm, { appId: '', appCertName: '' })
  certPage.value = 1
}

const openImportEncryptDialog = () => {
  Object.assign(importEncryptForm, {
    certName: '',
    fileName: '',
    fileRaw: null,
    certProtectPwd: '',
    keyAccessPwd: ''
  })
  importEncryptVisible.value = true
}

const onEncryptCertFileChange = (file) => {
  importEncryptForm.fileName = file?.name || ''
  importEncryptForm.fileRaw = file?.raw || null
  importFormRef.value?.validateField('fileName')
}

const onEncryptCertFileRemove = () => {
  importEncryptForm.fileName = ''
  importEncryptForm.fileRaw = null
}

const submitImportEncrypt = () => {
  importFormRef.value?.validate((valid) => {
    if (!valid) return
    ElMessage.success('导入任务已提交（原型演示）')
    importEncryptVisible.value = false
  })
}

const handleView = (row) => {
  currentCert.value = row
  detailDialogVisible.value = true
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.cert-page-tabs {
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

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.name-dn-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .primary-line {
    font-weight: 500;
    color: $text-primary;
  }

  .sub-line {
    font-size: 12px;
    color: $text-secondary;
    line-height: 1.4;
    word-break: break-all;
  }
}

.status-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;

  &.success {
    background: #f6ffed;
    color: #52c41a;
  }
  &.warning {
    background: #fffbe6;
    color: #faad14;
  }
  &.danger {
    background: #fff2f0;
    color: #ff4d4f;
  }
}

.encrypt-cert-upload {
  width: 100%;
}
</style>
