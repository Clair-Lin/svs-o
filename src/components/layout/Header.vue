<template>
  <div class="header">
    <div class="header-left">
      <el-icon
        class="menu-toggle"
        @click="$emit('toggle-sidebar')"
      >
        <Fold v-if="!collapsed" />
        <Expand v-else />
      </el-icon>
      <el-breadcrumb class="header-breadcrumb" separator="/">
        <el-breadcrumb-item
          v-for="(item, index) in breadcrumbItems"
          :key="index"
          :to="item.to"
        >
          {{ item.label }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="header-center">
      <span class="system-title">SVS电子签章服务器</span>
    </div>

    <div class="header-right">
      <el-tooltip content="全屏" placement="bottom">
        <el-icon class="header-icon" @click="toggleFullscreen">
          <FullScreen />
        </el-icon>
      </el-tooltip>

      <el-dropdown trigger="click">
        <div class="user-info">
          <el-avatar :size="32" class="user-avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
          <span class="username">svssysadmin</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <el-icon><User /></el-icon>
              个人信息
            </el-dropdown-item>
            <el-dropdown-item>
              <el-icon><Lock /></el-icon>
              修改密码
            </el-dropdown-item>
            <el-dropdown-item divided>
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { Fold, Expand, FullScreen, User, ArrowDown, Lock, SwitchButton } from '@element-plus/icons-vue'
import { breadcrumbItems } from '@/composables/pageBreadcrumb'

defineProps({
  collapsed: Boolean
})
defineEmits(['toggle-sidebar'])

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.header {
  height: $header-height;
  background: $header-bg;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  margin-right: 16px;
}

.menu-toggle {
  font-size: 20px;
  cursor: pointer;
  color: $text-secondary;

  &:hover {
    color: $primary-color;
  }
}

.header-breadcrumb {
  flex: 1;
  min-width: 0;
  font-size: $font-size-base;

  :deep(.el-breadcrumb__inner) {
    color: $text-primary;
    font-weight: 400;
  }

  :deep(.el-breadcrumb__inner.is-link:hover) {
    color: $primary-color;
  }

  :deep(.el-breadcrumb__separator) {
    color: $text-secondary;
  }
}

.header-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.system-title {
  font-size: $font-size-lg;
  font-weight: bold;
  color: $text-primary;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  font-size: 18px;
  cursor: pointer;
  color: $text-secondary;

  &:hover {
    color: $primary-color;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: $border-radius;

  &:hover {
    background: #f5f5f5;
  }
}

.user-avatar {
  background: $primary-color;
}

.username {
  color: $text-primary;
  font-size: $font-size-base;
}
</style>
