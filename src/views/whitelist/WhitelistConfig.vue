<template>
  <div class="whitelist-page">
    <h1 class="page-title">白名单配置</h1>

    <section class="whitelist-panel">
      <div class="toolbar">
        <el-button type="primary" class="primary-button" @click="openAdd">新增</el-button>
        <el-button class="batch-button" @click="batchDelete">
          批量删除
        </el-button>
      </div>

      <el-table
        ref="tableRef"
        :data="ipList"
        class="whitelist-table"
        row-key="id"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="segment" label="IP白名单" min-width="400" />
        <el-table-column label="操作" width="118" align="left">
          <template #default="{ row }">
            <el-button type="primary" link class="delete-link" @click="deleteRow(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog
      v-model="addVisible"
      title="新增IP白名单"
      width="730px"
      destroy-on-close
      class="whitelist-add-dialog"
      @closed="resetAddForm"
    >
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="126px" class="add-form">
        <el-form-item label="IP白名单" prop="rawText">
          <el-input
            v-model="addForm.rawText"
            type="textarea"
            resize="both"
            placeholder="请输入IP白名单，多个IP用英文 “,” 逗号分隔"
          />
          <div class="field-tip">
            多个IP用英文 “,” 逗号分隔；网段可以用 * 号或 “/xx” 代替，“/xx” 中<br />
            的 “xx” 取值范围为1~32之间的整数
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button class="dialog-cancel" @click="addVisible = false">取消</el-button>
        <el-button type="primary" class="dialog-confirm" @click="confirmAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  parseCommaSeparatedSegments,
  findOverlappingRow,
  segmentToRange,
  displayIpSegment
} from '@/utils/whitelistIp.js'

const WHITELIST_MAX = 1000

const tableRef = ref(null)
const addFormRef = ref(null)
const addVisible = ref(false)
const selectedRows = ref([])

const addForm = reactive({
  rawText: ''
})

const ipList = ref([
  { id: '1', segment: '192.168.199.46' },
  { id: '2', segment: '192.168.201.59' }
])

const addRules = {
  rawText: [
    { required: true, message: '请输入IP白名单', trigger: 'blur' },
    {
      validator (_rule, value, callback) {
        const parsed = parseCommaSeparatedSegments(value)
        if (parsed.error) return callback(new Error(parsed.error))
        callback()
      },
      trigger: ['blur', 'change']
    }
  ]
}

function genId () {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function openAdd () {
  if (ipList.value.length >= WHITELIST_MAX) {
    ElMessage.warning(`白名单最多 ${WHITELIST_MAX} 条，请先删除后再添加`)
    return
  }
  addForm.rawText = ''
  addVisible.value = true
}

function resetAddForm () {
  addForm.rawText = ''
  addFormRef.value?.resetFields()
}

async function confirmAdd () {
  try {
    await addFormRef.value?.validate()
  } catch {
    return
  }

  const parsed = parseCommaSeparatedSegments(addForm.rawText)
  if (parsed.error) {
    ElMessage.error(parsed.error)
    return
  }

  const room = WHITELIST_MAX - ipList.value.length
  if (parsed.segments.length > room) {
    ElMessage.warning(`最多还可添加 ${room} 条`)
    return
  }

  const pending = []
  for (const segment of parsed.segments) {
    const range = segmentToRange(segment)
    const hit = findOverlappingRow(range, [...ipList.value, ...pending], null)
    if (hit) {
      const label = hit.segment != null ? hit.segment : displayIpSegment(hit)
      ElMessage.error(`与已有条目重叠：${label}`)
      return
    }
    pending.push({ id: genId(), segment })
  }

  ipList.value.push(...pending)
  addVisible.value = false
  ElMessage.success('操作成功')
}

function onSelectionChange (rows) {
  selectedRows.value = rows
}

function deleteRow (row) {
  ipList.value = ipList.value.filter((item) => item.id !== row.id)
  tableRef.value?.clearSelection?.()
  ElMessage.success('操作成功')
}

function batchDelete () {
  const count = selectedRows.value.length
  if (!count) {
    ElMessage.warning('请选择要删除的白名单')
    return
  }

  ElMessageBox.confirm(`确定删除选中的 ${count} 条白名单吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => {
      const ids = new Set(selectedRows.value.map((row) => row.id))
      ipList.value = ipList.value.filter((row) => !ids.has(row.id))
      tableRef.value?.clearSelection?.()
      ElMessage.success('操作成功')
    })
    .catch(() => {})
}
</script>

<style lang="scss" scoped>
.whitelist-page {
  min-height: 100%;
  padding: 10px 10px 0;
  background: #eef2f7;
}

.page-title {
  margin: 0 0 33px;
  color: #1f2d3d;
  font-size: 28px;
  font-weight: 400;
  line-height: 36px;
}

.whitelist-panel {
  min-height: 387px;
  background: #fff;
}

.toolbar {
  height: 69px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
}

.primary-button,
.batch-button {
  width: 70px;
  height: 28px;
  padding: 0;
  border-radius: 0;
  font-size: 12px;
}

.primary-button {
  background: #387ee8;
  border-color: #387ee8;
}

.batch-button {
  color: #696969;
  background: #fff;
  border-color: #c7d6ee;
  width: 100px;
}

.whitelist-table {
  width: 100%;

  :deep(.el-table__cell) {
    height: 36px;
    padding: 0;
    border-bottom-color: #e5eaf2;
  }

  :deep(.el-table__header th) {
    background: #f3f3f3 !important;
    color: #3e4b5a;
    font-weight: 400;
  }

  :deep(.el-table__header .cell),
  :deep(.el-table__body .cell) {
    padding: 0 10px;
    font-size: 12px;
    line-height: 36px;
  }

  :deep(.el-table__body .cell) {
    color: #000;
    font-weight: 500;
  }

  :deep(.el-checkbox__inner) {
    width: 14px;
    height: 14px;
    border-color: #cfd8e5;
    border-radius: 2px;
  }

  :deep(.el-table__body tr:hover > td) {
    background-color: #fff !important;
  }

  :deep(.el-table__inner-wrapper::before) {
    background: #e4ebf4;
  }
}

.delete-link {
  height: auto;
  padding: 0;
  color: #2f7bff;
  font-size: 12px;
  font-weight: 400;
}

.add-form {
  padding-top: 19px;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }

  :deep(.el-form-item__label) {
    color: #1f2d3d;
    font-size: 12px;
    line-height: 66px;
    padding-right: 12px;
  }

  :deep(.el-form-item.is-required:not(.is-no-asterisk).asterisk-left > .el-form-item__label::before) {
    color: #d40000;
    margin-right: 4px;
  }

  :deep(.el-textarea__inner) {
    width: 405px;
    min-height: 66px !important;
    border-radius: 0;
    color: #1f2d3d;
    font-size: 12px;
    line-height: 20px;
    padding: 9px 14px;
    box-shadow: 0 0 0 1px #d8dee8 inset;
  }
}

.field-tip {
  width: 405px;
  margin-top: 8px;
  color: #7f8794;
  font-size: 12px;
  line-height: 17px;
}

.dialog-cancel,
.dialog-confirm {
  width: 70px;
  height: 28px;
  padding: 0;
  border-radius: 0;
  font-size: 14px;
}

.dialog-cancel {
  margin-right: 8px;
  color: #1f2d3d;
  border-color: #d8dee8;
}

.dialog-confirm {
  background: #387ee8;
  border-color: #387ee8;
}
</style>

<style lang="scss">
.whitelist-add-dialog.el-dialog {
  height: 253px;
  padding: 0;
  border-radius: 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
}

.whitelist-add-dialog .el-dialog__header {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 18px;
  margin-right: 0;
  background: #dce1e7;
}

.whitelist-add-dialog .el-dialog__title {
  color: #111;
  font-size: 16px;
  font-weight: 400;
  line-height: 40px;
}

.whitelist-add-dialog .el-dialog__headerbtn {
  top: 0;
  right: 6px;
  width: 40px;
  height: 40px;
}

.whitelist-add-dialog .el-dialog__headerbtn .el-dialog__close {
  color: #7a8494;
  font-size: 18px;
}

.whitelist-add-dialog .el-dialog__body {
  height: 164px;
  padding: 0;
}

.whitelist-add-dialog .el-dialog__footer {
  height: 49px;
  padding: 10px 25px 0;
  border-top: 1px solid #e7ebf1;
}
</style>
