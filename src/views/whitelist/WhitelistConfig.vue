<template>
  <div class="whitelist-config">
    <div class="page-card">

      <div class="card-title">白名单配置</div>

      <el-alert
        title="启用全局白名单后，仅列表中已启用条目允许访问；未启用或空列表时的策略以实际部署为准。"
        type="info"
        :closable="false"
        show-icon
        class="whitelist-alert"
      />

      <div class="quota-line">
        当前已添加 <strong>{{ ipList.length }}</strong> / 最大 <strong>{{ WHITELIST_MAX }}</strong> 条
      </div>

      <div class="toolbar">
        <div class="toolbar__left">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加
          </el-button>
          <!-- <el-button @click="openImportDialog">
            <el-icon><Upload /></el-icon>
            批量导入
          </el-button>
          <el-button @click="exportWhitelist" :disabled="ipList.length === 0">
            <el-icon><Download /></el-icon>
            导出列表
          </el-button> -->
          <el-button
            type="danger"
            plain
            :disabled="!selectedRows.length"
            @click="batchDelete"
          >
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
          <el-button :disabled="!selectedRows.length" @click="batchSetEnabled(true)">
            <el-icon><CircleCheck /></el-icon>
            批量启用
          </el-button>
          <el-button :disabled="!selectedRows.length" @click="batchSetEnabled(false)">
            <el-icon><CircleClose /></el-icon>
            批量禁用
          </el-button>
        </div>
        <div class="toolbar__right">
          <el-switch
            v-model="enableWhitelist"
            active-text="启用白名单"
            inactive-text="禁用白名单"
          />
        </div>
      </div>

      <div class="filter-bar">
        <el-input
          v-model="searchIp"
          clearable
          placeholder="按 IP / 段 搜索"
          class="filter-bar__input"
          @keyup.enter="handleSearch"
        />
        <el-input
          v-model="searchRemark"
          clearable
          placeholder="按备注模糊搜索"
          class="filter-bar__input"
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleResetSearch">重置</el-button>
      </div>

      <el-table
        ref="tableRef"
        :data="paginatedList"
        border
        stripe
        row-key="id"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="48" reserve-selection />
        <el-table-column label="IP地址/段" min-width="200">
          <template #default="{ row }">
            {{ displayIpSegment(row) }}
          </template>
        </el-table-column>
        <el-table-column label="类型" width="88">
          <template #default="{ row }">
            <el-tag size="small">{{ typeLabel(row.entryType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.enabled"
              size="small"
              @change="onRowEnabledChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="添加时间" width="168" />
        <el-table-column prop="lastModifier" label="最后修改人" width="110" />
        <el-table-column prop="updateTime" label="最后修改时间" width="168" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="openView(row)">查看</el-button>
            <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" link @click="confirmDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          background
          layout="total, sizes, prev, pager, next"
          :total="filteredList.length"
          :page-sizes="[10, 20, 50]"
        />
      </div>
    </div>

    <el-dialog v-model="viewVisible" title="查看白名单条目" width="560px">
      <el-descriptions v-if="viewRow" :column="1" border>
        <el-descriptions-item label="IP地址/段">{{ displayIpSegment(viewRow) }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ typeLabel(viewRow.entryType) }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ viewRow.remark || '—' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ viewRow.enabled ? '启用' : '禁用' }}</el-descriptions-item>
        <el-descriptions-item label="添加时间">{{ viewRow.createTime }}</el-descriptions-item>
        <el-descriptions-item label="最后修改时间">{{ viewRow.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="最后修改人">{{ viewRow.lastModifier }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="viewVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="dialogVisible"
      :title="editMode ? '编辑白名单' : '添加白名单'"
      width="560px"
      destroy-on-close
      @closed="onDialogClosed"
    >
      <el-form
        ref="formRef"
        :model="ipForm"
        :rules="formRules"
        label-width="120px"
        @submit.prevent
      >
        <el-form-item label="类型" prop="entryType">
          <el-radio-group v-model="ipForm.entryType" @change="onEntryTypeChange">
            <el-radio label="single">单个 IP</el-radio>
            <el-radio label="cidr">CIDR 网段</el-radio>
            <el-radio label="range">IP 范围</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="ipForm.entryType === 'single'"
          label="IP 地址"
          prop="singleIp"
        >
          <el-input
            v-model="ipForm.singleIp"
            placeholder="例如 192.168.1.100"
            @input="scheduleOverlapCheck"
          />
        </el-form-item>

        <el-form-item
          v-if="ipForm.entryType === 'cidr'"
          label="CIDR"
          prop="cidr"
        >
          <el-input
            v-model="ipForm.cidr"
            placeholder="例如 192.168.1.0/24"
            @input="scheduleOverlapCheck"
          />
        </el-form-item>

        <template v-if="ipForm.entryType === 'range'">
          <el-form-item label="起始 IP" prop="startIp">
            <el-input
              v-model="ipForm.startIp"
              placeholder="起始 IPv4"
              @input="scheduleOverlapCheck"
            />
          </el-form-item>
          <el-form-item label="结束 IP" prop="endIp">
            <el-input
              v-model="ipForm.endIp"
              placeholder="结束 IPv4"
              @input="scheduleOverlapCheck"
            />
          </el-form-item>
        </template>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="ipForm.remark" type="textarea" :rows="2" placeholder="可选" />
        </el-form-item>

        <el-form-item label="是否启用">
          <el-switch v-model="ipForm.enabled" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>

      <el-alert
        v-if="overlapHint"
        :title="overlapHint"
        type="error"
        :closable="false"
        show-icon
        class="overlap-alert"
      />

      <div class="dialog-quota">
        当前已添加 {{ ipList.length }} / 最大 {{ WHITELIST_MAX }} 条
        <span v-if="!editMode && ipList.length >= WHITELIST_MAX" class="dialog-quota__warn">（已达上限，无法继续添加）</span>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!!overlapHint || (!editMode && ipList.length >= WHITELIST_MAX)" @click="handleSave">
          确定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="importVisible" title="批量导入" width="640px" destroy-on-close>
      <p class="import-hint">
        支持 .txt / .csv，每行一个 <strong>IPv4</strong> 或 <strong>CIDR</strong>（如 10.0.0.1 或 10.0.0.0/24）。以 # 开头的行视为注释。
      </p>
      <el-upload
        class="import-upload"
        drag
        :auto-upload="false"
        :show-file-list="true"
        :limit="1"
        accept=".txt,.csv"
        @change="onImportFileChange"
      >
        <el-icon class="import-upload__icon"><Upload /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击选择</em></div>
      </el-upload>
      <el-divider>或粘贴文本</el-divider>
      <el-input
        v-model="importText"
        type="textarea"
        :rows="8"
        placeholder="每行一个 IP 或 CIDR"
      />
      <template #footer>
        <el-button @click="importVisible = false">取消</el-button>
        <el-button type="primary" @click="runImport">导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import {
  Plus, Upload, Download, Delete, CircleCheck, CircleClose
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  isValidIPv4,
  isValidCIDR,
  isValidIpRange,
  draftToRange,
  findOverlappingRow,
  parseImportLine,
  displayIpSegment
} from '@/utils/whitelistIp.js'

const WHITELIST_MAX = 1000
const CURRENT_USER = 'admin'

const enableWhitelist = ref(true)
const dialogVisible = ref(false)
const viewVisible = ref(false)
const importVisible = ref(false)
const viewRow = ref(null)
const editMode = ref(false)
const editingId = ref(null)
const formRef = ref(null)
const tableRef = ref(null)
const selectedRows = ref([])
const searchIp = ref('')
const searchRemark = ref('')
const appliedSearchIp = ref('')
const appliedSearchRemark = ref('')
const page = ref(1)
const pageSize = ref(10)
const importText = ref('')
const importFileContent = ref('')
const overlapHint = ref('')
let overlapTimer = null

function genId () {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function nowStr () {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

const ipList = ref([
  {
    id: '1',
    entryType: 'cidr',
    cidr: '192.168.1.0/24',
    singleIp: '',
    startIp: '',
    endIp: '',
    remark: '业务网段',
    enabled: true,
    createTime: '2024-03-01 10:00:00',
    updateTime: '2024-03-01 10:00:00',
    lastModifier: 'admin'
  },
  {
    id: '2',
    entryType: 'single',
    singleIp: '10.0.0.100',
    cidr: '',
    startIp: '',
    endIp: '',
    remark: '应用服务器 A',
    enabled: true,
    createTime: '2024-03-02 14:30:00',
    updateTime: '2024-03-02 14:30:00',
    lastModifier: 'admin'
  },
  {
    id: '3',
    entryType: 'range',
    singleIp: '',
    cidr: '',
    startIp: '172.16.0.10',
    endIp: '172.16.0.50',
    remark: 'DMZ 连续地址',
    enabled: true,
    createTime: '2024-03-03 09:00:00',
    updateTime: '2024-03-03 09:00:00',
    lastModifier: 'operator1'
  }
])

const ipForm = reactive({
  entryType: 'single',
  singleIp: '',
  cidr: '',
  startIp: '',
  endIp: '',
  remark: '',
  enabled: true
})

function typeLabel (t) {
  if (t === 'single') return '单个'
  if (t === 'cidr') return '段'
  if (t === 'range') return '范围'
  return t
}

const formRules = {
  entryType: [{ required: true }],
  singleIp: [
    {
      validator (_r, v, cb) {
        if (ipForm.entryType !== 'single') return cb()
        if (!v?.trim()) return cb(new Error('请输入 IP 地址'))
        if (!isValidIPv4(v)) return cb(new Error('IPv4 格式不正确'))
        cb()
      },
      trigger: ['blur', 'change']
    }
  ],
  cidr: [
    {
      validator (_r, v, cb) {
        if (ipForm.entryType !== 'cidr') return cb()
        if (!v?.trim()) return cb(new Error('请输入 CIDR'))
        if (!isValidCIDR(v)) return cb(new Error('CIDR 不合法（示例：192.168.0.0/24）'))
        cb()
      },
      trigger: ['blur', 'change']
    }
  ],
  startIp: [
    {
      validator (_r, v, cb) {
        if (ipForm.entryType !== 'range') return cb()
        if (!v?.trim()) return cb(new Error('请输入起始 IP'))
        if (!isValidIPv4(v)) return cb(new Error('起始 IP 格式不正确'))
        cb()
      },
      trigger: ['blur', 'change']
    }
  ],
  endIp: [
    {
      validator (_r, v, cb) {
        if (ipForm.entryType !== 'range') return cb()
        if (!v?.trim()) return cb(new Error('请输入结束 IP'))
        if (!isValidIPv4(v)) return cb(new Error('结束 IP 格式不正确'))
        if (isValidIPv4(ipForm.startIp) && isValidIPv4(v) && !isValidIpRange(ipForm.startIp, v)) {
          return cb(new Error('结束 IP 不能小于起始 IP'))
        }
        cb()
      },
      trigger: ['blur', 'change']
    }
  ]
}

const filteredList = computed(() => {
  const qIp = appliedSearchIp.value.trim().toLowerCase()
  const qRm = appliedSearchRemark.value.trim().toLowerCase()
  return ipList.value.filter((row) => {
    const seg = displayIpSegment(row).toLowerCase()
    const okIp = !qIp || seg.includes(qIp)
    const okRm = !qRm || (row.remark || '').toLowerCase().includes(qRm)
    return okIp && okRm
  })
})

const paginatedList = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

watch([appliedSearchIp, appliedSearchRemark], () => {
  page.value = 1
})

watch(pageSize, () => {
  page.value = 1
})

function handleSearch () {
  appliedSearchIp.value = searchIp.value
  appliedSearchRemark.value = searchRemark.value
  page.value = 1
}

function handleResetSearch () {
  searchIp.value = ''
  searchRemark.value = ''
  appliedSearchIp.value = ''
  appliedSearchRemark.value = ''
  page.value = 1
}

function scheduleOverlapCheck () {
  overlapHint.value = ''
  if (overlapTimer) clearTimeout(overlapTimer)
  overlapTimer = setTimeout(() => {
    overlapTimer = null
    runOverlapCheck()
  }, 200)
}

function runOverlapCheck () {
  const range = draftToRange(ipForm)
  if (!range) {
    overlapHint.value = ''
    return
  }
  const hit = findOverlappingRow(range, ipList.value, editingId.value)
  if (hit) {
    overlapHint.value = `与已有条目重叠：${displayIpSegment(hit)}（${typeLabel(hit.entryType)}）`
  } else {
    overlapHint.value = ''
  }
}

watch(
  () => [
    ipForm.entryType,
    ipForm.singleIp,
    ipForm.cidr,
    ipForm.startIp,
    ipForm.endIp
  ],
  () => scheduleOverlapCheck()
)

function promptApplyConfirm () {
  ElMessageBox.confirm(
    '白名单已更新。是否需要立即生效？\n\n' +
    '建议：若设备支持策略热加载，通常无需重启服务即可生效；若当前环境未启用热加载，可能需要重启签名验签相关服务后生效。请以实际部署文档为准。',
    '立即生效',
    {
      confirmButtonText: '需要立即生效',
      cancelButtonText: '仅保存配置',
      type: 'info',
      distinguishCancelAndClose: true
    }
  )
    .then(() => {
      ElMessage.success('已按「立即生效」记录，系统将尝试应用（支持热加载时无需重启）')
    })
    .catch((action) => {
      if (action === 'cancel') {
        ElMessage.info('已保存配置，将在下次策略下发或重启服务后生效（视环境而定）')
      }
    })
}

function resetForm () {
  Object.assign(ipForm, {
    entryType: 'single',
    singleIp: '',
    cidr: '',
    startIp: '',
    endIp: '',
    remark: '',
    enabled: true
  })
  editingId.value = null
  overlapHint.value = ''
}

function onDialogClosed () {
  resetForm()
  editMode.value = false
}

function onEntryTypeChange () {
  nextTick(() => {
    formRef.value?.clearValidate?.()
    scheduleOverlapCheck()
  })
}

const openView = (row) => {
  viewRow.value = { ...row }
  viewVisible.value = true
}

const handleAdd = () => {
  if (ipList.value.length >= WHITELIST_MAX) {
    ElMessage.warning(`白名单最多 ${WHITELIST_MAX} 条，请先删除或导出后再添加`)
    return
  }
  editMode.value = false
  editingId.value = null
  resetForm()
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate?.())
}

const handleEdit = (row) => {
  editMode.value = true
  editingId.value = row.id
  Object.assign(ipForm, {
    entryType: row.entryType,
    singleIp: row.singleIp || '',
    cidr: row.cidr || '',
    startIp: row.startIp || '',
    endIp: row.endIp || '',
    remark: row.remark || '',
    enabled: row.enabled
  })
  dialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate?.()
    scheduleOverlapCheck()
  })
}

function buildRowFromForm (id, createTime) {
  const base = {
    id,
    entryType: ipForm.entryType,
    singleIp: ipForm.entryType === 'single' ? ipForm.singleIp.trim() : '',
    cidr: ipForm.entryType === 'cidr' ? ipForm.cidr.trim() : '',
    startIp: ipForm.entryType === 'range' ? ipForm.startIp.trim() : '',
    endIp: ipForm.entryType === 'range' ? ipForm.endIp.trim() : '',
    remark: ipForm.remark.trim(),
    enabled: ipForm.enabled,
    lastModifier: CURRENT_USER,
    updateTime: nowStr()
  }
  if (createTime) base.createTime = createTime
  else base.createTime = nowStr()
  return base
}

const handleSave = async () => {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  runOverlapCheck()
  if (overlapHint.value) {
    ElMessage.error('请解决与已有条目的重叠后再保存')
    return
  }
  if (!editMode.value && ipList.value.length >= WHITELIST_MAX) {
    ElMessage.warning(`已达到最大条数 ${WHITELIST_MAX}`)
    return
  }

  if (editMode.value && editingId.value) {
    const i = ipList.value.findIndex((r) => r.id === editingId.value)
    if (i > -1) {
      const prev = ipList.value[i]
      ipList.value[i] = buildRowFromForm(prev.id, prev.createTime)
    }
    ElMessage.success('修改成功')
  } else {
    ipList.value.push(buildRowFromForm(genId()))
    ElMessage.success('添加成功')
  }
  dialogVisible.value = false
  promptApplyConfirm()
}

function confirmDelete (row) {
  const seg = displayIpSegment(row)
  ElMessageBox.confirm(
    `删除后该 IP/网段将无法访问签名验签服务器：${seg}。是否继续？`,
    '删除确认',
    { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
  )
    .then(() => {
      const i = ipList.value.findIndex((r) => r.id === row.id)
      if (i > -1) ipList.value.splice(i, 1)
      tableRef.value?.clearSelection?.()
      ElMessage.success('已删除')
      promptApplyConfirm()
    })
    .catch(() => {})
}

function onSelectionChange (rows) {
  selectedRows.value = rows
}

function batchDelete () {
  const n = selectedRows.value.length
  if (!n) return
  ElMessageBox.confirm(
    `确定删除选中的 ${n} 条白名单吗？删除后对应 IP/网段将无法访问。`,
    '批量删除',
    { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
  )
    .then(() => {
      const ids = new Set(selectedRows.value.map((r) => r.id))
      ipList.value = ipList.value.filter((r) => !ids.has(r.id))
      tableRef.value?.clearSelection?.()
      ElMessage.success(`已删除 ${n} 条`)
      promptApplyConfirm()
    })
    .catch(() => {})
}

function batchSetEnabled (enabled) {
  const n = selectedRows.value.length
  if (!n) return
  selectedRows.value.forEach((row) => {
    const target = ipList.value.find((r) => r.id === row.id)
    if (target) {
      target.enabled = enabled
      target.lastModifier = CURRENT_USER
      target.updateTime = nowStr()
    }
  })
  ElMessage.success(enabled ? `已批量启用 ${n} 条` : `已批量禁用 ${n} 条`)
  promptApplyConfirm()
}

function onRowEnabledChange (row) {
  row.lastModifier = CURRENT_USER
  row.updateTime = nowStr()
  promptApplyConfirm()
}

function openImportDialog () {
  importText.value = ''
  importFileContent.value = ''
  importVisible.value = true
}

function onImportFileChange (uploadFile) {
  const raw = uploadFile?.raw
  if (!raw) return
  const reader = new FileReader()
  reader.onload = () => {
    importFileContent.value = typeof reader.result === 'string' ? reader.result : ''
  }
  reader.readAsText(raw, 'UTF-8')
}

function runImport () {
  const text = [importFileContent.value, importText.value].filter(Boolean).join('\n').trim()
  if (!text) {
    ElMessage.warning('请选择文件或粘贴要导入的文本')
    return
  }
  const lines = text.split(/\r?\n/)
  const toAdd = []
  const errors = []
  for (const line of lines) {
    const parsed = parseImportLine(line)
    if (!parsed) continue
    if (parsed.error) {
      errors.push(parsed.error)
      continue
    }
    const draft = {
      entryType: parsed.entryType,
      singleIp: parsed.singleIp,
      cidr: parsed.cidr,
      startIp: parsed.startIp,
      endIp: parsed.endIp
    }
    const range = draftToRange(draft)
    if (!range) {
      errors.push(`无效行：${line.trim()}`)
      continue
    }
    const hit = findOverlappingRow(range, [...ipList.value, ...toAdd], null)
    if (hit) {
      errors.push(`与已有或本次导入内重叠，已跳过：${line.trim()}`)
      continue
    }
    toAdd.push({
      id: genId(),
      entryType: parsed.entryType,
      singleIp: parsed.singleIp,
      cidr: parsed.cidr,
      startIp: parsed.startIp,
      endIp: parsed.endIp,
      remark: '',
      enabled: true,
      createTime: nowStr(),
      updateTime: nowStr(),
      lastModifier: CURRENT_USER
    })
  }

  const room = WHITELIST_MAX - ipList.value.length
  if (toAdd.length > room) {
    ElMessage.warning(`最多还可添加 ${room} 条，将只导入前 ${room} 条有效数据`)
    toAdd.splice(room)
  }

  if (toAdd.length) {
    ipList.value.push(...toAdd)
    ElMessage.success(`成功导入 ${toAdd.length} 条`)
  }
  if (errors.length) {
    ElMessage.warning(errors.slice(0, 5).join('；') + (errors.length > 5 ? `…等共 ${errors.length} 条提示` : ''))
  }
  if (!toAdd.length && !errors.length) {
    ElMessage.info('没有可导入的内容')
  } else if (toAdd.length) {
    importVisible.value = false
    promptApplyConfirm()
  }
}

function exportWhitelist () {
  const header = ['类型', 'IP地址/段', '备注', '状态', '添加时间', '最后修改时间', '最后修改人']
  const rows = ipList.value.map((r) => [
    typeLabel(r.entryType),
    displayIpSegment(r),
    r.remark || '',
    r.enabled ? '启用' : '禁用',
    r.createTime,
    r.updateTime,
    r.lastModifier
  ])
  const csv = [header, ...rows]
    .map((line) =>
      line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
    .join('\r\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `whitelist_${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
  ElMessage.success('已导出当前列表')
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.whitelist-intro {
  margin-bottom: 16px;
  padding: 14px 16px;
  background: #fafafa;
  border: 1px solid $border-light;
  border-radius: $border-radius;
  font-size: 13px;
  color: $text-secondary;
  line-height: 1.75;

  &__title {
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 8px;
    font-size: 14px;
  }

  ul {
    margin: 0;
    padding-left: 20px;
  }

  li + li {
    margin-top: 6px;
  }
}

.whitelist-alert {
  margin-bottom: 12px;
}

.quota-line {
  font-size: 13px;
  color: $text-secondary;
  margin-bottom: 12px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;

  &__left {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  &__right {
    flex-shrink: 0;
  }
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;

  &__input {
    width: 220px;
    max-width: 100%;
  }
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.overlap-alert {
  margin-top: 8px;
}

.dialog-quota {
  margin-top: 12px;
  font-size: 12px;
  color: $text-muted;

  &__warn {
    color: $warning-color;
    margin-left: 4px;
  }
}

.import-hint {
  font-size: 13px;
  color: $text-secondary;
  line-height: 1.6;
  margin: 0 0 12px;
}

.import-upload {
  width: 100%;

  &__icon {
    font-size: 48px;
    color: $text-muted;
  }
}
</style>
