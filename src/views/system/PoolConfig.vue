<template>
  <div class="pool-config">
    <div class="page-card">
      <div class="card-title">连接池配置</div>

      <el-form :model="poolForm" label-width="120px" style="max-width: 600px">
        <el-form-item label="最小连接数">
          <el-input-number v-model="poolForm.minConnections" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="最大连接数">
          <el-input-number v-model="poolForm.maxConnections" :min="1" :max="500" />
        </el-form-item>
        <el-form-item label="连接超时时间">
          <el-input v-model="poolForm.timeout" style="width: 200px">
            <template #append>秒</template>
          </el-input>
        </el-form-item>
        <el-form-item label="空闲连接超时">
          <el-input v-model="poolForm.idleTimeout" style="width: 200px">
            <template #append>秒</template>
          </el-input>
        </el-form-item>
        <el-form-item label="最大等待时间">
          <el-input v-model="poolForm.maxWait" style="width: 200px">
            <template #append>秒</template>
          </el-input>
        </el-form-item>
        <el-form-item label="连接验证SQL">
          <el-input v-model="poolForm.validationQuery" placeholder="SELECT 1" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary">保存配置</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const poolForm = reactive({
  minConnections: 5,
  maxConnections: 50,
  timeout: 30,
  idleTimeout: 600,
  maxWait: 60,
  validationQuery: 'SELECT 1'
})
</script>
