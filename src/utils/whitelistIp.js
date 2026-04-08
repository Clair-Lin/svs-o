/** IPv4 白名单：格式校验、CIDR 解析、区间重叠检测（原型前端逻辑） */

const IPV4 =
  /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/

export function isValidIPv4 (s) {
  if (typeof s !== 'string') return false
  return IPV4.test(s.trim())
}

export function ipToLong (ip) {
  const parts = ip.trim().split('.').map((x) => parseInt(x, 10))
  return (((parts[0] * 256 + parts[1]) * 256 + parts[2]) * 256 + parts[3]) >>> 0
}

export function longToIp (n) {
  const x = n >>> 0
  return [(x >>> 24) & 255, (x >>> 16) & 255, (x >>> 8) & 255, x & 255].join('.')
}

/**
 * @returns {{ start: number, end: number } | null}
 */
/** CIDR 前缀按产品约定：1~32（不含 /0） */
export function cidrToRange (cidrStr, { allowPrefixZero = true } = {}) {
  const s = cidrStr.trim()
  const i = s.indexOf('/')
  if (i < 0) return null
  const ipPart = s.slice(0, i).trim()
  const pre = parseInt(s.slice(i + 1), 10)
  const minPre = allowPrefixZero ? 0 : 1
  if (!isValidIPv4(ipPart) || Number.isNaN(pre) || pre < minPre || pre > 32) return null
  if (pre === 32) {
    const v = ipToLong(ipPart)
    return { start: v, end: v }
  }
  const hostBits = 32 - pre
  const mask = hostBits === 32 ? 0 : (0xffffffff << hostBits) >>> 0
  const ipNum = ipToLong(ipPart)
  const network = (ipNum & mask) >>> 0
  const broadcast = (network | (~mask >>> 0)) >>> 0
  return { start: network, end: broadcast }
}

export function isValidCIDR (s, opts) {
  return cidrToRange(s, opts) !== null
}

/**
 * 网段简写：如 192.168.1.*、192.168.*.*
 * @returns {{ start: number, end: number } | null}
 */
export function wildcardIpv4ToRange (s) {
  const parts = s.trim().split('.')
  if (parts.length !== 4) return null
  const minOct = []
  const maxOct = []
  for (const p of parts) {
    if (p === '*') {
      minOct.push(0)
      maxOct.push(255)
    } else if (/^\d{1,3}$/.test(p)) {
      const n = parseInt(p, 10)
      if (n < 0 || n > 255) return null
      minOct.push(n)
      maxOct.push(n)
    } else {
      return null
    }
  }
  return {
    start: ipToLong(minOct.join('.')),
    end: ipToLong(maxOct.join('.'))
  }
}

/**
 * 单条展示串 → 数值区间（单个 IP / CIDR / * 网段）
 */
export function segmentToRange (segment) {
  const s = (segment || '').trim()
  if (!s) return null
  if (s.includes('/')) {
    return cidrToRange(s, { allowPrefixZero: false })
  }
  if (s.includes('*')) {
    return wildcardIpv4ToRange(s)
  }
  if (isValidIPv4(s)) {
    const v = ipToLong(s)
    return { start: v, end: v }
  }
  return null
}

/**
 * 校验单条 IP 白名单展示串是否合法
 */
export function isValidWhitelistSegment (segment) {
  return segmentToRange(segment) !== null
}

/**
 * 将逗号分隔输入拆成若干条并校验；返回 { segments: string[] } 或 { error: string }
 */
export function parseCommaSeparatedSegments (raw) {
  const text = (raw || '').trim()
  if (!text) return { error: '请输入 IP 白名单' }
  const parts = text.split(',').map((x) => x.trim()).filter(Boolean)
  if (!parts.length) return { error: '请输入 IP 白名单' }
  const segments = []
  for (const p of parts) {
    if (!isValidWhitelistSegment(p)) {
      return { error: `格式不正确：${p}` }
    }
    segments.push(p)
  }
  return { segments }
}

export function isValidIpRange (startIp, endIp) {
  if (!isValidIPv4(startIp) || !isValidIPv4(endIp)) return false
  return ipToLong(startIp) <= ipToLong(endIp)
}

/**
 * @param {object} row — entryType: 'single'|'cidr'|'range'
 * @returns {{ start: number, end: number } | null}
 */
export function rowToNumericRange (row) {
  if (!row) return null
  if (row.segment != null && row.segment !== '') {
    return segmentToRange(row.segment)
  }
  if (row.entryType === 'single') {
    if (!row.singleIp || !isValidIPv4(row.singleIp)) return null
    const v = ipToLong(row.singleIp)
    return { start: v, end: v }
  }
  if (row.entryType === 'cidr') {
    return cidrToRange(row.cidr || '')
  }
  if (row.entryType === 'range') {
    if (!isValidIpRange(row.startIp, row.endIp)) return null
    return { start: ipToLong(row.startIp), end: ipToLong(row.endIp) }
  }
  return null
}

export function rangesOverlap (a, b) {
  if (!a || !b) return false
  return a.start <= b.end && b.start <= a.end
}

/**
 * 与列表中其它条目是否重叠（不含 excludeId）
 */
export function findOverlappingRow (range, list, excludeId) {
  if (!range) return null
  for (const row of list) {
    if (excludeId != null && row.id === excludeId) continue
    const r = rowToNumericRange(row)
    if (r && rangesOverlap(range, r)) return row
  }
  return null
}

/**
 * 由表单草稿构造待检测 range
 */
export function draftToRange (draft) {
  const t = draft.entryType
  if (t === 'single') {
    if (!draft.singleIp?.trim() || !isValidIPv4(draft.singleIp)) return null
    const v = ipToLong(draft.singleIp)
    return { start: v, end: v }
  }
  if (t === 'cidr') {
    return cidrToRange(draft.cidr || '')
  }
  if (t === 'range') {
    if (!isValidIpRange(draft.startIp, draft.endIp)) return null
    return { start: ipToLong(draft.startIp), end: ipToLong(draft.endIp) }
  }
  return null
}

/** 解析导入行：单个 IPv4 / CIDR / * 网段 */
export function parseImportLine (line) {
  const s = line.trim()
  if (!s || s.startsWith('#')) return null
  if (!isValidWhitelistSegment(s)) {
    return { error: `无法解析：${s}` }
  }
  if (s.includes('/')) {
    return { segment: s, entryType: 'cidr', singleIp: '', cidr: s, startIp: '', endIp: '' }
  }
  if (s.includes('*')) {
    return { segment: s, entryType: 'wildcard', singleIp: '', cidr: '', startIp: '', endIp: '' }
  }
  return { segment: s, entryType: 'single', singleIp: s, cidr: '', startIp: '', endIp: '' }
}

export function displayIpSegment (row) {
  if (row.segment != null && row.segment !== '') return row.segment
  if (row.entryType === 'single') return row.singleIp || ''
  if (row.entryType === 'cidr') return row.cidr || ''
  if (row.entryType === 'range') return `${row.startIp} - ${row.endIp}`
  return ''
}
