<template>
  <div class="ntp-config">
    <div class="page-card">
      <div class="card-title">NTP时间源管理</div>

      <div class="action-bar">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加时间源
        </el-button>
        <el-button @click="handleSync">
          <el-icon><Refresh /></el-icon>
          立即同步
        </el-button>
      </div>

      <el-table :data="ntpList" border stripe>
        <el-table-column prop="name" label="时间源名称" width="150" />
        <el-table-column prop="server" label="服务器地址" width="200" />
        <el-table-column prop="priority" label="优先级" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span class="status-tag" :class="row.status === '可用' ? 'success' : 'danger'">
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="lastSync" label="最后同步时间" width="160" />
        <el-table-column prop="delay" label="延迟" width="100" />
        <el-table-column label="操作" width="150">
          <template #default>
            <el-button type="primary" size="small" link>编辑</el-button>
            <el-button type="danger" size="small" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="current-time">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="当前系统时间">{{ systemTime }}</el-descriptions-item>
          <el-descriptions-item label="同步状态">
            <span class="status-tag success">已同步</span>
          </el-descriptions-item>
          <el-descriptions-item label="使用的时间源">{{ currentTimeSource }}</el-descriptions-item>
          <el-descriptions-item label="时区">{{ timezone }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <!-- 添加时间源对话框 -->
    <el-dialog v-model="dialogVisible" title="添加NTP时间源" width="500px">
      <el-form :model="ntpForm" label-width="100px">
        <el-form-item label="时间源名称">
          <el-input v-model="ntpForm.name" placeholder="例如: 阿里云NTP" />
        </el-form-item>
        <el-form-item label="服务器地址">
          <el-input v-model="ntpForm.server" placeholder="例如: ntp.aliyun.com" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-input-number v-model="ntpForm.priority" :min="1" :max="10" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Plus, Refresh } from '@element-plus/icons-vue'

const dialogVisible = ref(false)
const systemTime = ref('2024-03-15 14:30:25')
const currentTimeSource = ref('阿里云NTP')
const timezone = ref('Asia/Shanghai (UTC+8)')

const ntpList = ref([
  { name: '阿里云NTP', server: 'ntp.aliyun.com', priority: 1, status: '可用', lastSync: '2024-03-15 14:30:00', delay: '15ms' },
  { name: '腾讯云NTP', server: 'ntp.tencent.com', priority: 2, status: '可用', lastSync: '2024-03-15 14:29:00', delay: '18ms' },
  { name: '国家授时中心', server: 'ntp.ntsc.ac.cn', priority: 3, status: '不可用', lastSync: '2024-03-15 12:00:00', delay: '-' }
])

const ntpForm = reactive({
  name: '',
  server: '',
  priority: 1
})

const handleAdd = () => {
  dialogVisible.value = true
}

const handleSync = () => {
  // 同步时间
}
</script>

<style lang="scss" scoped>
.action-bar {
  margin-bottom: 16px;
}

.current-time {
  margin-top: 24px;
}
</style>
