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
            <el-option label="SM2" value="SM2" />
            <el-option label="RSA" value="RSA" />
            <el-option label="SM4" value="SM4" />
            <el-option label="3DES" value="3DES" />
            <el-option label="AES" value="AES" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">密钥用途</span>
          <el-select v-model="filterUsage" placeholder="全部" class="filter-select">
            <el-option label="全部" value="" />
            <el-option label="签名验签" value="签名验签" />
            <el-option label="加密解密" value="加密解密" />
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
      <el-table-column prop="keyAlgorithm" label="密钥算法" width="120" />
      <el-table-column prop="keyUsage" label="密钥用途" width="120" />
      <el-table-column prop="keyLength" label="密钥长度" width="100" align="center" />
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
        <el-form-item label="密钥算法" prop="algorithm">
          <el-select v-model="keyForm.algorithm" style="width: 100%" @change="handleAlgorithmChange">
            <el-option label="SM2" value="SM2" />
            <el-option label="RSA" value="RSA" />
            <el-option label="SM4" value="SM4" />
            <el-option label="3DES" value="3DES" />
            <el-option label="AES" value="AES" />
          </el-select>
        </el-form-item>
        <el-form-item label="密钥用途" prop="usage">
          <el-checkbox-group v-model="keyForm.usage">
            <el-checkbox label="签名验签" :disabled="isSymmetricKeyAlgorithm">
              签名验签
            </el-checkbox>
            <el-checkbox label="加密解密">加密解密</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="密钥长度" prop="keySize">
          <el-select v-model="keyForm.keySize" style="width: 100%">
            <el-option
              v-for="size in availableSizes"
              :key="size"
              :label="String(size)"
              :value="size"
            />
          </el-select>
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

    <el-dialog v-model="detailDialogVisible" title="密钥详情" width="480px" class="detail-dialog-p2" align-center>
      <div v-if="currentKey" class="detail-p2-body">
        <div class="detail-p2-row">
          <span class="detail-p2-label">密钥ID</span>
          <span class="detail-p2-value">{{ currentKey.keyId }}</span>
        </div>
        <div class="detail-p2-row">
          <span class="detail-p2-label">密钥算法</span>
          <span class="detail-p2-value">{{ currentKey.keyAlgorithm }}</span>
        </div>
        <div class="detail-p2-row">
          <span class="detail-p2-label">密钥用途</span>
          <span class="detail-p2-value">{{ currentKey.keyUsage }}</span>
        </div>
        <div class="detail-p2-row">
          <span class="detail-p2-label">密钥长度</span>
          <span class="detail-p2-value">{{ currentKey.keyLength }}</span>
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
import { ref, reactive, computed, inject } from 'vue'
import { ElMessage } from 'element-plus'
import { KEY_MANAGE_SECURITY_KEY } from './keyManageSecurityKey.js'

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
const securityModalsRef = inject(KEY_MANAGE_SECURITY_KEY) ?? ref(null)

const keyForm = reactive({
  algorithm: 'SM2',
  usage: ['签名验签'],
  keySize: 256,
  password: ''
})

const keyRules = {
  algorithm: [{ required: true, message: '请选择密钥算法', trigger: 'change' }],
  keySize: [{ required: true, message: '请选择密钥长度', trigger: 'change' }],
  usage: [{ required: true, message: '请选择密钥用途', trigger: 'change', type: 'array', min: 1 }],
  password: [
    { required: true, message: '请输入密钥访问口令', trigger: 'blur' },
    { min: 6, max: 32, message: '长度在 6 到 32 个字符', trigger: 'blur' }
  ]
}

/** 各算法可选密钥长度（位），与算法类型一致 */
const KEY_SIZES_BY_ALGORITHM = {
  SM2: [256],
  RSA: [2048],
  SM4: [128],
  '3DES': [168],
  AES: [128]
}

const availableSizes = computed(() => {
  return KEY_SIZES_BY_ALGORITHM[keyForm.algorithm] ?? [256]
})

/** SM4 / 3DES / AES 仅支持加密解密 */
const SYMMETRIC_ALGORITHMS = ['SM4', '3DES', 'AES']
const isSymmetricKeyAlgorithm = computed(() =>
  SYMMETRIC_ALGORITHMS.includes(keyForm.algorithm)
)

function handleAlgorithmChange () {
  const sizes = KEY_SIZES_BY_ALGORITHM[keyForm.algorithm]
  keyForm.keySize = sizes?.length ? sizes[0] : 256
  if (isSymmetricKeyAlgorithm.value) {
    keyForm.usage = ['加密解密']
  }
}

const keyList = ref([
  {
    index: 102,
    keyId: '1763124279630301',
    keyAlgorithm: 'RSA',
    keyUsage: '签名验签',
    keyLength: '2048',
    addedTime: '2025-11-14 20:44:39',
    addedTimeMs: 1763124279000
  },
  {
    index: 101,
    keyId: '1763124100123456',
    keyAlgorithm: 'SM2',
    keyUsage: '签名验签',
    keyLength: '256',
    addedTime: '2025-11-14 18:22:10',
    addedTimeMs: 1763118130000
  }
])

const filteredKeyList = computed(() =>
  keyList.value.filter((row) => {
    if (filterKeyId.value && !String(row.keyId).includes(filterKeyId.value.trim())) {
      return false
    }
    if (filterAlgorithm.value && row.keyAlgorithm !== filterAlgorithm.value) {
      return false
    }
    if (filterUsage.value && row.keyUsage !== filterUsage.value) {
      return false
    }
    if (filterDateRange.value && filterDateRange.value.length === 2) {
      const [start, end] = filterDateRange.value.map(Number)
      if (row.addedTimeMs < start || row.addedTimeMs > end) return false
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
    algorithm: 'SM2',
    usage: ['签名验签'],
    keySize: 256,
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
    ElMessage.success('密钥生成成功（签名验签服务器 GM/T 0029-2014 原型）')
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
  securityModalsRef.value?.openUkeyBackup?.(row)
}

const handleDestroy = (row) => {
  securityModalsRef.value?.openDestroyFlow?.(row)
}

const handleViewPassword = (row) => {
  securityModalsRef.value?.openViewPasswordFlow?.(row)
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

.filter-daterange {
  flex: 1;
  min-width: 180px;
  max-width: 300px;
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
