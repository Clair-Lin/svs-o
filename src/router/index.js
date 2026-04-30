import { createRouter, createWebHashHistory } from 'vue-router'
import { applyBreadcrumbFromRoute } from '@/composables/pageBreadcrumb'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  // 监控功能：系统状态、资源与业务统计等统一展示（监控总览页）
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      title: '监控总览',
      breadcrumb: [{ label: '设备资源' }, { label: '监控总览' }]
    }
  },
  {
    path: '/detect',
    redirect: '/system/detect'
  },
  // 应用管理
  {
    path: '/application',
    name: 'Application',
    component: () => import('@/views/Application.vue'),
    meta: { title: '应用管理', breadcrumb: [{ label: '应用管理' }] }
  },
  // 签名验签服务 - 密钥管理：Tab 切换 GM/T 0029-2014（签名验签服务器）与 GM/T 0019-2023（通用密码服务接口）
  {
    path: '/key/manage',
    name: 'KeyManage',
    component: () => import('@/views/key/KeyManage.vue'),
    meta: { title: '密钥管理', dynamicBreadcrumb: true }
  },
  {
    path: '/key/manage/0029',
    redirect: { path: '/key/manage', query: { tab: '0029' } }
  },
  {
    path: '/key/manage/0019',
    redirect: { path: '/key/manage', query: { tab: '0019' } }
  },
  // 签名验签服务 - 证书管理（顶栏面包屑由页面 Tab 动态设置）
  {
    path: '/cert/manage',
    name: 'CertManage',
    component: () => import('@/views/cert/CertManage.vue'),
    meta: { title: '证书管理', dynamicBreadcrumb: true }
  },
  // 签名验签服务 - 用户证书管理
  {
    path: '/cert/user',
    name: 'UserCert',
    component: () => import('@/views/cert/UserCert.vue'),
    meta: {
      title: '用户证书管理',
      breadcrumb: [{ label: '签名验签服务' }, { label: '用户证书管理' }]
    }
  },
  // 签名验签服务 - CA根证管理
  {
    path: '/cert/ca',
    name: 'CACert',
    component: () => import('@/views/cert/CACert.vue'),
    meta: {
      title: 'CA根证管理',
      breadcrumb: [{ label: '签名验签服务' }, { label: 'CA根证管理' }]
    }
  },
  {
    path: '/cert/ca/chain/:id',
    name: 'CACertChain',
    component: () => import('@/views/cert/CACertChain.vue'),
    meta: {
      title: 'CA-证书链',
      breadcrumb: [
        { label: '签名验签服务' },
        { label: 'CA根证管理', to: '/cert/ca' },
        { label: 'CA-证书链' }
      ]
    }
  },
  // 系统管理 - 白名单配置（应用访问 IP，单一界面）
  {
    path: '/system/whitelist',
    name: 'WhitelistConfig',
    component: () => import('@/views/whitelist/WhitelistConfig.vue'),
    meta: {
      title: '白名单配置',
      breadcrumb: [{ label: '系统管理' }, { label: '白名单配置' }]
    }
  },
  {
    path: '/whitelist/ip',
    redirect: '/system/whitelist'
  },
  {
    path: '/whitelist/service',
    redirect: '/system/whitelist'
  },
  {
    path: '/system/whitelist/ip',
    redirect: '/system/whitelist'
  },
  {
    path: '/system/whitelist/service',
    redirect: '/system/whitelist'
  },
  // 系统管理
  {
    path: '/system/info',
    name: 'SystemInfo',
    component: () => import('@/views/system/SystemInfo.vue'),
    meta: {
      title: '系统信息',
      breadcrumb: [{ label: '系统管理' }, { label: '系统信息' }]
    }
  },
  {
    path: '/system/network',
    name: 'NetworkConfig',
    component: () => import('@/views/system/NetworkConfig.vue'),
    meta: {
      title: '网络配置',
      breadcrumb: [{ label: '系统管理' }, { label: '网络配置' }]
    }
  },
  {
    path: '/system/pool',
    name: 'PoolConfig',
    component: () => import('@/views/system/PoolConfig.vue'),
    meta: {
      title: '连接池配置',
      breadcrumb: [{ label: '系统管理' }, { label: '连接池配置' }]
    }
  },
  {
    path: '/system/admin',
    name: 'AdminManage',
    component: () => import('@/views/system/AdminManage.vue'),
    meta: {
      title: '管理员管理',
      breadcrumb: [{ label: '系统管理' }, { label: '管理员管理' }]
    }
  },
  {
    path: '/system/permission',
    name: 'Permission',
    component: () => import('@/views/system/Permission.vue'),
    meta: {
      title: '权限管理',
      breadcrumb: [{ label: '系统管理' }, { label: '权限管理' }]
    }
  },
  {
    path: '/system/ntp',
    name: 'NTPConfig',
    component: () => import('@/views/system/NTPConfig.vue'),
    meta: {
      title: 'NTP时间源管理',
      breadcrumb: [{ label: '系统管理' }, { label: 'NTP时间源管理' }]
    }
  },
  // 系统管理 - 一键检测：服务接口（证书/签名/验签）+ 加密卡 + 汇总
  {
    path: '/system/detect',
    name: 'Detect',
    component: () => import('@/views/Detect.vue'),
    meta: {
      title: '一键检测',
      breadcrumb: [
        { label: '系统管理', to: '/system/info' },
        { label: '一键检测' }
      ]
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.afterEach((to) => {
  applyBreadcrumbFromRoute(to)
})

export default router
