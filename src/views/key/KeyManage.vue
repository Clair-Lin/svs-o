<template>
  <div class="key-manage">
    <KeyManageSecurityModals ref="securityModalsRef" />
    <div class="page-card">
      <el-tabs v-model="activeTab" class="key-manage-page-tabs">
        <el-tab-pane :label="tabCopy['0029'].tabLabel" name="0029" lazy>
          <KeyManage0029Panel />
        </el-tab-pane>
        <el-tab-pane :label="tabCopy['0019'].tabLabel" name="0019" lazy>
          <KeyManage0019Panel />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, watchEffect, provide } from 'vue'
import { setPageBreadcrumbItems } from '@/composables/pageBreadcrumb'
import { useRoute, useRouter } from 'vue-router'
import KeyManage0029Panel from './KeyManage0029Panel.vue'
import KeyManage0019Panel from './KeyManage0019Panel.vue'
import KeyManageSecurityModals from './KeyManageSecurityModals.vue'
import { KEY_MANAGE_SECURITY_KEY } from './keyManageSecurityKey.js'

const route = useRoute()
const router = useRouter()
const activeTab = ref('0029')
const securityModalsRef = ref(null)
provide(KEY_MANAGE_SECURITY_KEY, securityModalsRef)

/** Tab 与面包屑：标准号 + 规范简称，与密标委公开名称一致 */
const tabCopy = {
  '0029': {
    tabLabel: '签名验签服务器密钥',
    breadcrumb: '签名验签服务器技术规范'
  },
  '0019': {
    tabLabel: '通用密码服务接口密钥',
    breadcrumb: '通用密码服务接口规范'
  }
}

function tabFromRoute () {
  const t = route.query.tab
  return t === '0019' ? '0019' : '0029'
}

onMounted(() => {
  activeTab.value = tabFromRoute()
})

watch(
  () => route.query.tab,
  () => {
    activeTab.value = tabFromRoute()
  }
)

watch(activeTab, (val) => {
  const cur = route.query.tab === '0019' ? '0019' : '0029'
  if (val === cur) return
  router.replace({
    path: '/key/manage',
    query: val === '0019' ? { tab: '0019' } : {}
  })
})

watchEffect(() => {
  setPageBreadcrumbItems([
    { label: '签名验签服务' },
    { label: '密钥管理' },
    { label: tabCopy[activeTab.value].breadcrumb }
  ])
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.key-manage-page-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }

  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
  }

  :deep(.el-tabs__item) {
    font-size: 15px;
    padding: 0 20px;
  }

  :deep(.el-tabs__item.is-active) {
    color: $primary-color;
    font-weight: 600;
  }

  :deep(.el-tabs__active-bar) {
    background-color: $primary-color;
  }

  :deep(.el-tabs__content) {
    padding-top: 16px;
  }
}
</style>
