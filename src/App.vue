<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <Sidebar :collapsed="sidebarCollapsed" />

    <div class="main-container">
      <!-- 头部 -->
      <Header
        :collapsed="sidebarCollapsed"
        @toggle-sidebar="toggleSidebar"
      />

      <!-- 主内容区 -->
      <div class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'

const sidebarCollapsed = ref(false)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<style lang="scss" scoped>
</style>
