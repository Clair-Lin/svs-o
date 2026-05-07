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
          <div class="action-bar">
            <el-button type="primary" @click="openApplyCertDialog">申请应用证书 <el-tag type="danger" effect="dark" size="small" style="margin-left: 6px;">新</el-tag></el-button>
          </div>
          <el-table :data="pagedApplyList" border stripe>
            <el-table-column prop="subjectDn" label="证书主题(DN)" min-width="280" show-overflow-tooltip />
            <el-table-column prop="algorithm" label="算法" width="88" />
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <span class="apply-status" :class="row.applyStatus === '已签发' ? 'issued' : 'pending'">
                  <el-icon v-if="row.applyStatus === '已签发'"><CircleCheck /></el-icon>
                  <el-icon v-else><CircleClose /></el-icon>
                  {{ row.applyStatus }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="applyTime" label="申请时间" width="168" />
            <el-table-column label="操作" fixed="right" width="220">
              <template #default="{ row }">
                <el-button type="primary" size="small" link @click="openImportApplyCert(row)">导入证书</el-button>
                <el-button type="primary" size="small" link @click="downloadApplyCsr(row)">下载CSR</el-button>
                <el-button type="primary" size="small" link @click="removeApplyRow(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination">
            <el-pagination
              v-model:current-page="applyPage"
              v-model:page-size="applyPageSize"
              background
              layout="total, sizes, prev, pager, next, jumper"
              :total="applyList.length"
              :page-sizes="[10, 20, 50, 100]"
            />
          </div>
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

    <el-dialog
      v-model="applyCertVisible"
      title="申请应用证书"
      width="560px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form
        ref="applyCertFormRef"
        :model="applyCertForm"
        :rules="applyCertRules"
        label-width="128px"
        label-position="right"
        class="apply-cert-form"
      >
        <el-form-item label="证书名称" prop="certName">
          <el-input v-model="applyCertForm.certName" placeholder="请输入证书名称" clearable maxlength="128" />
        </el-form-item>
        <el-form-item label="算法" prop="algorithm">
          <el-select v-model="applyCertForm.algorithm" placeholder="请选择算法" style="width: 100%">
            <el-option label="SM2" value="sm2" />
            <el-option label="RSA" value="rsa" />
          </el-select>
        </el-form-item>
        <el-form-item label="密钥索引" prop="keyIndex">
          <el-select v-model="applyCertForm.keyIndex" placeholder="请选择密钥索引" style="width: 100%" filterable>
            <el-option v-for="n in keyIndexOptions" :key="n" :label="String(n)" :value="n" />
          </el-select>
        </el-form-item>

        <el-form-item label="通用名(CN)" prop="dnCN" class="apply-dn-cn-item">
          <div class="apply-dn-cn-wrap">
            <el-input
              v-model="applyCertForm.dnCN"
              placeholder="请输入通用名(CN)，2-50个字符"
              clearable
              maxlength="50"
            />
            <p class="apply-dn-cn-tip">
              通用名可以为邮箱、手机号、域名、姓名，或由中文、英文、数字、_等组成
            </p>
          </div>
        </el-form-item>
        <el-form-item label="国家(C)" prop="dnC">
          <el-select v-model="applyCertForm.dnC" placeholder="选择所属国家" style="width: 100%" filterable>
            <el-option v-for="c in countryOptions" :key="c.code" :label="c.label" :value="c.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="省份/州(ST)" prop="dnST">
          <el-input v-model="applyCertForm.dnST" placeholder="如：广东" clearable maxlength="128" />
        </el-form-item>
        <el-form-item label="城市(L)" prop="dnL" class="apply-dn-field">
          <el-input v-model="applyCertForm.dnL" placeholder="如：深圳" clearable maxlength="128" />
        </el-form-item>
        <el-form-item label="公司(O)" prop="dnO">
          <el-input v-model="applyCertForm.dnO" placeholder="如：a company" clearable maxlength="128" />
        </el-form-item>
        <el-form-item label="部门(OU)" prop="dnOU">
          <el-input v-model="applyCertForm.dnOU" placeholder="如：研发部" clearable maxlength="128" />
        </el-form-item>
        <el-form-item label="证书主题" class="apply-dn-subject-preview-item">
          <div class="apply-dn-subject-preview" :class="{ 'is-placeholder': !applyCurrentSubjectDn }">
            {{ applyCurrentSubjectDn || '（填写通用名与国家后将显示当前证书主题）' }}
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="applyCertVisible = false">取消</el-button>
        <el-button type="primary" :loading="applyCertSubmitting" @click="submitApplyCert">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="importApplyCertVisible" title="导入证书" width="520px" destroy-on-close>
      <el-form ref="importApplyFormRef" :model="importApplyForm" :rules="importApplyRules" label-width="120px">
        <el-form-item label="申请记录">
          <span class="text-secondary">{{ importApplyTarget?.subjectDn || '—' }}</span>
        </el-form-item>
        <el-form-item label="证书文件" prop="fileName">
          <el-upload
            class="encrypt-cert-upload"
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="onImportApplyFileChange"
            :on-remove="onImportApplyFileRemove"
            accept=".cer,.crt,.pem,.p7b"
          >
            <el-button type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="importApplyCertVisible = false">取消</el-button>
        <el-button type="primary" @click="submitImportApplyCert">确定</el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, CircleClose, CircleCheck } from '@element-plus/icons-vue'

const pad2 = (n) => String(n).padStart(2, '0')
const formatNow = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

/** 将拆分字段组装为 DN（仅含已填项；CN、C 必填由表单保证） */
const buildSubjectDnFromForm = (f) => {
  const esc = (v) => String(v || '').replace(/([/+,;"<>\\])/g, '\\$1')
  const segs = []
  if (f.dnC) segs.push(`C=${esc(f.dnC)}`)
  if (String(f.dnST || '').trim()) segs.push(`ST=${esc(f.dnST.trim())}`)
  if (String(f.dnL || '').trim()) segs.push(`L=${esc(f.dnL.trim())}`)
  if (String(f.dnO || '').trim()) segs.push(`O=${esc(f.dnO.trim())}`)
  if (String(f.dnOU || '').trim()) segs.push(`OU=${esc(f.dnOU.trim())}`)
  segs.push(`CN=${esc(f.dnCN)}`)
  return `/${segs.join('/')}`
}

const countryOptions = [
  { code: 'CN', label: 'China (中国)' },
  { code: 'US', label: 'United States (美国)' },
  { code: 'GB', label: 'United Kingdom (英国)' },
  { code: 'JP', label: 'Japan (日本)' },
  { code: 'DE', label: 'Germany (德国)' }
]

const keyIndexOptions = Array.from({ length: 32 }, (_, i) => i + 1)

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

const applyPage = ref(1)
const applyPageSize = ref(10)
const applyCertVisible = ref(false)
const applyCertFormRef = ref(null)
const applyCertSubmitting = ref(false)

const applyCertForm = reactive({
  certName: '',
  algorithm: 'sm2',
  keyIndex: null,
  dnCN: '',
  dnO: '',
  dnOU: '',
  dnL: '',
  dnST: '',
  dnC: 'CN'
})

/** 与提交时一致的当前主题 DN（通用名、国家未齐时不展示拼接串） */
const applyCurrentSubjectDn = computed(() => {
  const f = applyCertForm
  if (!String(f.dnCN || '').trim() || !f.dnC) return ''
  return buildSubjectDnFromForm(f)
})

const applyCertRules = {
  certName: [{ required: true, message: '请输入证书名称', trigger: 'blur' }],
  algorithm: [{ required: true, message: '请选择算法', trigger: 'change' }],
  keyIndex: [{ required: true, message: '请选择密钥索引', trigger: 'change' }],
  dnCN: [
    { required: true, message: '请输入通用名(CN)', trigger: 'blur' },
    { min: 2, max: 50, message: '通用名为 2～50 个字符', trigger: 'blur' }
  ],
  dnC: [{ required: true, message: '请选择国家(C)', trigger: 'change' }]
}

const applyList = ref([
  {
    id: 'a1',
    certName: 'demo_s1100',
    subjectDn: '/C=CN/ST=GuangDong/O=Olym Tech Ltd/CN=13511111111_s1100',
    algorithm: 'rsa',
    applyStatus: '未签发',
    applyTime: '2023-11-26 19:33:55'
  },
  {
    id: 'a2',
    certName: 'demo_s1123',
    subjectDn: '/C=CN/ST=GuangDong/O=Olym Tech Ltd/CN=13511111111_s1123',
    algorithm: 'sm2',
    applyStatus: '未签发',
    applyTime: '2023-11-26 19:34:12'
  }
])

const pagedApplyList = computed(() => {
  const list = applyList.value
  const start = (applyPage.value - 1) * applyPageSize.value
  return list.slice(start, start + applyPageSize.value)
})

watch(
  () => applyList.value.length,
  () => {
    const pages = Math.max(1, Math.ceil(applyList.value.length / applyPageSize.value) || 1)
    if (applyPage.value > pages) applyPage.value = pages
  }
)

const importApplyCertVisible = ref(false)
const importApplyFormRef = ref(null)
const importApplyTarget = ref(null)
const importApplyForm = reactive({ fileName: '', fileRaw: null })
const importApplyRules = {
  fileName: [{ required: true, message: '请上传证书文件', trigger: 'change' }]
}

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

const resetApplyCertForm = () => {
  Object.assign(applyCertForm, {
    certName: '',
    algorithm: 'sm2',
    keyIndex: null,
    dnCN: '',
    dnO: '',
    dnOU: '',
    dnL: '',
    dnST: '',
    dnC: 'CN'
  })
}

const openApplyCertDialog = () => {
  resetApplyCertForm()
  applyCertVisible.value = true
}

const submitApplyCert = () => {
  applyCertFormRef.value?.validate((valid) => {
    if (!valid) return
    applyCertSubmitting.value = true
    const subjectDn = buildSubjectDnFromForm(applyCertForm)
    setTimeout(() => {
      applyList.value.unshift({
        id: `a_${Date.now()}`,
        certName: applyCertForm.certName,
        subjectDn,
        algorithm: applyCertForm.algorithm,
        applyStatus: '未签发',
        applyTime: formatNow(),
        keyIndex: applyCertForm.keyIndex
      })
      applyCertSubmitting.value = false
      applyCertVisible.value = false
      applyPage.value = 1
      ElMessage.success('申请已提交（原型演示）')
    }, 280)
  })
}

const openImportApplyCert = (row) => {
  importApplyTarget.value = row
  importApplyForm.fileName = ''
  importApplyForm.fileRaw = null
  importApplyCertVisible.value = true
}

const onImportApplyFileChange = (file) => {
  importApplyForm.fileName = file?.name || ''
  importApplyForm.fileRaw = file?.raw || null
  importApplyFormRef.value?.validateField('fileName')
}

const onImportApplyFileRemove = () => {
  importApplyForm.fileName = ''
  importApplyForm.fileRaw = null
}

const submitImportApplyCert = () => {
  importApplyFormRef.value?.validate((valid) => {
    if (!valid || !importApplyTarget.value) return
    importApplyTarget.value.applyStatus = '已签发'
    ElMessage.success('证书已导入（原型演示）')
    importApplyCertVisible.value = false
  })
}

const downloadApplyCsr = (row) => {
  ElMessage.info(`已模拟下载 CSR：${row.certName || row.id}（原型演示）`)
}

const removeApplyRow = (row) => {
  ElMessageBox.confirm('确定删除该证书申请记录吗？', '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => {
      applyList.value = applyList.value.filter((r) => r.id !== row.id)
      ElMessage.success('已删除')
    })
    .catch(() => {})
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

.text-secondary {
  font-size: 13px;
  color: $text-secondary;
  word-break: break-all;
}

.apply-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;

  &.pending {
    color: #ff4d4f;
  }
  &.issued {
    color: #52c41a;
  }
}

.apply-cert-form {
  :deep(> .el-form-item) {
    margin-bottom: 18px;
  }
}

.apply-dn-cn-wrap {
  width: 100%;
}

.apply-dn-cn-tip {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: $text-secondary;
}

.apply-dn-cn-item {
  :deep(.el-form-item__content) {
    align-items: flex-start;
  }
}

.apply-dn-subject-preview-item {
  :deep(.el-form-item__content) {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
  }
}

.apply-dn-subject-preview {
  flex: 1;
  min-width: 0;
  font-size: var(--el-font-size-base);
  line-height: 22px;
  word-break: break-all;
  font-family: inherit;
  color: var(--el-text-color-primary);

  &.is-placeholder {
    color: var(--el-text-color-secondary);
  }
}
</style>
