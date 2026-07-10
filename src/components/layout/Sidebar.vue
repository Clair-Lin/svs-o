<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="sidebar-logo">
      <div class="brand-mark" aria-hidden="true">
        <span class="mark-stroke mark-blue"></span>
        <span class="mark-stroke mark-cyan"></span>
        <span class="mark-stroke mark-green"></span>
      </div>
      <div v-show="!collapsed" class="brand-copy">
        <div class="logo-text">签名验签服务器</div>
        <div class="version-text">系统版本：1.0</div>
      </div>
    </div>

    <el-menu
      :default-active="activeMenu"
      :collapse="collapsed"
      :collapse-transition="false"
      router
      class="sidebar-menu"
    >
      <el-menu-item index="/dashboard">
        <span class="menu-icon" aria-hidden="true">
          <svg viewBox="0 0 20 20" focusable="false">
            <path d="M3.5 6.3 10 3.4l6.5 2.9L10 9.2 3.5 6.3Z" />
            <path d="m3.5 10 6.5 3 6.5-3" />
            <path d="m3.5 13.7 6.5 3 6.5-3" />
          </svg>
        </span>
        <template #title>设备资源</template>
      </el-menu-item>

      <el-menu-item index="/application">
        <span class="menu-icon" aria-hidden="true">
          <svg viewBox="0 0 20 20" focusable="false">
            <path d="M4.2 8.6h11.6v7.9H4.2z" />
            <path d="M6.4 8.6V7a3.6 3.6 0 0 1 7.2 0v1.6" />
            <path d="M10 12.1v1.3" />
          </svg>
        </span>
        <template #title>应用管理</template>
      </el-menu-item>

      <el-sub-menu index="sign-service">
        <template #title>
          <span class="menu-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" focusable="false">
              <path d="M4.2 4h6.4M4.2 10h6.4M4.2 16h6.4" />
              <path d="M4.2 4v12" />
              <path d="M15.2 3.8h.1M15.2 9.8h.1M15.2 15.8h.1" />
            </svg>
          </span>
          <span>签名验签服务</span>
        </template>
        <el-menu-item index="/key/manage">密钥管理</el-menu-item>
        <el-menu-item index="/cert/manage">证书管理</el-menu-item>
        <el-menu-item index="/cert/user">用户证书管理</el-menu-item>
        <el-menu-item index="/cert/ca">CA根证管理</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="system">
        <template #title>
          <span class="menu-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" focusable="false" class="system-menu-svg">
              <path d="M3.8 4.8h8.3v7.1H3.8z" />
              <rect class="system-icon-mask" x="5.6" y="6.4" width="9.7" height="8.5" />
              <path d="M6.4 7.2h8.1v6.9H6.4z" />
              <path d="M13.7 12.4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
            </svg>
          </span>
          <span>系统管理</span>
        </template>
        <el-menu-item index="/system/info">系统信息</el-menu-item>
        <el-menu-item index="/system/network">网络配置</el-menu-item>
        <el-menu-item index="/system/pool">连接池配置</el-menu-item>
        <el-menu-item index="/system/admin">管理员管理</el-menu-item>
        <el-menu-item index="/system/permission">权限管理</el-menu-item>
        <el-menu-item index="/system/ntp">NTP时间源管理</el-menu-item>
        <el-menu-item index="/system/whitelist">白名单配置</el-menu-item>
        <el-menu-item index="/system/detect">一键检测</el-menu-item>
      </el-sub-menu>
    </el-menu>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineProps({
  collapsed: Boolean
})

const route = useRoute()
const activeMenu = computed(() => {
  if (route.path === '/dashboard') return ''
  return route.path.startsWith('/key/manage') ? '/key/manage' : route.path
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.sidebar {
  width: $sidebar-width;
  height: 100vh;
  background: $sidebar-bg;
  box-shadow: 4px 0 10px rgba(16, 35, 60, 0.18);
  overflow: hidden;
  transition: width $transition-duration;

  &.collapsed {
    width: $sidebar-collapsed-width;

    .sidebar-logo {
      justify-content: center;
      padding: 0;
    }

    .brand-mark {
      transform: scale(0.9);
    }
  }
}

.sidebar-logo {
  height: 82px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
}

.brand-mark {
  position: relative;
  width: 46px;
  height: 30px;
  flex: 0 0 46px;
}

.mark-stroke {
  position: absolute;
  bottom: 5px;
  width: 11px;
  height: 34px;
  border-radius: 999px;
  transform: rotate(45deg);
  box-shadow: 0 5px 12px rgba(37, 123, 255, 0.2);
}

.mark-blue {
  left: 5px;
  background: linear-gradient(180deg, #8d50ff 0%, #2d75ff 100%);
}

.mark-cyan {
  left: 20px;
  background: linear-gradient(180deg, #27b7ff 0%, #39e4ff 100%);
}

.mark-green {
  left: 35px;
  height: 23px;
  background: linear-gradient(180deg, #53e6a6 0%, #4bd2d5 100%);
}

.brand-copy {
  min-width: 0;
  color: #FFFFFFA6;
}

.logo-text {
  font-size: 16px;
  line-height: 22px;
  font-weight: 500;
  letter-spacing: 0;
  white-space: nowrap;
}

.version-text {
  margin-top: 14px;
  padding-left: 1px;
  font-size: 12px;
  line-height: 16px;
  color: #FFFFFFA6;
  white-space: nowrap;
}

:deep(.sidebar-menu) {
  --el-menu-bg-color: #162842;
  --el-menu-text-color: #FFFFFFA6;
  --el-menu-active-color: #ffffff;
  --el-menu-hover-bg-color: rgba(111, 163, 230, 0.12);
  border-right: 0;
  background: transparent;

  .el-menu-item,
  .el-sub-menu__title {
    height: 42px;
    line-height: 42px;
    padding: 0 18px !important;
    color: #FFFFFFA6;
    font-size: 14px;
    letter-spacing: 0;

    .menu-icon {
      width: 18px;
      height: 18px;
      margin-right: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFFA6;
      flex: 0 0 18px;
    }

    .menu-icon svg {
      width: 18px;
      height: 18px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.9;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .menu-icon .system-menu-svg {
      stroke-width: 1.65;
    }

    .menu-icon .system-menu-svg .system-icon-mask {
      fill: #162842;
      stroke: none;
    }

    .menu-icon .system-menu-svg path:last-child {
      fill: #162842;
      stroke-width: 1.65;
    }

    &:hover {
      color: #fff;
      background: rgba(111, 163, 230, 0.12) !important;

      .menu-icon {
        color: #d7ecff;
      }

      .menu-icon .system-menu-svg .system-icon-mask,
      .menu-icon .system-menu-svg path:last-child {
        fill: #223955;
      }
    }
  }

  .el-menu-item.is-active {
    color: #FFFFFF;
    background: #387ee8 !important;

    .menu-icon {
      color: #FFFFFF;
    }

    .menu-icon .system-menu-svg .system-icon-mask,
    .menu-icon .system-menu-svg path:last-child {
      fill: #387ee8;
    }
  }

  .el-sub-menu.is-active > .el-sub-menu__title {
    color: #FFFFFF;
    background: transparent !important;

    .menu-icon {
      color: #FFFFFF;
    }

    .menu-icon .system-menu-svg .system-icon-mask,
    .menu-icon .system-menu-svg path:last-child {
      fill: #162842;
    }

    &:hover {
      background: rgba(111, 163, 230, 0.12) !important;

      .menu-icon .system-menu-svg .system-icon-mask,
      .menu-icon .system-menu-svg path:last-child {
        fill: #223955;
      }
    }
  }

  .el-sub-menu .el-menu {
    background: #162842;
  }

  .el-sub-menu .el-menu-item {
    height: 36px;
    line-height: 36px;
    padding-left: 48px !important;
    background: transparent !important;
    font-size: 13px;
  }

  .el-sub-menu .el-menu-item.is-active {
    color: #FFFFFF;
    background: #387ee8 !important;
  }

  .el-sub-menu__icon-arrow {
    right: 18px;
    color: #86a9cc;
  }
}
</style>
