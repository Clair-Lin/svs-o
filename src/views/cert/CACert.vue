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
              placeholder="可用空格或逗号分隔多关键字"
              clearable
              class="filter-input filter-input--dn"
            />
          </div>
          <div class="filter-item filter-item--status">
            <span class="filter-label">状态</span>
            <el-select v-model="filterStatus" class="filter-status-select" placeholder="全部">
              <el-option label="全部" value="all" />
              <el-option label="未知" value="unknown" />
              <el-option label="正常" value="normal" />
              <el-option label="已过期" value="expired" />
              <el-option label="已吊销" value="revoked" />
              <el-option label="未生效" value="inactive" />
            </el-select>
          </div>
        </div>
        <div class="filter-row filter-row--second">
          <div class="filter-item filter-item--datepair">
            <span class="filter-label">生效开始时间</span>
            <el-date-picker
              v-model="filterNotBeforeStart"
              type="date"
              placeholder="开始日期"
              value-format="YYYY-MM-DD"
              clearable
              class="filter-date-single"
            />
          </div>
          <div class="filter-item filter-item--datepair">
            <span class="filter-label">生效结束时间</span>
            <el-date-picker
              v-model="filterNotBeforeEnd"
              type="date"
              placeholder="结束日期"
              value-format="YYYY-MM-DD"
              clearable
              class="filter-date-single"
            />
          </div>
          <div class="filter-item filter-item--datepair">
            <span class="filter-label">过期开始时间</span>
            <el-date-picker
              v-model="filterNotAfterStart"
              type="date"
              placeholder="开始日期"
              value-format="YYYY-MM-DD"
              clearable
              class="filter-date-single"
            />
          </div>
          <div class="filter-item filter-item--datepair">
            <span class="filter-label">过期结束时间</span>
            <el-date-picker
              v-model="filterNotAfterEnd"
              type="date"
              placeholder="结束日期"
              value-format="YYYY-MM-DD"
              clearable
              class="filter-date-single"
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

      <el-table :data="pagedList" border class="ca-cert-table">
        <el-table-column prop="caName" label="CA名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="description" label="CA描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="CA证书（DN）" min-width="280" show-overflow-tooltip>
          <template #default="{ row }">
            <el-button type="primary" link class="dn-link" @click="openDetail(row)">
              {{ row.certLabel }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="notBefore" label="生效时间" width="120" align="center" />
        <el-table-column prop="notAfter" label="过期时间" width="120" align="center" />
        <el-table-column label="状态" width="140" align="left">
          <template #default="{ row }">
            <div class="cert-status-cell">
              <span
                class="cert-status-dot"
                :class="'cert-status-dot--' + statusDisplay(row).variant"
                aria-hidden="true"
              />
              <span class="cert-status-text">{{ statusDisplay(row).text }}</span>
            </div>
          </template>
        </el-table-column>
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

let idSeq = 7

const filterCaName = ref('')
const queryCaName = ref('')
const filterDn = ref('')
const queryDn = ref('')
const filterStatus = ref('all')
const queryStatus = ref('all')
const filterNotBeforeStart = ref('')
const filterNotBeforeEnd = ref('')
const filterNotAfterStart = ref('')
const filterNotAfterEnd = ref('')
const queryNotBeforeStart = ref('')
const queryNotBeforeEnd = ref('')
const queryNotAfterStart = ref('')
const queryNotAfterEnd = ref('')

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
    notAfter: '2033-05-31',
    certState: 'normal'
  },
  {
    id: '2',
    caName: 'SM2-CA',
    description: 'SM2',
    certLabel: 'C=CN,O=GMSSL,OU=PKI/SM2,CN=RootCA for Test',
    notBefore: '2022-01-15',
    notAfter: '2032-01-14',
    certState: 'revoked'
  },
  {
    id: '3',
    caName: 'RSA-CA',
    description: 'RSA',
    certLabel: 'C=CN,O=GMSSL,OU=PKI/RSA,CN=RootCA for Test',
    notBefore: '2022-01-15',
    notAfter: '2032-01-14',
    certState: 'unknown'
  },
  {
    id: '4',
    caName: 'ML-DSA_CA',
    description: '抗量子密码算法签发的CA根证',
    certLabel: 'C=CN,CN=root_ca_20260205165008',
    notBefore: '2026-02-05',
    notAfter: '2036-02-04'
  },
  {
    id: '5',
    caName: 'DEMO-EXPIRED',
    description: '演示已过期',
    certLabel: 'C=CN,O=DEMO,CN=Expired CA',
    notBefore: '2020-01-01',
    notAfter: '2025-12-31'
  },
  {
    id: '6',
    caName: 'DEMO-INACTIVE',
    description: '演示未生效',
    certLabel: 'C=CN,O=DEMO,CN=Future CA',
    notBefore: '2027-01-01',
    notAfter: '2037-01-01'
  }
])

function parseYmd (s) {
  if (!s) return null
  const t = Date.parse(s + (s.length === 10 ? 'T00:00:00' : ''))
  return Number.isNaN(t) ? null : t
}

function todayYmd () {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * 行状态：未知、正常、已过期、已吊销、未生效
 * 显式 certState 优先；否则按日期推导（无有效日期则未知）
 */
const STATUS_KEYS = ['unknown', 'normal', 'expired', 'revoked', 'inactive']

function rowCertState (row) {
  const explicit = row?.certState
  if (explicit && STATUS_KEYS.includes(explicit)) return explicit
  const nb = row?.notBefore
  const na = row?.notAfter
  if (!nb || !na) return 'unknown'
  const today = todayYmd()
  if (today < nb) return 'inactive'
  if (today > na) return 'expired'
  return 'normal'
}

function statusDisplay (row) {
  const key = rowCertState(row)
  const map = {
    unknown: { text: '未知', variant: 'unknown' },
    normal: { text: '正常', variant: 'normal' },
    expired: { text: '已过期', variant: 'expired' },
    revoked: { text: '已吊销', variant: 'revoked' },
    inactive: { text: '未生效', variant: 'inactive' }
  }
  return map[key] || map.unknown
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

/** 按查询条件筛一行日期字段：仅开始 / 仅结束 / 两端（颠倒顺序时取闭区间） */
function rowDateMatchesBound (rowYmd, qStart, qEnd) {
  const s = (qStart || '').trim()
  const e = (qEnd || '').trim()
  if (!s && !e) return true
  const v = rowYmd
  if (!v) return false
  if (s && e) {
    const lo = s <= e ? s : e
    const hi = s <= e ? e : s
    return v >= lo && v <= hi
  }
  if (s) return v >= s
  return v <= e
}

/** CA名称、DN、状态、生效/过期独立日期边界（AND） */
const filteredList = computed(() => {
  const q = queryCaName.value.trim().toLowerCase()
  const st = queryStatus.value

  return list.value.filter((row) => {
    if (q && !row.caName.toLowerCase().includes(q)) return false
    if (!dnFuzzyMatch(row.certLabel, queryDn.value)) return false

    if (!rowDateMatchesBound(row.notBefore, queryNotBeforeStart.value, queryNotBeforeEnd.value)) {
      return false
    }
    if (!rowDateMatchesBound(row.notAfter, queryNotAfterStart.value, queryNotAfterEnd.value)) {
      return false
    }

    if (st !== 'all' && rowCertState(row) !== st) return false

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
  queryStatus.value = filterStatus.value
  queryNotBeforeStart.value = filterNotBeforeStart.value || ''
  queryNotBeforeEnd.value = filterNotBeforeEnd.value || ''
  queryNotAfterStart.value = filterNotAfterStart.value || ''
  queryNotAfterEnd.value = filterNotAfterEnd.value || ''
  currentPage.value = 1
}

const handleReset = () => {
  filterCaName.value = ''
  queryCaName.value = ''
  filterDn.value = ''
  queryDn.value = ''
  filterStatus.value = 'all'
  queryStatus.value = 'all'
  filterNotBeforeStart.value = ''
  filterNotBeforeEnd.value = ''
  filterNotAfterStart.value = ''
  filterNotAfterEnd.value = ''
  queryNotBeforeStart.value = ''
  queryNotBeforeEnd.value = ''
  queryNotAfterStart.value = ''
  queryNotAfterEnd.value = ''
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

.filter-row--second {
  margin-top: $spacing-sm;
}

.filter-item--status {
  flex: 0 0 auto;
  align-items: center;
}

.filter-status-select {
  width: 150px;
}

.filter-item--datepair {
  flex: 0 0 auto;
  align-items: center;
}

.filter-date-single {
  width: 160px;
}

/* 列表 12px；仅表头浅灰，表体全白 */
.ca-cert-table {
  :deep(.el-table__header .cell),
  :deep(.el-table__body .cell) {
    font-size: 12px;
  }

  :deep(.el-table__header th) {
    background-color: #f5f7fa !important;
  }

  :deep(.el-table__body tr) {
    background-color: #fff !important;
  }

  :deep(.el-table__body tr:hover > td) {
    background-color: #fff !important;
  }
}

.cert-status-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  line-height: 1.4;
}

.cert-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.cert-status-dot--unknown {
  background-color: #c0c4cc;
}

.cert-status-dot--normal {
  background-color: #67c23a;
}

.cert-status-dot--expired {
  background-color: #f56c6c;
}

.cert-status-dot--revoked {
  background-color: #909399;
}

.cert-status-dot--inactive {
  background-color: #409eff;
}

.cert-status-text {
  font-size: 12px;
  color: $text-primary;
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
