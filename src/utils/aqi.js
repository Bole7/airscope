// 空气质量指数（US AQI）的分级、配色与健康建议
export const AQI_LEVELS = [
  { max: 50, label: '优', color: '#2FA36B', advice: '空气质量令人满意，适合正常户外活动。' },
  { max: 100, label: '良', color: '#D8A32C', advice: '空气质量可接受，极少数敏感人群应减少户外剧烈运动。' },
  { max: 150, label: '轻度污染', color: '#E4813C', advice: '敏感人群症状可能轻度加剧，建议减少长时间户外活动。' },
  { max: 200, label: '中度污染', color: '#D9534F', advice: '建议减少户外运动，外出佩戴口罩。' },
  { max: 300, label: '重度污染', color: '#8E5BB5', advice: '建议留在室内并关闭门窗，开启空气净化设备。' },
  { max: Infinity, label: '严重污染', color: '#7E3B3B', advice: '尽量避免外出，敏感人群应停止户外活动。' },
]

// PM2.5 浓度（μg/m³）分级，参考我国 24 小时平均标准
export const PM25_LEVELS = [
  { max: 35, label: '优', color: '#2FA36B' },
  { max: 75, label: '良', color: '#D8A32C' },
  { max: 115, label: '轻度污染', color: '#E4813C' },
  { max: 150, label: '中度污染', color: '#D9534F' },
  { max: 250, label: '重度污染', color: '#8E5BB5' },
  { max: Infinity, label: '严重污染', color: '#7E3B3B' },
]

export function levelOf(value, levels = AQI_LEVELS) {
  if (value === null || value === undefined) {
    return { label: '暂无', color: '#8A97A8', advice: '暂无监测数据。', max: null }
  }
  return levels.find((item) => value <= item.max) || levels[levels.length - 1]
}

/** 仪表盘百分比：把 0~300 映射到 0~100 */
export function gaugePercent(value, max = 300) {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, (value / max) * 100))
}
