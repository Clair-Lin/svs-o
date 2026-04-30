<template>
  <div class="sidebar" :class="{ collapsed }">
    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="logo-icon">
        <el-icon :size="24"><Key /></el-icon>
      </div>
      <span v-show="!collapsed" class="logo-text">SVS</span>
    </div>

    <!-- 菜单 -->
    <el-menu
      :default-active="activeMenu"
      :default-openeds="['sign-service', 'system']"
      :collapse="collapsed"
      :collapse-transition="false"
      background-color="#001529"
      text-color="#ffffff"
      active-text-color="#ffffff"
      router
    >
      <!-- 监控功能 -->
      <el-menu-item index="/dashboard">
        <el-icon><Monitor /></el-icon>
        <template #title>设备资源</template>
      </el-menu-item>

      <!-- 应用管理 -->
      <!-- <el-menu-item index="/application">
        <el-icon><Grid /></el-icon>
        <template #title>应用管理</template>
      </el-menu-item> -->

      <!-- 签名验签服务 -->
      <el-sub-menu index="sign-service">
        <template #title>
          <el-icon><Edit /></el-icon>
          <span>签名验签服务</span>
        </template>
        <el-menu-item index="/key/manage">
          <template #title>密钥管理</template>
        </el-menu-item>
        <el-menu-item index="/cert/manage">证书管理</el-menu-item>
        <el-menu-item index="/cert/user">用户证书管理</el-menu-item>
        <el-menu-item index="/cert/ca">CA根证管理</el-menu-item>
      </el-sub-menu>

      <!-- 系统管理 -->
      <el-sub-menu index="system">
        <template #title>
          <el-icon><Tools /></el-icon>
          <span>系统管理</span>
        </template>
        <!-- <el-menu-item index="/system/info">系统信息</el-menu-item>
        <el-menu-item index="/system/network">网络配置</el-menu-item>
        <el-menu-item index="/system/pool">连接池配置</el-menu-item>
        <el-menu-item index="/system/admin">管理员管理</el-menu-item>
        <el-menu-item index="/system/permission">权限管理</el-menu-item>
        <el-menu-item index="/system/ntp">NTP时间源管理</el-menu-item> -->
        <el-menu-item index="/system/whitelist">白名单配置</el-menu-item>
        <el-menu-item index="/system/detect">一键检测</el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Key, Monitor, Grid, Edit, Tools
} from '@element-plus/icons-vue'

defineProps({
  collapsed: Boolean
})

const route = useRoute()
const activeMenu = computed(() =>
  route.path.startsWith('/key/manage') ? '/key/manage' : route.path
)
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.sidebar {
  width: $sidebar-width;
  height: 100vh;
  background: $sidebar-bg;
  transition: width $transition-duration;
  overflow: hidden;

  &.collapsed {
    width: $sidebar-collapsed-width;

    .sidebar-logo {
      padding: 0 20px;
    }
  }
}

.sidebar-logo {
  height: $header-height;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1890ff, #36cfc9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.logo-text {
  margin-left: 10px;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  white-space: nowrap;
}

:deep(.el-menu) {
  border-right: none;

  .el-menu-item {
    height: 40px;
    line-height: 40px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.08) !important;
    }

    &.is-active {
      background-color: $primary-color !important;
    }
  }

  .el-sub-menu {
    .el-sub-menu__title {
      height: 40px;
      line-height: 40px;
      color: #fff;

      .el-icon {
        color: #fff;
      }

      &:hover {
        background-color: rgba(255, 255, 255, 0.08) !important;
      }
    }

    .el-menu-item {
      height: 32px;
      line-height: 32px;
      padding-left: 50px !important;
      background: #000c17 !important;

      &:hover {
        background: rgba(255, 255, 255, 0.08) !important;
      }

      &.is-active {
        background: $primary-color !important;
      }
    }
  }
}
</style>
