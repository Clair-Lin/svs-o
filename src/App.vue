<template>
  <router-view v-if="isStandalonePage" v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>

  <div v-else class="layout-container">
    <Sidebar :collapsed="sidebarCollapsed" />

    <div class="main-container">
      <Header
        :collapsed="sidebarCollapsed"
        @toggle-sidebar="toggleSidebar"
      />

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
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'

const sidebarCollapsed = ref(false)
const route = useRoute()
const isStandalonePage = computed(() => route.meta.standalone === true)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<style lang="scss" scoped>
</style>
