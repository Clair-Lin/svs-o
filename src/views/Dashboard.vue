<template>
  <div class="dashboard">
    <!-- <div class="page-card monitor-intro">
      <div class="card-title">监控总览</div>
      <p class="intro-text">
        系统状态、资源与业务统计在同一页面展示；设备基本信息内嵌网络状态（端口与网口流量），便于运维一站式查看。
      </p>
    </div> -->

    <h3 class="section-heading">系统状态与资源</h3>
    <!-- 第一行：设备基本信息 | 网络状态 -->
    <div class="card-grid card-grid--device-row">
      <div class="page-card device-basic-card">
        <div class="card-title">设备基本信息</div>
        <div class="device-basic-body">
          <div class="basic-field">
            <span class="field-label">健康状态</span>
            <span class="status-tag success">{{ deviceBasic.health }}</span>
          </div>
          <div class="basic-field">
            <span class="field-label">CPU型号</span>
            <span class="field-value">{{ deviceBasic.cpuModel }}</span>
          </div>
          <div class="basic-field">
            <span class="field-label">CPU核数</span>
            <span class="field-value">{{ deviceBasic.cpuCores }}</span>
          </div>
        </div>
      </div>

      <div class="page-card network-status-card">
        <div class="card-title">网络状态</div>
        <div class="network-status-body">
          <div class="port-status-line">
            <span class="port-item">
              <span class="field-label">管理端口</span>
              <span class="port-num">{{ networkPorts.management.port }}</span>
              <span class="status-tag success">{{ networkPorts.management.status }}</span>
            </span>
            <span class="port-item">
              <span class="field-label">服务端口</span>
              <span class="port-num">{{ networkPorts.service.port }}</span>
              <span class="status-tag success">{{ networkPorts.service.status }}</span>
            </span>
          </div>
          <div class="nic-list-caption">网口列表</div>
          <el-table
            :data="nicTrafficList"
            size="small"
            border
            class="nic-table"
            :header-cell-style="{ background: '#fafafa', color: '#333' }"
          >
            <el-table-column prop="name" label="网口" width="100" />
            <el-table-column prop="ip" label="IP" width="160" />
            <el-table-column label="流量" min-width="220">
              <template #default="{ row }">
                <div class="traffic-cell">
                  <div>上行：{{ row.upRate }} Mb/s</div>
                  <div>下行：{{ row.downRate }} Mb/s</div>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 第二行：CPU / 内存 / 硬盘使用率 -->
    <div class="card-grid card-grid--usage-row">
      <div class="page-card usage-rate-card">
        <div class="card-title">CPU使用率</div>
        <div class="chart-container chart-container--cpu chart-container--usage-row">
          <div ref="cpuChart" class="donut-chart"></div>
        </div>
      </div>

      <div class="page-card usage-rate-card">
        <div class="card-title">内存使用率</div>
        <div class="usage-donut-layout usage-donut-layout--compact">
          <div ref="memoryChart" class="donut-chart donut-chart--with-side"></div>
          <div class="usage-detail">
            <div class="usage-detail-line">
              <span class="usage-detail-label">已使用</span>
              <span class="usage-detail-value">{{ memoryUsage.used }}</span>
            </div>
            <div class="usage-detail-line">
              <span class="usage-detail-label">可用/全部</span>
              <span class="usage-detail-value">{{ memoryUsage.available }} / {{ memoryUsage.total }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="page-card usage-rate-card">
        <div class="card-title">硬盘使用率</div>
        <div class="usage-donut-layout usage-donut-layout--compact">
          <div ref="diskChart" class="donut-chart donut-chart--with-side"></div>
          <div class="usage-detail">
            <div class="usage-detail-line">
              <span class="usage-detail-label">已使用</span>
              <span class="usage-detail-value">{{ diskUsage.used }}</span>
            </div>
            <div class="usage-detail-line">
              <span class="usage-detail-label">可用/全部</span>
              <span class="usage-detail-value">{{ diskUsage.available }} / {{ diskUsage.total }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <h3 class="section-heading">业务统计</h3>
    <div class="biz-stats-module">
      <div class="page-card biz-fixed-card">
        <div class="card-title">数据统计
        </div>
        <div class="biz-stat-strip">
          <div
            v-for="item in businessStatsFixed"
            :key="item.label"
            class="biz-stat-strip__cell"
          >
            <div class="biz-stat-strip__label-row">
              <span class="biz-stat-strip__label">{{ item.label }}</span>
              <el-tooltip
                v-if="item.showDetailTooltip"
                effect="dark"
                placement="top"
                popper-class="biz-detail-tooltip"
              >
                <el-icon class="biz-stat-strip__info-icon"><InfoFilled /></el-icon>
                <template #content>
                  <div
                    v-for="line in item.detailLines"
                    :key="line"
                    class="biz-detail-tooltip__line"
                  >
                    {{ line }}
                  </div>
                </template>
              </el-tooltip>
            </div>
            <div class="biz-stat-strip__value">{{ item.value }}</div>
            <div v-if="item.unit" class="biz-stat-strip__unit">{{ item.unit }}</div>
          </div>
        </div>
      </div>

      <div class="page-card biz-timed-card">
        <div class="card-title">业务数据
        </div>
        <div class="biz-time-toolbar biz-time-toolbar--embedded">
          <span class="biz-time-toolbar-label">快捷筛选</span>
          <el-button-group class="biz-preset-group">
            <el-button
              v-for="p in bizPresetOptions"
              :key="p.key"
              :type="bizTimePreset === p.key ? 'primary' : 'default'"
              @click="applyBizPreset(p.key)"
            >
              {{ p.label }}
            </el-button>
          </el-button-group>
          <el-date-picker
            v-model="bizDayMonth"
            type="month"
            size="small"
            value-format="YYYY-MM"
            placeholder="选择月份"
            class="biz-month-picker"
            @change="onBizDayMonthChange"
          />
          <el-date-picker
            v-model="bizDayRange"
            type="daterange"
            unlink-panels
            size="small"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            class="biz-date-range"
            @change="onBizDayRangeChange"
          />
        </div>
        <div class="biz-stat-strip">
          <div
            v-for="item in businessStatsTimed"
            :key="item.label"
            class="biz-stat-strip__cell"
          >
            <div class="biz-stat-strip__label-row">
              <span class="biz-stat-strip__label">{{ item.label }}</span>
              <span v-if="item.unit" class="biz-stat-strip__unit biz-stat-strip__unit--inline">（{{ item.unit }}）</span>
              <el-tooltip
                v-if="item.showDetailTooltip"
                effect="dark"
                placement="top"
                popper-class="biz-detail-tooltip"
              >
                <el-icon class="biz-stat-strip__info-icon"><InfoFilled /></el-icon>
                <template #content>
                  <div class="biz-detail-tooltip-grid">
                    <div
                      v-for="line in item.detailLinesP1"
                      :key="line"
                      class="biz-detail-tooltip__line"
                    >
                      {{ line }}
                    </div>
                    <div
                      v-for="line in item.detailLinesP7"
                      :key="line"
                      class="biz-detail-tooltip__line"
                    >
                      {{ line }}
                    </div>
                  </div>
                </template>
              </el-tooltip>
            </div>
            <div class="biz-stat-split">
              <div class="biz-stat-split__line biz-stat-split__line--total">总数：{{ item.totalValue }}</div>
              <div class="biz-stat-split__line biz-stat-split__line--success">成功：{{ item.successValue }}</div>
              <div class="biz-stat-split__line biz-stat-split__line--danger">失败：{{ item.failValue }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template v-if="showAlarmSection">
      <h3 class="section-heading">告警</h3>
      <div class="page-card alarm-section">
        <div class="card-title">
          <el-icon><Bell /></el-icon>
          系统告警
          <el-badge :value="alarmCount" type="danger" style="margin-left: 8px" />
        </div>
        <el-table :data="alarmList" size="small" border>
          <el-table-column prop="level" label="级别" width="80">
            <template #default="{ row }">
              <el-tag :type="row.level === '严重' ? 'danger' : 'warning'" size="small">
                {{ row.level }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="100" />
          <el-table-column prop="message" label="告警信息" />
          <el-table-column prop="time" label="发生时间" width="160" />
          <el-table-column label="操作" width="120">
            <template #default>
              <el-button type="primary" size="small" link>处理</el-button>
              <el-button type="primary" size="small" link>忽略</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { Bell, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const pad2 = (n) => String(n).padStart(2, '0')

const toYMD = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

const parseYMD = (s) => {
  const [y, m, day] = s.split('-').map(Number)
  return new Date(y, m - 1, day)
}

const addDays = (ymdStr, delta) => {
  const d = parseYMD(ymdStr)
  d.setDate(d.getDate() + delta)
  return toYMD(d)
}

const toYM = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`

const monthStartYMD = (ym) => `${ym}-01`

const monthEndYMD = (ym) => {
  const [y, m] = ym.split('-').map(Number)
  return toYMD(new Date(y, m, 0))
}

const daysInclusiveRange = (startStr, endStr) => {
  const a = parseYMD(startStr).getTime()
  const b = parseYMD(endStr).getTime()
  return Math.max(1, Math.round((b - a) / 86400000) + 1)
}

const formatInt = (n) => new Intl.NumberFormat('zh-CN').format(Math.max(0, Math.round(n)))

const bizPresetOptions = [
  { key: 'today', label: '今日' },
  { key: 'yesterday', label: '昨日' },
  { key: 'thisMonth', label: '本月' }
]

const bizTimePreset = ref('today')
const bizDayMonth = ref('')
const bizDayRange = ref([])

const todayStr = () => toYMD(new Date())
const todayMonthStr = () => toYM(new Date())

const applyBizPreset = (key) => {
  bizTimePreset.value = key
  const month = todayMonthStr()
  const today = todayStr()
  if (key === 'today') {
    bizDayMonth.value = month
    bizDayRange.value = [today, today]
    return
  }
  if (key === 'yesterday') {
    const y = addDays(today, -1)
    bizDayMonth.value = toYM(parseYMD(y))
    bizDayRange.value = [y, y]
    return
  }
  if (key === 'thisMonth') {
    bizDayMonth.value = month
    bizDayRange.value = [monthStartYMD(month), today]
  }
}

const onBizDayMonthChange = (val) => {
  if (!val) return
  bizDayMonth.value = val
  const start = monthStartYMD(val)
  const end = val === todayMonthStr() ? todayStr() : monthEndYMD(val)
  bizDayRange.value = [start, end]
  bizTimePreset.value = 'custom'
}

const onBizDayRangeChange = (val) => {
  if (!val || val.length !== 2 || !bizDayMonth.value) return
  const startMonth = toYM(parseYMD(val[0]))
  const endMonth = toYM(parseYMD(val[1]))
  if (startMonth !== bizDayMonth.value || endMonth !== bizDayMonth.value) {
    const start = monthStartYMD(bizDayMonth.value)
    const end = bizDayMonth.value === todayMonthStr() ? todayStr() : monthEndYMD(bizDayMonth.value)
    bizDayRange.value = [start, end]
    ElMessage.error('暂不支持跨月查询')
    return
  }
  bizTimePreset.value = 'custom'
}

const bizEffectiveRange = computed(() => {
  const r = bizDayRange.value
  if (!r || r.length !== 2) {
    const m = bizDayMonth.value || todayMonthStr()
    return [monthStartYMD(m), m === todayMonthStr() ? todayStr() : monthEndYMD(m)]
  }
  return r
})

const bizRangeDayCount = computed(() => {
  return daysInclusiveRange(bizEffectiveRange.value[0], bizEffectiveRange.value[1])
})

/** 单日且为今天 / 昨天（用于单位文案与昨日示例数据区分） */
const isBizRangeTodayOnly = computed(() => {
  const r = bizEffectiveRange.value
  if (!r || r.length !== 2) return false
  const [s, e] = r
  const t = todayStr()
  return s === e && s === t
})

const isBizRangeYesterdayOnly = computed(() => {
  const r = bizEffectiveRange.value
  if (!r || r.length !== 2) return false
  const [s, e] = r
  const y = addDays(todayStr(), -1)
  return s === e && s === y
})

const businessFixedBases = [
  {
    label: '证书数量',
    value: 156,
    unit: '张',
    detailLines: ['根证书：24 张', '签名证书：72 张', '用户证书：60 张']
  },
  { label: '应用实体数量', value: 12, unit: '个' },
  { label: '并发连接数', value: 42, unit: '路' }
]

const businessStatsFixed = computed(() =>
  businessFixedBases.map((row) => ({
    label: row.label,
    value: formatInt(row.value),
    unit: row.unit,
    detailLines: row.detailLines || [],
    showDetailTooltip: Array.isArray(row.detailLines) && row.detailLines.length > 0
  }))
)

/**
 * 按日基准（示意），乘以所选区间天数。
 * 「昨天」与「今天」同为 1 天时，用 yesterdayScale 区分示例量，避免切换无变化。
 */
const businessTimedBases = [
  {
    label: '签名业务',
    successPerDay: 44880,
    failPerDay: 350,
    yesterdayScale: 0.91,
    detail: {
      p1SignSuccess: 28200,
      p1SignFail: 180,
      p1VerifySuccess: 27900,
      p1VerifyFail: 120,
      p7SignSuccess: 16680,
      p7SignFail: 170,
      p7VerifySuccess: 16720,
      p7VerifyFail: 150
    }
  },
  {
    label: '验签业务',
    successPerDay: 44620,
    failPerDay: 270,
    yesterdayScale: 0.935,
    detail: {
      p1SignSuccess: 28100,
      p1SignFail: 130,
      p1VerifySuccess: 27700,
      p1VerifyFail: 90,
      p7SignSuccess: 16520,
      p7SignFail: 140,
      p7VerifySuccess: 16920,
      p7VerifyFail: 180
    }
  },
  {
    label: '制作信封',
    successPerDay: 1168,
    failPerDay: 32,
    yesterdayScale: 0.88
  },
  {
    label: '解信封',
    successPerDay: 1152,
    failPerDay: 28,
    yesterdayScale: 0.9
  }
]

const bizTimedUnitLabel = computed(() => {
  return '次'
})

const businessStatsTimed = computed(() => {
  const days = bizRangeDayCount.value
  const yOnly = isBizRangeYesterdayOnly.value
  const unit = bizTimedUnitLabel.value
  return businessTimedBases.map((row) => {
    const scale = days === 1 && yOnly ? row.yesterdayScale : 1
    const d = row.detail
    const detailLinesP1 =
      row.label === '签名业务' && d
        ? [
            `P1 签名成功数量：${formatInt(d.p1SignSuccess * days * scale)}`,
            `P1 签名失败数量：${formatInt(d.p1SignFail * days * scale)}`
          ]
        : row.label === '验签业务' && d
          ? [
              `P1 验签成功数量：${formatInt(d.p1VerifySuccess * days * scale)}`,
              `P1 验签失败数量：${formatInt(d.p1VerifyFail * days * scale)}`
            ]
          : []
    const detailLinesP7 =
      row.label === '签名业务' && d
        ? [
            `P7 签名成功数量：${formatInt(d.p7SignSuccess * days * scale)}`,
            `P7 签名失败数量：${formatInt(d.p7SignFail * days * scale)}`
          ]
        : row.label === '验签业务' && d
          ? [
              `P7 验签成功数量：${formatInt(d.p7VerifySuccess * days * scale)}`,
              `P7 验签失败数量：${formatInt(d.p7VerifyFail * days * scale)}`
            ]
          : []
    const showDetailTooltip = detailLinesP1.length > 0 || detailLinesP7.length > 0
    return {
      label: row.label,
      successValue: formatInt(row.successPerDay * days * scale),
      failValue: formatInt(row.failPerDay * days * scale),
      totalValue: formatInt((row.successPerDay + row.failPerDay) * days * scale),
      detailLinesP1,
      detailLinesP7,
      showDetailTooltip,
      unit
    }
  })
})

/** 暂不需要告警模块时设为 false，需要展示时改为 true */
const showAlarmSection = ref(false)

const cpuChart = ref(null)
const memoryChart = ref(null)
const diskChart = ref(null)
const alarmCount = ref(2)

let cpuInstance = null
let memoryInstance = null
let diskInstance = null

const deviceBasic = ref({
  health: '正常',
  cpuModel: 'Intel(R) Xeon(R) CPU E5-2650 v4 @ 2.20GHz',
  cpuCores: '物理CPU核数: 1 / 逻辑CPU核数: 4'
})

const networkPorts = ref({
  management: { port: '9054', status: '正常' },
  service: { port: '1555', status: '正常' }
})

/** 与示意图一致：网口、IP、上下行流量（Mb/s） */
const nicTrafficList = ref([
  { name: 'lo', ip: '127.0.0.1', upRate: '312.53', downRate: '312.53' },
  { name: 'eth0', ip: '192.168.137.173', upRate: '373.85', downRate: '32.40' }
])

const alarmList = ref([
  { level: '警告', type: '证书', message: '证书 CN=张三 将于7天后过期', time: '2026-04-07 10:30:00' },
  { level: '警告', type: '资源', message: '内存使用率超过80%阈值', time: '2026-04-07 09:15:00' }
])

/** 与设备资源示意图一致的示例数据 */
const cpuUsagePercent = 6.7
const memoryUsage = ref({
  percent: 56.71,
  used: '4.29G',
  available: '3.28G',
  total: '7.57G'
})
const diskUsage = ref({
  percent: 13.44,
  used: '8.22G',
  available: '52.97G',
  total: '61.19G'
})

const DONUT_ACTIVE = '#1890ff'
const DONUT_TRACK = '#f0f0f0'

const createDonutOption = (percent, decimals) => {
  const used = Number(percent)
  const rest = Math.max(0, 100 - used)
  const labelText = `${used.toFixed(decimals)}%`
  return {
    animationDuration: 400,
    tooltip: { show: false },
    series: [
      {
        type: 'pie',
        radius: ['58%', '78%'],
        center: ['50%', '50%'],
        startAngle: 90,
        clockwise: true,
        avoidLabelOverlap: false,
        itemStyle: { borderWidth: 0 },
        label: {
          show: true,
          position: 'center',
          formatter: labelText,
          fontSize: 22,
          fontWeight: 'bold',
          color: '#333'
        },
        labelLine: { show: false },
        emphasis: {
          scale: false,
          disabled: true
        },
        data: [
          {
            value: used,
            name: '已使用',
            itemStyle: { color: DONUT_ACTIVE }
          },
          {
            value: rest,
            name: '剩余',
            itemStyle: { color: DONUT_TRACK },
            tooltip: { show: false }
          }
        ]
      }
    ]
  }
}

const initCharts = () => {
  cpuInstance = echarts.init(cpuChart.value)
  memoryInstance = echarts.init(memoryChart.value)
  diskInstance = echarts.init(diskChart.value)

  cpuInstance.setOption(createDonutOption(cpuUsagePercent, 1))
  memoryInstance.setOption(createDonutOption(memoryUsage.value.percent, 2))
  diskInstance.setOption(createDonutOption(diskUsage.value.percent, 2))
}

const handleResize = () => {
  cpuInstance?.resize()
  memoryInstance?.resize()
  diskInstance?.resize()
}

onMounted(() => {
  applyBizPreset('today')
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  cpuInstance?.dispose()
  memoryInstance?.dispose()
  diskInstance?.dispose()
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.dashboard {
  padding: 0;
}

.monitor-intro {
  margin-bottom: $spacing-md;

  .intro-text {
    margin: 0;
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.6;
  }
}

.section-heading {
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
  margin: $spacing-md 0 12px;
  padding-left: 8px;
  border-left: 3px solid $primary-color;
}

.biz-stats-module {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.biz-time-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  padding: 12px 14px;
  background: $card-bg;
  border: 1px solid $border-light;
  border-radius: 4px;
  box-shadow: $box-shadow;

  &--embedded {
    margin-top: -4px;
    margin-bottom: $spacing-md;
    padding: 0 0 $spacing-md;
    background: transparent;
    border: none;
    border-radius: 0;
    box-shadow: none;
    border-bottom: 1px solid $border-light;
  }
}

.biz-time-toolbar-label {
  font-size: $font-size-sm;
  font-weight: 600;
  color: $text-secondary;
  margin-right: 4px;
}

.biz-preset-group {
  flex-shrink: 0;
}

.biz-month-picker {
  width: 150px;
  max-width: 100%;
}

.biz-date-range {
  width: 220px;
  max-width: 100%;
}

.biz-date-range :deep(.el-range-editor.el-input__wrapper) {
  width: 100%;
}

.biz-fixed-card,
.biz-timed-card {
  margin-bottom: 0;
}

.biz-stat-strip {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  margin-top: 4px;
  padding: 4px 0 8px;
}

.biz-stat-strip__cell {
  flex: 1 1 0;
  min-width: 140px;
  text-align: center;
  padding: 12px 10px;
  box-sizing: border-box;

  &:not(:last-child) {
    border-right: 1px solid $border-light;
  }
}

.biz-stat-strip__label {
  font-size: 17px;
  color: $text-primary;
  line-height: 1.4;
}

.biz-stat-strip__label-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.biz-stat-strip__info-icon {
  color: #8c8c8c;
  font-size: 14px;
  cursor: pointer;
}

.biz-stat-strip__value{
  font-size: 18px;
  color:rgb(0, 125, 243);
  margin-top: 4px;
  line-height: 1.3;
} 

.biz-stat-strip__unit {
  font-size: 14px;
  color: $text-primary;
  margin-top: 6px;
  line-height: 1.3;
}

.biz-stat-strip__unit--inline {
  margin-top: 0;
}

.biz-stat-split {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: stretch;
  width: fit-content;
  margin: 0 auto;
}

.biz-stat-split__line {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
  text-align: left;
  min-width: 170px;

  &--success {
    color: $success-color;
  }

  &--danger {
    color: $danger-color;
  }

  &--total {
    color:rgb(0, 125, 243);
  }
}

.biz-detail-tooltip__line {
  line-height: 1.5;
  white-space: nowrap;
}

.biz-detail-tooltip-grid {
  display: grid;
  grid-template-columns: max-content max-content;
  gap: 0 18px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
  margin-bottom: $spacing-md;
}

.card-grid--device-row {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
  align-items: stretch;
}

.card-grid--usage-row {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.device-basic-card {
  .device-basic-body {
    padding-top: 4px;
  }

  .basic-field {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 14px;
    line-height: 1.5;
  }

  .field-label {
    flex-shrink: 0;
    width: 88px;
    font-weight: 600;
    color: $text-primary;
  }

  .field-value {
    flex: 1;
    color: $text-secondary;
    word-break: break-all;
  }
}

.network-status-card {
  .network-status-body {
    padding-top: 4px;
  }

  .field-label {
    font-weight: 600;
    color: $text-primary;
  }

  .port-status-line {
    display: flex;
    flex-wrap: wrap;
    gap: 20px 28px;
    margin-bottom: 14px;
    align-items: center;
  }

  .port-item {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .port-item .field-label {
    width: auto;
  }

  .port-num {
    font-weight: 500;
    color: $text-primary;
  }

  .nic-list-caption {
    font-size: $font-size-sm;
    color: $text-muted;
    margin-bottom: 8px;
  }

  .nic-table {
    width: 100%;
  }

  .traffic-cell {
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: 1.6;

    div + div {
      margin-top: 2px;
    }
  }
}

.usage-rate-card {
  min-width: 0;
}

.chart-container--cpu {
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container--usage-row {
  height: 200px;
  min-height: 180px;
}

.donut-chart {
  width: 100%;
  height: 100%;
  min-height: 160px;
}

.donut-chart--with-side {
  width: 200px;
  min-width: 200px;
  height: 200px;
  flex-shrink: 0;
}

.card-grid--usage-row .donut-chart--with-side {
  width: 150px;
  min-width: 140px;
  height: 150px;
  max-width: 100%;
}

.usage-donut-layout {
  display: flex;
  align-items: center;
  min-height: 200px;
  padding: 8px 0 4px;
}

.usage-donut-layout--compact {
  min-height: 180px;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 4px;
  padding: 6px 4px 4px;
}

.usage-donut-layout--compact .usage-detail {
  flex: 1 1 120px;
  min-width: 0;
  padding-left: 4px;
  gap: 10px;
}

.usage-detail {
  flex: 1;
  padding-left: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}

.usage-detail-line {
  font-size: $font-size-base;
  color: $text-primary;
  line-height: 1.5;
}

.usage-detail-label {
  color: $text-secondary;
  margin-right: 8px;
}

.usage-detail-value {
  font-weight: 500;
}

.alarm-section {
  margin-top: $spacing-md;

  .card-title {
    display: flex;
    align-items: center;
  }
}
</style>

