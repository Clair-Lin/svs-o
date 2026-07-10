<template>
  <div class="ca-cert">
    <div class="page-card ca-cert-card">
      <div class="ca-toolbar">
        <div class="search-row">
          <label class="search-label">CA名称</label>
          <el-input
            v-model="filterCaName"
            placeholder="请输入CA名称"
            clearable
            class="search-input"
          />
          <el-button type="primary" class="query-button" @click="handleSearch">查询</el-button>
          <el-button class="reset-button" @click="handleReset">重置</el-button>
        </div>

        <el-button type="primary" class="add-button" @click="openAdd">添加</el-button>
      </div>

      <el-table :data="pagedList" class="ca-cert-table">
        <el-table-column prop="caName" label="CA名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="description" label="CA描述" min-width="260" show-overflow-tooltip />
        <el-table-column label="CA证书" min-width="420" show-overflow-tooltip>
          <template #default="{ row }">
            <el-button type="primary" link class="dn-link" @click="openDetail(row)">
              {{ row.certLabel }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="left">
          <template #default="{ row }">
            <div class="operation-links">
              <el-button type="primary" link @click="stubAction(row, '上传下级证书')">上传下级证书</el-button>
              <el-button type="primary" link @click="openCrl(row)">配置CRL</el-button>
              <el-button type="primary" link @click="openOcsp(row)">配置OCSP</el-button>
              <el-button type="primary" link @click="handleDelete(row)">删除</el-button>
            </div>
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

    <el-dialog
      v-model="addVisible"
      title="添加CA信息"
      width="640px"
      destroy-on-close
      class="ca-form-dialog ca-add-dialog"
      @closed="resetAddForm"
    >
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="106px" class="ca-dialog-form">
        <el-form-item label="CA名称" prop="caName">
          <el-input v-model="addForm.caName" placeholder="请输入CA名称" clearable />
          <div class="field-tip">支持中文、英文、特殊字符，长度2-20字符</div>
        </el-form-item>
        <el-form-item label="CA描述" prop="description">
          <el-input
            v-model="addForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入CA描述"
            maxlength="500"
          />
        </el-form-item>
        <el-form-item label="证书类型" prop="certType">
          <el-select v-model="addForm.certType" placeholder="请选择证书类型">
            <el-option label="SM2证书" value="SM2证书" />
            <el-option label="ML-DSA证书" value="ML-DSA证书" />
          </el-select>
        </el-form-item>
        <el-form-item label="根证书导入方式" prop="importWay">
          <el-select v-model="addForm.importWay" placeholder="请选择导入方式">
            <el-option label="上传证书文件" value="上传证书文件" />
          </el-select>
        </el-form-item>
        <el-form-item label="证书文件" prop="certFileName">
          <el-upload
            action="#"
            :auto-upload="false"
            :limit="1"
            accept=".cer,.crt,.pem,.p7b"
            :on-change="onAddCertChange"
            :on-remove="onAddCertRemove"
          >
            <el-button type="primary" class="upload-button">点击上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button class="dialog-cancel" @click="addVisible = false">取消</el-button>
        <el-button type="primary" class="dialog-confirm" @click="confirmAdd">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="crlVisible"
      title="配置CRL"
      width="680px"
      destroy-on-close
      class="ca-form-dialog crl-dialog"
      @closed="resetCrlForm"
    >
      <el-form ref="crlFormRef" :model="crlForm" :rules="crlRules" label-width="150px" class="ca-dialog-form crl-form">
        <el-form-item label="CRL下载方式" prop="downloadMode">
          <el-radio-group v-model="crlForm.downloadMode">
            <el-radio value="HTTP配置">HTTP配置</el-radio>
            <el-radio value="LDAP配置">LDAP配置</el-radio>
            <el-radio value="上传CRL文件">上传CRL文件</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="HTTP服务器地址" prop="httpServer">
          <el-input v-model="crlForm.httpServer" placeholder="请输入HTTP服务器地址" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button class="dialog-cancel" @click="crlVisible = false">取消</el-button>
        <el-button type="primary" class="dialog-confirm" @click="confirmCrl">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="ocspVisible"
      title="配置OCSP"
      width="640px"
      destroy-on-close
      class="ca-form-dialog ocsp-dialog"
      @closed="resetOcspForm"
    >
      <el-form ref="ocspFormRef" :model="ocspForm" :rules="ocspRules" label-width="150px" class="ca-dialog-form ocsp-form">
        <el-form-item label="OCSP服务器地址" prop="server">
          <el-input v-model="ocspForm.server" placeholder="请输入OCSP服务器地址" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button class="dialog-cancel" @click="ocspVisible = false">取消</el-button>
        <el-button type="primary" class="dialog-confirm" @click="confirmOcsp">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

let idSeq = 6

const filterCaName = ref('')
const queryCaName = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const list = ref([
  {
    id: '1',
    caName: 'CA_TEST',
    description: 'CA_TEST',
    certLabel: 'C=CN,ST=GuangDong,O=Olym Tech Ltd,CN=Root CA',
    certType: 'SM2证书'
  },
  {
    id: '2',
    caName: 'SM2-CA',
    description: 'SM2',
    certLabel: 'C=CN,O=GMSSL,OU=PKI/SM2,CN=RootCA for Test',
    certType: 'SM2证书'
  },
  {
    id: '3',
    caName: 'RSA-CA',
    description: 'RSA',
    certLabel: 'C=CN,O=GMSSL,OU=PKI/RSA,CN=RootCA for Test',
    certType: 'SM2证书'
  },
  {
    id: '4',
    caName: 'ML-DSA_CA',
    description: '抗量子密码算法签发的CA根证',
    certLabel: 'C=CN,CN=root_ca_20260205165008',
    certType: 'ML-DSA证书'
  },
  {
    id: '5',
    caName: 'test',
    description: 'ML-DSA根证书',
    certLabel: 'C=CN,O=GMSSL,CN=test ML-DSA Root CA',
    certType: 'ML-DSA证书'
  }
])

const filteredList = computed(() => {
  const q = queryCaName.value.trim().toLowerCase()
  if (!q) return list.value
  return list.value.filter((row) => row.caName.toLowerCase().includes(q))
})

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

watch([filteredList, pageSize], () => {
  const maxPage = Math.max(1, Math.ceil(filteredList.value.length / pageSize.value) || 1)
  if (currentPage.value > maxPage) currentPage.value = maxPage
})

const addVisible = ref(false)
const addFormRef = ref(null)
const addForm = reactive({
  caName: '',
  description: '',
  certType: '',
  importWay: '上传证书文件',
  certFileName: ''
})

const addRules = {
  caName: [
    { required: true, message: '请输入CA名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度2-20字符', trigger: 'blur' }
  ],
  description: [{ required: true, message: '请输入CA描述', trigger: 'blur' }],
  certType: [{ required: true, message: '请选择证书类型', trigger: 'change' }],
  importWay: [{ required: true, message: '请选择根证书导入方式', trigger: 'change' }],
  certFileName: [{ required: true, message: '请上传证书文件', trigger: 'change' }]
}

const crlVisible = ref(false)
const crlFormRef = ref(null)
const currentCrlRow = ref(null)
const crlForm = reactive({
  downloadMode: 'HTTP配置',
  httpServer: ''
})

const crlRules = {
  downloadMode: [{ required: true, message: '请选择CRL下载方式', trigger: 'change' }],
  httpServer: [{ required: true, message: '请输入HTTP服务器地址', trigger: 'blur' }]
}

const ocspVisible = ref(false)
const ocspFormRef = ref(null)
const currentOcspRow = ref(null)
const ocspForm = reactive({
  server: ''
})

const ocspRules = {
  server: [{ required: true, message: '请输入OCSP服务器地址', trigger: 'blur' }]
}

function showSuccess () {
  ElMessage({
    message: '操作成功',
    type: 'success',
    customClass: 'ca-success-message',
    offset: 20,
    duration: 2200
  })
}

function certLabelByType (certType, caName) {
  if (certType === 'ML-DSA证书') return `C=CN,O=GMSSL,CN=${caName || 'RootCA for Test'} ML-DSA Root CA`
  return `C=CN,O=GMSSL,OU=PKI/SM2,CN=${caName || 'RootCA for Test'}`
}

function resetAddForm () {
  addForm.caName = ''
  addForm.description = ''
  addForm.certType = ''
  addForm.importWay = '上传证书文件'
  addForm.certFileName = ''
  addFormRef.value?.resetFields()
}

function handleSearch () {
  queryCaName.value = filterCaName.value
  currentPage.value = 1
}

function handleReset () {
  filterCaName.value = ''
  queryCaName.value = ''
  currentPage.value = 1
}

function openAdd () {
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
    certLabel: certLabelByType(addForm.certType, addForm.caName.trim()),
    certType: addForm.certType
  })
  addVisible.value = false
  currentPage.value = Math.max(1, Math.ceil(filteredList.value.length / pageSize.value) || 1)
  showSuccess()
}

function openCrl (row) {
  currentCrlRow.value = row
  crlForm.downloadMode = 'HTTP配置'
  crlForm.httpServer = ''
  crlVisible.value = true
}

function resetCrlForm () {
  currentCrlRow.value = null
  crlForm.downloadMode = 'HTTP配置'
  crlForm.httpServer = ''
  crlFormRef.value?.resetFields()
}

async function confirmCrl () {
  try {
    await crlFormRef.value?.validate()
  } catch {
    return
  }
  crlVisible.value = false
  showSuccess()
}

function openOcsp (row) {
  currentOcspRow.value = row
  ocspForm.server = ''
  ocspVisible.value = true
}

function resetOcspForm () {
  currentOcspRow.value = null
  ocspForm.server = ''
  ocspFormRef.value?.resetFields()
}

async function confirmOcsp () {
  try {
    await ocspFormRef.value?.validate()
  } catch {
    return
  }
  ocspVisible.value = false
  showSuccess()
}

function openDetail (row) {
  router.push({
    name: 'CACertChain',
    params: { id: row.id },
    state: { caCertRow: { ...row } }
  })
}

function stubAction (row, title) {
  ElMessage.info(`${title}（原型演示）：${row.caName}`)
}

function handleDelete (row) {
  ElMessageBox.confirm(`确定删除“${row.caName}”？`, '提示', { type: 'warning' })
    .then(() => {
      list.value = list.value.filter((item) => item.id !== row.id)
      showSuccess()
    })
    .catch(() => {})
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.ca-cert {
  min-height: 100%;
}

.ca-cert-card {
  min-height: calc(100vh - #{$header-height} - 20px);
  padding: 0;
  border-radius: 0;
  box-shadow: 0 1px 5px rgba(24, 47, 77, 0.12);
}

.ca-toolbar {
  padding: 16px 16px 14px;
  background: #fff;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-label {
  color: #1f2d3d;
  font-size: 12px;
  line-height: 30px;
  white-space: nowrap;
}

.search-input {
  width: 180px;

  :deep(.el-input__wrapper) {
    border-radius: 0;
    box-shadow: 0 0 0 1px #d8dee8 inset;
  }

  :deep(.el-input__inner) {
    height: 30px;
    font-size: 12px;
  }
}

.query-button,
.reset-button,
.add-button {
  min-width: 70px;
  height: 30px;
  border-radius: 0;
  font-size: 12px;
}

.query-button,
.add-button {
  background: #387ee8;
  border-color: #387ee8;
}

.reset-button {
  margin-left: 0;
  color: #3b4b5f;
  border-color: #d8dee8;
}

.add-button {
  display: block;
  margin-top: 15px;
}

.ca-cert-table {
  width: 100%;

  :deep(.el-table__cell) {
    padding: 0;
    border-bottom-color: #e8edf4;
  }

  :deep(.el-table__header th) {
    height: 40px;
    background-color: #f2f2f2 !important;
    color: #333;
    font-weight: 400;
  }

  :deep(.el-table__header .cell),
  :deep(.el-table__body .cell) {
    padding: 0 12px;
    font-size: 12px;
    line-height: 40px;
  }

  :deep(.el-table__row) {
    height: 41px;
  }

  :deep(.el-table__body tr:hover > td) {
    background-color: #fff !important;
  }

  :deep(.el-table__inner-wrapper::before) {
    background-color: #e8edf4;
  }
}

.dn-link {
  height: auto;
  padding: 0;
  color: #387ee8;
  font-size: 12px;
  font-weight: 400;
  line-height: 40px;
  text-align: left;
}

.operation-links {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 14px;
  white-space: nowrap;

  :deep(.el-button) {
    height: auto;
    margin-left: 0;
    padding: 0;
    color: #387ee8;
    font-size: 12px;
    font-weight: 400;
  }

  :deep(.el-button:focus),
  :deep(.el-button:focus-visible) {
    outline: none;
    box-shadow: none;
  }
}

.table-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 14px 18px 0;
}

.ca-dialog-form {
  padding: 16px 0 10px 62px;

  :deep(.el-form-item) {
    margin-bottom: 15px;
  }

  :deep(.el-form-item__label) {
    color: #1f2d3d;
    font-size: 12px;
    line-height: 30px;
    padding-right: 10px;
  }

  :deep(.el-form-item__content) {
    line-height: 30px;
  }

  :deep(.el-input),
  :deep(.el-select) {
    width: 290px;
  }

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    min-height: 30px;
    height: 30px;
    border-radius: 0;
    box-shadow: 0 0 0 1px #d8dee8 inset;
  }

  :deep(.el-input__inner),
  :deep(.el-select__placeholder),
  :deep(.el-select__selected-item) {
    font-size: 12px;
  }

  :deep(.el-textarea__inner) {
    width: 290px;
    min-height: 84px !important;
    border-radius: 0;
    font-size: 12px;
    line-height: 20px;
    padding: 7px 11px;
    box-shadow: 0 0 0 1px #d8dee8 inset;
  }

  :deep(.el-form-item.is-required:not(.is-no-asterisk).asterisk-left > .el-form-item__label::before) {
    color: #d40000;
    margin-right: 3px;
  }

  :deep(.el-upload-list) {
    margin: 0;
  }
}

.field-tip {
  width: 290px;
  margin-top: 2px;
  color: #7a8494;
  font-size: 12px;
  line-height: 16px;
}

.upload-button {
  min-width: 94px;
  height: 30px;
  padding: 0 20px;
  border-radius: 0;
  background: #387ee8;
  border-color: #387ee8;
  font-size: 12px;
}

.crl-form {
  padding: 21px 0 0 20px;

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-radio-group) {
    height: 30px;
    align-items: center;
    gap: 34px;
  }

  :deep(.el-radio) {
    height: 30px;
    margin-right: 0;
    color: #1f2d3d;
    font-size: 12px;
  }

  :deep(.el-radio__label) {
    padding-left: 10px;
    font-size: 12px;
  }

  :deep(.el-input) {
    width: 330px;
  }
}

.ocsp-form {
  padding: 18px 0 0 20px;

  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  :deep(.el-input) {
    width: 290px;
  }
}

:global(.ca-form-dialog.el-dialog) {
  padding: 0;
  border-radius: 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
}

:global(.ca-add-dialog.el-dialog) {
  margin-top: 10vh !important;
  height: 433px;
}

:global(.crl-dialog.el-dialog) {
  margin-top: 14vh !important;
  height: 226px;
}

:global(.ocsp-dialog.el-dialog) {
  margin-top: 14vh !important;
  height: 181px;
}

:global(.ca-form-dialog .el-dialog__header) {
  height: 39px;
  display: flex;
  align-items: center;
  padding: 0 18px;
  margin-right: 0;
  background: #dce1e7;
}

:global(.ca-form-dialog .el-dialog__title) {
  color: #111;
  font-size: 16px;
  font-weight: 400;
  line-height: 39px;
}

:global(.ca-form-dialog .el-dialog__headerbtn) {
  top: 0;
  right: 6px;
  width: 39px;
  height: 39px;
}

:global(.ca-form-dialog .el-dialog__headerbtn .el-dialog__close) {
  color: #1f2d3d;
  font-size: 18px;
}

:global(.ca-form-dialog .el-dialog__body) {
  padding: 0;
}

:global(.ca-add-dialog .el-dialog__body) {
  height: 337px;
}

:global(.crl-dialog .el-dialog__body) {
  height: 129px;
}

:global(.ocsp-dialog .el-dialog__body) {
  height: 84px;
}

:global(.ca-form-dialog .el-dialog__footer) {
  height: 57px;
  padding: 14px 25px 0;
  border-top: 1px solid #e7ebf1;
}

.dialog-cancel,
.dialog-confirm {
  width: 70px;
  height: 28px;
  min-width: 70px;
  padding: 0;
  border-radius: 0;
  font-size: 12px;
}

.dialog-cancel {
  margin-right: 10px;
  color: #1f2d3d;
  border-color: #d8dee8;
}

.dialog-confirm {
  background: #387ee8;
  border-color: #387ee8;
}

:global(.ca-success-message) {
  top: 20px !important;
  left: 50% !important;
  min-width: 380px;
  height: 48px;
  justify-content: flex-start;
  padding: 0 20px;
  border-color: #d8efcf;
  border-radius: 3px;
  background: #f0faeb;
  color: #67c23a;
  font-size: 14px;
  transform: translateX(-50%);
}
</style>
