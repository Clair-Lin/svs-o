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

      <el-table :data="filteredList" border stripe>
        <el-table-column prop="caName" label="CA名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="description" label="CA描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="certLabel" label="CA证书" min-width="200" show-overflow-tooltip />
        <el-table-column prop="notBefore" label="生效时间" width="120" align="center" />
        <el-table-column prop="notAfter" label="过期时间" width="120" align="center" />
        <el-table-column label="操作" fixed="right" width="140">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="openDetail(row)">查看</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
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

    <el-dialog v-model="detailVisible" title="CA根证详情" width="520px">
      <el-descriptions v-if="currentRow" :column="1" border>
        <el-descriptions-item label="CA名称">{{ currentRow.caName }}</el-descriptions-item>
        <el-descriptions-item label="CA描述">{{ currentRow.description || '—' }}</el-descriptions-item>
        <el-descriptions-item label="CA证书">{{ currentRow.certLabel }}</el-descriptions-item>
        <el-descriptions-item label="生效时间">{{ currentRow.notBefore }}</el-descriptions-item>
        <el-descriptions-item label="过期时间">{{ currentRow.notAfter }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

let idSeq = 1

const filterCaName = ref('')
const queryCaName = ref('')
const filterValidityRange = ref(null)
const queryValidityRange = ref(null)

const list = ref([])

function parseYmd (s) {
  if (!s) return null
  const t = Date.parse(s)
  return Number.isNaN(t) ? null : t
}

/** 证书有效期 [notBefore, notAfter] 与查询区间有交集则保留 */
const filteredList = computed(() => {
  const q = queryCaName.value.trim().toLowerCase()
  const range = queryValidityRange.value
  const [start, end] = Array.isArray(range) && range.length === 2 ? range : [null, null]
  const startT = start ? parseYmd(start) : null
  const endT = end ? parseYmd(end) : null

  return list.value.filter((row) => {
    if (q && !row.caName.toLowerCase().includes(q)) return false
    if (startT != null && endT != null) {
      const nb = parseYmd(row.notBefore)
      const na = parseYmd(row.notAfter)
      if (nb == null || na == null) return false
      if (!(nb <= endT && na >= startT)) return false
    }
    return true
  })
})

const addVisible = ref(false)
const detailVisible = ref(false)
const currentRow = ref(null)
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
  queryValidityRange.value = filterValidityRange.value
    ? [...filterValidityRange.value]
    : null
}

const handleReset = () => {
  filterCaName.value = ''
  queryCaName.value = ''
  filterValidityRange.value = null
  queryValidityRange.value = null
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
  currentRow.value = row
  detailVisible.value = true
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
</style>
