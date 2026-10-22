// Open-Meteo 公开接口封装：免密钥、支持 CORS，适合纯前端项目。
// 接口失败时自动降级到 data/mock.js 生成的示例数据，保证页面永远有内容可看。
import { findCity } from '@/data/cities'
import { createDemoBundle } from '@/data/mock'

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const AIR_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'
const CACHE_TTL = 5 * 60 * 1000
const REQUEST_TIMEOUT = 9000

const cache = new Map()

function buildUrls(city) {
  const forecast = new URLSearchParams({
    latitude: city.lat,
    longitude: city.lon,
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl',
    hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',
    timezone: 'Asia/Shanghai',
    forecast_days: '7',
    wind_speed_unit: 'kmh',
  })
  const air = new URLSearchParams({
    latitude: city.lat,
    longitude: city.lon,
    current: 'us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone',
    hourly: 'us_aqi,pm2_5,pm10',
    timezone: 'Asia/Shanghai',
    forecast_days: '7',
  })
  return [`${FORECAST_URL}?${forecast}`, `${AIR_URL}?${air}`]
}

function normalize(city, weather, air) {
  const current = weather.current
  const hourlyTime = weather.hourly.time
  const stamp = String(current.time).slice(0, 13)
  let currentIndex = hourlyTime.findIndex((item) => item.slice(0, 13) === stamp)
  if (currentIndex < 0) currentIndex = 0

  const daily = weather.daily
  return {
    cityId: city.id,
    source: 'live',
    fetchedAt: new Date().toISOString(),
    current: {
      time: current.time,
      temperature: current.temperature_2m,
      apparent: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      wind: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
      pressure: current.pressure_msl,
      precipitation: current.precipitation,
      code: current.weather_code,
      isDay: current.is_day === 1,
    },
    hourly: {
      time: hourlyTime,
      temperature: weather.hourly.temperature_2m,
      humidity: weather.hourly.relative_humidity_2m,
      precipitation: weather.hourly.precipitation_probability,
      wind: weather.hourly.wind_speed_10m,
    },
    currentIndex,
    air: air?.current
      ? {
          time: air.current.time,
          aqi: air.current.us_aqi,
          pm25: air.current.pm2_5,
          pm10: air.current.pm10,
          o3: air.current.ozone,
          no2: air.current.nitrogen_dioxide,
          so2: air.current.sulphur_dioxide,
          co: air.current.carbon_monoxide,
        }
      : null,
    airHourly: air?.hourly
      ? {
          time: air.hourly.time,
          aqi: air.hourly.us_aqi,
          pm25: air.hourly.pm2_5,
          pm10: air.hourly.pm10,
        }
      : null,
    daily: {
      time: daily.time,
      code: daily.weather_code,
      tmax: daily.temperature_2m_max,
      tmin: daily.temperature_2m_min,
      pop: daily.precipitation_probability_max,
      sunrise: daily.sunrise,
      sunset: daily.sunset,
    },
  }
}

async function getJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT) })
  if (!response.ok) throw new Error(`接口返回 ${response.status}`)
  return response.json()
}

/**
 * 读取某个城市的完整数据包（实况 + 逐小时 + 7 天预报 + 空气质量）
 * @param {string} cityId
 * @param {{ force?: boolean }} options force=true 时跳过缓存
 */
export async function loadCityBundle(cityId, { force = false } = {}) {
  const city = findCity(cityId)
  if (!city) throw new Error(`未知城市：${cityId}`)

  const cached = cache.get(city.id)
  if (!force && cached && Date.now() - cached.at < CACHE_TTL) return cached.data

  const [forecastUrl, airUrl] = buildUrls(city)
  try {
    const [weather, air] = await Promise.all([
      getJson(forecastUrl),
      getJson(airUrl).catch(() => null), // 空气质量失败不影响主流程
    ])
    const data = normalize(city, weather, air)
    cache.set(city.id, { at: Date.now(), data })
    return data
  } catch (error) {
    const demo = createDemoBundle(city)
    demo.reason = error?.name === 'TimeoutError' ? '请求超时' : error?.message || '网络异常'
    return demo
  }
}

export function clearWeatherCache() {
  cache.clear()
}
