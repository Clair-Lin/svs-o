<template>
  <div class="dashboard-home">
    <img class="dashboard-image" :src="dashboardImage" alt="首页" />
  </div>
</template>

<script setup>
import dashboardImage from '@/assets/企业微信截图_20260710162753.png'
</script>

<style lang="scss" scoped>
.dashboard-home {
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 70px);
  overflow: hidden;
}

.dashboard-image {
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 90px);
  display: block;
  object-fit: fill;
}
</style>
