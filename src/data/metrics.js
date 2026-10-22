// 趋势分析可切换的指标配置：一个数组驱动整页 UI
export const METRICS = [
  {
    value: 'temperature',
    label: '温度',
    unit: '°C',
    decimals: 0,
    color: '#2F6FED',
    source: 'weather',
    field: 'temperature',
    desc: '2 米高度逐小时气温',
  },
  {
    value: 'humidity',
    label: '相对湿度',
    unit: '%',
    decimals: 0,
    color: '#0F9F92',
    source: 'weather',
    field: 'humidity',
    desc: '逐小时相对湿度',
  },
  {
    value: 'precipitation',
    label: '降水概率',
    unit: '%',
    decimals: 0,
    color: '#4C82C8',
    source: 'weather',
    field: 'precipitation',
    desc: '逐小时降水概率预报',
  },
  {
    value: 'wind',
    label: '风速',
    unit: 'km/h',
    decimals: 1,
    color: '#8E5BB5',
    source: 'weather',
    field: 'wind',
    desc: '10 米高度风速',
  },
  {
    value: 'aqi',
    label: '空气质量',
    unit: 'AQI',
    decimals: 0,
    color: '#E4813C',
    source: 'air',
    field: 'aqi',
    desc: 'US AQI 逐小时预报',
  },
  {
    value: 'pm25',
    label: 'PM2.5',
    unit: 'μg/m³',
    decimals: 1,
    color: '#D9534F',
    source: 'air',
    field: 'pm25',
    desc: '细颗粒物浓度',
  },
]

export const RANGES = [
  { value: '24h', label: '近 24 小时' },
  { value: '7d', label: '未来 7 天' },
]

export function findMetric(value) {
  return METRICS.find((metric) => metric.value === value) || METRICS[0]
}
