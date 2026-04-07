<template>
  <div class="detect">
    <div class="page-card detect-card">
      <div class="card-title">一键检测</div>

      <div class="toolbar">
        <div class="toolbar-row">
          <span class="toolbar-label">检测内容</span>
          <el-radio-group v-model="detectType" size="default">
            <el-radio-button label="all">全部检测</el-radio-button>
            <el-radio-button label="service">服务接口检测</el-radio-button>
            <el-radio-button label="card">加密卡检测</el-radio-button>
          </el-radio-group>
        </div>

        <div class="toolbar-actions">
          <el-button type="primary" size="large" :loading="detecting" @click="runDetect">
            <el-icon v-if="!detecting"><VideoPlay /></el-icon>
            {{ detecting ? '检测中...' : '开始检测' }}
          </el-button>
        </div>

        <div class="progress-wrap">
          <el-progress
            :percentage="progressShown"
            :stroke-width="14"
            :status="progressStatusType"
          />
          <div v-if="progressStatus" class="progress-text">{{ progressStatus }}</div>
        </div>
      </div>

      <template v-if="summary">
        <div class="stat-cards">
          <div class="stat-card" :class="overallStatusClass">
            <div class="stat-card-icon">
              <el-icon v-if="overallOk" :size="28"><CircleCheck /></el-icon>
              <el-icon v-else :size="28"><WarningFilled /></el-icon>
            </div>
            <div class="stat-card-body">
              <div class="stat-card-label">整体状态</div>
              <div class="stat-card-value">{{ overallLabel }}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-card-body">
              <div class="stat-card-label">检测项总数</div>
              <div class="stat-card-value num">{{ summary.total }}</div>
            </div>
          </div>
          <div class="stat-card stat-ok">
            <div class="stat-card-body">
              <div class="stat-card-label">正常</div>
              <div class="stat-card-value num">{{ summary.passed }}</div>
            </div>
          </div>
          <div class="stat-card stat-warn">
            <div class="stat-card-body">
              <div class="stat-card-label">警告</div>
              <div class="stat-card-value num">{{ summary.warning }}</div>
            </div>
          </div>
          <div class="stat-card stat-bad">
            <div class="stat-card-body">
              <div class="stat-card-label">异常</div>
              <div class="stat-card-value num">{{ summary.failed }}</div>
            </div>
          </div>
        </div>

        <p class="finish-time">完成时间：{{ summary.time }}</p>

        <div class="result-node">
          <div class="result-node-head">
            <span class="node-title">检测对象</span>
            <span class="node-meta">本机 192.168.1.100</span>
            <span class="node-counts">
              <span class="ok">{{ normalCount }}/{{ summary.total }} 正常</span>
              <span class="bad" v-if="summary.failed > 0">{{ summary.failed }} 异常</span>
            </span>
          </div>

          <el-collapse v-model="collapseActive" class="check-collapse">
            <el-collapse-item v-if="serviceResults.length" name="service">
              <template #title>
                <span class="collapse-title">服务接口检测</span>
                <el-tag size="small" type="info" class="collapse-count">{{ serviceResults.length }} 项</el-tag>
              </template>
              <div
                v-for="row in serviceResults"
                :key="row.name"
                class="check-item"
              >
                <div class="check-item-icon" :class="row.status === '正常' ? 'is-ok' : 'is-bad'">
                  <el-icon v-if="row.status === '正常'"><SuccessFilled /></el-icon>
                  <el-icon v-else><CircleCloseFilled /></el-icon>
                </div>
                <div class="check-item-main">
                  <div class="check-item-name">{{ row.name }}</div>
                  <div class="check-item-meta">接口地址：{{ row.url }}</div>
                  <div class="check-item-meta">响应时间：{{ row.responseTime }} · {{ row.detail }}</div>
                </div>
                <el-tag :type="row.status === '正常' ? 'success' : 'danger'" size="small">{{ row.status }}</el-tag>
              </div>
            </el-collapse-item>

            <el-collapse-item v-if="cardResult" name="card">
              <template #title>
                <span class="collapse-title">加密卡检测</span>
                <el-tag size="small" type="info" class="collapse-count">{{ cardCheckItems.length }} 项</el-tag>
              </template>
              <div
                v-for="item in cardCheckItems"
                :key="item.name"
                class="check-item"
              >
                <div class="check-item-icon" :class="item.ok ? 'is-ok' : 'is-bad'">
                  <el-icon v-if="item.ok"><SuccessFilled /></el-icon>
                  <el-icon v-else><CircleCloseFilled /></el-icon>
                </div>
                <div class="check-item-main">
                  <div class="check-item-name">{{ item.name }}</div>
                  <div class="check-item-meta">{{ item.detail }}</div>
                </div>
                <el-tag :type="item.ok ? 'success' : 'danger'" size="small">{{ item.statusText }}</el-tag>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  CircleCheck,
  VideoPlay,
  SuccessFilled,
  CircleCloseFilled,
  WarningFilled
} from '@element-plus/icons-vue'

const detectType = ref('all')
const detecting = ref(false)
const progress = ref(0)
const progressStatus = ref('')

const serviceResults = ref([])
const cardResult = ref(null)
const summary = ref(null)

const collapseActive = ref(['service', 'card'])

/** 切换「检测内容」时清空结果；检测进行中则中断定时器 */
let detectTimer = null

function clearDetectResults() {
  if (detectTimer !== null) {
    clearInterval(detectTimer)
    detectTimer = null
  }
  detecting.value = false
  serviceResults.value = []
  cardResult.value = null
  summary.value = null
  progress.value = 0
  progressStatus.value = ''
  collapseActive.value = ['service', 'card']
}

watch(detectType, clearDetectResults)

const SERVICE_INTERFACE_ROWS = [
  {
    name: '获取服务器证书接口',
    url: 'https://192.168.1.100:443/api/server-certificate',
    status: '正常',
    responseTime: '18ms',
    detail: '成功获取服务器证书'
  },
  {
    name: '服务器签名接口',
    url: 'http://192.168.1.100:8080/api/sign',
    status: '正常',
    responseTime: '15ms',
    detail: '签名接口响应正常'
  },
  {
    name: '服务器验签接口',
    url: 'http://192.168.1.100:8080/api/verify',
    status: '正常',
    responseTime: '14ms',
    detail: '验签接口响应正常'
  }
]

const MOCK_CARD = {
  model: 'HSM-2000',
  serial: 'HSM20240301001',
  firmware: '2.1.0',
  connected: true,
  uptime: '15天 8小时',
  health: '良好'
}

const STEPS_SERVICE = [
  { progress: 25, status: '正在检测获取服务器证书接口...' },
  { progress: 50, status: '正在检测服务器签名接口...' },
  { progress: 75, status: '正在检测服务器验签接口...' },
  { progress: 100, status: '检测完成' }
]

const STEPS_CARD = [
  { progress: 50, status: '正在检测加密卡...' },
  { progress: 100, status: '检测完成' }
]

const STEPS_ALL = [
  { progress: 18, status: '正在检测获取服务器证书接口...' },
  { progress: 36, status: '正在检测服务器签名接口...' },
  { progress: 54, status: '正在检测服务器验签接口...' },
  { progress: 72, status: '正在检测加密卡...' },
  { progress: 88, status: '正在汇总检测结果...' },
  { progress: 100, status: '检测完成' }
]

const progressShown = computed(() => (detecting.value ? progress.value : summary.value ? 100 : 0))

const progressStatusType = computed(() => {
  if (detecting.value) return undefined
  if (summary.value && summary.value.failed === 0) return 'success'
  if (summary.value && summary.value.failed > 0) return 'exception'
  return undefined
})

const overallOk = computed(() => summary.value && summary.value.failed === 0 && summary.value.warning === 0)
const overallLabel = computed(() => {
  if (!summary.value) return '—'
  if (summary.value.failed > 0) return '异常'
  if (summary.value.warning > 0) return '警告'
  return '正常'
})
const overallStatusClass = computed(() => {
  if (!summary.value) return ''
  if (summary.value.failed > 0) return 'is-bad'
  if (summary.value.warning > 0) return 'is-warn'
  return 'is-ok'
})

const normalCount = computed(() => (summary.value ? summary.value.passed : 0))

const cardCheckItems = computed(() => {
  if (!cardResult.value) return []
  const c = cardResult.value
  return [
    {
      name: '加密卡连接',
      ok: c.connected,
      statusText: c.connected ? '正常' : '异常',
      detail: `卡型号 ${c.model} · 序列号 ${c.serial} · 固件 ${c.firmware}`
    },
    {
      name: '加密卡健康',
      ok: c.health === '良好',
      statusText: c.health === '良好' ? '正常' : '警告',
      detail: `健康状态：${c.health} · 运行时间 ${c.uptime}`
    }
  ]
})

const runDetect = () => {
  if (detectTimer !== null) {
    clearInterval(detectTimer)
    detectTimer = null
  }

  detecting.value = true
  progress.value = 0
  serviceResults.value = []
  cardResult.value = null
  summary.value = null

  const steps =
    detectType.value === 'service'
      ? STEPS_SERVICE
      : detectType.value === 'card'
        ? STEPS_CARD
        : STEPS_ALL

  let stepIndex = 0
  detectTimer = setInterval(() => {
    if (stepIndex < steps.length) {
      progress.value = steps[stepIndex].progress
      progressStatus.value = steps[stepIndex].status
      stepIndex++
    } else {
      clearInterval(detectTimer)
      detectTimer = null
      detecting.value = false

      const mode = detectType.value

      if (mode === 'all' || mode === 'service') {
        serviceResults.value = SERVICE_INTERFACE_ROWS.map((r) => ({ ...r }))
      }
      if (mode === 'all' || mode === 'card') {
        cardResult.value = { ...MOCK_CARD }
      }

      let total = 0
      let passed = 0
      if (mode === 'all' || mode === 'service') {
        const ok = serviceResults.value.filter((r) => r.status === '正常').length
        total += serviceResults.value.length
        passed += ok
      }
      if (mode === 'all' || mode === 'card') {
        const c = cardResult.value
        const cardItems = [
          !!(c?.connected),
          c?.health === '良好'
        ]
        total += cardItems.length
        passed += cardItems.filter(Boolean).length
      }

      summary.value = {
        total,
        passed,
        warning: 0,
        failed: total - passed,
        time: '2026-04-07 15:42:00'
      }

      collapseActive.value = []
      if (serviceResults.value.length) collapseActive.value.push('service')
      if (cardResult.value) collapseActive.value.push('card')
    }
  }, 220)
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.detect-card {
  padding-bottom: 8px;
}

.toolbar {
  margin-bottom: 20px;
}

.toolbar-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;

  :deep(.el-radio-group) {
    flex: 1;
    min-width: 0;
  }
}

.toolbar-label {
  font-weight: 600;
  color: $text-primary;
}

.toolbar-actions {
  margin-bottom: 16px;
}

.progress-wrap {
  max-width: 100%;

  .progress-text {
    margin-top: 8px;
    font-size: 13px;
    color: $text-secondary;
  }
}

.finish-time {
  margin: -8px 0 16px;
  font-size: 13px;
  color: $text-muted;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 14px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid $border-light;

  &.is-ok {
    border-color: rgba(82, 196, 26, 0.35);
    background: #f6ffed;
  }

  &.is-warn {
    border-color: rgba(250, 173, 20, 0.4);
    background: #fffbe6;
  }

  &.is-bad {
    border-color: rgba(255, 77, 79, 0.35);
    background: #fff2f0;
  }

  .stat-card-icon {
    color: $text-muted;

    .is-ok & {
      color: #52c41a;
    }

    .is-bad & {
      color: #ff4d4f;
    }

    .is-warn & {
      color: #faad14;
    }
  }

  .stat-card-label {
    font-size: 12px;
    color: $text-muted;
    margin-bottom: 4px;
  }

  .stat-card-value {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;

    &.num {
      font-size: 22px;
    }
  }

  &.stat-ok .stat-card-value.num {
    color: #52c41a;
  }

  &.stat-warn .stat-card-value.num {
    color: #faad14;
  }

  &.stat-bad .stat-card-value.num {
    color: #ff4d4f;
  }
}

.result-node {
  border: 1px solid $border-color;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.result-node-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 20px;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid $border-light;
  font-size: 13px;

  .node-title {
    font-weight: 600;
    color: $text-primary;
  }

  .node-meta {
    color: $text-secondary;
  }

  .node-counts {
    margin-left: auto;
    display: flex;
    gap: 16px;
    font-size: 12px;

    .ok {
      color: #52c41a;
    }

    .bad {
      color: #ff4d4f;
    }
  }
}

.check-collapse {
  border: none;

  :deep(.el-collapse-item__header) {
    padding: 12px 16px;
    font-weight: 600;
    background: #fff;
  }

  :deep(.el-collapse-item__wrap) {
    border-bottom: 1px solid $border-light;
  }

  :deep(.el-collapse-item__content) {
    padding: 0 16px 16px;
  }
}

.collapse-title {
  margin-right: 8px;
}

.collapse-count {
  vertical-align: middle;
}

.check-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid $border-light;

  &:last-child {
    border-bottom: none;
  }
}

.check-item-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;

  &.is-ok {
    color: #52c41a;
    background: #f6ffed;
  }

  &.is-bad {
    color: #ff4d4f;
    background: #fff2f0;
  }
}

.check-item-main {
  flex: 1;
  min-width: 0;
}

.check-item-name {
  font-weight: 500;
  color: $text-primary;
  margin-bottom: 6px;
}

.check-item-meta {
  font-size: 12px;
  color: $text-muted;
  line-height: 1.5;
}

</style>
