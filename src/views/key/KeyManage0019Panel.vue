<template>
  <div class="key-panel">
    <div class="action-bar">
      <el-button type="primary" @click="handleCreate">生成容器</el-button>
      <el-button @click="handleImportContainer">导入容器</el-button>
    </div>

    <el-table :data="pagedKeyList" border stripe>
      <el-table-column prop="containerName" label="容器名" min-width="180" />
      <el-table-column prop="algorithmSpec" label="算法" width="120" />
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
          <el-button type="primary" size="small" link @click="openBindCertDialog(row)">关联证书</el-button>
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
        <el-form-item label="密码算法" prop="algorithmSpec">
          <el-select v-model="keyForm.algorithmSpec" style="width: 100%">
            <el-option label="SM2_256" value="SM2_256" />
            <el-option label="RSA_2048" value="RSA_2048" />
          </el-select>
        </el-form-item>
        <el-form-item label="密钥用途" prop="usageLabel">
          <el-select v-model="keyForm.usageLabel" style="width: 100%">
            <el-option label="签名验签" value="签名验签" />
            <el-option label="加密解密" value="加密解密" />
          </el-select>
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
          <span class="detail-p2-label">密码算法</span>
          <span class="detail-p2-value">{{ currentKey.algorithmSpec }}</span>
        </div>
        <div class="detail-p2-row">
          <span class="detail-p2-label">密钥用途</span>
          <span class="detail-p2-value">{{ currentKey.usageLabel }}</span>
        </div>
        <div class="detail-p2-row">
          <span class="detail-p2-label">公钥内容</span>
          <span class="detail-p2-value detail-p2-value--pre">{{ currentKey.publicKeyContent }}</span>
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
                关联证书
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <el-dialog
      v-model="bindCertDialogVisible"
      title="绑定证书"
      width="620px"
      :close-on-click-modal="false"
      @closed="resetBindDialog"
    >
      <div v-if="bindTargetRow" class="bind-cert-body">
        <div class="bind-row">
          <span class="bind-label">容器名:</span>
          <span>{{ bindTargetRow.containerName }}</span>
        </div>
        <div class="bind-row" v-if="bindStep === 1">
          <span class="bind-label">密钥用途:</span>
          <el-radio-group v-model="bindPurpose">
            <el-radio value="sign">签名密钥对证书</el-radio>
            <el-radio value="encrypt" :disabled="!bindTargetRow.hasEncryptKeyPair">加密密钥对证书</el-radio>
          </el-radio-group>
        </div>
        <div class="bind-row" v-else>
          <span class="bind-label">密钥用途:</span>
          <span>{{ purposeLabel(bindPurpose) }}</span>
        </div>

        <template v-if="bindStep === 1">
          <div class="bind-row">
            <span class="bind-label">关联证书:</span>
            <el-button @click="openAssociateCertDialog">关联证书</el-button>
            <span v-if="selectedAppCert" class="bind-file-name">{{ selectedAppCert.appCertName }}</span>
          </div>
        </template>

        <template v-else>
          <div class="cert-preview-title">证书信息:</div>
          <div class="cert-preview-box">
            <div class="cert-preview-row"><span>主体(CN):</span><span>{{ certPreview.subjectCn }}</span></div>
            <div class="cert-preview-row"><span>颁发者(CN):</span><span>{{ certPreview.issuerCn }}</span></div>
            <div class="cert-preview-row"><span>序列号:</span><span>{{ certPreview.serialNumber }}</span></div>
            <div class="cert-preview-row"><span>有效期:</span><span>{{ certPreview.validFrom }} ~ {{ certPreview.validTo }}</span></div>
            <div class="cert-preview-row"><span>公钥算法:</span><span>{{ certPreview.publicKeyAlgorithm }}</span></div>
            <div class="cert-preview-row"><span>用途:</span><span>{{ certPreview.usages.join('、') }}</span></div>
          </div>
          <div class="validate-line" :class="{ ok: certValidate.algorithmMatch, fail: !certValidate.algorithmMatch }">
            {{ certValidate.algorithmMatch ? '✓' : '✗' }}
            证书公钥与容器密钥算法{{ certValidate.algorithmMatch ? '匹配' : '不匹配' }}
          </div>
          <div class="validate-line" :class="{ ok: certValidate.purposeMatch, fail: !certValidate.purposeMatch }">
            {{ certValidate.purposeMatch ? '✓' : '✗' }}
            证书用途{{ certValidate.purposeMatch ? '匹配' : `不含"${bindPurpose === 'sign' ? '数字签名' : '密钥加密'}"` }}
          </div>
          <el-alert
            v-if="bindErrorMsg"
            :title="bindErrorMsg"
            type="error"
            :closable="false"
            class="bind-error"
          />
        </template>
      </div>
      <template #footer>
        <el-button @click="bindCertDialogVisible = false">取消</el-button>
        <el-button
          v-if="bindStep === 1"
          type="primary"
          :disabled="!selectedAppCert"
          @click="goBindPreview"
        >
          下一步
        </el-button>
        <el-button v-else type="primary" :loading="bindingSubmitting" @click="confirmBindCert">
          确认绑定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="associateDialogVisible"
      title="关联已有应用证书"
      width="1020px"
      :close-on-click-modal="false"
    >
      <el-table
        ref="appCertTableRef"
        :data="applicationCertList"
        border
        stripe
        max-height="360"
        @selection-change="handleAppCertSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="appCertName" label="应用证书名称/ID" min-width="200" show-overflow-tooltip />
        <el-table-column prop="algorithm" label="算法" width="100" />
        <el-table-column prop="issuerCn" label="颁发者" min-width="150" show-overflow-tooltip />
        <el-table-column prop="serialNumber" label="证书序列号" min-width="160" show-overflow-tooltip />
        <el-table-column prop="appliedDate" label="申请日期" width="140" />
        <el-table-column prop="expireDate" label="到期时间" width="140" />
      </el-table>
      <template #footer>
        <el-button @click="associateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAssociateCert">确定</el-button>
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
const bindStep = ref(1)
const bindTargetRow = ref(null)
const bindPurpose = ref('sign')
const selectedAppCert = ref(null)
const bindingSubmitting = ref(false)
const bindErrorMsg = ref('')
const associateDialogVisible = ref(false)
const appCertTableRef = ref(null)
const associateSelectedRows = ref([])

const keyForm = reactive({
  containerName: '',
  algorithmSpec: 'SM2_256',
  usageLabel: '签名验签',
  password: ''
})

const keyRules = {
  containerName: [{ required: true, message: '请输入容器名', trigger: 'blur' }],
  algorithmSpec: [{ required: true, message: '请选择密码算法', trigger: 'change' }],
  usageLabel: [{ required: true, message: '请选择密钥用途', trigger: 'change' }],
  password: [
    { required: true, message: '请输入 PIN', trigger: 'blur' },
    { min: 6, max: 32, message: '长度在 6 到 32 个字符', trigger: 'blur' }
  ]
}

const keyList = ref([
  {
    keyId: 'SVS_userA',
    containerName: 'SVS_userA',
    algorithmSpec: 'SM2_256',
    usageLabel: '签名验签',
    hasSignKeyPair: true,
    hasEncryptKeyPair: false,
    certBindings: {
      sign: {
        subjectCn: 'CN=用户A',
        issuerCn: 'XX CA Center',
        validFrom: '2025-01-01',
        validTo: '2027-01-01',
        serialNumber: '1A2B3C4D5E8899',
        publicKeyAlgorithm: 'SM2 256bit',
        usages: ['数字签名']
      },
      encrypt: null
    },
    publicKeyContent: '-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoEcz1UBgi0DQgAE6f4Mwl7F9qJQxM7kR8I5f2Q1c0hN\np0j4R1sD8n7xS2t9M6kY7h1Qxw3aD2Y9V6t8r1L5j2f9m0v8q3x2Yw==\n-----END PUBLIC KEY-----',
    addedTime: '2026-04-30 10:00:00'
  },
  {
    keyId: 'SVS_userB',
    containerName: 'SVS_userB',
    algorithmSpec: 'SM2_256',
    usageLabel: '签名验签',
    hasSignKeyPair: true,
    hasEncryptKeyPair: true,
    certBindings: {
      sign: null,
      encrypt: null
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

const certPreview = reactive({
  subjectCn: '',
  issuerCn: '',
  serialNumber: '',
  validFrom: '',
  validTo: '',
  publicKeyAlgorithm: '',
  usages: []
})

const certValidate = reactive({
  algorithmMatch: true,
  purposeMatch: true
})

const detailCertRows = computed(() => {
  const row = currentKey.value
  if (!row) return []
  const signCert = row.certBindings?.sign
  const encCert = row.certBindings?.encrypt
  return [
    {
      purpose: 'sign',
      purposeLabel: '签名密钥对证书',
      bound: Boolean(signCert),
      enabled: row.hasSignKeyPair,
      subjectCn: signCert?.subjectCn ?? '（未绑定）',
      issuerCn: signCert?.issuerCn ?? '—',
      validity: signCert ? `${signCert.validFrom} ~ ${signCert.validTo}` : '—'
    },
    {
      purpose: 'encrypt',
      purposeLabel: '加密密钥对证书',
      bound: Boolean(encCert),
      enabled: row.hasEncryptKeyPair,
      subjectCn: encCert?.subjectCn ?? '（未绑定）',
      issuerCn: encCert?.issuerCn ?? '—',
      validity: encCert ? `${encCert.validFrom} ~ ${encCert.validTo}` : '—'
    }
  ]
})

function purposeLabel (purpose) {
  return purpose === 'encrypt' ? '加密密钥对证书' : '签名密钥对证书'
}

function getCertDisplay (row) {
  const signCn = row.certBindings?.sign?.subjectCn
  const encryptCn = row.certBindings?.encrypt?.subjectCn
  return signCn || encryptCn || '未绑定'
}

const handleCreate = () => {
  Object.assign(keyForm, {
    containerName: '',
    algorithmSpec: 'SM2_256',
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

function openBindCertDialog (row, presetPurpose = '') {
  bindTargetRow.value = row
  bindPurpose.value = presetPurpose || (row.hasSignKeyPair ? 'sign' : 'encrypt')
  bindStep.value = 1
  bindErrorMsg.value = ''
  selectedAppCert.value = null
  bindCertDialogVisible.value = true
}

function resetBindDialog () {
  bindTargetRow.value = null
  bindStep.value = 1
  selectedAppCert.value = null
  associateSelectedRows.value = []
  bindingSubmitting.value = false
  bindErrorMsg.value = ''
  Object.assign(certPreview, {
    subjectCn: '',
    issuerCn: '',
    serialNumber: '',
    validFrom: '',
    validTo: '',
    publicKeyAlgorithm: '',
    usages: []
  })
  Object.assign(certValidate, {
    algorithmMatch: true,
    purposeMatch: true
  })
}

function openAssociateCertDialog () {
  associateSelectedRows.value = selectedAppCert.value ? [selectedAppCert.value] : []
  associateDialogVisible.value = true
}

function handleAppCertSelectionChange (rows) {
  const last = rows[rows.length - 1]
  if (!last) {
    associateSelectedRows.value = []
    return
  }
  associateSelectedRows.value = [last]
  const table = appCertTableRef.value
  if (!table) return
  applicationCertList.value.forEach((item) => {
    table.toggleRowSelection(item, item.id === last.id)
  })
}

function confirmAssociateCert () {
  const picked = associateSelectedRows.value[0]
  if (!picked) {
    ElMessage.warning('请选择要关联的应用证书')
    return
  }
  selectedAppCert.value = picked
  associateDialogVisible.value = false
}

async function goBindPreview () {
  if (!bindTargetRow.value || !selectedAppCert.value) return
  try {
    Object.assign(certPreview, {
      subjectCn: selectedAppCert.value.subjectCn,
      issuerCn: selectedAppCert.value.issuerCn,
      serialNumber: selectedAppCert.value.serialNumber,
      validFrom: selectedAppCert.value.validFrom,
      validTo: selectedAppCert.value.validTo,
      publicKeyAlgorithm: selectedAppCert.value.publicKeyAlgorithm,
      usages: [...selectedAppCert.value.usages]
    })
    certValidate.algorithmMatch =
      bindTargetRow.value.algorithmSpec.startsWith('SM2')
        ? certPreview.publicKeyAlgorithm.includes('SM2')
        : certPreview.publicKeyAlgorithm.includes('RSA')
    certValidate.purposeMatch = bindPurpose.value === 'sign'
      ? certPreview.usages.includes('数字签名')
      : certPreview.usages.includes('密钥加密')
    bindErrorMsg.value = ''
    bindStep.value = 2
  } catch (err) {
    bindErrorMsg.value = `证书解析失败：${err?.message || '证书格式不支持'}`
    ElMessage.error('证书解析失败，请确认文件格式是否正确')
  }
}

function confirmBindCert () {
  const row = bindTargetRow.value
  if (!row) return
  bindingSubmitting.value = true
  bindErrorMsg.value = ''
  setTimeout(() => {
    bindingSubmitting.value = false
    if (selectedAppCert.value?.id === 'fail') {
      bindErrorMsg.value = '绑定失败：证书格式不支持或容器不存在，请检查后重试。'
      return
    }
    row.certBindings[bindPurpose.value] = {
      subjectCn: certPreview.subjectCn,
      issuerCn: certPreview.issuerCn,
      serialNumber: certPreview.serialNumber,
      validFrom: certPreview.validFrom,
      validTo: certPreview.validTo,
      publicKeyAlgorithm: certPreview.publicKeyAlgorithm,
      usages: [...certPreview.usages]
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

.detail-p2-value--pre {
  white-space: pre-wrap;
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

.bind-cert-body {
  min-height: 220px;
}

.bind-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.bind-label {
  width: 80px;
  color: $text-secondary;
  flex-shrink: 0;
}

.bind-upload {
  display: inline-flex;
}

.bind-file-name {
  color: $text-secondary;
  font-size: 13px;
}

.cert-preview-title {
  margin: 2px 0 8px;
  color: $text-secondary;
}

.cert-preview-box {
  border: 1px solid $border-color;
  border-radius: 4px;
  padding: 10px 12px;
  margin-bottom: 10px;
}

.cert-preview-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  line-height: 24px;
  font-size: 13px;
}

.validate-line {
  margin-bottom: 6px;
  font-size: 13px;
}

.validate-line.ok {
  color: #52c41a;
}

.validate-line.fail {
  color: #f5222d;
}

.bind-error {
  margin-top: 10px;
}

</style>
