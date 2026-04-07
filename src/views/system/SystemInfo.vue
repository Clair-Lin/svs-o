<template>
  <div class="system-info">
    <div class="page-card">
      <div class="card-title">系统信息</div>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="设备型号">SVS-2000</el-descriptions-item>
        <el-descriptions-item label="序列号">SVS20240301001</el-descriptions-item>
        <el-descriptions-item label="固件版本">1.7.1</el-descriptions-item>
        <el-descriptions-item label="内核版本">Linux 5.4.0</el-descriptions-item>
        <el-descriptions-item label="CPU">Intel Xeon E5-2680 v4 @ 2.40GHz</el-descriptions-item>
        <el-descriptions-item label="内存">32GB DDR4</el-descriptions-item>
        <el-descriptions-item label="硬盘">1TB SSD</el-descriptions-item>
        <el-descriptions-item label="网卡">4×千兆以太网</el-descriptions-item>
        <el-descriptions-item label="加密卡">HSM-2000</el-descriptions-item>
        <el-descriptions-item label="运行时间">15天 8小时 32分钟</el-descriptions-item>
      </el-descriptions>

      <div class="card-title" style="margin-top: 24px">网络信息</div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="管理IP">192.168.1.100</el-descriptions-item>
        <el-descriptions-item label="子网掩码">255.255.255.0</el-descriptions-item>
        <el-descriptions-item label="网关">192.168.1.1</el-descriptions-item>
        <el-descriptions-item label="DNS">8.8.8.8</el-descriptions-item>
        <el-descriptions-item label="MAC地址">00:1A:2B:3C:4D:5E</el-descriptions-item>
        <el-descriptions-item label="服务IP">192.168.1.101</el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup>
</script>
