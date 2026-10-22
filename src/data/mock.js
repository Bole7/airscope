// 离线示例数据：接口不可用时用确定性随机数生成一份"看起来真实"的数据，
// 保证课堂演示、断网环境下页面依旧完整可讲。
import { pad2 } from '@/utils/format'

function hashSeed(text) {
  let hash = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function createRandom(seed) {
  let state = seed
  return function next() {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function isoAt(date, hour) {
  const d = new Date(date)
  d.setHours(hour, 0, 0, 0)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(hour)}:00`
}

export function createDemoBundle(city) {
  const random = createRandom(hashSeed(city.id))
  const noise = (scale) => (random() - 0.5) * 2 * scale

  // 用纬度粗略估算气温基准，让不同城市的数据有差异
  const baseTemp = 30 - Math.abs(city.lat - 23) * 0.75 + noise(1.5)
  const today = new Date()
  const hours = []
  const temperature = []
  const humidity = []
  const precipitation = []
  const wind = []
  const aqiSeries = []
  const pm25Series = []
  const pm10Series = []

  for (let i = 0; i < 168; i += 1) {
    const date = new Date(today)
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() + Math.floor(i / 24))
    const hour = i % 24
    hours.push(isoAt(date, hour))

    const temp = baseTemp + 4.6 * Math.sin(((hour - 9) / 24) * Math.PI * 2) + noise(0.9)
    temperature.push(Number(temp.toFixed(1)))

    const hum = 68 - 16 * Math.sin(((hour - 9) / 24) * Math.PI * 2) + noise(4)
    humidity.push(Math.round(Math.min(96, Math.max(28, hum))))

    const pop = Math.round(Math.min(92, Math.max(0, 18 + 34 * Math.sin(((hour - 14) / 24) * Math.PI * 2) + noise(12))) / 5) * 5
    precipitation.push(pop)

    wind.push(Number(Math.max(0.6, 7 + 4.5 * Math.sin(((hour - 12) / 24) * Math.PI * 2) + noise(2)).toFixed(1)))

    const aqi = Math.round(Math.min(210, Math.max(22, 72 + 34 * Math.sin(((hour - 6) / 24) * Math.PI * 2) + noise(14))))
    aqiSeries.push(aqi)
    pm25Series.push(Number((aqi * 0.31 + noise(3)).toFixed(1)))
    pm10Series.push(Number((aqi * 0.46 + noise(4)).toFixed(1)))
  }

  const currentIndex = Math.min(167, new Date().getHours())
  const codePool = [0, 1, 2, 3]
  const code = codePool[Math.abs(Math.floor(random() * 4))] ?? 2
  const currentTemp = temperature[currentIndex]

  const daily = { time: [], code: [], tmax: [], tmin: [], pop: [], sunrise: [], sunset: [] }
  for (let d = 0; d < 7; d += 1) {
    const date = new Date(today)
    date.setDate(date.getDate() + d)
    const slice = temperature.slice(d * 24, d * 24 + 24)
    daily.time.push(`${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`)
    daily.code.push(codePool[(d + code) % 4])
    daily.tmax.push(Number(Math.max(...slice).toFixed(1)))
    daily.tmin.push(Number(Math.min(...slice).toFixed(1)))
    daily.pop.push(precipitation[d * 24 + 14] ?? 20)
    daily.sunrise.push('06:24')
    daily.sunset.push('17:52')
  }

  return {
    cityId: city.id,
    source: 'demo',
    fetchedAt: new Date().toISOString(),
    current: {
      time: hours[currentIndex],
      temperature: currentTemp,
      apparent: Number((currentTemp + (humidity[currentIndex] > 72 ? 1.4 : -0.6)).toFixed(1)),
      humidity: humidity[currentIndex],
      wind: wind[currentIndex],
      windDirection: 90,
      pressure: Math.round(1009 + noise(3)),
      precipitation: 0,
      code,
      isDay: currentIndex >= 6 && currentIndex <= 18,
    },
    hourly: { time: hours, temperature, humidity, precipitation, wind },
    currentIndex,
    air: {
      time: hours[currentIndex],
      aqi: aqiSeries[currentIndex],
      pm25: pm25Series[currentIndex],
      pm10: pm10Series[currentIndex],
      o3: Number((58 + noise(6)).toFixed(1)),
      no2: Number((21 + noise(4)).toFixed(1)),
      so2: Number((6 + noise(2)).toFixed(1)),
      co: Number((0.5 + noise(0.1)).toFixed(2)),
    },
    airHourly: { time: hours, aqi: aqiSeries, pm25: pm25Series, pm10: pm10Series },
    daily,
    demo: true,
  }
}
