// 通用格式化与数学工具

export function pad2(n) {
  return String(n).padStart(2, '0')
}

/** 把 "2026-10-22T14:45" 这类本地时间字符串转成 Date（不做时区换算） */
export function toDate(iso) {
  if (!iso) return null
  const [datePart, timePart = '00:00'] = String(iso).split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  const [hh, mm] = timePart.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm)
}

/** 14:00 */
export function formatHour(iso) {
  if (!iso) return '--:--'
  return `${iso.slice(11, 13)}:00`
}

/** 10/22 */
export function formatDateShort(iso) {
  if (!iso) return '--/--'
  return `${Number(iso.slice(5, 7))}/${Number(iso.slice(8, 10))}`
}

/** 周四 */
export function formatWeekday(iso) {
  const date = toDate(iso)
  if (!date) return ''
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
}

/** 14:45 更新 */
export function formatClock(iso) {
  if (!iso) return '--:--'
  return iso.slice(11, 16)
}

export function round(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return null
  const factor = 10 ** digits
  return Math.round(Number(value) * factor) / factor
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function average(list) {
  const valid = list.filter((n) => typeof n === 'number' && !Number.isNaN(n))
  if (!valid.length) return null
  return valid.reduce((sum, n) => sum + n, 0) / valid.length
}

/** 数值 + 单位的安全展示 */
export function withUnit(value, unit, digits = 1) {
  const rounded = round(value, digits)
  return rounded === null ? '—' : `${rounded}${unit}`
}
