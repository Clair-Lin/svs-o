<template>
  <div class="key-panel">
    <div class="action-bar">
      <el-button type="primary" @click="handleCreate">生成容器</el-button>
      <el-button @click="handleImportContainer">导入容器</el-button>
    </div>

    <el-table :data="pagedKeyList" border stripe>
      <el-table-column prop="containerName" label="容器名" min-width="180" />
      <el-table-column prop="keyAlgorithm" label="密钥算法" width="110" />
      <el-table-column prop="keyLength" label="密钥长度" width="100" align="center" />
      <el-table-column prop="usageLabel" label="用途" width="120" />
      <el-table-column label="绑定证书" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ getCertDisplay(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="addedTime" label="添加时间" width="180" />
      <el-table-column label="操作" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" size="small" link @click="handleDetail(row)">详情</el-button>
          <el-button type="primary" size="small" link @click="openBindCertDialog(row)">
            {{ hasAnyCertBound(row) ? '更换证书' : '关联证书' }}
          </el-button>
          <el-button type="primary" size="small" link @click="handleBackup(row)">备份</el-button>
          <el-button type="primary" size="small" link @click="handleDestroy(row)">销毁</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        background
        layout="total, sizes, prev, pager, next"
        :total="keyList.length"
        :page-sizes="[10, 20, 50]"
      />
    </div>

    <el-dialog
      v-model="createDialogVisible"
      title="生成容器"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="keyForm" :rules="keyRules" label-width="120px">
        <el-form-item label="容器名" prop="containerName">
          <el-input v-model="keyForm.containerName" clearable placeholder="手动输入，唯一" />
        </el-form-item>
        <el-form-item label="密钥算法" prop="keyAlgorithm">
          <el-select v-model="keyForm.keyAlgorithm" style="width: 100%" @change="handleCreateAlgorithmChange">
            <el-option label="SM2" value="SM2" />
            <el-option label="RSA" value="RSA" />
          </el-select>
        </el-form-item>
        <el-form-item label="密钥长度" prop="keyLength">
          <el-select v-model="keyForm.keyLength" style="width: 100%">
            <el-option
              v-for="len in createAvailableKeyLengths"
              :key="len"
              :label="String(len)"
              :value="len"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="密钥用途">
          <el-radio-group v-model="keyForm.usageLabel">
            <el-radio value="签名验签">签名验签</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="PIN" prop="password">
          <el-input
            v-model="keyForm.password"
            type="password"
            placeholder="SAF_Login 认证凭据"
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

    <el-dialog v-model="detailDialogVisible" title="密钥详情" width="560px" class="detail-dialog-p2" align-center>
      <div v-if="currentKey" class="detail-p2-body">
        <div class="detail-p2-row">
          <span class="detail-p2-label">容器名</span>
          <span class="detail-p2-value">{{ currentKey.containerName }}</span>
        </div>
        <div class="detail-p2-row">
          <span class="detail-p2-label">密钥算法</span>
          <span class="detail-p2-value">{{ currentKey.keyAlgorithm }}</span>
        </div>
        <div class="detail-p2-row">
          <span class="detail-p2-label">密钥长度</span>
          <span class="detail-p2-value">{{ currentKey.keyLength }}</span>
        </div>
        <div class="detail-p2-row">
          <span class="detail-p2-label">密钥用途</span>
          <span class="detail-p2-value">{{ currentKey.usageLabel }}</span>
        </div>
        <div class="detail-p2-row">
          <span class="detail-p2-label">绑定证书</span>
          <span class="detail-p2-value">{{ getCertDisplay(currentKey) }}</span>
        </div>
        <div class="detail-p2-row">
          <span class="detail-p2-label">添加时间</span>
          <span class="detail-p2-value">{{ currentKey.addedTime }}</span>
        </div>
      </div>
      <div v-if="currentKey" class="cert-info-block">
        <div class="cert-info-title">证书信息</div>
        <el-table :data="detailCertRows" border size="small">
          <el-table-column prop="purposeLabel" label="密钥用途" width="120" />
          <el-table-column prop="subjectCn" label="证书CN" min-width="140" />
          <el-table-column prop="issuerCn" label="颁发者" min-width="130" />
          <el-table-column prop="validity" label="有效期" min-width="170" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="row.bound"
                type="primary"
                size="small"
                link
                @click="handleViewCert(currentKey, row.purpose)"
              >
                查看
              </el-button>
              <el-button
                type="primary"
                size="small"
                link
                :disabled="!row.enabled"
                @click="openBindCertDialog(currentKey, row.purpose)"
              >
                {{ row.bound ? '更换证书' : '关联证书' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <el-dialog
      v-model="bindCertDialogVisible"
      :title="bindCertDialogTitle"
      width="520px"
      :close-on-click-modal="false"
      @closed="resetBindDialog"
    >
      <el-form v-if="bindTargetRow" label-width="100px" class="bind-cert-form">
        <el-form-item label="容器名">
          <span>{{ bindTargetRow.containerName }}</span>
        </el-form-item>
        <el-form-item label="密钥用途">
          <span>签名验签</span>
        </el-form-item>

        <el-form-item label="选择证书">
          <div class="bind-select-cert">
            <el-input
              :value="selectedAppCert?.appCertName ?? ''"
              placeholder="请选择要绑定的证书"
              readonly
              class="bind-select-input"
            />
            <el-button type="primary" @click="openAssociateCertDialog">选择</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bindCertDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedAppCert" :loading="bindingSubmitting" @click="confirmBindCert">
          确认绑定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="associateDialogVisible"
      title="关联已有应用证书"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-table
        :data="applicationCertList"
        border
        stripe
        highlight-current-row
        max-height="360"
        @row-click="handleAppCertRowClick"
      >
        <el-table-column width="50" align="center">
          <template #default="{ row }">
            <el-radio v-model="associateRadioId" :value="row.id">&nbsp;</el-radio>
          </template>
        </el-table-column>
        <el-table-column prop="appCertName" label="应用证书名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="algorithm" label="算法" width="80" align="center" />
        <el-table-column prop="issuerCn" label="颁发者" min-width="140" show-overflow-tooltip />
        <el-table-column prop="serialNumber" label="证书序列号" min-width="160" show-overflow-tooltip />
        <el-table-column prop="appliedDate" label="申请日期" width="120" align="center" />
        <el-table-column prop="expireDate" label="到期时间" width="120" align="center" />
      </el-table>
      <template #footer>
        <el-button @click="associateDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!associateRadioId" @click="confirmAssociateCert">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { KEY_MANAGE_SECURITY_KEY } from './keyManageSecurityKey.js'
const currentPage = ref(1)
const pageSize = ref(10)
const createDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const creating = ref(false)
const currentKey = ref(null)
const formRef = ref(null)
const securityModalsRef = inject(KEY_MANAGE_SECURITY_KEY) ?? ref(null)
const bindCertDialogVisible = ref(false)
const bindTargetRow = ref(null)
const bindPurpose = ref('sign')
const selectedAppCert = ref(null)
const bindingSubmitting = ref(false)
const associateDialogVisible = ref(false)
const associateRadioId = ref(null)

const keyForm = reactive({
  containerName: '',
  keyAlgorithm: 'SM2',
  keyLength: 256,
  usageLabel: '签名验签',
  password: ''
})

/** 生成容器：各算法可选密钥长度（位） */
const CREATE_KEY_LENGTHS_BY_ALGORITHM = {
  SM2: [256],
  RSA: [2048]
}

const createAvailableKeyLengths = computed(() => CREATE_KEY_LENGTHS_BY_ALGORITHM[keyForm.keyAlgorithm] ?? [256])

function handleCreateAlgorithmChange () {
  const sizes = CREATE_KEY_LENGTHS_BY_ALGORITHM[keyForm.keyAlgorithm]
  keyForm.keyLength = sizes?.length ? sizes[0] : 256
}

const keyRules = {
  containerName: [{ required: true, message: '请输入容器名', trigger: 'blur' }],
  keyAlgorithm: [{ required: true, message: '请选择密钥算法', trigger: 'change' }],
  keyLength: [{ required: true, message: '请选择密钥长度', trigger: 'change' }],
  password: [
    { required: true, message: '请输入 PIN', trigger: 'blur' },
    { min: 6, max: 32, message: '长度在 6 到 32 个字符', trigger: 'blur' }
  ]
}

const keyList = ref([
  {
    keyId: 'SVS_userA',
    containerName: 'SVS_userA',
    keyAlgorithm: 'SM2',
    keyLength: 256,
    usageLabel: '签名验签',
    hasSignKeyPair: true,
    certBindings: {
      sign: {
        subjectCn: 'CN=用户A',
        issuerCn: 'XX CA Center',
        validFrom: '2025-01-01',
        validTo: '2027-01-01',
        serialNumber: '1A2B3C4D5E8899',
        publicKeyAlgorithm: 'SM2 256bit',
        usages: ['数字签名']
      }
    },
    publicKeyContent: '-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoEcz1UBgi0DQgAE6f4Mwl7F9qJQxM7kR8I5f2Q1c0hN\np0j4R1sD8n7xS2t9M6kY7h1Qxw3aD2Y9V6t8r1L5j2f9m0v8q3x2Yw==\n-----END PUBLIC KEY-----',
    addedTime: '2026-04-30 10:00:00'
  },
  {
    keyId: 'SVS_userB',
    containerName: 'SVS_userB',
    keyAlgorithm: 'SM2',
    keyLength: 256,
    usageLabel: '签名验签',
    hasSignKeyPair: true,
    certBindings: {
      sign: null
    },
    publicKeyContent: '-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoEcz1UBgi0DQgAE8r2Jm6kN9xS3p4Qw7tY2v1c0hN5L\nq8p3D1sF6n9xT2v7B5kY4h1Qxw3aD2Y9V6t8r1L5j2f9m0v8q3x2Yw==\n-----END PUBLIC KEY-----',
    addedTime: '2026-04-30 10:01:00'
  }
])

const applicationCertList = ref([
  {
    id: 'app-cert-001',
    appCertName: '签名应用证书-用户A / APP001',
    algorithm: 'SM2',
    issuerCn: 'XX CA Center',
    serialNumber: '1A2B3C4D5E8899',
    appliedDate: '2025-01-01',
    expireDate: '2027-01-01',
    subjectCn: 'CN=用户A',
    validFrom: '2025-01-01',
    validTo: '2027-01-01',
    publicKeyAlgorithm: 'SM2 256bit',
    usages: ['数字签名']
  },
  {
    id: 'app-cert-002',
    appCertName: '加密应用证书-用户B / APP002',
    algorithm: 'SM2',
    issuerCn: 'XX CA Center',
    serialNumber: '9D8C7B6A5F3322',
    appliedDate: '2025-02-15',
    expireDate: '2027-02-15',
    subjectCn: 'CN=用户B',
    validFrom: '2025-02-15',
    validTo: '2027-02-15',
    publicKeyAlgorithm: 'SM2 256bit',
    usages: ['密钥加密']
  }
])

const pagedKeyList = computed(() => {
  const list = keyList.value
  const start = (currentPage.value - 1) * pageSize.value
  return list.slice(start, start + pageSize.value)
})

const detailCertRows = computed(() => {
  const row = currentKey.value
  if (!row) return []
  const signCert = row.certBindings?.sign
  return [
    {
      purpose: 'sign',
      purposeLabel: '签名密钥对证书',
      bound: Boolean(signCert),
      enabled: row.hasSignKeyPair,
      subjectCn: signCert?.subjectCn ?? '（未绑定）',
      issuerCn: signCert?.issuerCn ?? '—',
      validity: signCert ? `${signCert.validFrom} ~ ${signCert.validTo}` : '—'
    }
  ]
})

function getCertDisplay (row) {
  return row.certBindings?.sign?.subjectCn || '未绑定'
}

/** 容器是否已绑定签名证书（列表主操作：关联 / 更换） */
function hasAnyCertBound (row) {
  return Boolean(row?.certBindings?.sign)
}

const bindPurposeSlotHasCert = computed(() => {
  const row = bindTargetRow.value
  if (!row?.certBindings) return false
  return Boolean(row.certBindings[bindPurpose.value])
})

const bindCertDialogTitle = computed(() => (bindPurposeSlotHasCert.value ? '更换证书' : '绑定证书'))

const handleCreate = () => {
  Object.assign(keyForm, {
    containerName: '',
    keyAlgorithm: 'SM2',
    keyLength: 256,
    usageLabel: '签名验签',
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
    ElMessage.success('容器生成成功（通用密码服务接口 GM/T 0019-2023 原型）')
  }, 1500)
}

const handleImportContainer = () => {
  ElMessage.info('导入容器：请选择容器备份文件（原型演示）')
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

function openBindCertDialog (row) {
  bindTargetRow.value = row
  bindPurpose.value = 'sign'
  selectedAppCert.value = null
  bindCertDialogVisible.value = true
}

function resetBindDialog () {
  bindTargetRow.value = null
  selectedAppCert.value = null
  associateRadioId.value = null
  bindingSubmitting.value = false
}

function openAssociateCertDialog () {
  associateRadioId.value = selectedAppCert.value?.id ?? null
  associateDialogVisible.value = true
}

function handleAppCertRowClick (row) {
  associateRadioId.value = row.id
}

function confirmAssociateCert () {
  const picked = applicationCertList.value.find(c => c.id === associateRadioId.value)
  if (!picked) {
    ElMessage.warning('请选择要关联的应用证书')
    return
  }
  selectedAppCert.value = picked
  associateDialogVisible.value = false
}

function confirmBindCert () {
  const row = bindTargetRow.value
  if (!row || !selectedAppCert.value) return
  bindingSubmitting.value = true
  setTimeout(() => {
    bindingSubmitting.value = false
    const cert = selectedAppCert.value
    row.certBindings[bindPurpose.value] = {
      subjectCn: cert.subjectCn,
      issuerCn: cert.issuerCn,
      serialNumber: cert.serialNumber,
      validFrom: cert.validFrom,
      validTo: cert.validTo,
      publicKeyAlgorithm: cert.publicKeyAlgorithm,
      usages: [...cert.usages]
    }
    bindCertDialogVisible.value = false
    ElMessage.success('证书绑定成功（SAF_SetCertificate 原型演示）')
  }, 800)
}

function handleViewCert (row, purpose) {
  const cert = row?.certBindings?.[purpose]
  if (!cert) return
  ElMessageBox.alert(
    `主体: ${cert.subjectCn}\n颁发者: ${cert.issuerCn}\n序列号: ${cert.serialNumber}\n有效期: ${cert.validFrom} ~ ${cert.validTo}`,
    '证书详情',
    { confirmButtonText: '关闭' }
  )
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

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

.cert-info-block {
  margin-top: 12px;
}

.cert-info-title {
  margin: 0 0 8px;
  font-size: 14px;
  color: $text-primary;
  font-weight: 600;
}

.bind-cert-form {
  .el-form-item__label {
    color: $text-secondary;
  }

  .el-form-item__content {
    > span {
      color: $text-primary;
      font-size: 14px;
    }
  }
}

.bind-select-cert {
  display: flex;
  gap: 8px;
  width: 100%;

  .bind-select-input {
    flex: 1;
  }
}

</style>
