<template>
  <div class="permission">
    <div class="page-card">
      <div class="card-title">权限管理</div>

      <div class="permission-content">
        <!-- 角色列表 -->
        <div class="role-section">
          <div class="section-header">
            <span>角色列表</span>
            <el-button type="primary" size="small">
              <el-icon><Plus /></el-icon>
              添加角色
            </el-button>
          </div>
          <el-table :data="roleList" border stripe highlight-current-row @current-change="handleRoleChange">
            <el-table-column prop="name" label="角色名称" />
            <el-table-column prop="description" label="描述" />
            <el-table-column label="操作" width="150">
              <template #default>
                <el-button type="primary" size="small" link>编辑</el-button>
                <el-button type="danger" size="small" link>删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 权限配置 -->
        <div class="perm-section">
          <div class="section-header">
            <span>权限配置 - {{ currentRole?.name || '请选择角色' }}</span>
          </div>
          <el-tree
            ref="treeRef"
            :data="permissionTree"
            show-checkbox
            node-key="id"
            :default-checked-keys="checkedPermissions"
            :props="{ label: 'name', children: 'children' }"
          />
          <div class="perm-actions">
            <el-button type="primary">保存权限</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const treeRef = ref(null)
const currentRole = ref(null)
const checkedPermissions = ref([])

const roleList = ref([
  { id: 1, name: '超级管理员', description: '拥有所有权限' },
  { id: 2, name: '操作员', description: '日常操作权限' },
  { id: 3, name: '审计员', description: '审计查看权限' }
])

const permissionTree = ref([
  {
    id: 1,
    name: '设备资源',
    children: [{ id: 11, name: '查看' }]
  },
  {
    id: 2,
    name: '签名验签服务',
    children: [
      { id: 21, name: '密钥管理' },
      { id: 22, name: '证书管理' },
      { id: 23, name: '用户证书管理' },
      { id: 24, name: 'CA根证管理' }
    ]
  },
  {
    id: 3,
    name: '系统管理',
    children: [
      { id: 31, name: '系统信息' },
      { id: 32, name: '网络配置' },
      { id: 34, name: '管理员管理' }
    ]
  }
])

const handleRoleChange = (row) => {
  currentRole.value = row
  // 根据角色加载权限
  if (row?.id === 1) {
    checkedPermissions.value = [11, 21, 22, 23, 24, 31, 32, 34]
  } else if (row?.id === 2) {
    checkedPermissions.value = [11, 21, 22]
  } else {
    checkedPermissions.value = [11]
  }
}
</script>

<style lang="scss" scoped>
.permission-content {
  display: flex;
  gap: 24px;
}

.role-section {
  flex: 1;
}

.perm-section {
  flex: 1;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-weight: bold;
  font-size: 16px;
}

.perm-actions {
  margin-top: 16px;
}
</style>
