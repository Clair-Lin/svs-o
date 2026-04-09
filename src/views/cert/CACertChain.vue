<template>
  <div class="ca-cert-chain">
    <div class="page-card">
      <div class="chain-toolbar">
        <el-button type="primary" link class="back-btn" @click="goBack">
          <el-icon class="back-icon"><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2 class="chain-title">CA-证书链</h2>
      </div>

      <el-table v-if="chainRows.length" :data="chainRows" border stripe>
        <el-table-column prop="serialNumber" label="证书SN" min-width="150" show-overflow-tooltip />
        <el-table-column prop="subjectDn" label="证书DN" min-width="220" show-overflow-tooltip />
        <el-table-column prop="issuerDn" label="签发者DN" min-width="220" show-overflow-tooltip />
        <el-table-column prop="notBefore" label="证书生效时间" width="175" align="center" />
        <el-table-column prop="notAfter" label="证书失效时间" width="175" align="center" />
        <el-table-column prop="algorithm" label="算法类型" width="140" align="center" />
      </el-table>
      <el-empty v-else description="未找到该 CA 的证书链数据" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

/** 与 CACert 列表一致，供直接打开 URL 时回退 */
const FALLBACK_CA_ROWS = {
  '1': {
    id: '1',
    caName: 'CA_TEST',
    description: 'CA_TEST',
    certLabel: 'C=CN,ST=GuangDong,O=Olym Tech Ltd,CN=Root CA',
    notBefore: '2023-06-01',
    notAfter: '2033-05-31'
  },
  '2': {
    id: '2',
    caName: 'SM2-CA',
    description: 'SM2',
    certLabel: 'C=CN,O=GMSSL,OU=PKI/SM2,CN=RootCA for Test',
    notBefore: '2022-01-15',
    notAfter: '2032-01-14'
  },
  '3': {
    id: '3',
    caName: 'RSA-CA',
    description: 'RSA',
    certLabel: 'C=CN,O=GMSSL,OU=PKI/RSA,CN=RootCA for Test',
    notBefore: '2022-01-15',
    notAfter: '2032-01-14'
  },
  '4': {
    id: '4',
    caName: 'ML-DSA_CA',
    description: '抗量子密码算法签发的CA根证',
    certLabel: 'C=CN,CN=root_ca_20260205165008',
    notBefore: '2026-02-05',
    notAfter: '2036-02-04'
  }
}

/** 由 id + DN 生成稳定 16 位十六进制串（原型演示） */
function serialForRow (row) {
  const str = `${row?.id || ''}|${row?.certLabel || ''}`
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const a = (h >>> 0).toString(16).padStart(8, '0')
  const b = ((h ^ 0x9e3779b9) >>> 0).toString(16).padStart(8, '0')
  return (a + b).slice(0, 16)
}

function inferAlgorithm (row) {
  const name = `${row?.caName || ''} ${row?.description || ''}`
  if (/ML-DSA|抗量子|量子/i.test(name)) return 'ML-DSA-44'
  if (/RSA/i.test(row?.caName || '')) return 'SHA256WithRSA'
  if (/SM2/i.test(row?.caName || '')) return 'SM3WithSM2'
  return 'SM3WithSM2'
}

function ymdToDemoDateTime (ymd, endOfDay) {
  if (!ymd) return '—'
  const t = endOfDay ? '23:59:59' : '00:00:00'
  return `${ymd} ${t}`
}

/** id=1 时首行示意与参考图一致（仍为该条 CA 的展示样例） */
function presetExtrasForId1 () {
  return {
    serialNumber: 'e479cbe7022ee9e3',
    notBefore: '2024-10-11 11:41:42',
    notAfter: '2027-08-01 11:41:42',
    algorithm: 'SM3WithSM2'
  }
}

function buildSingleRowChain (row) {
  const dn = row.certLabel || '—'
  return [
    {
      serialNumber: serialForRow(row),
      subjectDn: dn,
      issuerDn: dn,
      notBefore: ymdToDemoDateTime(row.notBefore, false),
      notAfter: ymdToDemoDateTime(row.notAfter, true),
      algorithm: inferAlgorithm(row)
    }
  ]
}

/** 多层级演示：自上而下为「下级 → 根」，根 DN 与当前行一致 */
function buildTwoTierSm2Style (row) {
  const rootDn = row.certLabel || '—'
  const subDn = rootDn.replace(/CN=[^,]+/, 'CN=Issuing CA')
  return [
    {
      serialNumber: serialForRow({ id: row.id + '-sub', certLabel: subDn }),
      subjectDn: subDn,
      issuerDn: rootDn,
      notBefore: ymdToDemoDateTime(row.notBefore, false),
      notAfter: ymdToDemoDateTime(row.notAfter, true),
      algorithm: 'SM3WithSM2'
    },
    {
      serialNumber: serialForRow(row),
      subjectDn: rootDn,
      issuerDn: rootDn,
      notBefore: ymdToDemoDateTime(row.notBefore, false),
      notAfter: ymdToDemoDateTime(row.notAfter, true),
      algorithm: 'SM3WithSM2'
    }
  ]
}

function buildTwoTierRsaStyle (row) {
  const rootDn = row.certLabel || '—'
  const subDn = rootDn.replace(/CN=[^,]+/, 'CN=Enterprise CA')
  return [
    {
      serialNumber: serialForRow({ id: row.id + '-sub', certLabel: subDn }),
      subjectDn: subDn,
      issuerDn: rootDn,
      notBefore: ymdToDemoDateTime(row.notBefore, false),
      notAfter: ymdToDemoDateTime(row.notAfter, true),
      algorithm: 'SHA256WithRSA'
    },
    {
      serialNumber: serialForRow(row),
      subjectDn: rootDn,
      issuerDn: rootDn,
      notBefore: ymdToDemoDateTime(row.notBefore, false),
      notAfter: ymdToDemoDateTime(row.notAfter, true),
      algorithm: 'SHA256WithRSA'
    }
  ]
}

function buildChainForCaRow (row) {
  if (!row) return []
  if (row.id === '1') {
    const p = presetExtrasForId1()
    const dn = row.certLabel || '—'
    return [
      {
        serialNumber: p.serialNumber,
        subjectDn: dn,
        issuerDn: dn,
        notBefore: p.notBefore,
        notAfter: p.notAfter,
        algorithm: p.algorithm
      }
    ]
  }
  if (row.id === '2') return buildTwoTierSm2Style(row)
  if (row.id === '3') return buildTwoTierRsaStyle(row)
  if (row.id === '4') {
    const single = buildSingleRowChain(row)
    single[0].algorithm = 'ML-DSA-44'
    return single
  }
  return buildSingleRowChain(row)
}

function resolveCaRow () {
  const id = String(route.params.id || '')
  const st = history.state?.caCertRow
  if (st && String(st.id) === id) return st
  return FALLBACK_CA_ROWS[id] || null
}

const chainRows = computed(() => {
  const row = resolveCaRow()
  return buildChainForCaRow(row)
})

function goBack () {
  router.push('/cert/ca')
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.ca-cert-chain {
  .chain-toolbar {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    margin-bottom: $spacing-md;
  }

  .back-btn {
    padding: 0;
    font-size: $font-size-base;
  }

  .back-icon {
    margin-right: 4px;
    vertical-align: middle;
  }

  .chain-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: $text-primary;
  }
}
</style>
