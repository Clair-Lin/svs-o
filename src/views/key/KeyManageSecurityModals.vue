<template>
  <div class="key-manage-security-modals">
    <el-dialog
      v-model="ukeyDialogVisible"
      title="请选择UKEY"
      width="480px"
      align-center
      :close-on-click-modal="false"
      @closed="onUkeyDialogClosed"
    >
      <div class="ukey-body">
        <div v-if="ukeyPhase === 'detecting'" class="ukey-loading">
          <el-icon class="ukey-loading-icon is-loading" :size="40">
            <Loading />
          </el-icon>
          <p class="ukey-loading-text">控件检测中...</p>
        </div>
        <div v-else class="ukey-ready">
          <p class="ukey-hint">请选择用于备份的 UKEY：</p>
          <el-radio-group v-model="selectedUkeyId" class="ukey-radio-group">
            <el-radio v-for="u in ukeyOptions" :key="u.id" :label="u.id" class="ukey-radio">
              {{ u.label }}
            </el-radio>
          </el-radio-group>
        </div>
      </div>
      <template #footer>
        <el-button @click="ukeyDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="ukeyConfirmDisabled"
          :loading="ukeySubmitting"
          @click="confirmUkeyBackup"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="authDialogVisible"
      title="二次认证"
      width="480px"
      align-center
      :close-on-click-modal="false"
      @closed="onAuthDialogClosed"
    >
      <div class="auth-body">
        <div class="auth-row">
          <span class="auth-label">管理密码：</span>
          <el-input
            v-model="adminPassword"
            type="password"
            show-password
            clearable
            placeholder="输入管理员密码进行认证"
            class="auth-input"
            autocomplete="off"
            @keyup.enter="confirmAuth"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="authDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="authSubmitting" @click="confirmAuth">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

const ukeyDialogVisible = ref(false)
const ukeyPhase = ref('detecting')
const ukeySubmitting = ref(false)
const selectedUkeyId = ref('')
const pendingBackupRow = ref(null)
let ukeyDetectTimer = null

const ukeyOptions = ref([
  { id: 'ukey-1', label: 'UKEY-01（SN: 8A2F-9012-3B4C）' },
  { id: 'ukey-2', label: 'UKEY-02（SN: 7C1E-4455-66DD）' }
])

const ukeyConfirmDisabled = computed(() => {
  if (ukeyPhase.value === 'detecting') return true
  return !selectedUkeyId.value
})

function clearUkeyTimer () {
  if (ukeyDetectTimer) {
    clearTimeout(ukeyDetectTimer)
    ukeyDetectTimer = null
  }
}

function onUkeyDialogClosed () {
  clearUkeyTimer()
  ukeyPhase.value = 'detecting'
  selectedUkeyId.value = ''
  pendingBackupRow.value = null
  ukeySubmitting.value = false
}

function openUkeyBackup (row) {
  pendingBackupRow.value = row
  ukeyPhase.value = 'detecting'
  selectedUkeyId.value = ''
  ukeyDialogVisible.value = true
  clearUkeyTimer()
  ukeyDetectTimer = setTimeout(() => {
    ukeyPhase.value = 'ready'
    selectedUkeyId.value = ukeyOptions.value[0]?.id ?? ''
    ukeyDetectTimer = null
  }, 1200)
}

function confirmUkeyBackup () {
  const row = pendingBackupRow.value
  if (!row || ukeyConfirmDisabled.value) return
  ukeySubmitting.value = true
  setTimeout(() => {
    ukeySubmitting.value = false
    ukeyDialogVisible.value = false
    const kid = row.keyId ?? ''
    ElMessage.success(`密钥 ${kid} 已通过 UKEY 认证完成备份（原型演示）`)
  }, 600)
}

const authDialogVisible = ref(false)
const authSubmitting = ref(false)
const adminPassword = ref('')
/** @type {import('vue').Ref<'destroy' | 'viewPassword' | null>} */
const authMode = ref(null)
const pendingAuthRow = ref(null)

function onAuthDialogClosed () {
  adminPassword.value = ''
  authMode.value = null
  pendingAuthRow.value = null
  authSubmitting.value = false
}

function openSecondaryAuth (mode, row) {
  authMode.value = mode
  pendingAuthRow.value = row
  adminPassword.value = ''
  authDialogVisible.value = true
}

function openDestroyFlow (row) {
  ElMessageBox.confirm('确定要销毁此密钥吗？', '温馨提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    closeOnClickModal: false
  })
    .then(() => {
      openSecondaryAuth('destroy', row)
    })
    .catch(() => {})
}

function openViewPasswordFlow (row) {
  openSecondaryAuth('viewPassword', row)
}

function confirmAuth () {
  if (!adminPassword.value.trim()) {
    ElMessage.warning('请输入管理密码')
    return
  }
  const row = pendingAuthRow.value
  const mode = authMode.value
  if (!row || !mode) return

  authSubmitting.value = true
  setTimeout(() => {
    authSubmitting.value = false
    authDialogVisible.value = false
    const kid = row.keyId ?? ''
    if (mode === 'destroy') {
      ElMessage.success(`密钥 ${kid} 已通过二次认证并销毁（原型演示）`)
    } else {
      ElMessageBox.alert(
        `密钥 ${kid} 的访问口令（原型演示）：Kp9#xQ2@mL7`,
        '密钥访问口令',
        { confirmButtonText: '知道了' }
      )
    }
  }, 500)
}

onBeforeUnmount(() => {
  clearUkeyTimer()
})

defineExpose({
  openUkeyBackup,
  openDestroyFlow,
  openViewPasswordFlow
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.ukey-body {
  min-height: 160px;
}

.ukey-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px 24px;
  color: $primary-color;
}

.ukey-loading-icon {
  margin-bottom: 16px;
}

.ukey-loading-text {
  margin: 0;
  font-size: 14px;
  color: $text-secondary;
}

.ukey-ready {
  padding: 8px 0 4px;
}

.ukey-hint {
  margin: 0 0 12px;
  font-size: 14px;
  color: $text-secondary;
}

.ukey-radio-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.ukey-radio {
  margin-right: 0;
  height: auto;
  white-space: normal;
  line-height: 22px;
}

.auth-body {
  padding: 8px 0 4px;
}

.auth-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.auth-label {
  flex-shrink: 0;
  font-size: 14px;
  color: $text-primary;
}

.auth-input {
  flex: 1;
  min-width: 0;
}
</style>
