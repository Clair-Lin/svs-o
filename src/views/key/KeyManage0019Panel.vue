<template>
  <div class="key-panel">
    <div class="key-search-toolbar">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">密钥ID</span>
          <el-input
            v-model="filterKeyId"
            placeholder="请输入密钥ID"
            clearable
            class="filter-input"
          />
        </div>
        <div class="filter-item">
          <span class="filter-label">密码算法</span>
          <el-select v-model="filterAlgorithm" placeholder="全部" class="filter-select">
            <el-option label="全部" value="" />
            <el-option label="RSA_2048" value="RSA_2048" />
            <el-option label="SM2_256" value="SM2_256" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">密钥用途</span>
          <el-select v-model="filterUsage" placeholder="全部" class="filter-select filter-select--usage">
            <el-option label="全部" value="" />
            <el-option label="签名" value="签名" />
            <el-option label="密钥交换协议" value="密钥交换协议" />
            <el-option label="加密" value="加密" />
            <el-option label="密钥交换（加密）" value="密钥交换（加密）" />
          </el-select>
        </div>
        <div class="filter-item filter-item--range">
          <span class="filter-label">添加时间</span>
          <el-date-picker
            v-model="filterDateRange"
            type="datetimerange"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="x"
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
      <el-button type="primary" @click="handleCreate">生成密钥</el-button>
      <el-button @click="handleRecover">恢复密钥</el-button>
    </div>

    <el-table :data="pagedKeyList" border stripe>
      <el-table-column prop="index" label="密钥索引" width="100" align="center" />
      <el-table-column prop="keyId" label="密钥ID" min-width="160" show-overflow-tooltip />
      <el-table-column prop="algorithmSpec" label="密钥算法" width="120" />
      <el-table-column prop="usageLabel" label="密钥用途" width="140" show-overflow-tooltip />
      <el-table-column prop="exportableLabel" label="是否可导出" width="110" align="center" />
      <el-table-column prop="addedTime" label="添加时间" width="180" />
      <el-table-column label="操作" fixed="right" width="320">
        <template #default="{ row }">
          <el-button type="primary" size="small" link @click="handleDetail(row)">详情</el-button>
          <el-button type="primary" size="small" link @click="handleBackup(row)">备份</el-button>
          <el-button type="primary" size="small" link @click="handleDestroy(row)">销毁</el-button>
          <el-button type="primary" size="small" link @click="handleViewPassword(row)">
            查看密钥访问口令
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        background
        layout="total, sizes, prev, pager, next"
        :total="filteredKeyList.length"
        :page-sizes="[10, 20, 50]"
      />
    </div>

    <el-dialog
      v-model="createDialogVisible"
      title="生成密钥"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="keyForm" :rules="keyRules" label-width="120px">
        <el-form-item label="密钥容器名" prop="pucContainerName">
          <el-input v-model="keyForm.pucContainerName" placeholder="pucContainerName[in]" clearable />
        </el-form-item>
        <el-form-item label="密钥类型" prop="keyType">
          <el-select
            v-model="keyForm.keyType"
            style="width: 100%"
            placeholder="请选择密钥类型"
            @change="syncKeyTypeDerivedFields"
          >
            <el-option
              v-for="opt in KEY_TYPE_OPTIONS_0019"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="密钥用途" prop="keyUsage">
          <el-select v-model="keyForm.keyUsage" style="width: 100%" placeholder="请选择密钥用途">
            <el-option
              v-for="opt in currentKeyUsageOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="密钥长度" prop="keyLength">
          <el-select v-model="keyForm.keyLength" style="width: 100%" placeholder="请选择密钥长度">
            <el-option
              v-for="bits in availableKeyLengths"
              :key="bits"
              :label="`${bits}`"
              :value="bits"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="导出" prop="uiExportFlag">
          <el-radio-group v-model="keyForm.uiExportFlag">
            <el-radio
              v-for="opt in EXPORT_FLAG_OPTIONS"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="密钥访问口令" prop="password">
          <el-input
            v-model="keyForm.password"
            type="password"
            placeholder="请输入密钥访问口令"
            show-password
            autocomplete="new-password"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreateKey">
          {{ creating ? '生成中...' : '确定' }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="detailDialogVisible"
      title="密钥详情"
      width="480px"
      class="detail-dialog-p2"
      align-center
    >
      <div v-if="currentKey" class="detail-p2-body">
        <div class="detail-p2-row">
          <span class="detail-p2-label">密钥ID</span>
          <span class="detail-p2-value">{{ currentKey.keyId }}</span>
        </div>
        <div class="detail-p2-row">
          <span class="detail-p2-label">密钥算法</span>
          <span class="detail-p2-value">{{ currentKey.algorithmSpec }}</span>
        </div>
        <div class="detail-p2-row">
          <span class="detail-p2-label">密钥用途</span>
          <span class="detail-p2-value">{{ currentKey.usageLabel }}</span>
        </div>
        <div class="detail-p2-row">
          <span class="detail-p2-label">是否可导出</span>
          <span class="detail-p2-value">{{ currentKey.exportableLabel }}</span>
        </div>
        <div class="detail-p2-row">
          <span class="detail-p2-label">添加时间</span>
          <span class="detail-p2-value">{{ currentKey.addedTime }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  KEY_TYPE_OPTIONS_0019,
  KEY_USAGE_OPTIONS_SM2_0019,
  KEY_USAGE_OPTIONS_RSA_0019,
  KEY_LENGTHS_BY_TYPE_0019,
  EXPORT_FLAG_OPTIONS
} from '@/constants/gmt0019.js'

const filterKeyId = ref('')
const filterAlgorithm = ref('')
const filterUsage = ref('')
const filterDateRange = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const createDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const creating = ref(false)
const currentKey = ref(null)
const formRef = ref(null)

const keyForm = reactive({
  keyType: 'SM2',
  keyLength: 256,
  keyUsage: 'sm2_sign',
  pucContainerName: '',
  uiExportFlag: 0,
  password: ''
})

const currentKeyUsageOptions = computed(() =>
  keyForm.keyType === 'RSA' ? KEY_USAGE_OPTIONS_RSA_0019 : KEY_USAGE_OPTIONS_SM2_0019
)

const availableKeyLengths = computed(
  () => KEY_LENGTHS_BY_TYPE_0019[keyForm.keyType] ?? [256]
)

function syncKeyTypeDerivedFields () {
  const list = KEY_LENGTHS_BY_TYPE_0019[keyForm.keyType]
  if (list?.length && !list.includes(keyForm.keyLength)) {
    keyForm.keyLength = list[0]
  }
  const usageOpts = currentKeyUsageOptions.value
  if (usageOpts.length && !usageOpts.some((o) => o.value === keyForm.keyUsage)) {
    keyForm.keyUsage = usageOpts[0].value
  }
}

const keyRules = {
  keyType: [{ required: true, message: '请选择密钥类型', trigger: 'change' }],
  keyLength: [{ required: true, message: '请选择密钥长度', trigger: 'change' }],
  pucContainerName: [{ required: true, message: '请输入密钥容器名', trigger: 'blur' }],
  keyUsage: [{ required: true, message: '请选择密钥用途', trigger: 'change' }],
  uiExportFlag: [{ required: true, message: '请选择是否导出', trigger: 'change' }],
  password: [
    { required: true, message: '请输入密钥访问口令', trigger: 'blur' },
    { min: 6, max: 32, message: '长度在 6 到 32 个字符', trigger: 'blur' }
  ]
}

const keyList = ref([
  {
    index: 102,
    keyId: '1763124279630301',
    algorithmSpec: 'RSA_2048',
    usageLabel: '签名',
    exportableLabel: '可导出',
    uiExportFlag: 1,
    addedTime: '2025-11-14 20:44:39',
    addedTimeMs: 1763124279000
  },
  {
    index: 101,
    keyId: '1763124100123456',
    algorithmSpec: 'SM2_256',
    usageLabel: '密钥交换协议',
    exportableLabel: '不可导出',
    uiExportFlag: 0,
    addedTime: '2025-11-14 18:22:10',
    addedTimeMs: 1763118130000
  }
])

const filteredKeyList = computed(() =>
  keyList.value.filter((row) => {
    if (filterKeyId.value && !String(row.keyId).includes(filterKeyId.value.trim())) {
      return false
    }
    if (filterAlgorithm.value && row.algorithmSpec !== filterAlgorithm.value) {
      return false
    }
    if (filterUsage.value && row.usageLabel !== filterUsage.value) {
      return false
    }
    if (filterDateRange.value && filterDateRange.value.length === 2) {
      const [start, end] = filterDateRange.value.map(Number)
      const t = row.addedTimeMs
      if (t < start || t > end) return false
    }
    return true
  })
)

const pagedKeyList = computed(() => {
  const list = filteredKeyList.value
  const start = (currentPage.value - 1) * pageSize.value
  return list.slice(start, start + pageSize.value)
})

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  filterKeyId.value = ''
  filterAlgorithm.value = ''
  filterUsage.value = ''
  filterDateRange.value = null
  currentPage.value = 1
}

const handleCreate = () => {
  Object.assign(keyForm, {
    keyType: 'SM2',
    keyLength: 256,
    keyUsage: 'sm2_sign',
    pucContainerName: '',
    uiExportFlag: 0,
    password: ''
  })
  createDialogVisible.value = true
}

async function handleCreateKey () {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  creating.value = true
  setTimeout(() => {
    creating.value = false
    createDialogVisible.value = false
    ElMessage.success('密钥生成成功（通用密码服务接口 GM/T 0019-2023 原型）')
  }, 1500)
}

const handleRecover = () => {
  ElMessage.info('恢复密钥：请选择密钥备份文件（原型演示）')
}

const handleDetail = (row) => {
  currentKey.value = row
  detailDialogVisible.value = true
}

const handleBackup = (row) => {
  ElMessage.success(`已触发密钥 ${row.keyId} 备份（原型演示）`)
}

const handleDestroy = (row) => {
  ElMessageBox.confirm(
    `确定销毁密钥「${row.keyId}」吗？销毁后不可恢复。`,
    '销毁确认',
    {
      confirmButtonText: '确定销毁',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      ElMessage.success('已提交销毁请求（原型演示）')
    })
    .catch(() => {})
}

const handleViewPassword = () => {
  ElMessageBox.alert(
    '为保护密钥安全，口令已脱敏展示。原型演示口令：********',
    '密钥访问口令',
    { confirmButtonText: '知道了' }
  )
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.key-search-toolbar {
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

.filter-item--range {
  flex: 1 1 320px;
  min-width: 280px;
}

.filter-label {
  flex-shrink: 0;
  font-size: $font-size-base;
  color: $text-secondary;
  white-space: nowrap;
}

.filter-input {
  width: 200px;
}

.filter-select {
  width: 140px;
}

.filter-select--usage {
  width: 168px;
}

.filter-daterange {
  flex: 1;
  min-width: 280px;
  max-width: 400px;
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

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.detail-p2-body {
  padding: 8px 0 0;
}

.detail-p2-row {
  display: flex;
  align-items: flex-start;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.detail-p2-label {
  flex: 0 0 120px;
  text-align: right;
  padding-right: 16px;
  color: $text-secondary;
  font-size: 14px;
  line-height: 22px;
}

.detail-p2-value {
  flex: 1;
  color: $text-primary;
  font-size: 14px;
  line-height: 22px;
  word-break: break-all;
}

</style>
