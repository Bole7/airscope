import { defineStore } from 'pinia'
import { useLocalStorage } from '@/composables/useLocalStorage'

/**
 * 趋势分析页的偏好设置单独抽成 store：
 * 来回切换页面时指标与时间范围不会丢失（KeepAlive / 持久化双重保障）
 */
export const useTrendStore = defineStore('trend', () => {
  const metric = useLocalStorage('airscope:trend-metric', 'temperature')
  const range = useLocalStorage('airscope:trend-range', '24h')

  function setMetric(value) {
    metric.value = value
  }

  function setRange(value) {
    range.value = value
  }

  return { metric, range, setMetric, setRange }
})
