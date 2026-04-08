/**
 * 《通用密码服务接口规范》GM/T 0019-2023 — 生成密钥入参（与规范 / SDK 对齐示意）。
 * 数值型常量以设备头文件及后端约定为准。
 */

/** 密钥类型：仅 SM2 / RSA */
export const KEY_TYPE_OPTIONS_0019 = [
  { value: 'SM2', label: 'SM2' },
  { value: 'RSA', label: 'RSA' }
]

/** SM2：签名、密钥交换协议、加密 */
export const KEY_USAGE_OPTIONS_SM2_0019 = [
  { value: 'sm2_sign', label: '签名' },
  { value: 'sm2_kex', label: '密钥交换协议' },
  { value: 'sm2_enc', label: '加密' }
]

/** RSA：签名、密钥交换（加密） */
export const KEY_USAGE_OPTIONS_RSA_0019 = [
  { value: 'rsa_sign', label: '签名' },
  { value: 'rsa_kex', label: '密钥交换（加密）' }
]

/** uiExportFlag[in] */
export const EXPORT_FLAG_OPTIONS = [
  { value: 0, label: '不可导出' },
  { value: 1, label: '可导出' }
]

/** 各密钥类型允许的密钥长度（比特），对应 uiKeyBits 示意 */
export const KEY_LENGTHS_BY_TYPE_0019 = {
  SM2: [256],
  RSA: [2048]
}
