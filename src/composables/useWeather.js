import { onUnmounted, ref, unref, watch } from 'vue'
import { loadCityBundle } from '@/api/openMeteo'

/**
 * 城市数据加载组合式函数
 * - 自动追踪城市变化并重新请求
 * - 维护 loading / error / data 三态
 * - 用递增序号丢弃过期响应，避免快速切换城市时的竞态问题
 */
export function useWeather(citySource, { immediate = true } = {}) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)
  let sequence = 0

  const resolveId = () => (typeof citySource === 'function' ? citySource() : unref(citySource))

  async function load(force = false) {
    const id = resolveId()
    if (!id) return
    const token = ++sequence
    loading.value = true
    error.value = null
    try {
      const bundle = await loadCityBundle(id, { force })
      if (token !== sequence) return // 已有更新的请求，丢弃本次结果
      data.value = bundle
      if (bundle.source === 'demo') {
        error.value = `实时接口暂不可用（${bundle.reason || '网络异常'}），当前展示离线示例数据`
      }
    } catch (err) {
      if (token !== sequence) return
      error.value = err?.message || '数据加载失败'
    } finally {
      if (token === sequence) loading.value = false
    }
  }

  watch(
    () => resolveId(),
    (id) => {
      if (id) load()
    },
    { immediate },
  )

  onUnmounted(() => {
    sequence += 1 // 组件卸载后让在途请求失效
  })

  return {
    data,
    loading,
    error,
    reload: () => load(true),
    isDemo: () => data.value?.source === 'demo',
  }
}
