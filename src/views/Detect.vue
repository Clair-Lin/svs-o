<template>
  <div class="detect">
    <div class="page-card detect-card">
      <div class="card-title">一键检测</div>

      <div class="detect-warning">
        <el-icon :size="20"><Warning /></el-icon>
        <span>检测前需上传 <strong>CA 根证</strong> 和 <strong>证书管理里面的证书</strong>。</span>
      </div>

      <div class="config-panel">
        <div class="config-row">
          <span class="config-label">检测方式：</span>
          <el-radio-group v-model="detectType" class="check-method-segment">
            <el-radio-button label="all">全部检测</el-radio-button>
            <el-radio-button label="service">服务接口检测</el-radio-button>
            <el-radio-button label="card">加密卡检测</el-radio-button>
          </el-radio-group>
        </div>

        <div class="config-row config-row--certificate">
          <span class="config-label">证　　书：</span>
          <el-select
            v-model="selectedCert"
            filterable
            class="certificate-select"
            placeholder="请选择证书"
          >
            <el-option
              v-for="item in certificateOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>

          <el-button
            type="primary"
            class="start-button"
            :loading="detecting"
            @click="runDetect"
          >
            {{ detecting ? '检测中...' : '开始检测' }}
          </el-button>
        </div>
      </div>
    </div>

    <div class="page-card results-module">
      <div class="results-toolbar">
        <span class="results-title">检测结果</span>
        <el-button type="primary" link :icon="Download" @click="exportReport">
          导出报告
        </el-button>
      </div>

      <div class="progress-line">
        <el-progress
          :percentage="progressShown"
          :stroke-width="12"
          :show-text="true"
        />
        <div class="progress-text">{{ progressStatus }}</div>
      </div>

      <div class="stat-cards">
        <div class="stat-card stat-card--overall" :class="overallClass">
          <el-icon class="stat-icon" :size="28">
            <CircleCheckFilled v-if="summary.failed === 0" />
            <CircleCloseFilled v-else />
          </el-icon>
          <div>
            <div class="stat-label">整体状态</div>
            <div class="stat-value stat-value--overall">{{ overallLabel }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">检测项总数</div>
          <div class="stat-value">{{ summary.total }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">正常</div>
          <div class="stat-value stat-value--success">{{ summary.success }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">警告</div>
          <div class="stat-value stat-value--warning">{{ summary.warning }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">异常</div>
          <div class="stat-value stat-value--danger">{{ summary.failed }}</div>
        </div>
      </div>

      <div class="finish-info">完成时间：{{ summary.time }}</div>
      <div class="finish-tip">检测完成，{{ summary.failed }} 项失败，请查看详情</div>

      <div class="detail-panel">
        <div class="target-bar">
          <span>检测对象: 本机 {{ DISPLAY_ORIGIN }}</span>
          <span class="target-count">{{ summary.success }} / {{ summary.total }} 正常</span>
        </div>

        <div
          v-for="group in visibleGroups"
          :key="group.key"
          class="result-group"
        >
          <div class="group-header" @click="toggleGroup(group.key)">
            <span class="group-title">{{ group.name }}</span>
            <span class="group-count">{{ group.items.length }}项</span>
            <el-icon class="group-arrow">
              <ArrowDown v-if="expandedGroups[group.key]" />
              <ArrowRight v-else />
            </el-icon>
          </div>

          <div v-show="expandedGroups[group.key]" class="group-body">
            <div
              v-for="item in group.items"
              :key="item.name"
              class="result-row"
            >
              <el-icon class="row-icon" :class="`row-icon--${item.type}`">
                <CircleCheckFilled v-if="item.type === 'success'" />
                <WarningFilled v-else-if="item.type === 'warning'" />
                <CircleCloseFilled v-else />
              </el-icon>
              <div class="row-content">
                <div class="row-title">{{ item.name }}</div>
                <div v-for="line in item.lines" :key="line" class="row-line">
                  {{ formatDisplayLine(line) }}
                </div>
              </div>
              <div class="row-status" :class="`row-status--${item.type}`">{{ item.status }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ArrowDown,
  ArrowRight,
  CircleCheckFilled,
  CircleCloseFilled,
  Download,
  Warning,
  WarningFilled
} from '@element-plus/icons-vue'

const detectType = ref('all')
const selectedCert = ref('cert-ca')
const detecting = ref(false)
const progress = ref(100)
const progressStatus = ref('检测完成')
const DISPLAY_ORIGIN = 'https://192.168.18.12:8443'

const certificateOptions = [
  {
    value: 'cert-ca',
    label: '/C=CN/ST=guangdong/O=myibc.net/OU=ca_99.myibc'
  },
  {
    value: 'cert-user',
    label: '/C=CN/ST=guangdong/O=myibc.net/OU=user_sign'
  }
]

const allGroups = [
  {
    key: 'service',
    name: '服务接口检测',
    items: [
      {
        name: '获取随机数',
        status: '正常',
        type: 'success',
        lines: [
          '接口地址：/cloud_sign_svs/cert/generateRandom',
          '响应时间：3ms - 调用成功'
        ]
      },
      {
        name: '导出证书',
        status: '正常',
        type: 'success',
        lines: [
          '接口地址：/cloud_sign_svs/cert/ExportCert',
          '响应时间：5ms - 调用成功'
        ]
      },
      {
        name: '数据签名',
        status: '正常',
        type: 'success',
        lines: [
          '接口地址：/cloud_sign_svs/cert/SignData',
          '响应时间：7ms - 调用成功'
        ]
      },
      {
        name: '数据验签',
        status: '正常',
        type: 'success',
        lines: [
          '接口地址：/cloud_sign_svs/cert/VerifySignedData',
          '响应时间：6ms - 调用成功'
        ]
      },
      {
        name: '获取服务器证书',
        status: '正常',
        type: 'success',
        lines: [
          '接口地址：/cloud_sign_svs/cert/GetServerCert',
          '响应时间：4ms - 调用成功'
        ]
      }
    ]
  },
  {
    key: 'card',
    name: '加密卡检测',
    items: [
      {
        name: '加密卡状态',
        status: '异常',
        type: 'danger',
        lines: [
          '设备状态：未检测到可用加密卡',
          '处理建议：请确认加密卡连接状态后重新检测'
        ]
      }
    ]
  }
]

const expandedGroups = reactive({
  service: true,
  card: true
})

const visibleGroups = computed(() => {
  if (detectType.value === 'service') return allGroups.filter((item) => item.key === 'service')
  if (detectType.value === 'card') return allGroups.filter((item) => item.key === 'card')
  return allGroups
})

const summary = computed(() => {
  const items = visibleGroups.value.flatMap((group) => group.items)
  const success = items.filter((item) => item.type === 'success').length
  const warning = items.filter((item) => item.type === 'warning').length
  const failed = items.filter((item) => item.type === 'danger').length

  return {
    total: items.length,
    success,
    warning,
    failed,
    time: '2026-05-20 15:00:18'
  }
})

const progressShown = computed(() => (detecting.value ? progress.value : 100))

const overallLabel = computed(() => {
  if (summary.value.failed > 0) return '异常'
  if (summary.value.warning > 0) return '警告'
  return '正常'
})

const overallClass = computed(() => ({
  'is-danger': summary.value.failed > 0,
  'is-warning': summary.value.failed === 0 && summary.value.warning > 0,
  'is-success': summary.value.failed === 0 && summary.value.warning === 0
}))

function toggleGroup(key) {
  expandedGroups[key] = !expandedGroups[key]
}

function formatDisplayLine(line) {
  const apiPrefix = '接口地址：'
  if (!line.startsWith(apiPrefix)) return line

  const path = line.slice(apiPrefix.length)
  return `${apiPrefix}${DISPLAY_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}

function runDetect() {
  if (!selectedCert.value && detectType.value !== 'card') {
    ElMessage.warning('请先选择证书')
    return
  }

  detecting.value = true
  progress.value = 0
  progressStatus.value = '正在检测...'

  const timer = setInterval(() => {
    progress.value += 25
    if (progress.value >= 100) {
      clearInterval(timer)
      progress.value = 100
      progressStatus.value = '检测完成'
      detecting.value = false
    }
  }, 180)
}

function exportReport() {
  ElMessage.success('检测报告已生成')
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.detect {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detect-card {
  padding-bottom: 24px;
}

.detect-warning {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  margin: 24px 0 16px;
  padding: 0 16px;
  color: #fa8c16;
  background: #fff2e8;
  font-size: 14px;

  strong {
    font-weight: 700;
  }
}

.config-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.config-row {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 30px;
}

.config-row--certificate {
  padding-right: 4px;
}

.config-label {
  flex: 0 0 auto;
  color: $text-primary;
  font-size: 14px;
  white-space: nowrap;
}

.check-method-segment {
  display: inline-flex;
  padding: 4px;
  background: #e9edf3;
  border-radius: 4px;

  :deep(.el-radio-button__inner) {
    min-width: 92px;
    height: 22px;
    padding: 0 14px;
    border: none !important;
    border-radius: 3px !important;
    background: transparent !important;
    box-shadow: none !important;
    color: $text-secondary;
    font-size: 12px;
    line-height: 22px;
  }

  :deep(.el-radio-button.is-active .el-radio-button__inner) {
    background: #fff !important;
    color: #1677ff !important;
    font-weight: 600;
  }
}

.certificate-select {
  width: 322px;
}

.start-button {
  width: 94px;
  margin-left: auto;
  border-radius: 0;
}

.results-module {
  padding-top: 0;
}

.results-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 45px;
  margin: 0 -24px 26px;
  padding: 0 20px;
  border-bottom: 1px solid $border-light;
}

.results-title {
  color: $text-primary;
  font-size: 16px;
  font-weight: 700;
}

.progress-line {
  margin-bottom: 18px;
}

.progress-text {
  margin-top: 8px;
  color: $text-secondary;
  font-size: 13px;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.stat-card {
  min-height: 98px;
  padding: 18px 16px;
  border: 1px solid #e5eaf3;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(21, 34, 50, 0.04);
}

.stat-card--overall {
  display: flex;
  align-items: center;
  gap: 14px;

  &.is-danger {
    border-color: #ffb4b4;
    background: #fff1f0;

    .stat-icon,
    .stat-value--overall {
      color: #ff4d4f;
    }
  }

  &.is-success {
    border-color: rgba(82, 196, 26, 0.35);
    background: #f6ffed;

    .stat-icon,
    .stat-value--overall {
      color: #00b96b;
    }
  }

  &.is-warning {
    border-color: rgba(250, 173, 20, 0.4);
    background: #fffbe6;

    .stat-icon,
    .stat-value--overall {
      color: #fa8c16;
    }
  }
}

.stat-label {
  margin-bottom: 10px;
  color: $text-secondary;
  font-size: 14px;
}

.stat-value {
  color: $text-primary;
  font-size: 20px;
  font-weight: 700;
}

.stat-value--success {
  color: #00b96b;
}

.stat-value--warning {
  color: #fa8c16;
}

.stat-value--danger {
  color: #ff4d4f;
}

.finish-info,
.finish-tip {
  margin-bottom: 16px;
  color: $text-secondary;
  font-size: 13px;
}

.detail-panel {
  border: 1px solid #e5eaf3;
  border-radius: 5px;
  overflow: hidden;
  background: #fff;
}

.target-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 35px;
  padding: 0 16px;
  background: #fafafa;
  color: $text-secondary;
  font-size: 12px;
}

.target-count {
  color: #00b96b;
  font-size: 14px;
}

.result-group {
  border-top: 1px solid $border-light;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 16px;
  cursor: pointer;
}

.group-title {
  color: $text-primary;
  font-weight: 700;
}

.group-count {
  color: $text-secondary;
}

.group-arrow {
  margin-left: auto;
  color: $text-muted;
}

.group-body {
  padding: 0 16px 8px;
}

.result-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 18px 0;
  border-top: 1px solid $border-light;
}

.row-icon {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  border-radius: 50%;
  color: #fff;
  flex-shrink: 0;

  &--success {
    color: #00c853;
  }

  &--warning {
    color: #fa8c16;
  }

  &--danger {
    color: #ff4d4f;
  }
}

.row-content {
  min-width: 0;
  flex: 1;
}

.row-title {
  margin-bottom: 6px;
  color: $text-primary;
  font-size: 14px;
  font-weight: 700;
}

.row-line {
  color: $text-muted;
  font-size: 12px;
  line-height: 1.7;
}

.row-status {
  flex-shrink: 0;
  padding-top: 2px;
  font-size: 14px;
  font-weight: 700;

  &--success {
    color: #00b96b;
  }

  &--warning {
    color: #fa8c16;
  }

  &--danger {
    color: #ff4d4f;
  }
}

@media (max-width: 1200px) {
  .stat-cards {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .stat-cards {
    grid-template-columns: 1fr;
  }

  .config-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .certificate-select,
  .start-button {
    width: 100%;
    margin-left: 0;
  }
}
</style>
