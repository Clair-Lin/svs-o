<template>
  <div class="ca-cert">
    <div class="page-card">
      <div class="ca-search-toolbar">
        <div class="filter-row">
          <div class="filter-item">
            <span class="filter-label">CA名称</span>
            <el-input
              v-model="filterCaName"
              placeholder="请输入CA名称"
              clearable
              class="filter-input"
            />
          </div>
          <div class="filter-item">
            <span class="filter-label">DN</span>
            <el-input
              v-model="filterDn"
              placeholder="DN模糊查询：忽略空格，可用空格或逗号分隔多关键字"
              clearable
              class="filter-input filter-input--dn"
            />
          </div>
          <div class="filter-item filter-item--range">
            <span class="filter-label">有效期</span>
            <el-date-picker
              v-model="filterValidityRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              class="filter-daterange"
            />
          </div>
          <div class="filter-item filter-actions">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </div>

      <div class="action-bar">
        <el-button type="primary" @click="openAdd">添加</el-button>
      </div>

      <el-table :data="pagedList" border stripe>
        <el-table-column prop="caName" label="CA名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="description" label="CA描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="CA证书主题（DN）" min-width="280" show-overflow-tooltip>
          <template #default="{ row }">
            <el-button type="primary" link class="dn-link" @click="openDetail(row)">
              {{ row.certLabel }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="notBefore" label="生效时间" width="120" align="center" />
        <el-table-column prop="notAfter" label="过期时间" width="120" align="center" />
        <el-table-column label="操作" fixed="right" width="300">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="stubAction(row, '上传下级证书')">
              上传下级证书
            </el-button>
            <el-button type="primary" size="small" link @click="stubAction(row, '配置CRL')">配置CRL</el-button>
            <el-button type="primary" size="small" link @click="stubAction(row, '配置OCSP')">配置OCSP</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, prev, pager, next, sizes"
          :total="filteredList.length"
          background
        />
      </div>
    </div>

    <el-dialog v-model="addVisible" title="添加" width="520px" destroy-on-close @closed="resetAddForm">
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="100px">
        <el-form-item label="CA名称" prop="caName">
          <el-input v-model="addForm.caName" placeholder="请输入CA名称" clearable />
        </el-form-item>
        <el-form-item label="CA描述" prop="description">
          <el-input
            v-model="addForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入CA描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="生效时间" prop="notBefore">
          <el-date-picker
            v-model="addForm.notBefore"
            type="date"
            placeholder="选择生效日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="过期时间" prop="notAfter">
          <el-date-picker
            v-model="addForm.notAfter"
            type="date"
            placeholder="选择过期日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="CA证书" prop="certFileName">
          <el-upload
            action="#"
            :auto-upload="false"
            :limit="1"
            accept=".cer,.crt,.pem,.p7b"
            :on-change="onAddCertChange"
            :on-remove="onAddCertRemove"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="upload-tip">支持 CER、CRT、PEM、P7B</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAdd">确定</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

let idSeq = 5

const filterCaName = ref('')
const queryCaName = ref('')
const filterDn = ref('')
const queryDn = ref('')
const filterValidityRange = ref(null)
const queryValidityRange = ref(null)

const currentPage = ref(1)
const pageSize = ref(10)

/** 与示意图一致的示例数据（缺省字段已补全） */
const list = ref([
  {
    id: '1',
    caName: 'CA_TEST',
    description: 'CA_TEST',
    certLabel: 'C=CN,ST=GuangDong,O=Olym Tech Ltd,CN=Root CA',
    notBefore: '2023-06-01',
    notAfter: '2033-05-31'
  },
  {
    id: '2',
    caName: 'SM2-CA',
    description: 'SM2',
    certLabel: 'C=CN,O=GMSSL,OU=PKI/SM2,CN=RootCA for Test',
    notBefore: '2022-01-15',
    notAfter: '2032-01-14'
  },
  {
    id: '3',
    caName: 'RSA-CA',
    description: 'RSA',
    certLabel: 'C=CN,O=GMSSL,OU=PKI/RSA,CN=RootCA for Test',
    notBefore: '2022-01-15',
    notAfter: '2032-01-14'
  },
  {
    id: '4',
    caName: 'ML-DSA_CA',
    description: '抗量子密码算法签发的CA根证',
    certLabel: 'C=CN,CN=root_ca_20260205165008',
    notBefore: '2026-02-05',
    notAfter: '2036-02-04'
  }
])

function parseYmd (s) {
  if (!s) return null
  const t = Date.parse(s)
  return Number.isNaN(t) ? null : t
}

/** 小写并去掉所有空白，便于 DN 与子串模糊比对 */
function compactDnForSearch (s) {
  return String(s || '').toLowerCase().replace(/\s/g, '')
}

/**
 * DN 模糊查询：不区分大小写；忽略证书 DN 与关键字中的空格/换行；
 * 支持用空格、中英文逗号、顿号分隔多个关键字（需全部在 DN 中出现，顺序不限）。
 */
function dnFuzzyMatch (certLabel, queryRaw) {
  const raw = String(queryRaw || '').trim()
  if (!raw) return true
  const hay = compactDnForSearch(certLabel)
  const tokens = raw
    .toLowerCase()
    .split(/[\s,，、]+/)
    .map((t) => t.replace(/\s/g, ''))
    .filter(Boolean)
  if (!tokens.length) return true
  return tokens.every((t) => hay.includes(t))
}

/** CA名称、DN（模糊匹配 CA证书 DN 串）、证书有效期与查询条件 */
const filteredList = computed(() => {
  const q = queryCaName.value.trim().toLowerCase()
  const range = queryValidityRange.value
  const [start, end] = Array.isArray(range) && range.length === 2 ? range : [null, null]
  const startT = start ? parseYmd(start) : null
  const endT = end ? parseYmd(end) : null

  return list.value.filter((row) => {
    if (q && !row.caName.toLowerCase().includes(q)) return false
    if (!dnFuzzyMatch(row.certLabel, queryDn.value)) return false
    if (startT != null && endT != null) {
      const nb = parseYmd(row.notBefore)
      const na = parseYmd(row.notAfter)
      if (nb == null || na == null) return false
      if (!(nb <= endT && na >= startT)) return false
    }
    return true
  })
})

const pagedList = computed(() => {
  const all = filteredList.value
  const size = pageSize.value
  const page = currentPage.value
  const start = (page - 1) * size
  return all.slice(start, start + size)
})

watch([filteredList, pageSize], () => {
  const n = filteredList.value.length
  const size = pageSize.value || 10
  const maxPage = Math.max(1, Math.ceil(n / size) || 1)
  if (currentPage.value > maxPage) currentPage.value = maxPage
})

const addVisible = ref(false)
const addFormRef = ref(null)

const addForm = reactive({
  caName: '',
  description: '',
  notBefore: '',
  notAfter: '',
  certFileName: ''
})

const addRules = {
  caName: [{ required: true, message: '请输入CA名称', trigger: 'blur' }],
  notBefore: [{ required: true, message: '请选择生效时间', trigger: 'change' }],
  notAfter: [
    { required: true, message: '请选择过期时间', trigger: 'change' },
    {
      validator: (_rule, val, cb) => {
        if (!val || !addForm.notBefore) {
          cb()
          return
        }
        const a = parseYmd(addForm.notBefore)
        const b = parseYmd(val)
        if (a != null && b != null && b < a) {
          cb(new Error('过期时间不能早于生效时间'))
          return
        }
        cb()
      },
      trigger: 'change'
    }
  ],
  certFileName: [{ required: true, message: '请选择CA证书文件', trigger: 'change' }]
}

function resetAddForm () {
  addForm.caName = ''
  addForm.description = ''
  addForm.notBefore = ''
  addForm.notAfter = ''
  addForm.certFileName = ''
  addFormRef.value?.resetFields()
}

const handleSearch = () => {
  queryCaName.value = filterCaName.value
  queryDn.value = filterDn.value
  queryValidityRange.value = filterValidityRange.value
    ? [...filterValidityRange.value]
    : null
  currentPage.value = 1
}

const handleReset = () => {
  filterCaName.value = ''
  queryCaName.value = ''
  filterDn.value = ''
  queryDn.value = ''
  filterValidityRange.value = null
  queryValidityRange.value = null
  currentPage.value = 1
}

const stubAction = (row, title) => {
  ElMessage.info(`${title}（原型演示）：${row.caName}`)
}

const openAdd = () => {
  resetAddForm()
  addVisible.value = true
}

function onAddCertChange (uploadFile) {
  addForm.certFileName = uploadFile?.name || ''
  addFormRef.value?.validateField('certFileName')
}

function onAddCertRemove () {
  addForm.certFileName = ''
}

async function confirmAdd () {
  try {
    await addFormRef.value?.validate()
  } catch {
    return
  }
  list.value.push({
    id: String(idSeq++),
    caName: addForm.caName.trim(),
    description: addForm.description.trim(),
    certLabel: addForm.certFileName,
    notBefore: addForm.notBefore,
    notAfter: addForm.notAfter
  })
  addVisible.value = false
  ElMessage.success('添加成功（原型演示）')
}

const openDetail = (row) => {
  router.push({
    name: 'CACertChain',
    params: { id: row.id },
    state: { caCertRow: { ...row } }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除「${row.caName}」？`, '提示', { type: 'warning' })
    .then(() => {
      list.value = list.value.filter((r) => r.id !== row.id)
      ElMessage.success('已删除')
    })
    .catch(() => {})
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.ca-search-toolbar {
  background: $card-bg;
  padding: $spacing-md;
  margin-bottom: $spacing-sm;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-md $spacing-lg;
  align-items: center;
}

.filter-item {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: $spacing-xs;
}

.filter-label {
  flex-shrink: 0;
  font-size: $font-size-base;
  color: $text-secondary;
  white-space: nowrap;
}

.filter-input {
  width: 280px;

  &--dn {
    width: 360px;
    max-width: 100%;
  }
}

.filter-item--range {
  flex: 1 1 320px;
  min-width: 280px;
}

.filter-daterange {
  flex: 1;
  min-width: 240px;
  max-width: 320px;
}

.filter-actions {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: $spacing-xs;
}

.action-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: $text-secondary;
}

.table-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding: 4px 0;
}

.dn-link {
  padding: 0;
  height: auto;
  font-weight: 400;
  text-align: left;
  white-space: normal;
  line-height: 1.5;
}
</style>
