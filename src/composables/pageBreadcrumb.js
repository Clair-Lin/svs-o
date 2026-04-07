import { ref } from 'vue'

/** 顶栏面包屑（侧栏折叠按钮右侧），由各页或路由 meta 写入 */
export const breadcrumbItems = ref([])

function normalize (items) {
  return items.map((x) =>
    typeof x === 'string' ? { label: x } : { label: x.label, to: x.to }
  )
}

/** 密钥管理、证书管理等页在 Tab 变化时更新完整路径 */
export function setPageBreadcrumbItems (items) {
  breadcrumbItems.value = normalize(items)
}

/** 路由切换后由 router.afterEach 调用 */
export function applyBreadcrumbFromRoute (to) {
  if (to.meta?.dynamicBreadcrumb) {
    breadcrumbItems.value = [{ label: to.meta.title || '页面' }]
    return
  }
  const bc = to.meta?.breadcrumb
  if (Array.isArray(bc) && bc.length) {
    breadcrumbItems.value = normalize(bc)
  } else {
    breadcrumbItems.value = [{ label: to.meta?.title || '首页' }]
  }
}
