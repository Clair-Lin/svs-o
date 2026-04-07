<template>
  <div class="application">
    <div class="page-card">
      <div class="card-title">应用管理</div>

      <div class="action-bar">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加应用
        </el-button>
      </div>

      <el-table :data="appList" border stripe>
        <el-table-column prop="name" label="应用名称" width="150" />
        <el-table-column prop="appId" label="应用ID" width="200" />
        <el-table-column prop="ip" label="IP地址" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span class="status-tag" :class="row.status === '在线' ? 'success' : 'danger'">
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作" width="200">
          <template #default>
            <el-button type="primary" size="small" link>编辑</el-button>
            <el-button type="primary" size="small" link>配置</el-button>
            <el-button type="danger" size="small" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="50"
          :page-sizes="[10, 20, 50]"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const appList = ref([
  { name: '业务系统A', appId: 'APP001', ip: '192.168.1.10', status: '在线', createTime: '2024-01-15 10:00:00', description: '核心业务系统' },
  { name: '业务系统B', appId: 'APP002', ip: '192.168.1.11', status: '在线', createTime: '2024-02-20 14:30:00', description: '辅助业务系统' },
  { name: '测试系统', appId: 'APP003', ip: '192.168.1.100', status: '离线', createTime: '2024-03-01 09:00:00', description: '测试环境' }
])

const handleAdd = () => {
  // 添加应用
}
</script>

<style lang="scss" scoped>
.action-bar {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
