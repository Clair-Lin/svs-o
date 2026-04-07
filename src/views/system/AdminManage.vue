<template>
  <div class="admin-manage">
    <div class="page-card">
      <div class="card-title">管理员管理</div>

      <div class="action-bar">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加管理员
        </el-button>
      </div>

      <el-table :data="adminList" border stripe>
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="roleTagType(row)">
              {{ row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="lastLogin" label="最后登录" width="160" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span class="status-tag" :class="statusRowClass(row)">
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" link>编辑</el-button>
            <el-button type="primary" size="small" link>重置密码</el-button>
            <el-button
              type="danger"
              size="small"
              link
              :disabled="isSuperAdmin(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const ROLE_SUPER = '超级管理员'
const STATUS_OK = '正常'

const adminList = ref([
  { username: 'svssysadmin', role: ROLE_SUPER, email: 'admin@example.com', lastLogin: '2024-03-15 10:00:00', status: STATUS_OK },
  { username: 'operator1', role: '操作员', email: 'operator1@example.com', lastLogin: '2024-03-14 16:30:00', status: STATUS_OK },
  { username: 'auditor1', role: '审计员', email: 'auditor1@example.com', lastLogin: '2024-03-14 09:00:00', status: STATUS_OK }
])

function roleTagType (row) {
  return row.role === ROLE_SUPER ? 'danger' : 'primary'
}

function statusRowClass (row) {
  return row.status === STATUS_OK ? 'success' : 'danger'
}

function isSuperAdmin (row) {
  return row.role === ROLE_SUPER
}

const handleAdd = () => {
  // 添加管理员
}
</script>

<style lang="scss" scoped">
.action-bar {
  margin-bottom: 16px;
}
</style>
