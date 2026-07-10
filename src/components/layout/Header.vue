<template>
  <header class="header">
    <div class="header-left">
      <el-button
        class="menu-toggle"
        text
        :icon="collapsed ? Expand : Fold"
        @click="$emit('toggle-sidebar')"
      />

      <nav class="header-breadcrumb" aria-label="面包屑导航">
        <template v-for="(item, index) in headerBreadcrumb" :key="`${item.label}-${index}`">
          <span
            class="breadcrumb-item"
            :class="{ 'is-current': index === headerBreadcrumb.length - 1 }"
          >
            {{ item.label }}
          </span>
          <span v-if="index < headerBreadcrumb.length - 1" class="breadcrumb-separator">/</span>
        </template>
      </nav>
    </div>

    <div class="header-right">
      <el-tooltip content="全屏" placement="bottom">
        <el-button class="header-action" text :icon="FullScreen" @click="toggleFullscreen" />
      </el-tooltip>

      <el-dropdown
        trigger="click"
        popper-class="user-dropdown-popper"
        @command="handleUserCommand"
      >
        <button class="user-info" type="button">
          <el-avatar :size="28" class="user-avatar">
            <img class="avatar-image" :src="avatarImage" alt="用户头像" />
          </el-avatar>
          <span class="username">svssysadmin</span>
          <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu class="user-dropdown-menu">
            <el-dropdown-item command="password">
              <el-icon><EditPen /></el-icon>
              修改密码
            </el-dropdown-item>
            <el-dropdown-item command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Fold, Expand, FullScreen, ArrowDown, EditPen, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { breadcrumbItems } from '@/composables/pageBreadcrumb'
import avatarImage from '@/assets/image.png'

defineProps({
  collapsed: Boolean
})
defineEmits(['toggle-sidebar'])

const route = useRoute()
const router = useRouter()

const headerBreadcrumb = computed(() => {
  if (route.path === '/dashboard') return [{ label: '首页' }]
  return breadcrumbItems.value.length ? breadcrumbItems.value : [{ label: '首页' }]
})

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

const handleUserCommand = (command) => {
  if (command === 'logout') {
    router.replace('/login')
    return
  }

  if (command === 'password') {
    ElMessage.info('修改密码功能暂未开放')
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
  padding: 0 12px 0 14px;
  border-bottom: 1px solid #e7ebf1;
  box-shadow: 0 2px 9px rgba(19, 35, 55, 0.12);
  position: relative;
  z-index: 10;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
}

.header-left {
  min-width: 0;
  gap: 14px;
}

.menu-toggle {
  width: 26px;
  height: 26px;
  padding: 0;
  color: #606f7f;

  :deep(.el-icon) {
    font-size: 17px;
  }

  &:hover {
    color: $primary-color;
    background: #f2f6fb;
  }
}

.header-breadcrumb {
  display: flex;
  align-items: center;
  min-width: 0;
  color: #111827;
  font-size: 14px;
  line-height: $header-height;
  white-space: nowrap;
}

.breadcrumb-item {
  overflow: hidden;
  max-width: 180px;
  text-overflow: ellipsis;
}

.breadcrumb-item:not(.is-current) {
  color: #111827;
  font-weight: 600;
}

.breadcrumb-item.is-current {
  color: #111827;
  font-weight: 500;
}

.breadcrumb-separator {
  margin: 0 20px;
  color: #c4cad3;
  font-weight: 400;
}

.header-right {
  gap: 12px;
}

.header-action {
  height: 28px;
  padding: 0 4px;
  color: #2f7bff;
  font-size: 13px;

  &::after {
    content: '全屏';
    margin-left: 4px;
    font-size: 12px;
  }

  &:hover {
    color: #1b63d8;
    background: #f3f7ff;
  }
}

.user-info {
  height: 38px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 2px 0 6px;
  color: #2f7bff;
  background: transparent;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
  font: inherit;

  &:hover {
    background: #f3f7ff;
  }
}

.user-avatar {
  background: #f7f8fa;
  box-shadow: 0 0 0 2px #eef2f7;
}

.avatar-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.username {
  max-width: 120px;
  overflow: hidden;
  color: #2f7bff;
  font-size: 13px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  color: #4a5563;
  font-size: 12px;
}
</style>

<style lang="scss">
.user-dropdown-popper {
  min-width: 114px !important;
  margin-top: -2px;
  border: 1px solid #e4e8ef;
  border-radius: 3px;
  box-shadow: 0 2px 8px rgba(16, 35, 60, 0.12);

  .el-popper__arrow::before {
    border-color: #e4e8ef;
  }

  .el-dropdown-menu {
    padding: 5px 0;
  }

  .el-dropdown-menu__item {
    height: 32px;
    padding: 0 18px;
    color: #333f4d;
    font-size: 13px;
    line-height: 32px;

    .el-icon {
      margin-right: 8px;
      color: #516273;
      font-size: 14px;
    }

    &:hover {
      color: #387ee8;
      background: #f3f7ff;

      .el-icon {
        color: #387ee8;
      }
    }
  }
}
</style>
