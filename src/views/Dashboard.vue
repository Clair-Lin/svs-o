<template>
  <div class="dashboard">
    <!-- <div class="page-card monitor-intro">
      <div class="card-title">监控总览</div>
      <p class="intro-text">
        系统状态、资源与业务统计在同一页面展示；设备基本信息内嵌网络状态（端口与网口流量），便于运维一站式查看。
      </p>
    </div> -->

    <h3 class="section-heading">系统状态与资源</h3>
    <!-- 第一行：设备基本信息 + CPU使用率 -->
    <div class="card-grid">
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

          <div class="network-embedded">
            <div class="network-embedded-title">网络状态</div>
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

      <div class="page-card">
        <div class="card-title">CPU使用率</div>
        <div class="chart-container chart-container--cpu">
          <div ref="cpuChart" class="donut-chart"></div>
        </div>
      </div>
    </div>

    <!-- 第二行：内存使用率 + 硬盘使用率（环形图 + 右侧容量说明） -->
    <div class="card-grid">
      <div class="page-card">
        <div class="card-title">内存使用率</div>
        <div class="usage-donut-layout">
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

      <div class="page-card">
        <div class="card-title">硬盘使用率</div>
        <div class="usage-donut-layout">
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
    <div class="page-card">
      <div class="card-title">业务指标（示例数据）</div>
      <div class="biz-stats-grid">
        <div v-for="item in businessStats" :key="item.label" class="biz-stat-item">
          <div class="biz-stat-label">{{ item.label }}</div>
          <div class="biz-stat-value">{{ item.value }}</div>
          <div v-if="item.unit" class="biz-stat-unit">{{ item.unit }}</div>
        </div>
      </div>
    </div>

    <h3 class="section-heading">服务与连接</h3>
    <div class="page-card service-status">
      <div class="card-title">服务状态</div>
      <el-table :data="serviceList" size="small" border>
        <el-table-column prop="name" label="服务名称" width="150" />
        <el-table-column prop="port" label="端口" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <span class="status-tag" :class="row.status === '运行中' ? 'success' : 'danger'">
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="connections" label="当前连接" width="100" />
        <el-table-column prop="totalRequests" label="总请求数" width="120" />
        <el-table-column prop="successRate" label="成功率" width="100">
          <template #default="{ row }">
            <el-progress
              :percentage="row.successRate"
              :stroke-width="10"
              :color="row.successRate > 95 ? '#52c41a' : '#faad14'"
            />
          </template>
        </el-table-column>
        <el-table-column prop="avgResponseTime" label="平均响应" width="100" />
        <el-table-column prop="uptime" label="运行时间" />
      </el-table>
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
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { Bell } from '@element-plus/icons-vue'

/** 暂不需要告警模块时设为 false，需要展示时改为 true */
const showAlarmSection = ref(false)

const cpuChart = ref(null)
const memoryChart = ref(null)
const diskChart = ref(null)
const alarmCount = ref(2)

let cpuInstance = null
let memoryInstance = null
let diskInstance = null

const totalServiceConnections = 42

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

const businessStats = ref([
  { label: '证书数量', value: '156', unit: '张' },
  { label: '用户数量', value: '89', unit: '人' },
  { label: '应用实体数量', value: '12', unit: '个' },
  { label: '并发连接数', value: String(totalServiceConnections), unit: '路' },
  { label: '签名业务', value: '45,230', unit: '次（今日）' },
  { label: '验签业务', value: '44,890', unit: '次（今日）' },
  { label: '制作信封', value: '1,200', unit: '次（今日）' },
  { label: '解信封', value: '1,180', unit: '次（今日）' }
])

const serviceList = ref([
  { name: '签名服务', port: '8080', status: '运行中', connections: 25, totalRequests: 125680, successRate: 99.8, avgResponseTime: '15ms', uptime: '15天 8小时' },
  { name: '加密服务', port: '8081', status: '运行中', connections: 12, totalRequests: 89520, successRate: 99.9, avgResponseTime: '12ms', uptime: '15天 8小时' },
  { name: '证书服务', port: '8082', status: '运行中', connections: 5, totalRequests: 32100, successRate: 100, avgResponseTime: '8ms', uptime: '15天 8小时' }
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

.biz-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.biz-stat-item {
  padding: 14px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  text-align: center;
}

.biz-stat-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.biz-stat-value {
  font-size: 22px;
  font-weight: 600;
  color: $text-primary;
}

.biz-stat-unit {
  font-size: 11px;
  color: $text-muted;
  margin-top: 4px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
  margin-bottom: $spacing-md;
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

  .network-embedded {
    margin-top: 20px;
    padding-top: 18px;
    border-top: 1px solid $border-light;
  }

  .network-embedded-title {
    font-weight: 600;
    font-size: $font-size-base;
    color: $text-primary;
    margin-bottom: 14px;
  }

  .port-status-line {
    display: flex;
    flex-wrap: wrap;
    gap: 28px 36px;
    margin-bottom: 16px;
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

.chart-container--cpu {
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
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

.usage-donut-layout {
  display: flex;
  align-items: center;
  min-height: 200px;
  padding: 8px 0 4px;
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

.service-status {
  margin-top: $spacing-md;
}

.alarm-section {
  margin-top: $spacing-md;

  .card-title {
    display: flex;
    align-items: center;
  }
}
</style>
