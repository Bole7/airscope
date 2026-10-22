// WMO 天气代码 → 中文描述、图标分组、主题色
const WEATHER_MAP = {
  0: { text: '晴', group: 'clear' },
  1: { text: '晴间多云', group: 'partly' },
  2: { text: '局部多云', group: 'partly' },
  3: { text: '阴', group: 'cloudy' },
  45: { text: '有雾', group: 'fog' },
  48: { text: '雾凇', group: 'fog' },
  51: { text: '轻微毛毛雨', group: 'drizzle' },
  53: { text: '毛毛雨', group: 'drizzle' },
  55: { text: '浓毛毛雨', group: 'drizzle' },
  56: { text: '冻毛毛雨', group: 'drizzle' },
  57: { text: '强冻毛毛雨', group: 'drizzle' },
  61: { text: '小雨', group: 'rain' },
  63: { text: '中雨', group: 'rain' },
  65: { text: '大雨', group: 'rain' },
  66: { text: '冻雨', group: 'rain' },
  67: { text: '强冻雨', group: 'rain' },
  71: { text: '小雪', group: 'snow' },
  73: { text: '中雪', group: 'snow' },
  75: { text: '大雪', group: 'snow' },
  77: { text: '雪粒', group: 'snow' },
  80: { text: '阵雨', group: 'rain' },
  81: { text: '强阵雨', group: 'rain' },
  82: { text: '暴雨', group: 'rain' },
  85: { text: '阵雪', group: 'snow' },
  86: { text: '强阵雪', group: 'snow' },
  95: { text: '雷阵雨', group: 'thunder' },
  96: { text: '雷阵雨伴冰雹', group: 'thunder' },
  99: { text: '强雷阵雨伴冰雹', group: 'thunder' },
}

export function describeWeather(code) {
  return WEATHER_MAP[code] || { text: '未知天气', group: 'cloudy' }
}

export function weatherGroup(code) {
  return describeWeather(code).group
}

/** 风向角度 → 八方位中文 */
export function windDirection(degree) {
  if (!Number.isFinite(degree)) return '—'
  const dirs = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']
  const index = Math.round(((degree % 360) / 45)) % 8
  return `${dirs[index]}风`
}

export function windLevel(speed) {
  const kmh = Number(speed)
  if (!Number.isFinite(kmh)) return '—'
  if (kmh < 1) return '无风'
  if (kmh < 6) return '软风'
  if (kmh < 12) return '轻风'
  if (kmh < 20) return '微风'
  if (kmh < 29) return '和风'
  if (kmh < 39) return '清劲风'
  if (kmh < 50) return '强风'
  return '疾风'
}
