<template>
  <div class="service-manage">
    <div class="page-card">
      <div class="card-title">服务管理</div>

      <el-table :data="serviceList" border stripe>
        <el-table-column prop="name" label="服务名称" width="150" />
        <el-table-column prop="port" label="端口" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span class="status-tag" :class="row.status === '运行中' ? 'success' : 'danger'">
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="autoStart" label="开机启动" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.autoStart" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="uptime" label="运行时间" width="120" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === '运行中'"
              type="warning"
              size="small"
              link
            >
              停止
            </el-button>
            <el-button v-else type="success" size="small" link>
              启动
            </el-button>
            <el-button type="primary" size="small" link>
              重启
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const serviceList = ref([
  { name: '签名服务', port: 8080, status: '运行中', autoStart: true, uptime: '15天 8小时', description: 'XML/PDF签名验签服务' },
  { name: '加密服务', port: 8081, status: '运行中', autoStart: true, uptime: '15天 8小时', description: '加解密服务' },
  { name: '证书服务', port: 8082, status: '运行中', autoStart: true, uptime: '15天 8小时', description: '证书管理服务' },
  { name: '监控服务', port: 8083, status: '运行中', autoStart: true, uptime: '15天 8小时', description: 'SNMP监控服务' },
  { name: '管理服务', port: 443, status: '运行中', autoStart: true, uptime: '15天 8小时', description: 'Web管理界面' }
])
</script>
