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
export function cidrToRange (cidrStr) {
  const s = cidrStr.trim()
  const i = s.indexOf('/')
  if (i < 0) return null
  const ipPart = s.slice(0, i).trim()
  const pre = parseInt(s.slice(i + 1), 10)
  if (!isValidIPv4(ipPart) || Number.isNaN(pre) || pre < 0 || pre > 32) return null
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

export function isValidCIDR (s) {
  return cidrToRange(s) !== null
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

/** 解析导入行：IPv4 或 CIDR */
export function parseImportLine (line) {
  const s = line.trim()
  if (!s || s.startsWith('#')) return null
  if (s.includes('/') && isValidCIDR(s)) {
    return { entryType: 'cidr', cidr: s, singleIp: '', startIp: '', endIp: '' }
  }
  if (isValidIPv4(s)) {
    return { entryType: 'single', singleIp: s, cidr: '', startIp: '', endIp: '' }
  }
  return { error: `无法解析：${s}` }
}

export function displayIpSegment (row) {
  if (row.entryType === 'single') return row.singleIp || ''
  if (row.entryType === 'cidr') return row.cidr || ''
  if (row.entryType === 'range') return `${row.startIp} - ${row.endIp}`
  return ''
}
