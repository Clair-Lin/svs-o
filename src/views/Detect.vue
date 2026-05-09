<template>
  <div class="detect">
    <div class="page-card detect-card">
      <div class="card-title">一键检测</div>
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        class="detect-prereq-alert"
      >
        <template v-if="detectType === 'card'">
          加密卡检测<strong>无需选择签名证书</strong>，可直接点击「开始检查」。
        </template>
        <template v-else>
          检测前需完成 <strong>CA 根证</strong>、<strong>CRL</strong> 配置并<strong>选择用户签名证书</strong>。点击「选择证书」将自动校验根证与 CRL；二者均已配置后，方可从下拉框中选择签名证书；<strong>未选择证书时无法开始检测</strong>。若检测因证书或信任链问题导致接口异常，请按提示补全配置后再检。
        </template>
      </el-alert>
      <div v-show="needsSignCertForMode" class="cert-picker-bar">
        <span class="config-label">签名证书</span>
        <el-button
          type="primary"
          plain
          :loading="certPreChecking"
          @click="runCertPrereqAndOpenSelect"
        >
          选择证书
        </el-button>
        <el-select
          ref="signCertSelectRef"
          v-model="selectedSignCertId"
          :placeholder="signCertSelectPlaceholder"
          :disabled="!signCertPickerUnlocked"
          filterable
          clearable
          class="cert-picker-select"
        >
          <el-option
            v-for="opt in signCertOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>
      <div class="config-panel">
        <div class="config-panel__left">
          <span class="config-label">检测方式：</span>
          <el-radio-group v-model="detectType" class="check-method-segment">
            <el-radio-button label="all">全部检测</el-radio-button>
            <el-radio-button label="service">服务接口检测</el-radio-button>
            <el-radio-button label="card">加密卡检测</el-radio-button>
          </el-radio-group>
        </div>
        <el-tooltip
          :disabled="!startDetectBlockedByCert"
          content="请先完成前置检测并选择签名证书"
          placement="top"
        >
          <span class="config-panel__btn-wrap">
            <el-button
              type="primary"
              class="config-panel__btn"
              :loading="detecting"
              :disabled="startDetectDisabled"
              @click="runDetect"
            >
              {{ detecting ? '检查中...' : '开始检查' }}
            </el-button>
          </span>
        </el-tooltip>
      </div>
    </div>

    <div class="page-card results-module">
      <div class="results-module__toolbar">
        <span class="results-module__toolbar-title">检查结果</span>
        <el-button
          v-if="summary"
          type="primary"
          plain
          :icon="Download"
          @click="exportReport"
        >
          导出报告
        </el-button>
      </div>
      <div class="results-module__body">
        <el-alert
          v-if="!detecting && !summary"
          type="info"
          :closable="false"
          show-icon
          class="results-module__hint"
        >
          {{ idleHintText }}
        </el-alert>

        <div v-if="detecting || summary" class="progress-wrap results-module__progress">
          <el-progress
            :percentage="progressShown"
            :stroke-width="14"
            :status="progressStatusType"
          />
          <div v-if="progressStatus" class="progress-text">{{ progressStatus }}</div>
        </div>

        <template v-if="summary">
          <el-alert
            v-if="certAbnormalSummaryHint"
            type="error"
            :closable="false"
            show-icon
            class="detect-cert-abnormal-alert"
          >
            {{ certAbnormalSummaryHint }}
          </el-alert>
          <div class="detect-stat-strip detect-stat-strip--in-results">
            <div class="stat-cards stat-cards--inspect">
              <div class="stat-card stat-card--overall" :class="overallStatusClass">
                <div class="stat-card-icon">
                  <el-icon v-if="overallOk" :size="28"><CircleCheck /></el-icon>
                  <el-icon v-else-if="summary.warning > 0 && summary.failed === 0" :size="28"><WarningFilled /></el-icon>
                  <el-icon v-else :size="28"><CircleCloseFilled /></el-icon>
                </div>
                <div class="stat-card-body">
                  <div class="stat-card-label">整体状态</div>
                  <div class="stat-card-value stat-card-value--emphasis">{{ overallLabel }}</div>
                </div>
              </div>
              <div class="stat-card stat-card--plain">
                <div class="stat-card-body">
                  <div class="stat-card-label">检测项总数</div>
                  <div class="stat-card-value num">{{ inspectItemStats.total }}</div>
                </div>
              </div>
              <div class="stat-card stat-card--plain stat-card--tone-ok">
                <div class="stat-card-body">
                  <div class="stat-card-label">正常</div>
                  <div class="stat-card-value num">{{ inspectItemStats.ok }}</div>
                </div>
              </div>
              <div class="stat-card stat-card--plain stat-card--tone-warn">
                <div class="stat-card-body">
                  <div class="stat-card-label">警告</div>
                  <div class="stat-card-value num">{{ inspectItemStats.warn }}</div>
                </div>
              </div>
              <div class="stat-card stat-card--plain stat-card--tone-bad">
                <div class="stat-card-body">
                  <div class="stat-card-label">异常</div>
                  <div class="stat-card-value num">{{ inspectItemStats.bad }}</div>
                </div>
              </div>
            </div>
          </div>

          <p class="finish-time">完成时间：{{ summary.time }}</p>

          <div class="inspect-target-bar">
            <span class="inspect-target-bar__left">检测对象 {{ summary.targetLabel }}</span>
            <span
              class="inspect-target-bar__right"
              :class="{
                'inspect-target-bar__right--ok': inspectItemStats.bad === 0 && inspectItemStats.warn === 0,
                'inspect-target-bar__right--warn': inspectItemStats.bad === 0 && inspectItemStats.warn > 0,
                'inspect-target-bar__right--bad': inspectItemStats.bad > 0
              }"
            >
              {{ inspectItemStats.ok }}/{{ inspectItemStats.total }} 正常
            </span>
          </div>

          <div
            class="inspect-detail-panel"
            :class="{ 'inspect-detail-panel--error': summary.failed > 0 }"
          >
            <div
              v-for="(cat, ci) in resultCategories"
              :key="ci"
              class="inspect-cat"
            >
              <div
                class="inspect-cat__header"
                role="button"
                tabindex="0"
                @click="toggleCategory(ci)"
                @keydown.enter.prevent="toggleCategory(ci)"
              >
                <span class="inspect-cat__title">{{ cat.name }}</span>
                <span class="inspect-cat__badge">{{ cat.items.length }}项</span>
                <el-icon class="inspect-cat__chevron">
                  <ArrowDown v-if="isCategoryExpanded(ci)" />
                  <ArrowRight v-else />
                </el-icon>
              </div>
              <div v-show="isCategoryExpanded(ci)" class="inspect-cat__body">
                <div
                  v-for="(item, ii) in cat.items"
                  :key="ii + item.name"
                  class="inspect-result-row"
                >
                  <div
                    class="inspect-result-row__icon"
                    :class="`inspect-result-row__icon--${item.tagType}`"
                  >
                    <el-icon :size="14">
                      <CircleCheck v-if="item.tagType === 'success'" />
                      <WarningFilled v-else-if="item.tagType === 'warning'" />
                      <CircleCloseFilled v-else />
                    </el-icon>
                  </div>
                  <div class="inspect-result-row__main">
                    <div class="inspect-result-row__name">{{ item.name }}</div>
                    <div
                      v-for="(line, li) in item.metaLines"
                      :key="li"
                      class="inspect-result-row__meta"
                    >
                      {{ line }}
                    </div>
                  </div>
                  <div
                    class="inspect-result-row__status"
                    :class="`inspect-result-row__status--${item.tagType}`"
                  >
                    {{ item.label }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  CircleCheck,
  CircleCloseFilled,
  WarningFilled,
  Download,
  ArrowRight,
  ArrowDown
} from '@element-plus/icons-vue'

/**
 * 原型：为 true 时模拟「未上传/无效证书」导致证书相关接口异常，并展示「未检测到证书，请重新上传」等提示。
 * 为 false（默认）时服务接口检测均为「正常」演示数据。
 */
const DEMO_SIMULATE_CERT_MISSING = false

/**
 * 原型：模拟「是否已配置 CA 根证 / CRL」。任一为 false 时，点击「选择证书」将阻断且提示补全配置。
 * 联调真实接口时可改为请求结果。
 */
const DEMO_DETECT_CA_ROOT_READY = ref(true)
const DEMO_DETECT_CRL_READY = ref(true)

const signCertOptions = [
  { value: '1', label: '用户签名证书 · SM2（默认）' },
  { value: '2', label: '用户签名证书 · RSA-2048' }
]

const selectedSignCertId = ref('')
const signCertPickerUnlocked = ref(false)
const certPreChecking = ref(false)
const signCertSelectRef = ref(null)

/** 检测方式：全部 / 服务接口 / 加密卡（须在证书相关 computed 之前声明） */
const detectType = ref('all')
const detecting = ref(false)

const signCertSelectPlaceholder = computed(() =>
  signCertPickerUnlocked.value ? '请选择签名证书' : '请先点击「选择证书」完成前置检测'
)

/** 全部检测 / 服务接口检测须选签名证书；加密卡检测不需要 */
const needsSignCertForMode = computed(() =>
  detectType.value === 'all' || detectType.value === 'service'
)

const startDetectBlockedByCert = computed(() =>
  needsSignCertForMode.value && !selectedSignCertId.value
)

const startDetectDisabled = computed(() =>
  detecting.value || startDetectBlockedByCert.value
)

async function runCertPrereqAndOpenSelect () {
  certPreChecking.value = true
  try {
    await new Promise((r) => setTimeout(r, 320))
    if (!DEMO_DETECT_CA_ROOT_READY.value) {
      signCertPickerUnlocked.value = false
      selectedSignCertId.value = ''
      ElMessage.warning('尚未配置 CA 根证，请先上传根证后再选择签名证书。')
      return
    }
    if (!DEMO_DETECT_CRL_READY.value) {
      signCertPickerUnlocked.value = false
      selectedSignCertId.value = ''
      ElMessage.warning('尚未配置 CRL（证书撤销列表），请先配置 CRL 后再选择签名证书。')
      return
    }
    signCertPickerUnlocked.value = true
    ElMessage.success('根证与 CRL 已配置，证书信任链前置条件已就绪，请选择签名证书')
    await nextTick()
    signCertSelectRef.value?.focus?.()
  } finally {
    certPreChecking.value = false
  }
}

const progress = ref(0)
const progressStatus = ref('')

const serviceResults = ref([])
const cardResult = ref(null)
const summary = ref(null)

/** 各检测分类独立折叠，默认展开 */
const categoryExpanded = ref({})

const isCategoryExpanded = (ci) => categoryExpanded.value[ci] !== false

function toggleCategory(ci) {
  const open = isCategoryExpanded(ci)
  categoryExpanded.value = { ...categoryExpanded.value, [ci]: !open }
}

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
  categoryExpanded.value = {}
}

/** 切换检测方式时须重新走 CA 根证、CRL 前置检测并重新选择签名证书 */
function resetCertPrereqOnModeChange () {
  selectedSignCertId.value = ''
  signCertPickerUnlocked.value = false
}

watch(detectType, () => {
  resetCertPrereqOnModeChange()
  clearDetectResults()
})

const TARGET_LABEL = {
  all: '本机 192.168.1.100',
  service: '本机 192.168.1.100 · 服务接口',
  card: '本机 192.168.1.100 · 加密卡'
}

const idleHintText = computed(() => {
  const map = {
    all: selectedSignCertId.value
      ? '请点击「开始检查」执行全部检测。'
      : '请先完成前置检测并选择签名证书，再点击「开始检查」执行全部检测。',
    service: selectedSignCertId.value
      ? '请点击「开始检查」仅执行服务接口检测。'
      : '请先完成前置检测并选择签名证书，再点击「开始检查」执行服务接口检测。',
    card: '请点击「开始检查」仅执行加密卡检测（无需选择证书）。'
  }
  return map[detectType.value] || map.all
})

/** 是否与 CA/用户证书强相关的接口（用于异常时给出统一上传提示） */
function isCertRelatedServiceRow (row) {
  const n = String(row.name || '')
  const u = String(row.url || '').toLowerCase()
  if (n.includes('证书')) return true
  if (u.includes('/cert/') || u.includes('certificate')) return true
  if (n.includes('签名') || n.includes('验签')) return true
  return false
}

const CERT_REUPLOAD_HINT = '未检测到证书，请重新上传。'

/** 根据演示开关生成服务接口检测结果 */
function buildServiceResultsForRun () {
  const base = SERVICE_INTERFACE_ROWS.map((r) => ({ ...r }))
  if (!DEMO_SIMULATE_CERT_MISSING) return base
  return base.map((row) => {
    if (!isCertRelatedServiceRow(row)) return row
    return {
      ...row,
      status: '异常',
      responseTime: '—',
      detail: '未检测到有效证书或证书链校验失败（原型模拟）',
      certAbnormalUserHint: CERT_REUPLOAD_HINT
    }
  })
}

/** 有证书类接口异常时，在结果区顶部展示汇总提示 */
const certAbnormalSummaryHint = computed(() => {
  if (!summary.value || summary.value.failed === 0) return ''
  const bad = serviceResults.value.filter((r) => r.status !== '正常' && isCertRelatedServiceRow(r))
  if (!bad.length) return ''
  return CERT_REUPLOAD_HINT
})

/** 云签名服务接口基址（与检测结果展示一致，实际环境由部署决定） */
const CLOUD_SVS_BASE = 'https://192.168.1.100:443'

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
  },
  {
    name: '获取随机数',
    url: `${CLOUD_SVS_BASE}/cloud_sign_svs/cert/generateRandom`,
    status: '正常',
    responseTime: '12ms',
    detail: '随机数接口响应正常'
  },
  {
    name: '导出证书',
    url: `${CLOUD_SVS_BASE}/cloud_sign_svs/cert/ExportCert`,
    status: '正常',
    responseTime: '16ms',
    detail: '导出证书接口响应正常'
  },
  {
    name: '数据签名',
    url: `${CLOUD_SVS_BASE}/cloud_sign_svs/cert/SignData`,
    status: '正常',
    responseTime: '17ms',
    detail: '数据签名接口响应正常'
  },
  {
    name: '数据验签',
    url: `${CLOUD_SVS_BASE}/cloud_sign_svs/cert/VerifySignedData`,
    status: '正常',
    responseTime: '15ms',
    detail: '数据验签接口响应正常'
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
  { progress: 14, status: '正在检查获取服务器证书接口...' },
  { progress: 28, status: '正在检查服务器签名接口...' },
  { progress: 42, status: '正在检查服务器验签接口...' },
  { progress: 57, status: '正在检查获取随机数接口...' },
  { progress: 71, status: '正在检查导出证书接口...' },
  { progress: 85, status: '正在检查数据签名接口...' },
  { progress: 94, status: '正在检查数据验签接口...' },
  { progress: 100, status: '检查完成' }
]

const STEPS_CARD = [
  { progress: 50, status: '正在检查加密卡...' },
  { progress: 100, status: '检查完成' }
]

const STEPS_ALL = [
  { progress: 10, status: '正在检查获取服务器证书接口...' },
  { progress: 20, status: '正在检查服务器签名接口...' },
  { progress: 30, status: '正在检查服务器验签接口...' },
  { progress: 40, status: '正在检查获取随机数接口...' },
  { progress: 50, status: '正在检查导出证书接口...' },
  { progress: 60, status: '正在检查数据签名接口...' },
  { progress: 70, status: '正在检查数据验签接口...' },
  { progress: 80, status: '正在检查加密卡...' },
  { progress: 90, status: '正在汇总检查结果...' },
  { progress: 100, status: '检查完成' }
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

const cardCheckItems = computed(() => {
  if (!cardResult.value) return []
  const c = cardResult.value
  return [
    {
      name: '加密卡状态',
      ok: c.connected,
      statusText: c.connected ? '正常' : '异常',
      detail: `卡型号 ${c.model} · 序列号 ${c.serial} · 固件 ${c.firmware} · 运行时间 ${c.uptime}`
    }
  ]
})

/** 一键检测仅含：服务接口检测、加密卡检测（无许可证/基础设施/节点维度） */
const resultCategories = computed(() => {
  const cats = []
  if (serviceResults.value.length) {
    cats.push({
      name: '服务接口检测',
      items: serviceResults.value.map((r) => ({
        name: r.name,
        label: r.status,
        tagType: r.status === '正常' ? 'success' : 'danger',
        metaLines: [
          `接口地址：${r.url}`,
          `响应时间：${r.responseTime} · ${r.detail}`,
          ...(r.status !== '正常' && r.certAbnormalUserHint ? [r.certAbnormalUserHint] : [])
        ]
      }))
    })
  }
  if (cardCheckItems.value.length) {
    cats.push({
      name: '加密卡检测',
      items: cardCheckItems.value.map((i) => ({
        name: i.name,
        label: i.statusText,
        tagType: i.ok ? 'success' : i.statusText === '警告' ? 'warning' : 'danger',
        metaLines: []
      }))
    })
  }
  return cats
})

const inspectItemStats = computed(() => {
  let ok = 0
  let bad = 0
  let warn = 0
  for (const cat of resultCategories.value) {
    for (const it of cat.items) {
      if (it.tagType === 'success') ok++
      else if (it.tagType === 'warning') warn++
      else bad++
    }
  }
  const total = ok + bad + warn
  return { total, ok, bad, warn, skipped: 0 }
})

function exportReport () {
  if (!summary.value) {
    ElMessage.warning('请先执行检查')
    return
  }
  ElMessage.success('报告导出为原型占位，实际环境可对接导出接口')
}

const runDetect = () => {
  if ((detectType.value === 'all' || detectType.value === 'service') && !selectedSignCertId.value) {
    ElMessage.warning('请先完成前置检测并选择签名证书后再开始检测')
    return
  }

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
        serviceResults.value = buildServiceResultsForRun()
      } else {
        serviceResults.value = []
      }
      if (mode === 'all' || mode === 'card') {
        cardResult.value = { ...MOCK_CARD }
      } else {
        cardResult.value = null
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
          !!(c?.connected)
        ]
        total += cardItems.length
        passed += cardItems.filter(Boolean).length
      }

      const failed = total - passed
      const warning = 0

      categoryExpanded.value = {}

      summary.value = {
        total,
        passed,
        warning,
        failed,
        time: '2026-04-07 15:42:00',
        targetLabel: TARGET_LABEL[detectType.value] || TARGET_LABEL.all
      }
    }
  }, 220)
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.detect {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 汇总卡：无整板背景；置于结果卡内时与下方明细留白 */
.detect-stat-strip {
  margin: 0;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;

  &--in-results {
    margin-bottom: 4px;
  }
}

.detect-card {
  padding-bottom: 8px;
}

.detect-prereq-alert {
  margin-bottom: 4px;
}

.cert-picker-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  padding: 8px 0 12px;
  margin-bottom: 0;
  border-bottom: 1px solid $border-light;
}

.cert-picker-select {
  width: 300px;
  max-width: 100%;
}

.detect-cert-abnormal-alert {
  margin: 12px 0 10px;
}

.results-module__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
  padding-bottom: 10px;
  border-bottom: 1px solid $border-light;
}

.results-module__toolbar-title {
  font-size: 16px;
  font-weight: bold;
  color: $text-primary;
}

.results-module__body {
  padding-top: 4px;
}

.results-module__progress {
  margin-bottom: 8px;
}

/* 单行 — 左为「检测方式 + 分段」、右为「开始检查」，白底留白 */
.config-panel {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 24px;
  padding: 12px 0 20px;
  margin-bottom: 4px;
  background: #fff;
  border: none;
  border-radius: 0;
}

.config-panel__left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 16px;
  min-width: 0;
  flex: 1;
}

.config-label {
  font-weight: 500;
  color: $text-secondary;
  white-space: nowrap;
}

/* 示意图：浅灰圆角槽 + 选中项白底蓝字 */
.check-method-segment {
  padding: 4px;
  background: #e8eaed;
  border-radius: 4px;
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  border: none;
  box-shadow: none;

  :deep(.el-radio-button) {
    margin: 0;
  }

  :deep(.el-radio-button__inner) {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
    color: $text-secondary;
    border-radius: 4px !important;
    padding: 6px 16px;
    font-weight: 500;
  }

  :deep(.el-radio-button:first-child .el-radio-button__inner) {
    border-radius: 4px !important;
  }

  :deep(.el-radio-button:last-child .el-radio-button__inner) {
    border-radius: 4px !important;
  }

  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background: #fff !important;
    color: var(--el-color-primary) !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
  }

  :deep(.el-radio-button.is-active .el-radio-button__inner) {
    background: #fff !important;
    color: var(--el-color-primary) !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
  }

  :deep(.el-radio-button__inner:hover) {
    color: var(--el-color-primary);
  }
}

.config-panel__btn {
  flex-shrink: 0;
  border-radius: 4px;
}

.config-panel__btn-wrap {
  display: inline-block;
  line-height: 0;
  vertical-align: middle;
}

.results-module__hint {
  border: 1px solid rgba(64, 158, 255, 0.35);
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
  margin: 0 0 12px;
  font-size: 13px;
  color: $text-muted;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 10px;
  border-radius: 0px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
}

.stat-cards--inspect .stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px solid $border-light;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.stat-card--plain .stat-card-body {
  width: 100%;
}

.stat-card--tone-ok .stat-card-value.num {
  color: #52c41a;
}

.stat-card--tone-warn .stat-card-value.num {
  color: #faad14;
}

.stat-card--tone-bad .stat-card-value.num {
  color: #ff4d4f;
}

.stat-card--overall {
  &.is-ok {
    border-color: rgba(82, 196, 26, 0.35);
    background: #f6ffed;
  }

  &.is-warn {
    border-color: rgba(250, 173, 20, 0.4);
    background: #fffbe6;
  }

  &.is-bad {
    border-color: rgba(255, 77, 79, 0.45);
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
}

.stat-card-label {
  font-size: 12px;
  color: $text-muted;
  margin-bottom: 6px;
}

.stat-card-value {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;

  &.num {
    font-size: 22px;
    font-weight: 700;
  }
}

.stat-card-value--emphasis {
  font-size: 18px;

  .is-bad & {
    color: #ff4d4f;
  }

  .is-warn & {
    color: #faad14;
  }

  .is-ok & {
    color: #52c41a;
  }
}

.stat-suffix {
  font-size: 14px;
  font-weight: 600;
  margin-left: 2px;
  color: $text-secondary;
}

/* 检测对象条（示意图灰条） */
.inspect-target-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  padding: 10px 14px;
  margin-bottom: 0;
  background: #f5f5f5;
  border: 1px solid $border-light;
  border-radius: 4px 4px 0 0;
  font-size: 13px;
}

.inspect-target-bar__left {
  color: $text-secondary;
  font-weight: 500;
}

.inspect-target-bar__right {
  font-weight: 600;

  &--ok {
    color: #52c41a;
  }

  &--warn {
    color: #faad14;
  }

  &--bad {
    color: #ff4d4f;
  }
}

/* 明细列表外框（与检测对象条连成一块） */
.inspect-detail-panel {
  border: 1px solid $border-light;
  border-top: none;
  border-radius: 0 0 8px 8px;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  margin-bottom: 4px;

  &--error {
    border-color: rgba(255, 77, 79, 0.45);
    box-shadow: 0 0 0 1px rgba(255, 77, 79, 0.1);
  }
}

.inspect-cat {
  border-bottom: 1px solid $border-light;

  &:last-child {
    border-bottom: none;
  }
}

.inspect-cat__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #fafafa;
  cursor: pointer;
  user-select: none;

  &:hover {
    background: #f5f5f5;
  }
}

.inspect-cat__title {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

.inspect-cat__badge {
  font-size: 12px;
  color: $text-muted;
  padding: 2px 8px;
  background: #eee;
  border-radius: 4px;
}

.inspect-cat__chevron {
  margin-left: auto;
  color: $text-muted;
  font-size: 16px;
}

.inspect-cat__body {
  padding: 0 14px 8px;
}

.inspect-result-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid $border-light;

  &:first-child {
    border-top: none;
  }
}

.inspect-result-row__icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;

  &--success {
    background: #52c41a;
    color: #fff;
  }

  &--warning {
    background: #faad14;
    color: #fff;
  }

  &--danger {
    background: #ff4d4f;
    color: #fff;
  }
}

.inspect-result-row__main {
  flex: 1;
  min-width: 0;
}

.inspect-result-row__name {
  font-size: 14px;
  font-weight: 500;
  color: $text-primary;
  margin-bottom: 6px;
  line-height: 1.4;
}

.inspect-result-row__meta {
  font-size: 12px;
  color: $text-muted;
  line-height: 1.6;

  & + & {
    margin-top: 2px;
  }
}

.inspect-result-row__status {
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
  margin-top: 2px;

  &--success {
    color: #52c41a;
  }

  &--warning {
    color: #faad14;
  }

  &--danger {
    color: #ff4d4f;
  }
}

</style>
