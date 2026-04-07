<template>
  <div class="network-config">
    <div class="page-card">
      <div class="card-title">网络配置</div>

      <el-form :model="networkForm" label-width="100px" style="max-width: 600px">
        <el-form-item label="接口">
          <el-select v-model="networkForm.interface" style="width: 100%">
            <el-option label="eth0 (管理口)" value="eth0" />
            <el-option label="eth1 (服务口)" value="eth1" />
          </el-select>
        </el-form-item>

        <el-form-item label="IP地址">
          <el-input v-model="networkForm.ip" placeholder="192.168.1.100" />
        </el-form-item>

        <el-form-item label="子网掩码">
          <el-input v-model="networkForm.mask" placeholder="255.255.255.0" />
        </el-form-item>

        <el-form-item label="网关">
          <el-input v-model="networkForm.gateway" placeholder="192.168.1.1" />
        </el-form-item>

        <el-form-item label="DNS服务器">
          <el-input v-model="networkForm.dns" placeholder="8.8.8.8" />
        </el-form-item>

        <el-form-item label="配置方式">
          <el-radio-group v-model="networkForm.dhcp">
            <el-radio :label="false">静态IP</el-radio>
            <el-radio :label="true">DHCP</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary">保存配置</el-button>
          <el-button>测试连接</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const networkForm = reactive({
  interface: 'eth0',
  ip: '192.168.1.100',
  mask: '255.255.255.0',
  gateway: '192.168.1.1',
  dns: '8.8.8.8',
  dhcp: false
})
</script>
