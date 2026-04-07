/**
 * 《通用密码服务接口规范》GM/T 0019-2023 — 生成密钥入参（与规范 / SDK 对齐示意）。
 * 数值型常量以设备头文件及后端约定为准。
 */

/** 密钥类型：仅 SM2 / RSA */
export const KEY_TYPE_OPTIONS_0019 = [
  { value: 'SM2', label: 'SM2' },
  { value: 'RSA', label: 'RSA' }
]

/** 密钥用途（界面取值 1–3） */
export const KEY_USAGE_OPTIONS_0019 = [
  { value: 1, label: '加密' },
  { value: 2, label: '签名' },
  { value: 3, label: '密钥交换' }
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
